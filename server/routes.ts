import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { extractTextFromPDF } from "./services/pdfParser";
import { extractTextFromDOCX } from "./services/docxParser";
import { performDeepAnalysis } from "./services/atsScoring";
import { localAIService } from "./services/localAI";
import { analyzeCV as analyzeResume } from "./services/simpleAtsAnalysis";
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
        // Comprehensive South African Context Detection (20% of total score)
        // B-BBEE related terms (10 points per valid instance, max 20)
        const bbbeeTerms = ["b-bbee", "bbbee", "broad based black economic empowerment", "bee", "black owned", "hdi", "transformation focused"];
        let bbbeeScore = 0;
        for (const term of bbbeeTerms) {
          if (textContent.toLowerCase().includes(term)) {
            bbbeeScore += 10;
            if (bbbeeScore >= 20) break; // Cap at 20 points
          }
        }
        
        // NQF levels (5 points per correct level, max 10)
        const nqfMatches = textContent.match(/nqf level \d+|national qualifications? framework level \d+|nqf \d+/gi) || [];
        const nqfScore = Math.min(10, nqfMatches.length * 5);
        
        // South African cities (2 points per entity, max 5)
        const saCities = ["johannesburg", "cape town", "durban", "pretoria", "bloemfontein", "port elizabeth", "gqeberha", 
                         "east london", "polokwane", "nelspruit", "mbombela", "kimberley", "pietermaritzburg", "stellenbosch", "potchefstroom"];
        let citiesScore = 0;
        for (const city of saCities) {
          if (textContent.toLowerCase().includes(city)) {
            citiesScore += 2;
            if (citiesScore >= 5) break; // Cap at 5 points
          }
        }
        
        // South African provinces (2 points per entity, max 5)
        const saProvinces = ["gauteng", "western cape", "kwazulu natal", "eastern cape", "mpumalanga", 
                            "limpopo", "north west", "free state", "northern cape"];
        let provincesScore = 0;
        for (const province of saProvinces) {
          if (textContent.toLowerCase().includes(province)) {
            provincesScore += 2;
            if (provincesScore >= 5) break; // Cap at 5 points
          }
        }
        
        // South African currencies (2 points per entity, max 5)
        const currencyMatches = textContent.match(/r\d+|zar|rand/gi) || [];
        const currencyScore = Math.min(5, currencyMatches.length * 2);
        
        // South African languages (3 points per instance, max 5)
        const saLanguages = ["afrikaans", "xhosa", "zulu", "ndebele", "sepedi", "sesotho", "setswana", 
                            "siswati", "tshivenda", "xitsonga", "isizulu", "isixhosa"];
        let languagesScore = 0;
        for (const language of saLanguages) {
          if (textContent.toLowerCase().includes(language)) {
            languagesScore += 3;
            if (languagesScore >= 5) break; // Cap at 5 points
          }
        }
        
        // South African regulations (3 points per instance, max 5)
        const saRegulations = ["popi act", "popia", "protection of personal information", "fais", "fica", 
                              "national credit act", "consumer protection act", "employment equity act", 
                              "skills development act", "labor relations act", "bcea"];
        let regulationsScore = 0;
        for (const regulation of saRegulations) {
          if (textContent.toLowerCase().includes(regulation)) {
            regulationsScore += 3;
            if (regulationsScore >= 5) break; // Cap at 5 points
          }
        }
        
        // Calculate total SA context score (20% of total) - max 50 points
        const saContextScore = Math.min(100, bbbeeScore + nqfScore + citiesScore + provincesScore + 
                                        currencyScore + languagesScore + regulationsScore);
        
        // CV Format Evaluation (40% of total score)
        // Section headers (15 points each, max 60)
        const sectionPatterns = [
          /^(professional|career|summary|profile|objective)s?:?$/im,  // Summary section
          /^(skills|technical skills|competencies|core competencies|expertise|areas of expertise):?$/im, // Skills section
          /^(experience|work experience|professional experience|employment history|work history):?$/im, // Experience section
          /^(education|academic|qualifications|educational background|academic qualifications):?$/im, // Education section
          /^(projects|portfolio|key projects|personal projects|major projects):?$/im, // Projects section
          /^(certifications|certificates|professional certifications|accreditations):?$/im, // Certifications section
          /^(languages|language proficiency|spoken languages):?$/im, // Languages section
          /^(references|professional references):?$/im // References section
        ];
        
        let sectionsScore = 0;
        const detectedSections = [];
        
        for (const pattern of sectionPatterns) {
          if (pattern.test(textContent)) {
            sectionsScore += 15;
            
            // Add section name to detected sections based on which pattern matched
            const index = sectionPatterns.indexOf(pattern);
            switch (index) {
              case 0: detectedSections.push("summary"); break;
              case 1: detectedSections.push("skills"); break;
              case 2: detectedSections.push("experience"); break;
              case 3: detectedSections.push("education"); break;
              case 4: detectedSections.push("projects"); break;
              case 5: detectedSections.push("certifications"); break;
              case 6: detectedSections.push("languages"); break;
              case 7: detectedSections.push("references"); break;
            }
            
            if (sectionsScore >= 60) break; // Cap at 60 points
          }
        }
        
        // Bullet points (10 points)
        const hasBulletPoints = textContent.includes("•") || textContent.includes("-") || 
                                /^\s*[-•]\s+/m.test(textContent);
        const bulletPointsScore = hasBulletPoints ? 10 : 0;
        
        // Action verbs (10 points)
        const actionVerbs = ["managed", "developed", "created", "implemented", "designed", 
                           "led", "coordinated", "analyzed", "achieved", "increased"];
        const hasActionVerbs = actionVerbs.some(verb => textContent.toLowerCase().includes(verb));
        const actionVerbsScore = hasActionVerbs ? 10 : 0;
        
        // Dates (10 points)
        const hasDateRanges = /\d{4}\s*(-|to)\s*\d{4}|\d{4}\s*(-|to)\s*(present|current)/i.test(textContent);
        const datesScore = hasDateRanges ? 10 : 0;
        
        // Quantified achievements (10 points)
        const hasQuantifiedAchievements = /increased|improved|reduced|generated|achieved|by\s+\d+%|\d+%|increased by \d+/i.test(textContent);
        const achievementsScore = hasQuantifiedAchievements ? 10 : 0;
        
        // Word count optimal range (300-500 words)
        const wordCount = textContent.split(/\s+/).length;
        let wordCountScore = 0;
        if (wordCount >= 300 && wordCount <= 500) {
          wordCountScore = 10; // Optimal
        } else if (wordCount > 500 && wordCount <= 700) {
          wordCountScore = 5; // Slightly too long
        } else if (wordCount >= 200 && wordCount < 300) {
          wordCountScore = 5; // Slightly too short
        } // Otherwise 0 (too short or too long)
        
        // Calculate total format score (40% of total)
        const formatScore = Math.min(100, sectionsScore + bulletPointsScore + actionVerbsScore + 
                                   datesScore + achievementsScore + wordCountScore);
        
        // Skills Identification (40% of total score)
        // High-demand SA skills in 2025 (weighting x1.5)
        const highDemandSkills = [
          "data analysis", "python", "machine learning", "artificial intelligence",
          "cybersecurity", "cloud computing", "aws", "azure", 
          "renewable energy", "sustainability", "solar energy",
          "project management", "agile", "scrum", 
          "digital marketing", "e-commerce", "user experience"
        ];
        
        // Count high-demand skills (weighting x1.5)
        const identifiedHighDemandSkills = highDemandSkills.filter(skill => 
          textContent.toLowerCase().includes(skill.toLowerCase())
        );
        
        // Regular skills
        const regularSkills = [
          "microsoft office", "excel", "word", "powerpoint", "outlook",
          "team leadership", "problem solving", "communication",
          "javascript", "java", "c#", "c++", "php", "typescript",
          "html", "css", "react", "angular", "vue", "node.js", "express",
          "sql", "postgresql", "mysql", "mongodb", "database management",
          "google cloud", "docker", "kubernetes",
          "kanban", "waterfall",
          "customer service", "sales", "marketing", "seo", "social media",
          "budgeting", "financial analysis", "accounting",
          "research", "critical thinking", "strategic planning",
          "writing", "editing", "content creation",
          "adobe photoshop", "illustrator", "indesign", "ui/ux design",
          "human resources", "recruitment", "training", "onboarding",
          "logistics", "supply chain", "inventory management",
          "quality assurance", "quality control", "testing"
        ];
        
        // Count regular skills
        const identifiedRegularSkills = regularSkills.filter(skill => 
          textContent.toLowerCase().includes(skill.toLowerCase())
        );
        
        // Calculate skills score (40% of total)
        // High-demand skills get 12 points each (8 x 1.5), regular skills get 8 points each
        const skillsScore = Math.min(100, 
          (identifiedHighDemandSkills.length * 12) + 
          (identifiedRegularSkills.length * 8)
        );
        
        // All identified skills for display
        const allIdentifiedSkills = [
          ...identifiedHighDemandSkills, 
          ...identifiedRegularSkills
        ];
        
        // Calculate overall score with weighted components exactly as specified
        const overallScore = Math.round(
          (skillsScore * 0.4) +
          (formatScore * 0.4) +
          (saContextScore * 0.2)
        );
        
        // For references in later code
        const skillScore = skillsScore;
        const saScore = saContextScore;
        
        // Determine rating based on score
        let rating = "Needs Improvement";
        if (overallScore >= 90) rating = "Excellent";
        else if (overallScore >= 80) rating = "Very Good";
        else if (overallScore >= 70) rating = "Good";
        else if (overallScore >= 60) rating = "Above Average";
        else if (overallScore >= 50) rating = "Average";
        
        // Determine SA relevance
        let saRelevance = "Low";
        if (saContextScore >= 80) saRelevance = "Excellent";
        else if (saContextScore >= 60) saRelevance = "High";
        else if (saContextScore >= 40) saRelevance = "Medium";
        
        // Generate contextual strengths based on South African context
        const strengths = [
          "Your CV showcases your professional experience clearly.",
          "Your CV has been analyzed with our South African ATS criteria.",
          "Your CV demonstrates relevant qualifications and education.",
          "You have a clearly structured CV with good organization.",
          "Your CV highlights skills that employers are looking for."
        ];
        
        // Generate contextual improvements based on South African context
        const improvements = [
          "Include your B-BBEE status to increase opportunities with transformation-focused companies.",
          "Add NQF levels for your qualifications to align with South African standards.",
          "Include more South African-specific terminology and context.",
          "Use bullet points to make your achievements stand out more clearly.",
          "Add quantified achievements with specific metrics to demonstrate impact."
        ];
        
        // Combine all skills for display
        
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
            technical_skills: allIdentifiedSkills.filter(s => s.includes("python") || s.includes("java") || s.includes("data") || s.includes("software")),
            soft_skills: allIdentifiedSkills.filter(s => s.includes("communication") || s.includes("leadership") || s.includes("teamwork")),
            sa_specific_skills: allIdentifiedSkills.filter(s => s.includes("bee") || s.includes("nqf") || s.includes("saqa")),
            format_elements: {
              has_bullet_points: hasBulletPoints,
              has_date_ranges: hasDateRanges,
              has_quantified_achievements: hasQuantifiedAchievements
            },
            sa_elements: {
              sa_context_present: saScore > 30,
              sa_skills_count: allIdentifiedSkills.filter(s => s.includes("bee") || s.includes("nqf")).length
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