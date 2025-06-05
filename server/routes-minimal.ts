import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertCvSchema, 
  insertAtsScoreSchema, 
  insertDeepAnalysisReportSchema,
  insertEmployerSchema,
  insertJobPostingSchema,
} from "@shared/schema";
import { setupAuth } from "./auth";

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
  if (req.isAuthenticated() && req.user && (req.user as any).role === "admin") {
    return next();
  }
  res.status(403).json({ error: "Admin access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Health check endpoint
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

  // Basic employer routes
  app.get("/api/employers/me", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      // Return a basic response for now
      res.json({ message: "Employer endpoint working", userId });
    } catch (error) {
      next(error);
    }
  });

  // Basic job postings route
  app.get("/api/job-postings", async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Return empty array for now to prevent compilation errors
      res.json([]);
    } catch (error) {
      next(error);
    }
  });

  // Basic CV routes
  app.get("/api/cvs", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const cvs = await storage.getCVsByUser(userId);
      res.json(cvs);
    } catch (error) {
      next(error);
    }
  });

  // File upload route
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      res.json({
        message: "File uploaded successfully",
        filename: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      next(error);
    }
  });

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("API Error:", err);
    res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
    });
  });

  const server = createServer(app);
  return server;
}