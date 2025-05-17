import express, { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import multer from "multer";
import * as mammoth from "mammoth";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { createServer, Server } from "http";

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and DOCX files are allowed."));
    }
  },
});

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
};

// Admin check middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ error: "Admin access required" });
};

// Check for active subscription
const hasActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  try {
    const activeSubscription = await storage.getActiveSubscription(req.user!.id);
    
    if (!activeSubscription) {
      return res.status(403).json({ 
        error: "Subscription required", 
        message: "You need an active subscription to access this feature."
      });
    }
    
    next();
  } catch (error) {
    console.error("Subscription check error:", error);
    next(error);
  }
};

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Basic health check
  app.get("/api/health", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ status: "ok", environment: process.env.NODE_ENV });
    } catch (error) {
      next(error);
    }
  });
  
  // Plans endpoint
  app.get("/api/plans", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      next(error);
    }
  });
  
  // Get all CVs for a user
  app.get("/api/cvs", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvs = await storage.getCVsByUser(req.user!.id);
      res.json(cvs);
    } catch (error) {
      next(error);
    }
  });
  
  // Upload a new CV
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: "No file uploaded", 
          message: "Please select a PDF or Word document to upload." 
        });
      }
      
      let parsedContent = "";
      let fileName = req.file.originalname;
      let fileType = req.file.mimetype;
      
      // Extract text from the document
      if (fileType === "application/pdf") {
        // Parse PDF
        const pdfData = await PDFParser(req.file.buffer);
        parsedContent = pdfData.text;
      } else {
        // Parse DOCX
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        parsedContent = result.value;
      }
      
      // Create a new CV entry
      const userId = req.isAuthenticated() ? req.user!.id : null;
      const isGuest = !req.isAuthenticated();
      
      // Get optional fields from the request body
      const title = req.body.title || "My CV";
      const description = req.body.description;
      const targetPosition = req.body.targetPosition;
      const targetIndustry = req.body.targetIndustry;
      const jobDescription = req.body.jobDescription;
      
      const newCV = await storage.createCV({
        userId,
        fileName,
        fileType,
        fileSize: req.file.size,
        content: parsedContent,
        title,
        description,
        targetPosition,
        targetIndustry,
        jobDescription,
        isGuest
      });
      
      // Return the created CV
      res.status(201).json(newCV);
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
          error: "Unauthorized", 
          message: "You are not authorized to analyze this CV." 
        });
      }
      
      const jobDescription = cv.jobDescription || "";
      
      try {
        // Analyze the CV
        console.log("Starting CV analysis for ID:", cvId);
        const analysis = await analyzeCV(cv.content, jobDescription, cvId);
        
        // Store the analysis results
        const atsScore = await storage.createATSScore({
          cvId: cv.id,
          score: analysis.score,
          skillsScore: analysis.skillsScore || 0,
          contextScore: analysis.contextScore || 0,
          formatScore: analysis.formatScore || 0,
          strengths: analysis.strengths,
          improvements: analysis.improvements,
          issues: analysis.issues || [],
          saKeywordsFound: analysis.saKeywordsFound || [],
          saContextScore: analysis.saContextScore || 0,
          bbbeeDetected: analysis.bbbeeDetected || false,
          nqfDetected: analysis.nqfDetected || false,
          keywordRecommendations: analysis.keywordRecommendations || []
        });
        
        res.json({
          id: atsScore.id,
          ...analysis,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Analysis error:", error);
        
        // If AI service fails, fall back to basic analysis
        console.log("Falling back to basic analysis");
        
        const resumeText = cv.content;
        const resumeLower = resumeText.toLowerCase();
        
        // Analyze for key sections
        const hasProperSections = resumeText.includes("EXPERIENCE") || resumeText.includes("EDUCATION");
        const hasBulletPoints = resumeText.includes("•") || resumeText.includes("-");
        const hasDates = /\b(20\d{2}|19\d{2})\b/.test(resumeText);
        
        // Check for South African context
        const saKeywords = ["south africa", "south african", "bbbee", "b-bbee", "nqf", "matric"];
        const foundSaKeywords = saKeywords.filter(keyword => 
          resumeLower.includes(keyword)
        );
        
        const bbbeeDetected = resumeLower.includes("bbbee") || resumeLower.includes("b-bbee");
        const nqfDetected = resumeLower.includes("nqf");
        
        // Calculate scores
        const formatScore = Math.round((
          (hasProperSections ? 1 : 0) + 
          (hasBulletPoints ? 1 : 0) + 
          (hasDates ? 1 : 0)
        ) * 33.33);
        
        const skillsScore = Math.min(100, Math.round(
          countKeywords(resumeLower, ["skill", "skills", "proficient", "experience with", "knowledge of"]) * 20
        ));
        
        const saContextScore = Math.min(100, foundSaKeywords.length * 25);
        
        // Overall score with weighted categories
        const overallScore = Math.round(
          (formatScore * 0.4) + 
          (skillsScore * 0.4) + 
          (saContextScore * 0.2)
        );
        
        // Generate suggestions
        const suggestions = [];
        
        if (formatScore < 70) {
          suggestions.push("Improve your CV structure with clear sections for Experience, Education, and Skills.");
        }
        
        if (skillsScore < 70) {
          suggestions.push("Add more specific skills relevant to your field.");
        }
        
        if (!bbbeeDetected) {
          suggestions.push("Consider adding your B-BBEE status if applicable.");
        }
        
        if (!nqfDetected) {
          suggestions.push("Include NQF levels for your qualifications.");
        }
        
        // Job description keywords
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
      }
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
        verified: profile.whatsappVerified || false,
        number: profile.whatsappNumber
      });
    } catch (error) {
      next(error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}