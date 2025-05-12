import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { extractTextFromPDF } from "./services/pdfParser";
import { extractTextFromDOCX } from "./services/docxParser";
import { analyzeCV } from "./services/atsScoring";
import { insertUserSchema, insertCvSchema, insertAtsScoreSchema } from "@shared/schema";

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // File upload and analysis endpoint
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
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

      // Create a temporary user if no authentication is present
      let userId = 1; // Default for guest users
      
      // Store the CV
      const cvData = {
        userId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        content
      };

      const cv = await storage.createCV(cvData);

      res.json({ 
        success: true, 
        message: "File uploaded successfully",
        cv: {
          id: cv.id,
          fileName: cv.fileName,
          fileType: cv.fileType,
          fileSize: cv.fileSize
        }
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "An error occurred during file upload" 
      });
    }
  });

  // ATS Score endpoint
  app.get("/api/ats-score/:cvId", async (req: Request, res: Response) => {
    try {
      const cvId = Number(req.params.cvId);
      
      if (isNaN(cvId)) {
        return res.status(400).json({ error: "Invalid CV ID" });
      }

      // Check if there's already a score for this CV
      let atsScore = await storage.getATSScoreByCV(cvId);
      
      if (!atsScore) {
        // If not, get the CV and analyze it
        const cv = await storage.getCV(cvId);
        
        if (!cv) {
          return res.status(404).json({ error: "CV not found" });
        }

        // Analyze the CV
        const analysis = analyzeCV(cv.content);
        
        // Store the analysis results
        atsScore = await storage.createATSScore({
          cvId,
          score: analysis.score,
          strengths: analysis.strengths,
          improvements: analysis.improvements,
          issues: analysis.issues
        });
      }

      res.json({
        score: atsScore.score,
        strengths: atsScore.strengths,
        improvements: atsScore.improvements,
        issues: atsScore.issues
      });
    } catch (error) {
      console.error("ATS Score error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "An error occurred during ATS analysis" 
      });
    }
  });

  // Latest CV endpoint - for getting the most recently uploaded CV
  app.get("/api/latest-cv", async (req: Request, res: Response) => {
    try {
      // For now, use a default user id since we don't have authentication
      const userId = 1;
      
      const userCVs = await storage.getCVsByUser(userId);
      
      if (!userCVs || userCVs.length === 0) {
        return res.status(404).json({ error: "No CVs found for this user" });
      }

      // Sort by creation date and get the most recent
      const latestCV = userCVs.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })[0];

      res.json({
        id: latestCV.id,
        fileName: latestCV.fileName,
        fileType: latestCV.fileType,
        fileSize: latestCV.fileSize
      });
    } catch (error) {
      console.error("Latest CV error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "An error occurred while fetching the latest CV" 
      });
    }
  });

  // Mock deep analysis endpoint - premium feature
  app.post("/api/deep-analysis", async (req: Request, res: Response) => {
    try {
      const { cvId } = req.body;
      
      if (!cvId) {
        return res.status(400).json({ error: "CV ID is required" });
      }

      const cv = await storage.getCV(Number(cvId));
      
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }

      // Mock deep analysis - in a real implementation this would do more in-depth analysis
      // or call an external service
      res.json({
        success: true,
        message: "Deep analysis completed",
        analysisUrl: "/api/reports/deep-analysis-123.pdf", // Mock report URL
        summary: "Your CV has been thoroughly analyzed. See detailed report for recommendations."
      });
    } catch (error) {
      console.error("Deep analysis error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "An error occurred during deep analysis" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
