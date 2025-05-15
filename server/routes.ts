import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { extractTextFromPDF } from "./services/pdfParser";
import { extractTextFromDOCX } from "./services/docxParser";
import { analyzeCV, performDeepAnalysis } from "./services/atsScoring";
import { insertUserSchema, insertCvSchema, insertAtsScoreSchema, insertDeepAnalysisReportSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { payfastService } from "./services/payfastService";
import { whatsappService } from "./services/whatsappService";

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Only allow PDF and DOCX
    if (file.mimetype === "application/pdf" || 
        file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and DOCX files are allowed."));
    }
  },
});

// Check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
};

// Check if user is an admin
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: "Admin access required" });
};

// Check if user has active subscription
const hasActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  try {
    const subscription = await storage.getActiveSubscription(req.user!.id);
    if (!subscription) {
      return res.status(403).json({ error: "Active subscription required", requiresSubscription: true });
    }
    next();
  } catch (err) {
    next(err);
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Health check endpoint with database verification
  app.get("/api/health", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Import the database health check
      const { checkDatabaseHealth } = await import('./db-utils');
      
      // Run a basic health check on all connected services
      const dbHealth = await checkDatabaseHealth();
      
      res.json({ 
        status: "ok",
        database: dbHealth ? "connected" : "error",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });
    } catch (error) {
      next(error);
    }
  });

  // Get pricing plans
  app.get("/api/plans", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await storage.getActivePlans();
      res.json(plans);
    } catch (error) {
      next(error);
    }
  });

  // Get user's CVs
  app.get("/api/cvs", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvs = await storage.getCVsByUser(req.user!.id);
      res.json(cvs.map(cv => ({
        id: cv.id,
        fileName: cv.fileName,
        fileType: cv.fileType,
        fileSize: cv.fileSize,
        title: cv.title,
        description: cv.description,
        isDefault: cv.isDefault,
        targetPosition: cv.targetPosition,
        targetIndustry: cv.targetIndustry,
        createdAt: cv.createdAt
      })));
    } catch (error) {
      next(error);
    }
  });

  // File upload and analysis endpoint
  app.post("/api/upload", isAuthenticated, upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Upload request received", { 
        body: Object.keys(req.body),
        file: req.file ? "File present" : "No file",
        fileSize: req.file?.size
      });
      
      if (!req.file) {
        console.error("No file in request");
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      let content = "";

      console.log("Processing file upload:", file.originalname, "mimetype:", file.mimetype);

      // Extract text from file based on mimetype
      if (file.mimetype === "application/pdf") {
        console.log("Extracting text from PDF");
        content = await extractTextFromPDF(file.buffer);
      } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        console.log("Extracting text from DOCX");
        content = await extractTextFromDOCX(file.buffer);
      } else {
        return res.status(400).json({ 
          error: "Unsupported file type", 
          message: "Please upload a PDF or DOCX file" 
        });
      }

      if (!content) {
        return res.status(400).json({ error: "Could not extract content from file" });
      }

      // Get user id from authenticated user - we know it exists because of isAuthenticated middleware
      const userId = req.user!.id;
      let title = req.body.title || file.originalname.replace(/\.[^/.]+$/, "");
      
      console.log("Creating CV for user ID:", userId);
      
      // Get job description if provided
      const jobDescription = req.body.jobDescription || "";
      
      // Store the CV
      const cvData = {
        userId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        content,
        title,
        targetPosition: req.body.targetPosition,
        targetIndustry: req.body.targetIndustry,
        description: req.body.description,
        isDefault: req.body.isDefault === "true",
        jobDescription: jobDescription
      };

      const cv = await storage.createCV(cvData);

      // Begin background analysis of the CV
      // Pass job description and CV ID for better analysis and caching
      const analysis = await analyzeCV(content, jobDescription, cv.id);
      
      // Store the analysis results
      const atsScore = await storage.createATSScore({
        cvId: cv.id,
        score: analysis.score,
        skillsScore: analysis.skillsScore || 0,
        contextScore: analysis.contextScore || 0,
        formatScore: analysis.formatScore || 0,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        issues: analysis.issues,
        saKeywordsFound: analysis.saKeywordsFound || [],
        saContextScore: analysis.saContextScore,
        bbbeeDetected: analysis.bbbeeDetected,
        nqfDetected: analysis.nqfDetected,
        keywordRecommendations: analysis.keywordRecommendations
      });

      res.json({ 
        success: true, 
        message: "File uploaded and analyzed successfully",
        cv: {
          id: cv.id,
          fileName: cv.fileName,
          fileType: cv.fileType,
          fileSize: cv.fileSize,
          title: cv.title
        },
        score: atsScore.score
      });
    } catch (error) {
      console.error("Upload error:", error);
      next(error);
    }
  });

  // Get single CV
  app.get("/api/cv/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvId = Number(req.params.id);
      
      if (isNaN(cvId)) {
        return res.status(400).json({ error: "Invalid CV ID" });
      }
      
      const cv = await storage.getCV(cvId);
      
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }
      
      // If authenticated, check if the CV belongs to the user
      if (req.isAuthenticated() && cv.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to access this CV" });
      }
      
      // Return CV without content for security reasons
      res.json({
        id: cv.id,
        fileName: cv.fileName,
        fileType: cv.fileType,
        fileSize: cv.fileSize,
        title: cv.title,
        description: cv.description,
        isDefault: cv.isDefault,
        targetPosition: cv.targetPosition,
        targetIndustry: cv.targetIndustry,
        createdAt: cv.createdAt
      });
    } catch (error) {
      next(error);
    }
  });

  // Update CV details
  app.put("/api/cv/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvId = Number(req.params.id);
      
      if (isNaN(cvId)) {
        return res.status(400).json({ error: "Invalid CV ID" });
      }
      
      const cv = await storage.getCV(cvId);
      
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }
      
      // Check if the CV belongs to the user
      if (cv.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to modify this CV" });
      }
      
      const updates = {
        title: req.body.title,
        description: req.body.description,
        isDefault: req.body.isDefault === true,
        targetPosition: req.body.targetPosition,
        targetIndustry: req.body.targetIndustry
      };
      
      const updatedCV = await storage.updateCV(cvId, updates);
      
      res.json({
        id: updatedCV.id,
        fileName: updatedCV.fileName,
        fileType: updatedCV.fileType,
        fileSize: updatedCV.fileSize,
        title: updatedCV.title,
        description: updatedCV.description,
        isDefault: updatedCV.isDefault,
        targetPosition: updatedCV.targetPosition,
        targetIndustry: updatedCV.targetIndustry,
        createdAt: updatedCV.createdAt,
        updatedAt: updatedCV.updatedAt
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete CV
  app.delete("/api/cv/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvId = Number(req.params.id);
      
      if (isNaN(cvId)) {
        return res.status(400).json({ error: "Invalid CV ID" });
      }
      
      const cv = await storage.getCV(cvId);
      
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }
      
      // Check if the CV belongs to the user
      if (cv.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to delete this CV" });
      }
      
      await storage.deleteCV(cvId);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // ATS Score endpoint
  app.get("/api/ats-score/:cvId", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvId = Number(req.params.cvId);
      
      if (isNaN(cvId)) {
        return res.status(400).json({ error: "Invalid CV ID" });
      }

      const cv = await storage.getCV(cvId);
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }

      // If authenticated, check if the CV belongs to the user
      if (req.isAuthenticated() && cv.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to access this score" });
      }

      // Check if there's already a score for this CV
      let atsScore = await storage.getATSScoreByCV(cvId);
      
      if (!atsScore) {
        // If not, analyze the CV
        // Pass the CV ID for caching and job description if available
        const analysis = await analyzeCV(cv.content, cv.jobDescription || undefined, cvId);
        
        // Store the analysis results
        atsScore = await storage.createATSScore({
          cvId,
          score: analysis.score,
          skillsScore: analysis.skillsScore || 0,
          contextScore: analysis.contextScore || 0,
          formatScore: analysis.formatScore || 0,
          strengths: analysis.strengths,
          improvements: analysis.improvements,
          issues: analysis.issues,
          saKeywordsFound: analysis.saKeywordsFound || [],
          saContextScore: analysis.saContextScore,
          bbbeeDetected: analysis.bbbeeDetected,
          nqfDetected: analysis.nqfDetected,
          keywordRecommendations: analysis.keywordRecommendations
        });
      }

      res.json({
        score: atsScore.score,
        skillsScore: atsScore.skillsScore,
        contextScore: atsScore.contextScore,
        formatScore: atsScore.formatScore,
        strengths: atsScore.strengths,
        improvements: atsScore.improvements,
        issues: atsScore.issues,
        saKeywordsFound: atsScore.saKeywordsFound,
        saContextScore: atsScore.saContextScore,
        bbbeeDetected: atsScore.bbbeeDetected,
        nqfDetected: atsScore.nqfDetected,
        keywordRecommendations: atsScore.keywordRecommendations
      });
    } catch (error) {
      next(error);
    }
  });

  // Latest CV endpoint - for getting the most recently uploaded CV
  app.get("/api/latest-cv", async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user id from authenticated user or use guest id
      const userId = req.isAuthenticated() ? req.user!.id : 0;
      
      // Use the optimized method to get the latest CV
      const latestCV = await storage.getLatestCVByUser(userId);
      
      if (!latestCV) {
        return res.status(404).json({ error: "No CVs found for this user" });
      }

      res.json({
        id: latestCV.id,
        fileName: latestCV.fileName,
        fileType: latestCV.fileType,
        fileSize: latestCV.fileSize,
        title: latestCV.title,
        createdAt: latestCV.createdAt
      });
    } catch (error) {
      next(error);
    }
  });

  // Deep analysis endpoint - premium feature
  app.post("/api/deep-analysis", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cvId } = req.body;
      
      if (!cvId) {
        return res.status(400).json({ error: "CV ID is required" });
      }

      const cv = await storage.getCV(Number(cvId));
      
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }

      // Check if the CV belongs to the user
      if (cv.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to analyze this CV" });
      }

      // Check if user has an active subscription and available scans
      const subscription = await storage.getActiveSubscription(req.user!.id);
      let requiresPayment = true;
      let scanLimitReached = false;
      let scanInfo = { scansUsed: 0, scanLimit: 0 };
      
      if (subscription) {
        // Check subscription tier and available scans
        const plan = await storage.getPlan(subscription.planId);
        
        if (plan) {
          // Only check scan limits for plans that have them
          if (plan.scanLimit && plan.scanLimit > 0) {
            // This plan has a scan limit, check if it's reached
            scanInfo = await storage.recordScanUsage(req.user!.id);
            
            if (scanInfo.scanLimit > 0 && scanInfo.scansUsed > scanInfo.scanLimit) {
              // Scan limit reached
              scanLimitReached = true;
              requiresPayment = true;
            } else {
              // User has available scans
              requiresPayment = false;
            }
          } else {
            // Unlimited scans
            requiresPayment = false;
          }
        }
      }

      // Check if an analysis already exists
      let deepAnalysis = await storage.getDeepAnalysisByCV(cv.id);
      
      if (!deepAnalysis) {
        // Create a new analysis report (status = pending)
        deepAnalysis = await storage.createDeepAnalysisReport({
          cvId: cv.id,
          userId: req.user!.id,
          status: 'pending',
          paidAmount: requiresPayment ? 3000 : 0 // ZAR 30.00 (stored in cents)
        });
      }
      
      // If scan limit is reached, return that information
      if (scanLimitReached) {
        return res.status(402).json({
          error: "Monthly scan limit reached",
          scanLimitReached: true,
          scanInfo,
          requiresUpgrade: true,
          subscriptionOptions: [
            {
              id: 'premium-plus',
              name: 'Premium Plus',
              price: 20000, // ZAR 200.00 in cents
              scanLimit: 100,
              isRecommended: true
            },
            {
              id: 'premium',
              name: 'Premium',
              price: 10000, // ZAR 100.00 in cents
              scanLimit: 50,
              isPopular: true
            }
          ]
        });
      }

      // In a real implementation, this would trigger a background job
      // For now, simulate the analysis completing immediately if payment not required
      if (!requiresPayment && deepAnalysis.status === 'pending') {
        try {
          // Use OpenAI for deep analysis
          // Pass CV ID for caching the deep analysis
          const analysisResult = await performDeepAnalysis(cv.content, cv.jobDescription || undefined, cv.id);
          
          // Update the analysis with AI-generated insights
          deepAnalysis = await storage.updateDeepAnalysisReport(deepAnalysis.id, {
            status: 'completed',
            detailedAnalysis: {
              summary: "Your CV has been thoroughly analyzed with South African context in mind.",
              keyFindings: analysisResult.improvements.slice(0, 5),
              sectionScores: {
                professional: analysisResult.score,
                education: analysisResult.formatScore || 75,
                skills: analysisResult.skillsScore || 70,
                achievements: analysisResult.contextScore || 65
              }
            },
            industryComparison: {
              industry: cv.targetIndustry || "South African Job Market",
              averageScore: Math.max(50, Math.floor(analysisResult.score * 0.9)),
              yourScore: analysisResult.score,
              keyDifferences: [
                ...(analysisResult.strengths.slice(0, 2) || []),
                ...(analysisResult.improvements.slice(0, 2) || [])
              ]
            },
            regionalRecommendations: {
              region: "South Africa",
              keywords: analysisResult.saKeywordsFound || ["B-BBEE", "NQF Level"],
              certifications: ["SETA", "Microsoft Certified", "CompTIA"],
              marketTrends: analysisResult.bbbeeDetected 
                ? "You've correctly included B-BBEE status which is important for South African employers" 
                : "Consider adding B-BBEE status which is critical for South African recruitment"
            }
          });
        } catch (error) {
          console.error("Error performing deep analysis:", error);
          
          // Fallback to basic analysis if AI fails
          deepAnalysis = await storage.updateDeepAnalysisReport(deepAnalysis.id, {
            status: 'completed',
            detailedAnalysis: {
              summary: "Your CV has been analyzed with South African context in mind.",
              keyFindings: [
                "Please consider adding more South African context",
                "Make sure to include B-BBEE status if applicable",
                "Add NQF levels to all qualifications",
                "Include more quantifiable achievements"
              ],
              sectionScores: {
                professional: 70,
                education: 75,
                skills: 65,
                achievements: 60
              }
            },
            industryComparison: {
              industry: cv.targetIndustry || "South African Job Market",
              averageScore: 60,
              yourScore: 70,
              keyDifferences: [
                "Include B-BBEE status for better employment equity alignment",
                "Add NQF levels to all qualifications"
              ]
            },
            regionalRecommendations: {
              region: "South Africa",
              keywords: ["B-BBEE", "NQF Level", "Employment Equity", "SETA"],
              certifications: ["SETA", "Microsoft Certified", "CompTIA"],
              marketTrends: "Add B-BBEE status which is critical for South African recruitment"
            }
          });
        }
      }

      res.json({
        id: deepAnalysis.id,
        status: deepAnalysis.status,
        requiresPayment,
        price: requiresPayment ? 30.00 : 0,
        currency: "ZAR",
        reportUrl: deepAnalysis.status === 'completed' ? `/api/reports/${deepAnalysis.id}` : null,
        pdfDownloadUrl: deepAnalysis.status === 'completed' ? `/api/deep-analysis/${deepAnalysis.id}/download` : null,
        createdAt: deepAnalysis.createdAt,
        detailedAnalysis: deepAnalysis.detailedAnalysis,
        industryComparison: deepAnalysis.industryComparison,
        regionalRecommendations: deepAnalysis.regionalRecommendations
      });
    } catch (error) {
      next(error);
    }
  });

  // Deep analysis report download (PDF)
  app.get("/api/deep-analysis/:id/download", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) {
        return res.status(400).json({ error: "Invalid report ID" });
      }
      
      const report = await storage.getDeepAnalysisReport(reportId);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      // Check if the report belongs to the user
      if (report.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to access this report" });
      }
      
      // Check if the report is completed
      if (report.status !== 'completed') {
        return res.status(400).json({ 
          error: "Report is not ready for download", 
          status: report.status 
        });
      }
      
      // In a real implementation, this would generate a PDF file
      // For demo purposes, we're just sending a JSON response
      res.json({
        success: true,
        message: "PDF generated successfully",
        fileName: `ATSBoost_Deep_Analysis_${reportId}.pdf`,
        generatedDate: new Date().toISOString(),
        sections: [
          "Executive Summary",
          "South African Market Fit Analysis",
          "B-BBEE Optimization Guide",
          "Industry Keyword Assessment",
          "NQF Level Presentation",
          "Provincial Job Market Alignment",
          "Improvement Action Plan"
        ],
        fileSize: "1.2 MB"
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Process payment for deep analysis
  app.post("/api/process-deep-analysis-payment", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { analysisId, paymentMethod } = req.body;
      
      if (!analysisId) {
        return res.status(400).json({ error: "Analysis ID is required" });
      }
      
      const deepAnalysis = await storage.getDeepAnalysisReport(Number(analysisId));
      if (!deepAnalysis) {
        return res.status(404).json({ error: "Analysis report not found" });
      }
      
      // Check if the report belongs to the user
      if (deepAnalysis.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to pay for this report" });
      }
      
      // Check if already paid
      if (deepAnalysis.status === 'completed') {
        return res.status(400).json({ 
          error: "This report has already been paid for and completed",
          reportUrl: `/api/reports/${deepAnalysis.id}`,
          pdfDownloadUrl: `/api/deep-analysis/${deepAnalysis.id}/download`
        });
      }
      
      // Mock payment processing with Yoco
      // In a real implementation, this would integrate with Yoco payment gateway
      
      // Update the analysis status
      const updatedAnalysis = await storage.updateDeepAnalysisReport(deepAnalysis.id, {
        status: 'completed',
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentMethod || 'yoco',
        paymentReference: `yoco-payment-${Date.now()}`,
        // Add the same mock data as in the deep-analysis endpoint
        detailedAnalysis: {
          summary: "Your CV has been thoroughly analyzed with South African context in mind.",
          keyFindings: [
            "Strong emphasis on technical skills",
            "Lacks quantifiable achievements",
            "Education section well formatted",
            "Consider adding more South African context",
            "B-BBEE status needs to be more prominent"
          ],
          sectionScores: {
            professional: 85,
            education: 90,
            skills: 75,
            achievements: 60,
            saContext: 65
          }
        },
        industryComparison: {
          industry: deepAnalysis.cv?.targetIndustry || "Technology",
          averageScore: 72,
          yourScore: 81,
          keyDifferences: [
            "You have more technical certifications than average",
            "Industry values project management experience",
            "Include more South African regulatory knowledge"
          ]
        },
        regionalRecommendations: {
          region: "South Africa",
          keywords: ["B-BBEE", "NQF Level", "Johannesburg", "Cape Town", "POPIA Compliance"],
          certifications: ["SETA", "Microsoft Certified", "CompTIA"],
          marketTrends: "Growing demand for data science and cloud skills in the South African market"
        }
      });
      
      res.json({
        success: true,
        message: "Payment processed successfully",
        transactionId: `yoco-${Date.now()}`,
        amount: 30.00,
        currency: "ZAR",
        paymentDate: new Date().toISOString(),
        report: {
          id: updatedAnalysis.id,
          status: updatedAnalysis.status,
          reportUrl: `/api/reports/${updatedAnalysis.id}`,
          pdfDownloadUrl: `/api/deep-analysis/${updatedAnalysis.id}/download`
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Realtime ATS analysis endpoint
  app.post("/api/analyze-resume-text", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resumeContent, jobDescription } = req.body;
      
      if (!resumeContent) {
        return res.status(400).json({ error: "Resume content is required" });
      }
      
      // In a real implementation, this would perform NLP analysis on the resume content
      // For now, we'll provide a simplified analysis for demo purposes
      
      // Check for South African context
      const resumeLower = resumeContent.toLowerCase();
      
      // Check for B-BBEE mention
      const bbbeeDetected = /b-bbee|bbbee|broad.?based black economic empowerment|bee/i.test(resumeLower);
      
      // Check for NQF level mention
      const nqfDetected = /nqf level|saqa|qualification framework/i.test(resumeLower);
      
      // South African specific keywords
      const saKeywords = [
        "b-bbee", "nqf", "seta", "saqa", "employment equity", 
        "johannesburg", "cape town", "durban", "pretoria", "gauteng", "western cape",
        "south africa", "south african", "popia", "protection of personal information"
      ];
      
      // Count South African keywords found
      const foundSaKeywords = saKeywords.filter(keyword => 
        resumeLower.includes(keyword.toLowerCase())
      );
      
      // Calculate SA context score
      const saContextScore = Math.min(100, 
        Math.round(
          (foundSaKeywords.length / 5) * 50 + // Up to 50 points for keywords
          (bbbeeDetected ? 25 : 0) +           // 25 points for B-BBEE
          (nqfDetected ? 25 : 0)               // 25 points for NQF
        )
      );
      
      // Format score - check for proper sections, bullet points, etc.
      const hasProperSections = /education|experience|skills|qualifications/i.test(resumeLower);
      const hasBulletPoints = /•|-|\*/i.test(resumeContent);
      const hasDates = /20\d{2}|19\d{2}|january|february|march|april|may|june|july|august|september|october|november|december/i.test(resumeLower);
      
      const formatScore = Math.round(
        (hasProperSections ? 40 : 0) +
        (hasBulletPoints ? 30 : 0) +
        (hasDates ? 30 : 0)
      );
      
      // Skills score - would compare to job description in real implementation
      const skillsScore = jobDescription ? 
        Math.round(40 + Math.random() * 40) : 65;
      
      // Overall weighted score
      const overallScore = Math.round(
        (skillsScore * 0.4) +
        (formatScore * 0.3) +
        (saContextScore * 0.3)
      );
      
      // Generate improvement suggestions
      const suggestions = [];
      
      if (!bbbeeDetected) {
        suggestions.push("Add your B-BBEE status to increase your chances with South African employers");
      }
      
      if (!nqfDetected) {
        suggestions.push("Include NQF levels for your qualifications to align with South African standards");
      }
      
      if (foundSaKeywords.length < 3) {
        suggestions.push("Add more South African context (locations, regulatory frameworks, etc.)");
      }
      
      if (!hasProperSections) {
        suggestions.push("Structure your resume with clear sections (Education, Experience, Skills)");
      }
      
      if (!hasBulletPoints) {
        suggestions.push("Use bullet points to make achievements and responsibilities more scannable");
      }
      
      if (skillsScore < 70) {
        suggestions.push("Enhance skills section to better match typical job requirements");
      }
      
      // Job description keywords - would normally be extracted through NLP
      const jobKeywords = jobDescription ? 
        ["communication", "teamwork", "leadership", "problem-solving", "analytical", "technical", "project management"] :
        ["excel", "communication", "management", "reporting", "analysis", "strategic", "budget"];
      
      // Find keywords that exist in the resume
      const foundKeywords = jobKeywords.filter(keyword => 
        resumeLower.includes(keyword.toLowerCase())
      );
      
      // Return the analysis
      res.json({
        overall: overallScore,
        skills: skillsScore,
        format: formatScore,
        saContext: saContextScore,
        keywords: jobKeywords,
        foundKeywords,
        bbbeeDetected,
        nqfDetected,
        suggestions,
        analyzed: true,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      next(error);
    }
  });

  // WhatsApp settings endpoints
  app.get("/api/whatsapp-settings", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await storage.getSaProfile(req.user!.id);
      
      if (!profile) {
        return res.json({
          enabled: false,
          verified: false
        });
      }
      
      res.json({
        enabled: profile.whatsappEnabled || false,
        phoneNumber: profile.whatsappNumber,
        verified: profile.whatsappVerified || false
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/whatsapp-settings", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { enabled, phoneNumber } = req.body;
      
      // Validate South African phone number if provided
      if (phoneNumber) {
        const saPhoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
        if (!saPhoneRegex.test(phoneNumber)) {
          return res.status(400).json({ error: "Invalid South African phone number format" });
        }
      }
      
      // Get or create profile
      let profile = await storage.getSaProfile(req.user!.id);
      
      if (profile) {
        // Update existing profile
        profile = await storage.updateSaProfile(req.user!.id, {
          whatsappEnabled: enabled,
          whatsappNumber: phoneNumber,
          whatsappVerified: profile.whatsappVerified // Preserve existing verification status
        });
      } else {
        // Create new profile
        profile = await storage.createSaProfile({
          userId: req.user!.id,
          whatsappEnabled: enabled,
          whatsappNumber: phoneNumber,
          whatsappVerified: false
        });
      }
      
      res.json({
        enabled: profile.whatsappEnabled,
        phoneNumber: profile.whatsappNumber,
        verified: profile.whatsappVerified
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/whatsapp-verify", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      
      // Get user profile
      const profile = await storage.getSaProfile(req.user!.id);
      
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      // Send verification message
      const success = await whatsappService.sendVerificationCode(phoneNumber);
      
      if (!success) {
        return res.status(500).json({ error: "Failed to send verification message" });
      }
      
      // Note: In a real implementation, we would store the verification code
      // and wait for the user to confirm it. For this demo, we'll mark as verified immediately.
      await storage.updateSaProfile(req.user!.id, {
        whatsappVerified: true
      });
      
      res.json({ success: true, message: "Verification message sent" });
    } catch (error) {
      next(error);
    }
  });

  // PayFast integration endpoints
  app.post("/api/create-payfast-payment", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { plan_type, amount } = req.body;
      
      if (!plan_type || !amount) {
        return res.status(400).json({ error: "Plan type and amount are required" });
      }
      
      // Create a merchant reference
      const merchantReference = `deep_analysis_${req.user!.id}_${Date.now()}`;
      
      // Create payment URL
      const paymentUrl = payfastService.createPaymentUrl({
        merchantReference,
        amount: Number(amount),
        itemName: "ATSBoost Deep Analysis",
        itemDescription: "One-time comprehensive CV analysis with South African context",
        email: req.user!.email,
        firstName: req.user!.name?.split(" ")[0] || undefined,
        lastName: req.user!.name?.split(" ").slice(1).join(" ") || undefined
      });
      
      // Store payment reference
      // In a real implementation, we would save this reference to track the payment
      
      // Redirect to PayFast
      res.redirect(paymentUrl);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/create-payfast-subscription", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { plan_type, amount } = req.body;
      
      if (!plan_type || !amount) {
        return res.status(400).json({ error: "Plan type and amount are required" });
      }
      
      // Create a merchant reference
      const merchantReference = `premium_sub_${req.user!.id}_${Date.now()}`;
      
      // Create subscription URL
      const subscriptionUrl = payfastService.createSubscriptionUrl({
        merchantReference,
        amount: Number(amount),
        itemName: "ATSBoost Premium Subscription",
        itemDescription: "Monthly subscription to ATSBoost premium features",
        email: req.user!.email,
        firstName: req.user!.name?.split(" ")[0] || undefined,
        lastName: req.user!.name?.split(" ").slice(1).join(" ") || undefined,
        frequency: 'monthly',
        subscription: true
      });
      
      // Redirect to PayFast
      res.redirect(subscriptionUrl);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/payfast-notify", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestBody = req.body;
      const signature = req.headers['x-pf-signature'] as string;
      
      // Verify the PayFast notification
      const isValid = await payfastService.verifyPaymentNotification(requestBody, signature);
      
      if (!isValid) {
        return res.status(400).send("Invalid notification");
      }
      
      // Process the payment based on notification data
      const { payment_status, m_payment_id, pf_payment_id, amount_gross, token } = requestBody;
      
      // Check payment status
      if (payment_status !== 'COMPLETE') {
        return res.status(200).send("Payment not complete");
      }
      
      // Extract payment details
      const [paymentType, userId] = m_payment_id.split('_');
      
      if (paymentType === 'deep_analysis') {
        // Process one-time analysis payment
        // In a real implementation, we would update the database and trigger the analysis
        console.log(`Deep analysis payment processed for user ${userId}, amount: ${amount_gross}`);
        
        // Send WhatsApp notification
        const user = await storage.getUser(Number(userId));
        const profile = user ? await storage.getSaProfile(user.id) : null;
        
        if (profile?.whatsappEnabled && profile.whatsappNumber && profile.whatsappVerified) {
          await whatsappService.sendPaymentConfirmation(
            profile.whatsappNumber,
            'Deep Analysis',
            amount_gross
          );
        }
      } else if (paymentType === 'premium_sub') {
        // Process subscription payment
        // In a real implementation, we would create or update the subscription
        console.log(`Premium subscription payment processed for user ${userId}, amount: ${amount_gross}`);
        
        // Create or update subscription
        const user = await storage.getUser(Number(userId));
        
        if (user) {
          // Get all plans
          const plans = await storage.getActivePlans();
          const premiumPlan = plans.find(p => p.name.toLowerCase().includes('premium'));
          
          if (premiumPlan) {
            // Check if user already has a subscription
            const existingSubscription = await storage.getSubscription(user.id);
            
            const now = new Date();
            const endDate = new Date(now);
            endDate.setMonth(endDate.getMonth() + 1);
            
            if (existingSubscription) {
              // Update existing subscription
              await storage.updateSubscription(existingSubscription.id, {
                planId: premiumPlan.id,
                status: 'active',
                currentPeriodStart: now,
                currentPeriodEnd: endDate,
                paymentMethod: 'payfast',
                cancelAtPeriodEnd: false
              });
            } else {
              // Create new subscription
              await storage.createSubscription({
                userId: user.id,
                planId: premiumPlan.id,
                status: 'active',
                currentPeriodStart: now,
                currentPeriodEnd: endDate,
                paymentMethod: 'payfast',
                cancelAtPeriodEnd: false
              });
            }
            
            // Send WhatsApp notification
            const profile = await storage.getSaProfile(user.id);
            
            if (profile?.whatsappEnabled && profile.whatsappNumber && profile.whatsappVerified) {
              await whatsappService.sendSubscriptionConfirmation(
                profile.whatsappNumber,
                'Premium',
                endDate.toLocaleDateString('en-ZA')
              );
            }
          }
        }
      }
      
      res.status(200).send("Notification processed");
    } catch (error) {
      console.error('PayFast notification error:', error);
      res.status(500).send("Error processing notification");
    }
  });

  // Subscription management endpoints - PayFast integration will replace these
  app.post("/api/subscribe", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { planId, paymentMethod } = req.body;
      
      if (!planId) {
        return res.status(400).json({ error: "Plan ID is required" });
      }
      
      const plan = await storage.getPlan(Number(planId));
      
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      
      // Check if user already has a subscription
      const existingSubscription = await storage.getSubscription(req.user!.id);
      
      if (existingSubscription && existingSubscription.status === 'active') {
        // Update existing subscription
        const currentPeriodEnd = new Date(existingSubscription.currentPeriodEnd);
        
        const subscription = await storage.updateSubscription(existingSubscription.id, {
          planId: Number(planId),
          paymentMethod: paymentMethod || existingSubscription.paymentMethod,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1))
        });
        
        return res.json(subscription);
      }
      
      // Create new subscription
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);
      
      const subscription = await storage.createSubscription({
        userId: req.user!.id,
        planId: Number(planId),
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: endDate,
        paymentMethod: paymentMethod || 'card',
        cancelAtPeriodEnd: false
      });
      
      // Return more detailed information about the subscription and premium features
      res.json({
        subscription: subscription,
        details: {
          planName: plan.name,
          price: `ZAR ${plan.priceInCents / 100}`,
          status: 'active',
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          nextBillingDate: endDate.toISOString(),
          paymentMethod: paymentMethod || 'card',
          transactionId: `trans_${Date.now()}`,
          receiptUrl: `/receipts/${subscription.id}.pdf`
        },
        features: {
          deepAnalysis: {
            unlimited: true,
            description: "Get unlimited deep analysis reports with South African specific insights"
          },
          realTimeCvEditor: {
            enabled: true,
            description: "Edit your CV with AI-powered suggestions optimized for South African employers"
          },
          jobAlerts: {
            enabled: true,
            description: "Receive SMS notifications for South African job opportunities matching your skills"
          },
          interviewPrep: {
            enabled: true,
            description: "Practice with South African specific interview questions including B-BBEE topics"
          },
          saOptimization: {
            enabled: true,
            description: "Get recommendations specific to South African job market including B-BBEE and NQF presentation"
          }
        },
        message: "Your premium subscription has been activated successfully. You now have access to all premium features tailored for the South African job market."
      });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/subscription/cancel", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscription = await storage.getSubscription(req.user!.id);
      
      if (!subscription) {
        return res.status(404).json({ error: "No active subscription found" });
      }
      
      const updatedSubscription = await storage.updateSubscription(subscription.id, {
        cancelAtPeriodEnd: true
      });
      
      res.json(updatedSubscription);
    } catch (error) {
      next(error);
    }
  });

  // Admin database management endpoint
  // Employer management routes
  app.post("/api/employers", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Import employer storage functions
      const { getEmployerByUserId, createEmployer } = await import('./employerStorage');
      
      // Check if user already has an employer profile
      const existingEmployer = await getEmployerByUserId(req.user!.id);
      if (existingEmployer) {
        return res.status(400).json({ error: "You already have an employer profile" });
      }
      
      // Create a new employer profile
      const employerData = {
        userId: req.user!.id,
        companyName: req.body.companyName,
        industry: req.body.industry,
        size: req.body.size,
        location: req.body.location,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl,
        bbbeeLevel: req.body.bbbeeLevel,
        verified: false // Default to false, verification process can be added later
      };
      
      const employer = await createEmployer(employerData);
      
      res.status(201).json({
        id: employer.id,
        companyName: employer.companyName,
        industry: employer.industry,
        verified: employer.verified
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/employers/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { getEmployer } = await import('./employerStorage');
      
      const employerId = Number(req.params.id);
      
      if (isNaN(employerId)) {
        return res.status(400).json({ error: "Invalid employer ID" });
      }
      
      const employer = await getEmployer(employerId);
      
      if (!employer) {
        return res.status(404).json({ error: "Employer not found" });
      }
      
      // Return employer profile without sensitive information
      res.json({
        id: employer.id,
        companyName: employer.companyName,
        industry: employer.industry,
        size: employer.size,
        location: employer.location,
        description: employer.description,
        websiteUrl: employer.websiteUrl,
        bbbeeLevel: employer.bbbeeLevel,
        verified: employer.verified
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Job posting routes
  app.post("/api/job-postings", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { getEmployerByUserId, createJobPosting } = await import('./employerStorage');
      
      // Check if user is an employer
      const employer = await getEmployerByUserId(req.user!.id);
      
      if (!employer) {
        return res.status(403).json({ 
          error: "You need to create an employer profile first",
          createEmployerFirst: true
        });
      }
      
      // Create a new job posting
      const jobData = {
        employerId: employer.id,
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        salary: req.body.salary,
        salaryRange: req.body.salaryRange,
        jobType: req.body.jobType,
        requiredSkills: req.body.requiredSkills || [],
        preferredSkills: req.body.preferredSkills || [],
        education: req.body.education,
        experience: req.body.experience,
        bbbeePreference: req.body.bbbeePreference,
        isActive: true,
        applicationDeadline: req.body.applicationDeadline ? new Date(req.body.applicationDeadline) : null
      };
      
      const job = await createJobPosting(jobData);
      
      res.status(201).json({
        id: job.id,
        title: job.title,
        location: job.location,
        employerId: job.employerId,
        createdAt: job.createdAt
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/job-postings", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { getJobPostings } = await import('./employerStorage');
      
      const query = {
        location: req.query.location as string,
        title: req.query.title as string,
        industry: req.query.industry as string,
        jobType: req.query.jobType as string,
        limit: Math.min(Number(req.query.limit) || 20, 100) // Cap at 100 results
      };
      
      const jobs = await getJobPostings(query);
      
      res.json(jobs);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/job-postings/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { getJobPosting, getEmployer } = await import('./employerStorage');
      
      const jobId = Number(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ error: "Invalid job posting ID" });
      }
      
      const job = await getJobPosting(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job posting not found" });
      }
      
      // Get employer info for the job
      const employer = await getEmployer(job.employerId);
      
      res.json({
        ...job,
        employer: employer ? {
          id: employer.id,
          companyName: employer.companyName,
          industry: employer.industry,
          verified: employer.verified
        } : null
      });
    } catch (error) {
      next(error);
    }
  });
  
  // AI Job Matching routes
  app.get("/api/cv/:cvId/matching-jobs", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvId = Number(req.params.cvId);
      
      if (isNaN(cvId)) {
        return res.status(400).json({ error: "Invalid CV ID" });
      }
      
      const cv = await storage.getCV(cvId);
      
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }
      
      // Check if the CV belongs to the user
      if (cv.userId !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to access this CV" });
      }
      
      // Import the job matching service
      const { findMatchingJobs } = await import('./services/jobMatching');
      
      // Find matching jobs
      const limit = Math.min(Number(req.query.limit) || 10, 50); // Cap at 50 results
      const matches = await findMatchingJobs(cvId, limit);
      
      res.json(matches);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/job-postings/:jobId/matching-cvs", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { getJobPosting } = await import('./employerStorage');
      const { getEmployerByUserId } = await import('./employerStorage');
      
      const jobId = Number(req.params.jobId);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ error: "Invalid job posting ID" });
      }
      
      const job = await getJobPosting(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job posting not found" });
      }
      
      // Check if the job belongs to the user's employer profile
      const employer = await getEmployerByUserId(req.user!.id);
      
      if (!employer || employer.id !== job.employerId) {
        return res.status(403).json({ error: "You don't have permission to access matches for this job" });
      }
      
      // Import the job matching service
      const { findMatchingCVs } = await import('./services/jobMatching');
      
      // Find matching CVs
      const limit = Math.min(Number(req.query.limit) || 10, 50); // Cap at 50 results
      const matches = await findMatchingCVs(jobId, limit);
      
      // Filter out sensitive information from matched CVs
      const sanitizedMatches = matches.map(match => ({
        cv: {
          id: match.cv.id,
          title: match.cv.title,
          targetPosition: match.cv.targetPosition,
          targetIndustry: match.cv.targetIndustry,
        },
        score: match.score,
        matchedSkills: match.matchedSkills
      }));
      
      res.json(sanitizedMatches);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/database", isAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Import the database utilities
      const { generateSchemaDocs, checkDatabaseHealth } = await import('./db-utils');
      
      // Run health check
      const dbHealth = await checkDatabaseHealth();
      
      // Generate schema documentation if database is healthy
      let schemaFile = null;
      if (dbHealth) {
        schemaFile = await generateSchemaDocs();
      }
      
      res.json({
        status: dbHealth ? "healthy" : "error",
        message: dbHealth ? "Database is healthy and documentation generated" : "Database health check failed",
        schemaDocumentation: schemaFile,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
