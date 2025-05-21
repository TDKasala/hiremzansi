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