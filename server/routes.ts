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
  app.post("/api/upload", isAuthenticated, upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
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
