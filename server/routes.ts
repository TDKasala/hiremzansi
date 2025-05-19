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
      console.log("CV upload request received at " + new Date().toISOString());
      
      if (!req.file) {
        return res.status(400).json({ 
          error: "No file uploaded", 
          message: "Please upload a CV file in PDF or DOCX format" 
        });
      }
      
      console.log("Upload details:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        body_fields: Object.keys(req.body),
        hasFilename: !!req.body.filename,
        authenticated: req.isAuthenticated()
      });
      
      // CRITICAL FIX: Get filename from the new client implementation or generate a safe one
      const safeFilename = req.body.filename || `cv_${Date.now()}.${req.file.mimetype.includes('pdf') ? 'pdf' : 'docx'}`;
      
      // Get title from form data or use original filename as the title
      const title = req.body.title || (req.file.originalname ? req.file.originalname.replace(/\.[^/.]+$/, "") : "Untitled CV");
      const isGuest = !req.isAuthenticated();
      const userId = isGuest ? null : (req.isAuthenticated() && req.user ? req.user.id : null);
      
      // Extract text from the uploaded file
      let textContent = "";
      const fileBuffer = req.file.buffer;
      
      console.log("Processing file:", {
        filename: safeFilename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        title: title
      });
      
      if (req.file.mimetype === "application/pdf") {
        try {
          // Try PDF text extraction
          textContent = await extractTextFromPDF(fileBuffer);
          console.log("PDF text extraction successful, character count:", textContent.length);
        } catch (pdfError) {
          console.error("PDF extraction error:", pdfError);
          return res.status(400).json({ 
            error: "PDF parsing failed", 
            message: "Unable to extract text from the PDF. Please ensure it's not password protected and contains text."
          });
        }
      } else if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        try {
          // Try DOCX text extraction
          textContent = await extractTextFromDOCX(fileBuffer);
          console.log("DOCX text extraction successful, character count:", textContent.length);
        } catch (docxError) {
          console.error("DOCX extraction error:", docxError);
          return res.status(400).json({ 
            error: "DOCX parsing failed", 
            message: "Unable to extract text from the DOCX file. Please ensure it's a valid Word document."
          });
        }
      } else {
        return res.status(400).json({ 
          error: "Unsupported file type", 
          message: "Please upload a PDF or DOCX file" 
        });
      }
      
      // Ensure we have content
      if (!textContent || textContent.trim().length === 0) {
        return res.status(400).json({ 
          error: "Empty document", 
          message: "No text could be extracted from the file. Please ensure it contains text content."
        });
      }
      
      // Store the CV in the database
      try {
        // Create a fully defined CV object with the filename from the form
        console.log("Creating CV record with filename:", safeFilename);
        
        // Use storage.createCV but with guaranteed values
        const cvData = {
          userId: userId,
          fileName: safeFilename,  // Guaranteed filename from form or generated
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          content: textContent || " ",
          title: title || "CV",
          isGuest: Boolean(isGuest)
        };
        
        console.log("Creating CV with data:", cvData);
        const cv = await storage.createCV(cvData);
        console.log("CV created successfully:", cv);
        
        res.status(201).json({
          success: true,
          message: "CV uploaded successfully",
          cv: {
            id: cv.id,
            title: cv.title,
            fileName: safeFilename
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
      
      if (!isGuest && cv.userId && req.user && cv.userId !== req.user.id) {
        return res.status(403).json({ 
          error: "Access denied", 
          message: "You do not have permission to access this CV." 
        });
      }
      
      // Process the CV content for analysis
      let textContent = cv.content || "";
      
      // Check and sanitize content if it's HTML
      if (textContent.includes('<!DOCTYPE') || 
          textContent.includes('<html') || 
          textContent.includes('<body') ||
          (textContent.includes('<') && textContent.includes('>'))) {
        
        console.log("Detected HTML content, sanitizing for analysis");
        
        // More thorough HTML stripping
        textContent = textContent
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags and their content
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags and their content
          .replace(/<[^>]+>/g, ' ') // Replace all remaining HTML tags with spaces
          .replace(/&[a-z]+;/gi, ' ') // Replace HTML entities
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim();
        
        console.log("Sanitized content length:", textContent.length);
      }
      
      if (textContent.length < 50) {
        console.warn("CV content is very short after processing:", textContent);
        return res.status(400).json({
          error: "Invalid CV content",
          message: "The CV doesn't contain enough text to analyze. Please upload a CV with more content."
        });
      }
      
      try {
        // Enhanced detailed analysis with South African context
        const saKeywords = ["B-BBEE", "NQF", "SETA", "South Africa", "Johannesburg", "Cape Town", "Durban", "Pretoria"];
        const saContextPresent = saKeywords.some(keyword => 
          textContent.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Extract skills from text - more comprehensive analysis
        const techSkills = ["javascript", "python", "java", "react", "node", "typescript", "html", "css", "sql", "database", "aws", "cloud"];
        const softSkills = ["leadership", "communication", "teamwork", "project management", "time management", "problem solving"];
        const saSpecificSkills = ["bbbee", "employment equity", "popi", "compliance", "transformation", "stakeholder management"];
        
        // Count identified skills
        const identifiedTechSkills = techSkills.filter(skill => 
          textContent.toLowerCase().includes(skill.toLowerCase())
        );
        const identifiedSoftSkills = softSkills.filter(skill => 
          textContent.toLowerCase().includes(skill.toLowerCase())
        );
        const identifiedSaSkills = saSpecificSkills.filter(skill => 
          textContent.toLowerCase().includes(skill.toLowerCase())
        );
        
        // Calculate detailed scores
        const skillScore = Math.min(100, 
          (identifiedTechSkills.length * 8) + 
          (identifiedSoftSkills.length * 5) + 
          (identifiedSaSkills.length * 10)
        );
        
        // Calculate format score based on section headers, bullet points, etc.
        const hasBulletPoints = textContent.includes("•") || textContent.includes("-");
        const hasDateRanges = /\d{4}\s*(-|to)\s*\d{4}|\d{4}\s*(-|to)\s*(present|current)/i.test(textContent);
        const hasQuantifiedAchievements = /increased|improved|reduced|generated|achieved|by\s+\d+%/i.test(textContent);
        
        const formatScore = 50 + 
          (hasBulletPoints ? 15 : 0) + 
          (hasDateRanges ? 15 : 0) + 
          (hasQuantifiedAchievements ? 20 : 0);
        
        // Calculate SA context score
        const saScore = 30 + 
          (saContextPresent ? 30 : 0) + 
          (identifiedSaSkills.length * 10);
        
        // Calculate overall score with weighted components
        const overallScore = Math.round(
          (skillScore * 0.4) +
          (formatScore * 0.35) +
          (saScore * 0.25)
        );
        
        // Determine rating based on score
        let rating = "Needs Improvement";
        if (overallScore >= 90) rating = "Excellent";
        else if (overallScore >= 80) rating = "Very Good";
        else if (overallScore >= 70) rating = "Good";
        else if (overallScore >= 60) rating = "Above Average";
        else if (overallScore >= 50) rating = "Average";
        
        // Determine SA relevance
        let saRelevance = "Low";
        if (saScore >= 80) saRelevance = "Excellent";
        else if (saScore >= 60) saRelevance = "High";
        else if (saScore >= 40) saRelevance = "Medium";
        
        // Generate contextual strengths
        const strengths = [];
        if (identifiedTechSkills.length > 2) strengths.push(`Your CV highlights relevant technical skills that employers are seeking.`);
        if (identifiedSoftSkills.length > 1) strengths.push(`You've demonstrated important soft skills that complement your technical abilities.`);
        if (identifiedSaSkills.length > 0) strengths.push(`Your CV includes South African context that local employers value.`);
        if (hasBulletPoints) strengths.push(`Your CV uses bullet points effectively to highlight accomplishments.`);
        if (hasQuantifiedAchievements) strengths.push(`You've included quantified achievements that demonstrate impact.`);
        
        // If not enough strengths, add generic ones
        if (strengths.length < 3) {
          strengths.push(`Your CV has a professional structure.`);
          strengths.push(`Your CV demonstrates relevant experience.`);
        }
        
        // Generate contextual improvements
        const improvements = [];
        if (identifiedTechSkills.length < 3) improvements.push(`Add more industry-specific technical skills to match job requirements.`);
        if (identifiedSaSkills.length === 0) improvements.push(`Include South African context such as B-BBEE status and NQF levels.`);
        if (!hasQuantifiedAchievements) improvements.push(`Add quantified achievements with metrics to demonstrate your impact.`);
        if (!hasBulletPoints) improvements.push(`Use bullet points to make your CV more scannable.`);
        
        // If not enough improvements, add generic ones
        if (improvements.length < 3) {
          improvements.push(`Tailor your CV to specific job applications by matching keywords from the job description.`);
          improvements.push(`Consider adding more details about your responsibilities and achievements.`);
        }
        
        // Combine all skills for display
        const allIdentifiedSkills = [
          ...identifiedTechSkills, 
          ...identifiedSoftSkills,
          ...identifiedSaSkills
        ];
        
        // Prepare the detailed analysis
        const detailedAnalysis = {
          overall_score: overallScore,
          skill_score: skillScore,
          format_score: formatScore,
          sa_score: saScore,
          rating: rating,
          strengths: strengths.slice(0, 5),
          improvements: improvements.slice(0, 5),
          skills_identified: allIdentifiedSkills.slice(0, 8),
          sa_relevance: saRelevance,
          sections_detected: [
            hasBulletPoints ? "bullet_points" : null,
            hasDateRanges ? "date_ranges" : null,
            hasQuantifiedAchievements ? "quantified_achievements" : null
          ].filter(Boolean),
          detailed_components: {
            technical_skills: identifiedTechSkills,
            soft_skills: identifiedSoftSkills,
            sa_specific_skills: identifiedSaSkills,
            format_elements: {
              has_bullet_points: hasBulletPoints,
              has_date_ranges: hasDateRanges,
              has_quantified_achievements: hasQuantifiedAchievements
            },
            sa_elements: {
              sa_context_present: saContextPresent,
              sa_skills_count: identifiedSaSkills.length
            }
          }
        };
        
        // Create an ATS score record with the detailed analysis
        const atsScore = await storage.createATSScore({
          cvId,
          score: detailedAnalysis.overall_score,
          skillsScore: detailedAnalysis.skill_score,
          formatScore: detailedAnalysis.format_score,
          contextScore: detailedAnalysis.sa_score,
          strengths: detailedAnalysis.strengths,
          improvements: detailedAnalysis.improvements,
          issues: []
        });
        
        console.log("Created detailed ATS score:", atsScore.id);
        
        // Send the comprehensive analysis response
        res.json({
          success: true,
          score: detailedAnalysis.overall_score,
          scoreId: atsScore.id,
          rating: detailedAnalysis.rating,
          strengths: detailedAnalysis.strengths,
          improvements: detailedAnalysis.improvements,
          skills: detailedAnalysis.skills_identified,
          sa_score: detailedAnalysis.sa_score,
          sa_relevance: detailedAnalysis.sa_relevance,
          detailed_report: {
            components: {
              skills: {
                score: detailedAnalysis.skill_score,
                technical_skills: detailedAnalysis.detailed_components.technical_skills,
                soft_skills: detailedAnalysis.detailed_components.soft_skills,
                sa_specific_skills: detailedAnalysis.detailed_components.sa_specific_skills
              },
              format: {
                score: detailedAnalysis.format_score,
                has_bullet_points: detailedAnalysis.detailed_components.format_elements.has_bullet_points,
                has_date_ranges: detailedAnalysis.detailed_components.format_elements.has_date_ranges,
                has_quantified_achievements: detailedAnalysis.detailed_components.format_elements.has_quantified_achievements
              },
              south_african_context: {
                score: detailedAnalysis.sa_score,
                sa_context_present: detailedAnalysis.detailed_components.sa_elements.sa_context_present,
                sa_skills_count: detailedAnalysis.detailed_components.sa_elements.sa_skills_count,
                relevance: detailedAnalysis.sa_relevance
              }
            },
            breakdown: {
              skills_weight: "40%",
              format_weight: "35%",
              sa_context_weight: "25%"
            }
          }
        });
      } catch (error) {
        console.error("Error analyzing CV:", error);
        
        res.status(500).json({
          error: "Analysis failed",
          message: "We encountered an error while analyzing your CV. Please try again."
        });
      }
    } catch (error) {
      console.error("Error handling CV analysis request:", error);
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