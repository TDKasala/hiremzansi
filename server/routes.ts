import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { extractTextFromPDF } from "./services/pdfParser";
import { extractTextFromDOCX } from "./services/docxParser";
import { analyzeCV } from "./services/atsScoring";
import { insertUserSchema, insertCvSchema, insertAtsScoreSchema, insertDeepAnalysisReportSchema } from "@shared/schema";
import { setupAuth } from "./auth";

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

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ 
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
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
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      let content = "";

      // Extract text from file based on mimetype
      if (file.mimetype === "application/pdf") {
        content = await extractTextFromPDF(file.buffer);
      } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        content = await extractTextFromDOCX(file.buffer);
      }

      if (!content) {
        return res.status(400).json({ error: "Could not extract content from file" });
      }

      // Get user id from authenticated user or use guest id
      let userId = req.isAuthenticated() ? req.user!.id : 0;
      let title = req.body.title || file.originalname.replace(/\.[^/.]+$/, "");
      
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
        isDefault: req.body.isDefault === "true"
      };

      const cv = await storage.createCV(cvData);

      // Begin background analysis of the CV
      const analysis = analyzeCV(content);
      
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
        const analysis = analyzeCV(cv.content);
        
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

      // Check if user has an active subscription or if they need to pay
      const subscription = await storage.getActiveSubscription(req.user!.id);
      let requiresPayment = true;
      
      if (subscription) {
        // Check subscription tier and features
        requiresPayment = false;
      }

      // Check if an analysis already exists
      let deepAnalysis = await storage.getDeepAnalysisByCV(cv.id);
      
      if (!deepAnalysis) {
        // Create a new analysis report (status = pending)
        deepAnalysis = await storage.createDeepAnalysisReport({
          cvId: cv.id,
          userId: req.user!.id,
          status: 'pending',
          paidAmount: requiresPayment ? 5550 : 0 // ZAR 55.50 (stored in cents)
        });
      }

      // In a real implementation, this would trigger a background job
      // For now, simulate the analysis completing immediately if payment not required
      if (!requiresPayment && deepAnalysis.status === 'pending') {
        // Upgrade the analysis with mock data
        deepAnalysis = await storage.updateDeepAnalysisReport(deepAnalysis.id, {
          status: 'completed',
          detailedAnalysis: {
            summary: "Your CV has been thoroughly analyzed.",
            keyFindings: [
              "Strong emphasis on technical skills",
              "Lacks quantifiable achievements",
              "Education section well formatted",
              "Consider adding more South African context"
            ],
            sectionScores: {
              professional: 85,
              education: 90,
              skills: 75,
              achievements: 60
            }
          },
          industryComparison: {
            industry: cv.targetIndustry || "Technology",
            averageScore: 72,
            yourScore: 81,
            keyDifferences: [
              "You have more technical certifications than average",
              "Industry values project management experience"
            ]
          },
          regionalRecommendations: {
            region: "South Africa",
            keywords: ["B-BBEE", "NQF Level", "Johannesburg", "Cape Town"],
            certifications: ["SETA", "Microsoft Certified", "CompTIA"],
            marketTrends: "Growing demand for data science and cloud skills"
          }
        });
      }

      res.json({
        id: deepAnalysis.id,
        status: deepAnalysis.status,
        requiresPayment,
        price: requiresPayment ? 55.50 : 0,
        reportUrl: deepAnalysis.status === 'completed' ? `/api/reports/${deepAnalysis.id}` : null,
        createdAt: deepAnalysis.createdAt,
        detailedAnalysis: deepAnalysis.detailedAnalysis,
        industryComparison: deepAnalysis.industryComparison,
        regionalRecommendations: deepAnalysis.regionalRecommendations
      });
    } catch (error) {
      next(error);
    }
  });

  // Subscription management endpoints
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
      
      res.json(subscription);
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

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
