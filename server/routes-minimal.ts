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
import { authenticateAdmin, generateAdminToken, requireAdmin, initializeAdmin } from "./adminAuth";
import { memoryReferralService } from "./memoryReferralService";

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
  // Initialize admin authentication
  await initializeAdmin();

  // Admin authentication routes
  app.post("/api/admin/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await authenticateAdmin(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateAdminToken(user);
      res.json({ 
        token, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/me", requireAdmin, (req: Request, res: Response) => {
    res.json({ user: req.adminUser });
  });

  // Admin dashboard stats
  app.get("/api/admin/stats", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = {
        totalUsers: 25,
        activeUsers: 18,
        totalCVs: 142,
        premiumUsers: 8,
        totalRevenue: 4752,
        monthlyRevenue: 792
      };

      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

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
      
      res.json({ message: "Employer endpoint working", userId });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/employers", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      res.json({ message: "Employer created", userId });
    } catch (error) {
      next(error);
    }
  });

  // Job postings routes
  app.get("/api/job-postings", async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json([]);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/job-postings/my", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      res.json([]);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/job-postings", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      res.json({ message: "Job posting created", userId });
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

  // Referral system routes
  app.get("/api/referrals/code", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const referralCode = await memoryReferralService.getUserReferralCode(userId);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      res.json({ 
        referralCode,
        referralLink: `${baseUrl}/signup?ref=${referralCode}`
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/referrals/stats", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const stats = await memoryReferralService.getReferralStats(userId);
      const credits = await memoryReferralService.getUserCredits(userId);
      const rewards = await memoryReferralService.getUserRewards(userId);
      const referrals = await memoryReferralService.getUserReferrals(userId);

      res.json({
        stats,
        credits,
        rewards,
        referrals
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/referrals/process-signup", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { referralCode, userId } = req.body;
      
      if (!referralCode || !userId) {
        return res.status(400).json({ error: "Missing referral code or user ID" });
      }

      await memoryReferralService.processReferralSignup(referralCode, userId);
      res.json({ message: "Referral processed successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/referrals/spend-credits", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.id;
      const { type, amount = 1 } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      if (!type || !['free_analysis', 'scan_credits', 'professional_month', 'discount_credit'].includes(type)) {
        return res.status(400).json({ error: "Invalid credit type" });
      }

      const success = await memoryReferralService.spendCredits(userId, type, amount);
      
      if (success) {
        const updatedCredits = await memoryReferralService.getUserCredits(userId);
        res.json({ success: true, credits: updatedCredits });
      } else {
        res.status(400).json({ error: "Insufficient credits" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Newsletter subscription endpoint
  app.post("/api/newsletter/subscribe", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, source = 'website' } = req.body;
      
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Valid email address is required" });
      }

      // In a real implementation, you would:
      // 1. Validate email format more thoroughly
      // 2. Check if email already exists in newsletter list
      // 3. Store in database or send to email service (SendGrid, Mailchimp, etc.)
      // 4. Send confirmation email

      console.log(`Newsletter subscription: ${email} from ${source}`);
      
      // For now, just simulate successful subscription
      res.json({ 
        success: true, 
        message: "Successfully subscribed to newsletter",
        email: email
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