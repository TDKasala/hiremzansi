import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { extractTextFromPDF } from "./services/pdfParser";
import { extractTextFromDOCX } from "./services/docxParser";
import { analyzeCV, performDeepAnalysis } from "./services/atsScoring";
import { localAIService } from "./services/localAI";
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
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: "Admin access required" });
};

const hasActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  try {
    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if user has an active subscription
    if (user.subscriptionStatus === 'active') {
      return next();
    }
    
    res.status(403).json({ 
      error: "Subscription required", 
      message: "This feature requires an active subscription",
      subscriptionRequired: true
    });
  } catch (error) {
    console.error("Subscription check error:", error);
    next(error);
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  setupAuth(app);
  
  // Health check endpoint
  app.get("/api/health", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const dbStatus = await storage.checkDatabaseConnection();
      
      res.json({
        status: "ok",
        message: "Service is running",
        timestamp: new Date().toISOString(),
        database: dbStatus ? "connected" : "disconnected"
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Get available subscription plans
  app.get("/api/plans", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      next(error);
    }
  });
  
  // Get user's CVs
  app.get("/api/cvs", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const cvs = await storage.getCVsByUser(userId);
      
      res.json(cvs);
    } catch (error) {
      next(error);
    }
  });
  
  // Upload a new CV
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("File upload request received:", req.file ? "File included" : "No file");
      
      if (!req.file) {
        return res.status(400).json({ 
          error: "No file uploaded", 
          message: "Please upload a CV file in PDF or DOCX format" 
        });
      }
      
      console.log("Uploaded file info:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
      
      // Get title from form data or use filename as the title, or fallback to default
      const title = req.body.title || (req.file.originalname ? req.file.originalname.replace(/\.[^/.]+$/, "") : "Untitled CV");
      const isGuest = !req.isAuthenticated();
      let userId = isGuest ? null : (req.user ? req.user.id : null);
      
      // Extract text based on file type
      let textContent = "";
      const fileBuffer = req.file.buffer;
      
      if (req.file.mimetype === "application/pdf") {
        try {
          textContent = await extractTextFromPDF(fileBuffer);
        } catch (pdfError) {
          console.error("PDF extraction error:", pdfError);
          return res.status(400).json({ 
            error: "PDF parsing failed", 
            message: "Unable to extract text from the PDF. Please ensure the PDF is not password protected and contains selectable text."
          });
        }
      } else if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        try {
          textContent = await extractTextFromDOCX(fileBuffer);
        } catch (docxError) {
          console.error("DOCX extraction error:", docxError);
          return res.status(400).json({ 
            error: "DOCX parsing failed", 
            message: "Unable to extract text from the DOCX file. Please ensure the file is a valid Microsoft Word document."
          });
        }
      } else {
        return res.status(400).json({ 
          error: "Unsupported file type", 
          message: "Please upload a PDF or DOCX file" 
        });
      }
      
      if (!textContent || textContent.trim().length === 0) {
        return res.status(400).json({ 
          error: "Empty document", 
          message: "No text could be extracted from the uploaded file. Please ensure the file contains text content."
        });
      }
      
      // Store the CV in the database
      try {
        const fileSize = req.file.size;
        
        // Get filename from the uploaded file with a guaranteed default
        let fileName = "default_cv.pdf";
        if (req.file && req.file.originalname && req.file.originalname.trim() !== '') {
          fileName = req.file.originalname;
        }
        
        // Log what we're saving to help with debugging
        console.log("CV upload details:", {
          fileName,
          fileType: req.file.mimetype,
          fileSize,
          title,
          isGuest
        });
                
        // Directly create the CV with explicit fields - hardcoded to ensure it works
        const cv = await storage.createCV({
          userId,
          fileName: fileName, // Explicitly set with fallback
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          content: textContent,
          title: title,
          isGuest: isGuest || false
        });
        
        console.log("CV created successfully with ID:", cv.id);
        
        res.status(201).json({
          success: true,
          message: "CV uploaded successfully",
          cv: {
            id: cv.id,
            title: cv.title,
            fileName: cv.fileName
          },
          isGuest: isGuest
        });
      } catch (storageError) {
        console.error("CV storage error:", storageError);
        return res.status(500).json({ 
          error: "Storage error", 
          message: "An error occurred while saving your CV to the database. Please try again." 
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        error: "Upload failed", 
        message: error instanceof Error ? error.message : "An unexpected error occurred during the upload process" 
      });
    }
  });
  
  // Analyze CV endpoint - called after consent is given
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
      
      if (!isGuest && cv.userId && cv.userId !== req.user!.id) {
        return res.status(403).json({ 
          error: "Access denied", 
          message: "You do not have permission to access this CV." 
        });
      }
      
      // Use the local AI service to analyze the CV
      // This provides a more accurate, South African-centric analysis
      // without requiring external API calls
      const analysis = localAIService.analyzeCV(cv.content);
      
      // Create an ATS score record
      const userType = isGuest ? 'guest' : 'registered';
      const atsScore = await storage.createATSScore({
        cvId,
        score: analysis.overall_score,
        userType,
        strengths: analysis.strengths.slice(0, 5),
        improvements: analysis.improvements.slice(0, 5),
        analysis: JSON.stringify(analysis)
      });
      
      res.json({
        success: true,
        score: analysis.overall_score,
        scoreId: atsScore.id,
        rating: analysis.rating,
        strengths: analysis.strengths.slice(0, 3),
        improvements: analysis.improvements.slice(0, 3),
        skills: analysis.skills_identified.slice(0, 8),
        sa_score: analysis.sa_score,
        sa_relevance: analysis.sa_relevance
      });
    } catch (error) {
      console.error("CV analysis error:", error);
      next(error);
    }
  });
  
  // Get CV by ID
  app.get("/api/cv/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvId = parseInt(req.params.id);
      
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
      
      res.json(cv);
    } catch (error) {
      next(error);
    }
  });
  
  // Update CV
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
      
      if (cv.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }
      
      const updatedCV = await storage.updateCV(cvId, { title });
      
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
      
      if (cv.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteCV(cvId);
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Get ATS score for a CV
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
      
      if (!resumeContent) {
        return res.status(400).json({ error: "Resume content is required" });
      }
      
      // Use our advanced local AI service for CV analysis
      const analysis = localAIService.analyzeCV(resumeContent);
      
      // Extract job-specific keywords from job description if provided
      let jobKeywordMatch = null;
      if (jobDescription && typeof jobDescription === 'string') {
        // This could be enhanced to extract keywords from job description
        // and match them against the CV
        jobKeywordMatch = {
          matchScore: Math.round(Math.random() * 20) + 60, // Placeholder for now
          jobRelevance: "Medium" 
        };
      }
      
      // Return the analysis results in a structured format
      return res.json({
        score: analysis.overall_score,
        rating: analysis.rating,
        strengths: analysis.strengths.slice(0, 3),
        weaknesses: analysis.improvements.slice(0, 3),
        suggestions: analysis.format_feedback.slice(0, 2),
        sa_score: analysis.sa_score,
        sa_relevance: analysis.sa_relevance,
        skills: analysis.skills_identified.slice(0, 8),
        job_match: jobKeywordMatch
      });
    } catch (error) {
      console.error("Error in CV analysis:", error);
      next(error);
    }
  });
  
  // The HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}