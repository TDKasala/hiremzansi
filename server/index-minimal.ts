import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Basic health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Hire Mzansi CV Optimization Platform" });
});

// Basic plans endpoint for the UI
app.get("/api/plans", (_req: Request, res: Response) => {
  res.json([
    {
      id: 1,
      name: "Free Trial",
      price: 0,
      duration: "3 days",
      cv_analyses_limit: 3,
      features: ["Basic CV analysis", "ATS compatibility check", "Job matching (Coming Soon)"]
    },
    {
      id: 2,
      name: "Deep Analysis",
      price: 25,
      duration: "one-time",
      cv_analyses_limit: 1,
      features: ["Comprehensive CV analysis", "Detailed optimization suggestions", "Industry-specific keywords", "Job matching (Coming Soon)"]
    },
    {
      id: 3,
      name: "Monthly Premium",
      price: 100,
      duration: "monthly",
      cv_analyses_limit: 50,
      features: ["Unlimited CV analyses", "Priority support", "Advanced templates", "Job matching (Coming Soon)"]
    }
  ]);
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  log(`Error ${status}: ${message}`, 'error');
  res.status(status).json({ message });
});

// Start server with proper setup
const server = serveStatic(app);
setupVite(app, server);