import express, { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import multer from "multer";
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
      cb(null, false);
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

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Basic health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", environment: process.env.NODE_ENV });
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}