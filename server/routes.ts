import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { extractTextFromPDF } from "./services/simplePdfParser";
import { extractTextFromDOCX } from "./services/docxParser";
import { performDeepAnalysis } from "./services/atsScoring";
import { localAIService } from "./services/localAI";
import { analyzeCV as analyzeResume } from "./services/simpleAtsAnalysis";
import { analyzeCVContent, formatAnalysisForResponse } from "./services/atsAnalysisService";
import { generateQuizQuestions } from "./services/quizGeneratorService";
import { 
  insertUserSchema, 
  insertCvSchema, 
  insertAtsScoreSchema, 
  insertDeepAnalysisReportSchema,
  insertEmployerSchema,
  insertJobPostingSchema
} from "@shared/schema";
import { setupAuth } from "./auth";
import { payfastService } from "./services/payfastService";
import { whatsappService } from "./services/whatsappService";
import { jobBoardService } from "./services/jobBoardService";
import { interviewSimulationService } from "./services/interviewSimulationService";
import { skillGapAnalyzerService } from "./services/skillGapAnalyzerService";
import * as employerStorage from "./employerStorage";
import adminRoutes from "./routes/admin";
import testXaiApiRoutes from "./routes/testXaiApi";
import mockCvAnalysisRoutes from "./routes/mockCvAnalysis";
import pdfTestRoutes from "./routes/pdfTest";
import optimizedCvAnalysisRoutes from "./routes/optimizedCvAnalysis";
import { sendWeeklyCareerDigests, generatePersonalizedRecommendations } from "./services/recommendationService";
import { sendCareerDigestEmail } from "./services/emailService";

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
};

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ error: "Admin access required" });
};

const hasActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  try {
    const userId = req.user.id;
    const subscription = await storage.getActiveSubscription(userId);
    
    if (!subscription) {
      return res.status(403).json({ 
        error: "Subscription required", 
        message: "This feature requires an active subscription" 
      });
    }
    
    next();
  } catch (error) {
    console.error("Error checking subscription:", error);
    next(error);
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  await setupAuth(app);
  
  // Health check endpoints
  app.get("/api/health", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const dbStatus = await storage.checkDatabaseConnection();
      
      res.json({
        status: "ok",
        version: "1.0.0",
        database: dbStatus ? "connected" : "disconnected"
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Get subscription plans
  app.get("/api/plans", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      next(error);
    }
  });
  
  // Get all CVs for the authenticated user
  app.get("/api/cvs", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const cvs = await storage.getCVsByUser(userId);
      res.json(cvs);
    } catch (error) {
      next(error);
    }
  });
  
  // CV Upload endpoint
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: "No file uploaded", 
          message: "Please upload a file" 
        });
      }
      
      const { buffer, originalname, mimetype, size } = req.file;
      
      // Process file based on its type
      let textContent = "";
      
      if (mimetype === "application/pdf") {
        console.log("Processing PDF file");
        textContent = await extractTextFromPDF(buffer);
      } else if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
                 mimetype === "application/msword") {
        console.log("Processing DOCX/DOC file");
        textContent = await extractTextFromDOCX(buffer);
      } else if (mimetype === "text/plain") {
        console.log("Processing TXT file");
        textContent = buffer.toString("utf-8");
      } else {
        return res.status(400).json({ 
          error: "Unsupported file type", 
          message: "Please upload a PDF, DOCX, or TXT file" 
        });
      }
      
      if (!textContent || textContent.length < 100) {
        return res.status(400).json({ 
          error: "Empty or invalid file", 
          message: "The uploaded file doesn't contain enough text to analyze" 
        });
      }
      
      // Sanitize and trim content
      textContent = textContent.replace(/[\r\n]+/g, "\n").trim();
      
      // Create CV record in the database
      const cvData = {
        fileName: originalname,
        fileType: mimetype,
        fileSize: size,
        content: textContent,
        userId: req.isAuthenticated() ? req.user?.id : null,
        isGuest: !req.isAuthenticated()
      };
      
      // Validate data
      const validatedData = insertCvSchema.parse(cvData);
      
      // Create CV record
      const cv = await storage.createCV(validatedData);
      
      res.status(201).json(cv);
    } catch (error) {
      console.error("Error processing upload:", error);
      next(error);
    }
  });
  
  // Analyze CV endpoint using xAI Grok API - called after consent is given
  app.post("/api/analyze-cv/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvId = parseInt(req.params.id);
      
      if (isNaN(cvId)) {
        return res.status(400).json({ 
          error: "Invalid CV ID", 
          message: "Please provide a valid CV ID." 
        });
      }
      
      // Retrieve the CV from the database
      const cv = await storage.getCV(cvId);
      
      if (!cv) {
        return res.status(404).json({ 
          error: "CV not found", 
          message: "The CV with the specified ID was not found." 
        });
      }
      
      // Check if the CV belongs to the user (if authenticated)
      const isGuest = !req.isAuthenticated();
      
      if (!isGuest && cv.userId && req.user && cv.userId !== req.user.id) {
        return res.status(403).json({ 
          error: "Access denied", 
          message: "You do not have permission to access this CV." 
        });
      }
      
      // Get optional job description if provided in the request
      const { jobDescription } = req.body;
      
      console.log("Starting CV analysis with xAI service");
      
      // Use our xAI-powered analysis service
      const analysis = await analyzeCVContent(cv, jobDescription);
      
      if (!analysis.success) {
        console.error("xAI analysis failed:", analysis.error);
        return res.status(500).json({
          error: "CV analysis failed",
          message: analysis.error || "Failed to analyze CV with xAI service"
        });
      }
      
      // Format the xAI analysis for the response
      const formattedAnalysis = formatAnalysisForResponse(analysis);
      
      // Save analysis result to database
      try {
        // Create an ATS score record with the detailed analysis from xAI
        const atsScore = await storage.createATSScore({
          cvId,
          score: formattedAnalysis.score,
          skillsScore: formattedAnalysis.skillsScore || 0,
          formatScore: formattedAnalysis.formatScore || 0,
          contextScore: formattedAnalysis.contextScore || 0,
          strengths: formattedAnalysis.strengths || [],
          improvements: formattedAnalysis.improvements || [],
          issues: []
        });
        
        // Add the ATS score ID to the response
        formattedAnalysis.scoreId = atsScore.id;
        
        console.log("Successfully created ATS score record with ID:", atsScore.id);
      } catch (error) {
        console.error("Error creating ATS score:", error);
        // Continue to send the analysis even if saving to DB fails
      }
      
      // Send the comprehensive analysis response from xAI
      return res.json(formattedAnalysis);
      
    } catch (error) {
      console.error("Error analyzing CV:", error);
      next(error);
    }
  });
  
  app.get("/api/ats-score/:cvId", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvId = parseInt(req.params.cvId);
      
      if (isNaN(cvId)) {
        return res.status(400).json({ error: "Invalid CV ID" });
      }
      
      const cv = await storage.getCV(cvId);
      
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }
      
      // Check if the CV belongs to the current user (if authenticated)
      const isAuthenticated = req.isAuthenticated();
      const hasAccess = !isAuthenticated || !cv.userId || cv.userId === req.user?.id;
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const atsScore = await storage.getATSScoreByCV(cvId);
      
      if (!atsScore) {
        return res.status(404).json({ error: "ATS score not found" });
      }
      
      res.json(atsScore);
    } catch (error) {
      next(error);
    }
  });
  
  // Get latest CV uploaded by user
  app.get("/api/latest-cv", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(404).json({ error: "No CVs found for this user" });
      }
      
      const userId = req.user.id;
      const cv = await storage.getLatestCVByUser(userId);
      
      if (!cv) {
        return res.status(404).json({ error: "No CVs found for this user" });
      }
      
      res.json(cv);
    } catch (error) {
      next(error);
    }
  });
  
  // Realtime ATS analysis endpoint using local AI service
  app.post("/api/analyze-resume-text", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resumeContent, jobDescription } = req.body;
      
      if (!resumeContent || typeof resumeContent !== 'string' || resumeContent.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'CV text is required'
        });
      }
      
      // Use the local AI service for resume text analysis only
      const analysis = await localAIService.analyzeResume(resumeContent, jobDescription);
      
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing CV text:', error);
      next(error);
    }
  });
  
  // Update CV details
  app.put("/api/cv/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvId = parseInt(req.params.id);
      
      if (isNaN(cvId)) {
        return res.status(400).json({ error: "Invalid CV ID" });
      }
      
      const cv = await storage.getCV(cvId);
      
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }
      
      // Check if the CV belongs to the user
      if (cv.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updates = req.body;
      const updatedCV = await storage.updateCV(cvId, updates);
      
      res.json(updatedCV);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete CV
  app.delete("/api/cv/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvId = parseInt(req.params.id);
      
      if (isNaN(cvId)) {
        return res.status(400).json({ error: "Invalid CV ID" });
      }
      
      const cv = await storage.getCV(cvId);
      
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }
      
      // Check if the CV belongs to the user
      if (cv.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteCV(cvId);
      
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });
  
  // Additional admin routes
  app.use("/api/admin", isAdmin, adminRoutes);
  
  // xAI API test routes
  app.use("/api", testXaiApiRoutes);
  
  // Mock CV analysis routes for demonstration
  app.use("/api", mockCvAnalysisRoutes);
  
  // PDF testing routes
  app.use("/api", pdfTestRoutes);
  
  // Mobile-optimized CV analysis routes for fast performance (<2s on 3G)
  app.use("/api", optimizedCvAnalysisRoutes);
  
  // WhatsApp Integration Routes
  
  // Endpoint to handle WhatsApp webhook - for receiving messages and CV files
  app.post("/api/whatsapp/webhook", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await whatsappService.processWebhook(req.body);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
      next(error);
    }
  });

  // Endpoint to send WhatsApp upload instructions to a user
  app.post("/api/whatsapp/send-instructions", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      
      const success = await whatsappService.sendUploadInstructions(phoneNumber);
      
      if (success) {
        // If the user has a phone number saved, update it
        if (req.user && (!req.user.phoneNumber || req.user.phoneNumber !== phoneNumber)) {
          await storage.updateUser(req.user.id, { phoneNumber });
        }
        
        res.status(200).json({ message: "Instructions sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send instructions" });
      }
    } catch (error) {
      console.error('Error sending WhatsApp instructions:', error);
      next(error);
    }
  });

  // Endpoint to verify WhatsApp number
  app.post("/api/whatsapp/verify", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      
      // Generate a random 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the verification code
      const tokenExpiry = new Date();
      tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 10); // 10 minutes expiry
      
      await storage.updateUser(req.user.id, { 
        verificationToken: verificationCode,
        verificationTokenExpiry: tokenExpiry
      });
      
      // Send the verification code via WhatsApp
      const success = await whatsappService.sendVerificationCode(phoneNumber, verificationCode);
      
      if (success) {
        res.status(200).json({ message: "Verification code sent" });
      } else {
        res.status(500).json({ error: "Failed to send verification code" });
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      next(error);
    }
  });

  // Endpoint to confirm WhatsApp verification
  app.post("/api/whatsapp/confirm", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, phoneNumber } = req.body;
      
      if (!code || !phoneNumber) {
        return res.status(400).json({ error: "Verification code and phone number are required" });
      }
      
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if the verification code matches and hasn't expired
      if (user.verificationToken !== code) {
        return res.status(400).json({ error: "Invalid verification code" });
      }
      
      const now = new Date();
      if (!user.verificationTokenExpiry || now > user.verificationTokenExpiry) {
        return res.status(400).json({ error: "Verification code has expired" });
      }
      
      // Verification successful, update the user's phone information
      await storage.updateUser(user.id, {
        phoneNumber,
        phoneVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      });
      
      // If the user has a South African profile, update the WhatsApp settings there too
      const saProfile = await storage.getSaProfileByUserId(user.id);
      if (saProfile) {
        await storage.updateSaProfile(saProfile.id, {
          whatsappNumber: phoneNumber,
          whatsappVerified: true,
          whatsappEnabled: true
        });
      }
      
      res.status(200).json({ message: "WhatsApp number verified successfully" });
    } catch (error) {
      console.error('Error confirming verification:', error);
      next(error);
    }
  });

  // Endpoint to get WhatsApp settings
  app.get("/api/whatsapp-settings", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if the user has a South African profile
      const saProfile = await storage.getSaProfileByUserId(user.id);
      
      let settings = {
        enabled: false,
        phoneNumber: user.phoneNumber || null,
        verified: user.phoneVerified || false
      };
      
      // If the user has a South African profile, use those settings
      if (saProfile) {
        settings = {
          enabled: saProfile.whatsappEnabled || false,
          phoneNumber: saProfile.whatsappNumber || user.phoneNumber || null,
          verified: saProfile.whatsappVerified || user.phoneVerified || false
        };
      }
      
      res.status(200).json(settings);
    } catch (error) {
      console.error('Error getting WhatsApp settings:', error);
      next(error);
    }
  });

  // Endpoint to update WhatsApp settings
  app.post("/api/whatsapp-settings", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { enabled, phoneNumber } = req.body;
      
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if the user has a South African profile
      const saProfile = await storage.getSaProfileByUserId(user.id);
      
      if (saProfile) {
        // Update the SA profile with the new settings
        await storage.updateSaProfile(saProfile.id, {
          whatsappEnabled: enabled,
          whatsappNumber: phoneNumber
        });
      }
      
      // Always update the user record too
      await storage.updateUser(user.id, {
        phoneNumber
      });
      
      res.status(200).json({
        enabled,
        phoneNumber,
        verified: user.phoneVerified || (saProfile?.whatsappVerified || false)
      });
    } catch (error) {
      console.error('Error updating WhatsApp settings:', error);
      next(error);
    }
  });
  
  // Template Generation API Routes
  app.post("/api/templates/ai-cv", isAuthenticated, hasActiveSubscription, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userProfile, jobDescription } = req.body;
      const { templateService } = await import('./services/templateService');
      
      const template = await templateService.generateAIPoweredTemplate(userProfile, jobDescription);
      
      res.json({
        success: true,
        template
      });
    } catch (error: any) {
      console.error('Error generating AI CV template:', error);
      res.status(500).json({ 
        error: "Failed to generate AI-powered CV template",
        details: error.message 
      });
    }
  });

  app.post("/api/templates/industry-cv", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { industry, experienceLevel } = req.body;
      const { templateService } = await import('./services/templateService');
      
      const template = await templateService.generateIndustryTemplate(industry, experienceLevel);
      
      res.json({
        success: true,
        template
      });
    } catch (error: any) {
      console.error('Error generating industry CV template:', error);
      res.status(500).json({ 
        error: "Failed to generate industry-specific CV template",
        details: error.message 
      });
    }
  });

  app.post("/api/templates/cover-letter", isAuthenticated, hasActiveSubscription, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userProfile, company, position, jobDescription } = req.body;
      const { templateService } = await import('./services/templateService');
      
      const template = await templateService.generateCoverLetterTemplate(userProfile, company, position, jobDescription);
      
      res.json({
        success: true,
        template
      });
    } catch (error: any) {
      console.error('Error generating cover letter template:', error);
      res.status(500).json({ 
        error: "Failed to generate cover letter template",
        details: error.message 
      });
    }
  });

  app.post("/api/templates/dynamic-build", isAuthenticated, hasActiveSubscription, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userProfile, selectedSections, customContent } = req.body;
      const { templateService } = await import('./services/templateService');
      
      const result = await templateService.buildDynamicTemplate(userProfile, selectedSections, customContent);
      
      res.json({
        success: true,
        template: result.template,
        previewScore: result.previewScore
      });
    } catch (error: any) {
      console.error('Error building dynamic template:', error);
      res.status(500).json({ 
        error: "Failed to build dynamic template",
        details: error.message 
      });
    }
  });

  app.get("/api/templates/categories", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { templateService } = await import('./services/templateService');
      
      const categories = templateService.getTemplateCategories();
      
      res.json({
        success: true,
        categories
      });
    } catch (error: any) {
      console.error('Error getting template categories:', error);
      res.status(500).json({ 
        error: "Failed to get template categories",
        details: error.message 
      });
    }
  });

  // Quiz Generator API using xAI
  app.get("/api/quiz/:category", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      const count = req.query.count ? parseInt(req.query.count as string) : 5;
      
      // Validate category and count
      const validCategories = ["interview", "technical", "workplace"];
      const validCategory = validCategories.includes(category) ? category : "default";
      const validCount = !isNaN(count) && count > 0 && count <= 10 ? count : 5;
      
      console.log(`Generating ${validCount} quiz questions for category: ${validCategory}`);
      
      // Generate quiz questions using xAI service
      const questions = await generateQuizQuestions(validCategory, validCount);
      
      res.json({
        category: validCategory,
        questions
      });
    } catch (error) {
      console.error("Error generating quiz questions:", error);
      next(error);
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}