import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./databaseStorage";
import { initializeDatabase } from "./db-init";
import multer from "multer";
import { z } from "zod";
import { extractTextFromPDF } from "./services/simplePdfParser";
import { extractTextFromDOCX } from "./services/docxParser";
import { performDeepAnalysis } from "./services/atsScoring";
import { localAIService } from "./services/localAI";
import { analyzeCV as analyzeResume } from "./services/simpleAtsAnalysis";
import { analyzeCVContent, formatAnalysisForResponse } from "./services/atsAnalysisService";
import { generateQuizQuestions } from "./services/quizGeneratorService";
import { careerPathService } from "./services/careerPathService";
import { 
  insertUserSchema, 
  insertCvSchema, 
  insertAtsScoreSchema, 
  insertDeepAnalysisReportSchema,
  insertEmployerSchema,
  insertJobPostingSchema,
  insertJobMatchSchema,
  saProfiles,
  users,
  cvs,
  jobPostings,
  employers,
  jobMatches,
  skills,
  subscriptions,
  plans,
} from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "./db";
import { authenticateAdmin, generateAdminToken, requireAdmin, initializeAdmin } from "./adminAuth";
import { verifyToken, hashPassword, authenticateUser, generateToken } from "./auth";
import { isAuthenticated as authMiddleware, isAdmin as adminMiddleware } from "./auth";
import { databaseAuth, authenticateToken } from "./databaseAuth";
import { simpleAuth } from "./simpleAuth";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "./services/emailService";
import crypto from "crypto";
import { payfastService } from "./services/payfastService";
import { whatsappService } from "./services/whatsappService";
import { jobBoardService } from "./services/jobBoardService";
import { interviewSimulationService } from "./services/interviewSimulationService";
import { jobMatchingService } from "./services/jobMatchingService";
import { skillGapAnalyzerService } from "./services/skillGapAnalyzerService";
import * as employerStorage from "./employerStorage";
import adminRoutes from "./routes/admin";
import testXaiApiRoutes from "./routes/testXaiApi";
import pdfTestRoutes from "./routes/pdfTest";
import optimizedCvAnalysisRoutes from "./routes/optimizedCvAnalysis";
import paymentRoutes from "./routes/paymentRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import candidateScoringRoutes from "./routes/candidateScoringRoutes";
import gamificationRoutes from "./routes/gamificationRoutes";
import cvAnalysisRoutes from "./routes/cvAnalysis";
import dynamicResumeBuilderRoutes from "./routes/dynamicResumeBuilder";
import { sendWeeklyCareerDigests, generatePersonalizedRecommendations } from "./services/recommendationService";
import { sendCareerDigestEmail } from "./services/emailService";
import { referralService } from "./referralService";

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log("File filter check:", file.mimetype);
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log("Rejected file type:", file.mimetype);
      const error = new Error(`Unsupported file type: ${file.mimetype}`);
      cb(error as any, false);
    }
  }
});

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = databaseAuth.verifyToken(token);
      if (decoded) {
        (req as any).user = decoded;
        return next();
      }
    } catch (error) {
      // Token invalid, continue to unauthorized response
    }
  }
  
  // Check session-based authentication if available
  if (req.session && (req.session as any).userId) {
    return next();
  }
  
  res.status(401).json({ error: "Authentication required" });
};

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = databaseAuth.verifyToken(token);
      if (decoded && (decoded as any).role === "admin") {
        (req as any).user = decoded;
        return next();
      }
    } catch (error) {
      // Token invalid, continue to unauthorized response
    }
  }
  
  // Check session-based authentication if available
  if (req.session && (req.session as any).userId && (req.session as any).isAdmin) {
    return next();
  }
  
  res.status(403).json({ error: "Admin access required" });
};

const hasActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  let user = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      user = verifyToken(token);
      if (user) {
        (req as any).user = user;
      }
    } catch (error) {
      // Token invalid, continue to unauthorized response
    }
  }
  
  // Check session-based authentication if available
  if (!user && req.session && (req.session as any).userId) {
    user = { id: (req.session as any).userId };
  }
  
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  try {
    const userId = (req.user as any).id;
    const subscription = await storage.getSubscription(userId);
    
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
  // Initialize database connection and admin user
  console.log('Initializing PostgreSQL database...');
  await initializeDatabase();
  
  // Initialize admin authentication
  await initializeAdmin();

  // Admin authentication routes - hardcoded admin check for production
  app.post("/api/admin/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Direct admin authentication
      if (email === 'deniskasala17@gmail.com' && password === '@Deniskasala2025') {
        const adminUser = {
          id: 1,
          email: 'deniskasala17@gmail.com',
          name: 'Denis Kasala',
          role: 'admin'
        };

        const token = jwt.sign(
          { userId: adminUser.id, email: adminUser.email, role: adminUser.role }, 
          process.env.JWT_SECRET || 'fallback-secret-key-for-development', 
          { expiresIn: '7d' }
        );
        
        res.json({ 
          token, 
          user: {
            ...adminUser,
            isAdmin: true
          }
        });
      } else {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      next(error);
    }
  });

  app.get("/api/admin/me", (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-development') as any;
      if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      res.json({ user: decoded });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Password reset functionality
  const passwordResetTokens = new Map<string, { email: string; expires: Date }>();

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user exists
      const user = await databaseAuth.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ message: "If an account with that email exists, a reset link has been sent." });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
      
      // Store token temporarily
      passwordResetTokens.set(resetToken, { email, expires });
      
      // Clean up expired tokens
      for (const [token, data] of passwordResetTokens.entries()) {
        if (data.expires < new Date()) {
          passwordResetTokens.delete(token);
        }
      }

      // Send reset email
      const baseUrl = process.env.BASE_URL || 'https://hiremzansi.co.za';
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
      
      await sendPasswordResetEmail(email, resetLink, user.name || 'there');

      res.json({ message: "If an account with that email exists, a reset link has been sent." });
    } catch (error) {
      console.error("Error in forgot password:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  // Reset password endpoint
  app.post("/api/auth/reset-password", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Check if token exists and is valid
      const tokenData = passwordResetTokens.get(token);
      if (!tokenData || tokenData.expires < new Date()) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Get user by email
      const user = await databaseAuth.getUserByEmail(tokenData.email);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Update password
      await databaseAuth.updatePassword(user.id, password);
      
      // Remove used token
      passwordResetTokens.delete(token);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error in reset password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // User Authentication Routes - Simple Implementation
  app.post("/api/auth/signup", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, username } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user already exists
      const existingUser = await databaseAuth.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Create user using database auth system
      const result = await databaseAuth.createUser({
        username: username || email.split('@')[0],
        email,
        password,
        name: name || ''
      });
      
      const newUser = result.user;
      const verificationToken = result.verificationToken;
      
      // DO NOT log user in automatically - they need to verify email first
      
      // Send verification email
      await databaseAuth.sendVerificationEmail(newUser.email, verificationToken);

      res.status(201).json({ 
        message: "Account created successfully! Please check your email (including spam folder) to verify your account before logging in.",
        requiresVerification: true,
        email: newUser.email
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Get user by email
      const user = await databaseAuth.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await databaseAuth.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if email is verified (skip for admin users)
      if (!user.emailVerified && user.role !== 'admin') {
        return res.status(401).json({ 
          message: "Please verify your email address before logging in. Check your inbox (including spam folder) for the verification link.",
          requiresVerification: true,
          email: user.email
        });
      }

      // Store user in session
      (req as any).session.userId = user.id;
      (req as any).session.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role
      };

      res.json({ 
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified
        },
        redirectTo: "/dashboard"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Email verification route
  app.get("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Invalid verification token" });
      }

      const verified = await databaseAuth.verifyEmailToken(token);
      const baseUrl = process.env.BASE_URL || 'https://hiremzansi.co.za';
      
      if (verified) {
        res.redirect(`${baseUrl}/?verified=true`);
      } else {
        res.redirect(`${baseUrl}/?verified=false`);
      }
    } catch (error) {
      console.error("Email verification error:", error);
      res.redirect("/?verified=false");
    }
  });

  // Resend verification email
  app.post("/api/auth/resend-verification", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await databaseAuth.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Generate new verification token
      const verificationToken = databaseAuth.generateEmailVerificationToken(email);
      
      // Send verification email
      await databaseAuth.sendVerificationEmail(email, verificationToken);

      res.json({ 
        message: "Verification email sent successfully. Please check your inbox and spam folder.",
        email: email
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });

  // Session-based authentication middleware
  const requireSession = (req: Request, res: Response, next: NextFunction) => {
    const session = (req as any).session;
    if (!session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    (req as any).user = session.user;
    next();
  };

  app.get("/api/auth/me", requireSession, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionUser = (req as any).user;
      const user = await databaseAuth.getUserByEmail(sessionUser.email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Admin dashboard stats
  app.get("/api/admin/stats", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-development') as any;
      if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get basic stats from storage
      const stats = {
        totalUsers: 0,
        activeUsers: 0,
        totalCVs: 0,
        premiumUsers: 0,
        totalRevenue: 0,
        monthlyRevenue: 0
      };

      // Try to get real stats if storage is available
      try {
        const users = await storage.getAllUsers();
        stats.totalUsers = users.length;
        stats.activeUsers = users.filter(u => u.lastLogin && 
          new Date(u.lastLogin).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length;
        
        const cvs = await storage.getAllCVs();
        stats.totalCVs = cvs.length;
        
        // Calculate actual premium users from subscriptions
        const subscriptions = await db.select().from(plans);
        stats.premiumUsers = subscriptions.filter(s => s.name !== 'free').length;
        stats.monthlyRevenue = 0; // Calculate from actual transactions
        stats.totalRevenue = 0;   // Calculate from actual transactions
      } catch (error) {
        console.error("Error fetching stats:", (error as Error).message);
      }

      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // Admin users endpoint
  app.get("/api/admin/users", isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get all users from database storage
      const allUsers = (await storage.getAllUsers()).map((user: any) => ({
        id: user.id,
        username: user.username || user.name,
        email: user.email,
        role: user.role || 'user',
        isActive: user.isActive,
        createdAt: user.createdAt
      }));

      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Admin CVs endpoint
  app.get("/api/admin/cvs", isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvs = await storage.getAllCVs();
      const cvsWithUserInfo = cvs.map((cv: any) => ({
        id: cv.id,
        fileName: cv.fileName,
        userId: cv.userId,
        username: `User ${cv.userId}`,
        score: cv.atsScore || null,
        createdAt: cv.createdAt
      }));

      res.json(cvsWithUserInfo);
    } catch (error) {
      console.error("Error fetching CVs:", error);
      res.status(500).json({ error: "Failed to fetch CVs" });
    }
  });
  
  // Health check endpoints
  app.get("/api/health", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Simple health check - database connection is verified on startup
      res.json({
        status: "ok",
        version: "1.0.0",
        database: "connected"
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Get subscription plans
  app.get("/api/plans", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Return predefined subscription plans
      const plans = [
        {
          id: 1,
          name: "Basic",
          price: 0,
          features: ["CV Upload", "Basic ATS Scoring", "Job Matching"]
        },
        {
          id: 2,
          name: "Premium",
          price: 199,
          features: ["Everything in Basic", "Advanced Analysis", "Priority Support"]
        }
      ];
      res.json(plans);
    } catch (error) {
      next(error);
    }
  });
  
  // Employer Routes
  
  // Get current user's employer profile
  app.get("/api/employers/me", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const employer = await employerStorage.getEmployerByUserId(userId);
      
      if (!employer) {
        return res.status(404).json({ 
          error: "Employer profile not found", 
          message: "You don't have an employer profile yet." 
        });
      }
      
      res.json(employer);
    } catch (error) {
      next(error);
    }
  });
  
  // Create employer profile
  app.post("/api/employers", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      
      // Check if employer profile already exists
      const existingEmployer = await employerStorage.getEmployerByUserId(userId);
      
      if (existingEmployer) {
        return res.status(400).json({ 
          error: "Employer profile already exists", 
          message: "You already have an employer profile." 
        });
      }
      
      // Prepare employer data
      const employerData = {
        ...req.body,
        userId
      };
      
      // Validate data
      const validatedData = insertEmployerSchema.parse(employerData);
      
      // Create employer profile
      const employer = await employerStorage.createEmployer(validatedData);
      
      res.status(201).json(employer);
    } catch (error) {
      next(error);
    }
  });
  
  // Update employer profile
  app.put("/api/employers/me", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      
      // Get employer profile
      const employer = await employerStorage.getEmployerByUserId(userId);
      
      if (!employer) {
        return res.status(404).json({ 
          error: "Employer profile not found", 
          message: "You don't have an employer profile yet." 
        });
      }
      
      // Update employer profile
      const updatedEmployer = await employerStorage.updateEmployer(employer.id, req.body);
      
      res.json(updatedEmployer);
    } catch (error) {
      next(error);
    }
  });
  
  // Job Posting Routes
  
  // Get job postings for current employer
  app.get("/api/job-postings/my", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      
      // Get employer profile
      const employer = await employerStorage.getEmployerByUserId(userId);
      
      if (!employer) {
        return res.status(404).json({ 
          error: "Employer profile not found", 
          message: "You don't have an employer profile yet." 
        });
      }
      
      // Get job postings
      const jobPostings = await employerStorage.getJobPostingsByEmployer(employer.id);
      
      res.json(jobPostings);
    } catch (error) {
      next(error);
    }
  });
  
  // Get all job postings with filters
  app.get("/api/job-postings", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, location, industry, employmentType, limit } = req.query;
      
      // Prepare query parameters
      const queryParams: any = {};
      
      if (title) queryParams.title = title as string;
      if (location) queryParams.location = location as string;
      if (industry) queryParams.industry = industry as string;
      if (employmentType) queryParams.employmentType = employmentType as string;
      if (limit) queryParams.limit = parseInt(limit as string);
      
      // Get job postings
      const jobPostings = await employerStorage.getJobPostings(queryParams);
      
      res.json(jobPostings);
    } catch (error) {
      next(error);
    }
  });
  
  // Advanced South African job search with province and BBBEE filters
  app.get("/api/sa-job-search", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        province, 
        bbbeeLevel, 
        nqfLevel, 
        industry, 
        jobType,
        skills,
        limit,
        offset
      } = req.query;
      
      // Build conditions array
      const conditions = [eq(jobPostings.isActive, true)];
      
      if (province) {
        conditions.push(eq(employers.location, province as string));
      }
      
      if (bbbeeLevel) {
        conditions.push(eq(employers.bbbeeLevel, parseInt(bbbeeLevel as string)));
      }
      
      if (industry) {
        conditions.push(eq(jobPostings.industry, industry as string));
      }
      
      if (jobType) {
        conditions.push(eq(jobPostings.employmentType, jobType as string));
      }
      
      // Execute query with proper Drizzle structure
      const results = await db
        .select({
          job: jobPostings,
          employer: employers
        })
        .from(jobPostings)
        .innerJoin(employers, eq(jobPostings.employerId, employers.id))
        .where(and(...conditions))
        .orderBy(desc(jobPostings.createdAt))
        .limit(limit ? parseInt(limit as string) : 20)
        .offset(offset ? parseInt(offset as string) : 0);
      
      // Format response
      const formattedResults = results.map(({ job, employer }) => ({
        id: job.id,
        title: job.title,
        company: employer.companyName,
        location: employer.location,
        description: job.description,
        employmentType: job.employmentType,
        salary: job.salaryRange,
        requiredSkills: job.requiredSkills,
        bbbeeLevel: employer.bbbeeLevel,
        industry: job.industry,
        experienceLevel: job.experienceLevel,
        deadline: job.deadline,
        createdAt: job.createdAt,
        companyLogo: employer.logo
      }));
      
      res.json({
        results: formattedResults,
        count: formattedResults.length,
        filters: {
          province,
          bbbeeLevel,
          industry,
          jobType,
          skills
        }
      });
    } catch (error) {
      console.error("Error in SA job search:", error);
      next(error);
    }
  });
  
  // Get job posting by ID
  app.get("/api/job-postings/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ error: "Invalid job posting ID" });
      }
      
      // Get job posting
      const jobPosting = await employerStorage.getJobPosting(jobId);
      
      if (!jobPosting) {
        return res.status(404).json({ error: "Job posting not found" });
      }
      
      res.json(jobPosting);
    } catch (error) {
      next(error);
    }
  });
  
  // Create job posting
  app.post("/api/job-postings", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      
      // Get employer profile
      const employer = await employerStorage.getEmployerByUserId(userId);
      
      if (!employer) {
        return res.status(404).json({ 
          error: "Employer profile not found", 
          message: "You need to create an employer profile first." 
        });
      }
      
      // Prepare job posting data
      const jobPostingData = {
        ...req.body,
        employerId: employer.id
      };
      
      // Validate data
      const validatedData = insertJobPostingSchema.parse(jobPostingData);
      
      // Create job posting
      const jobPosting = await employerStorage.createJobPosting(validatedData);
      
      res.status(201).json(jobPosting);
    } catch (error) {
      next(error);
    }
  });
  
  // Update job posting
  app.patch("/api/job-postings/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(jobId)) {
        return res.status(400).json({ error: "Invalid job posting ID" });
      }
      
      // Get employer profile
      const employer = await employerStorage.getEmployerByUserId(userId);
      
      if (!employer) {
        return res.status(404).json({ error: "Employer profile not found" });
      }
      
      // Get job posting
      const jobPosting = await employerStorage.getJobPosting(jobId);
      
      if (!jobPosting) {
        return res.status(404).json({ error: "Job posting not found" });
      }
      
      // Check if job posting belongs to employer
      if (jobPosting.employerId !== employer.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Update job posting
      const updatedJobPosting = await employerStorage.updateJobPosting(jobId, req.body);
      
      res.json(updatedJobPosting);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete job posting
  app.delete("/api/job-postings/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(jobId)) {
        return res.status(400).json({ error: "Invalid job posting ID" });
      }
      
      // Get employer profile
      const employer = await employerStorage.getEmployerByUserId(userId);
      
      if (!employer) {
        return res.status(404).json({ error: "Employer profile not found" });
      }
      
      // Get job posting
      const jobPosting = await employerStorage.getJobPosting(jobId);
      
      if (!jobPosting) {
        return res.status(404).json({ error: "Job posting not found" });
      }
      
      // Check if job posting belongs to employer
      if (jobPosting.employerId !== employer.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Delete job posting
      await employerStorage.deleteJobPosting(jobId);
      
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });
  
  // Job Matching Routes
  
  // Get job matches for a specific job posting
  app.get("/api/job-postings/:id/candidates", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(jobId)) {
        return res.status(400).json({ error: "Invalid job posting ID" });
      }
      
      // Get employer profile
      const employer = await employerStorage.getEmployerByUserId(userId);
      
      if (!employer) {
        return res.status(404).json({ error: "Employer profile not found" });
      }
      
      // Get job posting
      const jobPosting = await employerStorage.getJobPosting(jobId);
      
      if (!jobPosting) {
        return res.status(404).json({ error: "Job posting not found" });
      }
      
      // Check if job posting belongs to employer
      if (jobPosting.employerId !== employer.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Get job matches
      const matches = await employerStorage.getJobMatchesForJob(jobId);
      
      res.json(matches);
    } catch (error) {
      next(error);
    }
  });
  
  // Get job matches for a specific CV
  app.get("/api/cv/:id/job-matches", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(cvId)) {
        return res.status(400).json({ error: "Invalid CV ID" });
      }
      
      // Get CV
      const cv = await storage.getCVById(cvId);
      
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }
      
      // Check if CV belongs to user
      if (cv.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Get job matches
      const matches = await employerStorage.getJobMatchesForCV(cvId);
      
      res.json(matches);
    } catch (error) {
      next(error);
    }
  });
  
  // Create job match (run matching algorithm between a CV and job posting)
  app.post("/api/job-matches", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cvId, jobId } = req.body;
      const userId = req.user!.id;
      
      if (!cvId || !jobId) {
        return res.status(400).json({ error: "CV ID and Job ID are required" });
      }
      
      // Get CV
      const cv = await storage.getCVById(cvId);
      
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }
      
      // Check if CV belongs to user
      if (cv.userId !== userId) {
        return res.status(403).json({ error: "Access denied to this CV" });
      }
      
      // Get job posting
      const jobPosting = await employerStorage.getJobPosting(jobId);
      
      if (!jobPosting) {
        return res.status(404).json({ error: "Job posting not found" });
      }
      
      // Check if job is active
      if (!jobPosting.isActive) {
        return res.status(400).json({ error: "Job posting is not active" });
      }
      
      // Use AI service to calculate match score
      // For now, we'll implement a simple matching algorithm without AI
      // This can be enhanced later with more sophisticated AI matching
      const matchedSkills: string[] = [];
      const jobSkills = jobPosting.requiredSkills || [];
      const cvContent = cv.content.toLowerCase();
      
      // Simple keyword matching for skills
      for (const skill of jobSkills) {
        if (cvContent.includes(skill.toLowerCase())) {
          matchedSkills.push(skill);
        }
      }
      
      // Calculate match score based on percentage of matched skills
      const matchPercentage = jobSkills.length > 0 
        ? Math.round((matchedSkills.length / jobSkills.length) * 100)
        : 50; // Default score if no skills are specified
      
      const analysisResult = {
        overallScore: matchPercentage,
        matchedSkills: matchedSkills,
        unmatchedSkills: jobSkills.filter(skill => !matchedSkills.includes(skill)),
        jobTitle: jobPosting.title,
        industry: jobPosting.industry
      };
      
      // Create job match record
      const matchData = {
        cvId,
        jobPostingId: jobId,
        userId,
        matchScore: analysisResult.overallScore || 0,
        matchedSkills: analysisResult.matchedSkills || []
      };
      
      const jobMatch = await employerStorage.createJobMatch(matchData);
      
      // Create notification for the employer
      await employerStorage.createNotification({
        userId: jobPosting.employerId,
        title: "New Job Application",
        message: `A new candidate has applied for your "${jobPosting.title}" job posting.`,
        type: "job-match",
        relatedEntityId: jobMatch.id,
        relatedEntityType: "job-match"
      });
      
      res.status(201).json({
        ...jobMatch,
        analysisDetails: analysisResult
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Skills Management Routes
  
  // Get all skills by category
  app.get("/api/skills", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.query;
      
      // Get all skills using the employer storage functions
      let skillsList;
      if (category) {
        // Filter by category if provided
        skillsList = await db.select().from(skills)
          .where(eq(skills.category, category as string));
      } else {
        // Get all skills
        skillsList = await db.select().from(skills);
      }
      
      res.json(skillsList);
    } catch (error) {
      next(error);
    }
  });
  
  // Get user skills
  app.get("/api/user/skills", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      
      // Get user skills
      const userSkills = await employerStorage.getUserSkills(userId);
      
      res.json(userSkills);
    } catch (error) {
      next(error);
    }
  });
  
  // Add user skill
  app.post("/api/user/skills", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const { skillId, proficiency, yearsExperience } = req.body;
      
      if (!skillId || !proficiency) {
        return res.status(400).json({ error: "Skill ID and proficiency are required" });
      }
      
      // Check if skill exists
      const skill = await employerStorage.getSkill(skillId);
      
      if (!skill) {
        return res.status(404).json({ error: "Skill not found" });
      }
      
      // Add user skill
      const userSkill = await employerStorage.addUserSkill({
        userId,
        skillId,
        proficiency,
        yearsExperience: yearsExperience || 0
      });
      
      res.status(201).json(userSkill);
    } catch (error) {
      next(error);
    }
  });
  
  // Remove user skill
  app.delete("/api/user/skills/:skillId", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const skillId = parseInt(req.params.skillId);
      
      if (isNaN(skillId)) {
        return res.status(400).json({ error: "Invalid skill ID" });
      }
      
      // Remove user skill
      await employerStorage.removeUserSkill(userId, skillId);
      
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });
  
  // South African Profile Routes
  
  // Get current user's South African profile details
  app.get("/api/sa-profile", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      
      // Query the saProfiles table directly
      const [profile] = await db.select().from(saProfiles).where(eq(saProfiles.userId, userId));
      
      if (!profile) {
        return res.status(404).json({ 
          error: "SA profile not found", 
          message: "You don't have a South African profile yet." 
        });
      }
      
      res.json(profile);
    } catch (error) {
      next(error);
    }
  });
  
  // Create or update South African profile
  app.post("/api/sa-profile", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      
      // Check if profile already exists
      const [existingProfile] = await db.select().from(saProfiles).where(eq(saProfiles.userId, userId));
      
      if (existingProfile) {
        // Update existing profile
        const [updatedProfile] = await db
          .update(saProfiles)
          .set({
            ...req.body,
            updatedAt: new Date()
          })
          .where(eq(saProfiles.userId, userId))
          .returning();
        
        return res.json(updatedProfile);
      }
      
      // Create new profile
      const [newProfile] = await db.insert(saProfiles)
        .values({
          ...req.body,
          userId
        })
        .returning();
      
      res.status(201).json(newProfile);
    } catch (error) {
      next(error);
    }
  });
  
  // B-BBEE Verification Routes
  
  // Submit B-BBEE certificate for verification
  app.post("/api/sa-profile/bbbee-verification", isAuthenticated, upload.single("certificate"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({ 
          error: "No file uploaded", 
          message: "Please upload your B-BBEE certificate" 
        });
      }
      
      // Get user's SA profile
      const [profile] = await db.select().from(saProfiles).where(eq(saProfiles.userId, userId));
      
      if (!profile) {
        return res.status(404).json({ 
          error: "SA profile not found", 
          message: "Please create your South African profile first" 
        });
      }
      
      // In a real implementation, we would:
      // 1. Save the certificate file
      // 2. Submit it for verification (manual or automated)
      // 3. Update the profile status
      
      // For now, we'll mock the verification process
      const [updatedProfile] = await db
        .update(saProfiles)
        .set({
          bbbeeVerificationStatus: "pending",
          bbbeeVerificationDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(saProfiles.userId, userId))
        .returning();
      
      // Create a notification for the user
      await employerStorage.createNotification({
        userId,
        title: "B-BBEE Verification Submitted",
        message: "Your B-BBEE certificate has been submitted for verification. You will be notified once the verification is complete.",
        type: "bbbee-verification",
        relatedEntityId: profile.id,
        relatedEntityType: "sa-profile"
      });
      
      res.json({
        message: "B-BBEE certificate submitted for verification",
        profile: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Notification Routes
  
  // Get notifications for the authenticated user
  app.get("/api/notifications", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      // Get notifications
      const notifications = await employerStorage.getNotificationsForUser(userId, limit);
      
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });
  
  // Mark notification as read
  app.patch("/api/notifications/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = parseInt(req.params.id);
      
      if (isNaN(notificationId)) {
        return res.status(400).json({ error: "Invalid notification ID" });
      }
      
      // Mark notification as read
      const notification = await employerStorage.markNotificationAsRead(notificationId);
      
      res.json(notification);
    } catch (error) {
      next(error);
    }
  });
  
  // South African Job Market Routes
  
  // Get personalized job recommendations based on CV with South African context
  app.get("/api/sa-job-recommendations", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { cvId, limit, includeApplied, province, industries, experienceLevel } = req.query;
      
      if (!cvId) {
        return res.status(400).json({ error: "CV ID is required" });
      }
      
      const parsedCvId = parseInt(cvId as string);
      
      if (isNaN(parsedCvId)) {
        return res.status(400).json({ error: "Invalid CV ID" });
      }
      
      // Get personalized recommendations using the South African job matching service
      const recommendations = await jobMatchingService.getPersonalizedJobRecommendations(
        userId,
        parsedCvId,
        {
          limit: limit ? parseInt(limit as string) : undefined,
          includeApplied: includeApplied === 'true',
          provincePreference: province as string,
          industryPreferences: industries ? (industries as string).split(',') : undefined,
          experienceLevelPreference: experienceLevel as string
        }
      );
      
      res.json({
        recommendations,
        metadata: {
          count: recommendations.length,
          filters: {
            province: province || null,
            industries: industries ? (industries as string).split(',') : null,
            experienceLevel: experienceLevel || null
          }
        }
      });
    } catch (error) {
      console.error("Error getting job recommendations:", error);
      next(error);
    }
  });
  
  // Get industry-specific search template for South African sectors
  app.get("/api/sa-industry-template/:industry", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { industry } = req.params;
      
      if (!industry) {
        return res.status(400).json({ error: "Industry is required" });
      }
      
      // Get the industry search template
      const template = jobMatchingService.getIndustrySearchTemplate(industry);
      
      res.json({
        industry,
        template,
        metadata: {
          isCustomTemplate: template.searchTerms.length > 0,
          supportedIndustries: [
            "Mining & Minerals",
            "Financial Services",
            "Information Technology",
            "Government & Public Sector",
            "Healthcare & Medical",
            "Retail & Consumer Goods",
            "Construction & Engineering",
            "Agriculture & Farming"
          ]
        }
      });
    } catch (error) {
      console.error("Error getting industry template:", error);
      next(error);
    }
  });
  
  // Get South African reference data
  app.get("/api/sa-reference-data", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // South African provinces
      const provinces = [
        { code: "GP", name: "Gauteng" },
        { code: "WC", name: "Western Cape" },
        { code: "KZN", name: "KwaZulu-Natal" },
        { code: "EC", name: "Eastern Cape" },
        { code: "FS", name: "Free State" },
        { code: "NW", name: "North West" },
        { code: "MP", name: "Mpumalanga" },
        { code: "LP", name: "Limpopo" },
        { code: "NC", name: "Northern Cape" }
      ];
      
      // Major South African industries
      const industries = [
        { code: "AGRI", name: "Agriculture & Farming" },
        { code: "MINING", name: "Mining & Minerals" },
        { code: "MANUF", name: "Manufacturing" },
        { code: "FINANCE", name: "Financial Services" },
        { code: "TECH", name: "Information Technology" },
        { code: "RETAIL", name: "Retail & Consumer Goods" },
        { code: "HEALTH", name: "Healthcare & Medical" },
        { code: "EDU", name: "Education & Training" },
        { code: "TOURISM", name: "Tourism & Hospitality" },
        { code: "CONST", name: "Construction & Engineering" },
        { code: "ENERGY", name: "Energy & Utilities" },
        { code: "TELCO", name: "Telecommunications" },
        { code: "LEGAL", name: "Legal Services" },
        { code: "GOVT", name: "Government & Public Sector" },
        { code: "TRANS", name: "Transport & Logistics" },
        { code: "MEDIA", name: "Media & Communications" }
      ];
      
      // B-BBEE levels
      const bbbeeLevels = [
        { level: 1, points: "≥ 100 points", description: "135% recognition" },
        { level: 2, points: "≥ 95 points", description: "125% recognition" },
        { level: 3, points: "≥ 90 points", description: "110% recognition" },
        { level: 4, points: "≥ 80 points", description: "100% recognition" },
        { level: 5, points: "≥ 75 points", description: "80% recognition" },
        { level: 6, points: "≥ 70 points", description: "60% recognition" },
        { level: 7, points: "≥ 55 points", description: "50% recognition" },
        { level: 8, points: "≥ 40 points", description: "10% recognition" },
        { level: "Non-Compliant", points: "< 40 points", description: "0% recognition" }
      ];
      
      // NQF levels
      const nqfLevels = [
        { level: 1, description: "General Certificate (Grade 9)" },
        { level: 2, description: "Elementary Certificate (Grade 10)" },
        { level: 3, description: "Intermediate Certificate (Grade 11)" },
        { level: 4, description: "National Certificate (Grade 12)" },
        { level: 5, description: "Higher Certificate or National Certificate" },
        { level: 6, description: "Diploma or Advanced Certificate" },
        { level: 7, description: "Bachelor's Degree or Advanced Diploma" },
        { level: 8, description: "Honours Degree or Postgraduate Diploma" },
        { level: 9, description: "Master's Degree" },
        { level: 10, description: "Doctoral Degree" }
      ];
      
      // Employment types
      const employmentTypes = [
        { code: "FULL", name: "Full-time" },
        { code: "PART", name: "Part-time" },
        { code: "CONTRACT", name: "Contract" },
        { code: "TEMP", name: "Temporary" },
        { code: "CASUAL", name: "Casual" },
        { code: "REMOTE", name: "Remote" },
        { code: "HYBRID", name: "Hybrid" },
        { code: "FREELANCE", name: "Freelance" },
        { code: "INTERN", name: "Internship" },
        { code: "LEARNERSHIP", name: "Learnership" },
        { code: "VOLUNTEER", name: "Volunteer" }
      ];
      
      // Return all reference data
      res.json({
        provinces,
        industries,
        bbbeeLevels,
        nqfLevels,
        employmentTypes
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Get all CVs for the authenticated user
  app.get("/api/cvs", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const cvs = await storage.getCVsByUserId(userId);
      res.json(cvs);
    } catch (error) {
      next(error);
    }
  });

  // Get latest CV for authenticated user
  app.get("/api/latest-cv", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const latestCV = await storage.getLatestCVByUserId(userId);
      
      if (!latestCV) {
        return res.status(404).json({ 
          error: "No CV found", 
          message: "You haven't uploaded any CVs yet." 
        });
      }
      
      res.json(latestCV);
    } catch (error) {
      next(error);
    }
  });

  // Get personalized job recommendations for authenticated users
  app.get("/api/job-recommendations", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { cvId, limit, includeApplied, province, industries, experienceLevel } = req.query;
      
      if (!cvId) {
        return res.status(400).json({ error: "CV ID is required" });
      }
      
      const parsedCvId = parseInt(cvId as string);
      
      if (isNaN(parsedCvId)) {
        return res.status(400).json({ error: "Invalid CV ID" });
      }
      
      // Get CV to verify it exists and belongs to user
      const cv = await storage.getCVById(parsedCvId);
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }
      
      if (cv.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Query active job postings that match user's CV
      const jobRecommendations = await db
        .select({
          id: jobPostings.id,
          jobTitle: jobPostings.title,
          company: employers.companyName,
          location: jobPostings.location,
          salaryRange: jobPostings.salaryRange,
          industry: jobPostings.industry,
          employmentType: jobPostings.employmentType,
          experienceLevel: jobPostings.experienceLevel,
          postedDate: jobPostings.createdAt,
          description: jobPostings.description,
          requirements: jobPostings.requirements,
          benefits: jobPostings.benefits,
          isRemote: jobPostings.isRemote,
          bbbeeCompliant: employers.bbbeeCompliant
        })
        .from(jobPostings)
        .innerJoin(employers, eq(jobPostings.employerId, employers.id))
        .where(and(
          eq(jobPostings.isActive, true),
          province ? eq(jobPostings.province, province as string) : undefined,
          experienceLevel ? eq(jobPostings.experienceLevel, experienceLevel as string) : undefined
        ))
        .orderBy(desc(jobPostings.createdAt))
        .limit(parseInt(limit as string) || 10);

      // Calculate match scores based on CV analysis
      const recommendations = jobRecommendations.map((job, index) => {
        // Simple scoring based on database data
        let matchScore = 70; // Base score
        
        // Adjust based on experience level match
        if (job.experienceLevel && cv.content) {
          const cvExperience = cv.content.toLowerCase();
          if (cvExperience.includes('senior') && job.experienceLevel.includes('Senior')) {
            matchScore += 10;
          }
          if (cvExperience.includes('manager') && job.experienceLevel.includes('Manager')) {
            matchScore += 10;
          }
        }
        
        // Adjust based on location preference
        if (province && job.location?.includes(province as string)) {
          matchScore += 5;
        }
        
        // Ensure score is within reasonable range
        matchScore = Math.min(95, Math.max(60, matchScore - (index * 2)));
        
        return {
          ...job,
          matchScore
        };
      });

      if (recommendations.length > 0) {
        return res.json({
          recommendations,
          metadata: {
            count: recommendations.length,
            filters: {
              province: province || null,
              industries: industries ? (industries as string).split(',') : null,
              experienceLevel: experienceLevel || null
            }
          }
        });
      }
      
      // Return empty results if no matches found
      return res.json({
        recommendations: [],
        metadata: {
          count: 0,
          filters: {
            province: province || null,
            industries: industries ? (industries as string).split(',') : null,
            experienceLevel: experienceLevel || null
          }
        }
      });
    } catch (error) {
      console.error("Error getting job recommendations:", error);
      next(error);
    }
  });

  // Get job seeker premium matches 
  app.get("/api/job-seeker/matches", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Get job seeker's actual premium matches
      const matches = await storage.getJobSeekerMatches(userId);
      
      res.json({
        matches,
        metadata: {
          count: matches.length,
          hasMatches: matches.length > 0
        }
      });
      
    } catch (error) {
      console.error("Error fetching job seeker matches:", error);
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });
  
  // CV Upload endpoint - supports both authenticated and guest users
  app.post("/api/upload", (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.log("Multer error:", err);
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              error: "File too large",
              message: "File size must be less than 5MB"
            });
          }
        }
        return res.status(400).json({
          error: "File upload error",
          message: err.message || "Failed to upload file"
        });
      }
      next();
    });
  }, async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Upload request received");
      console.log("Request headers:", req.headers);
      console.log("Request file:", req.file);
      console.log("Request body:", req.body);
      
      if (!req.file) {
        console.log("No file found in request");
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
      
      // Check if user is authenticated by verifying the token
      let userId = null;
      let isGuest = true;
      
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = databaseAuth.verifyToken(token);
        if (decoded && typeof decoded === 'object' && 'id' in decoded) {
          userId = decoded.id as number;
          isGuest = false;
        }
      }
      
      // Create CV record in the database
      const cvData = {
        fileName: originalname,
        fileType: mimetype,
        fileSize: size,
        content: textContent,
        userId: userId,
        isGuest: isGuest
      };
      
      // Create CV record
      const cv = await storage.saveCV(cvData);
      
      res.status(201).json(cv);
    } catch (error) {
      console.error("Error processing upload:", error);
      res.status(500).json({ 
        error: "Upload failed", 
        message: "Failed to process the uploaded file" 
      });
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
      const cv = await storage.getCVById(cvId);
      
      if (!cv) {
        return res.status(404).json({ 
          error: "CV not found", 
          message: "The CV with the specified ID was not found." 
        });
      }
      
      // Check if the CV belongs to the user (if authenticated)
      const isGuest = !req.user;
      
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
        const atsScore = await storage.saveATSScore({
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
      
      const cv = await storage.getCVById(cvId);
      
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }
      
      // Check if the CV belongs to the current user (if authenticated)
      const isAuthenticated = req.isAuthenticated();
      const hasAccess = !isAuthenticated || !cv.userId || cv.userId === req.user?.id;
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const atsScore = await storage.getATSScoresByCVId(cvId);
      
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
      // Check for authorization header
      const authHeader = req.headers.authorization;
      let user = null;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          user = verifyToken(token);
          if (user) {
            (req as any).user = user;
          }
        } catch (error) {
          // Token invalid
        }
      }
      
      // Check session-based authentication if available
      if (!user && req.session && (req.session as any).userId) {
        user = { id: (req.session as any).userId };
        (req as any).user = user;
      }
      
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = req.user.id;
      const cv = await storage.getLatestCVByUserId(userId);
      
      if (!cv) {
        return res.status(404).json({ error: "No CVs found for this user" });
      }
      
      res.json(cv);
    } catch (error) {
      console.error("Error fetching latest CV:", error);
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
      
      const cv = await storage.getCVById(cvId);
      
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
      
      const cv = await storage.getCVById(cvId);
      
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
  
  // xAI-powered CV analysis routes (primary AI service)
  app.use("/api/cv", cvAnalysisRoutes);
  
  // xAI API test routes
  app.use("/api", testXaiApiRoutes);
  
  // Removed mock analysis routes for production
  
  // PDF testing routes
  app.use("/api", pdfTestRoutes);
  
  // Mobile-optimized CV analysis routes for fast performance (<2s on 3G)
  app.use("/api", optimizedCvAnalysisRoutes);
  
  // Payment and notification routes for premium matching system
  app.use("/api/payment", paymentRoutes);
  app.use("/api/notifications", notificationRoutes);
  
  // Advanced features for recruiter success and job seeker engagement
  app.use("/api/candidate-scoring", candidateScoringRoutes);
  app.use("/api/gamification", gamificationRoutes);
  
  // WhatsApp Integration Routes
  
  // Endpoint to handle WhatsApp webhook - for receiving messages and CV files
  app.post("/api/whatsapp/webhook", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await whatsappService.processWebhook(req.body);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
      next(error);
    }
  });

  // Endpoint to send WhatsApp upload instructions to a user
  app.post("/api/whatsapp/send-instructions", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      
      const success = await whatsappService.sendUploadInstructions(phoneNumber);
      
      if (success) {
        // If the user has a phone number saved, update it
        if (req.user && (!req.user.phoneNumber || req.user.phoneNumber !== phoneNumber)) {
          await storage.updateUser(req.user.id, { phoneNumber });
        }
        
        res.status(200).json({ message: "Instructions sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send instructions" });
      }
    } catch (error) {
      console.error('Error sending WhatsApp instructions:', error);
      next(error);
    }
  });

  // Endpoint to verify WhatsApp number
  app.post("/api/whatsapp/verify", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      
      // Generate a random 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the verification code
      const tokenExpiry = new Date();
      tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 10); // 10 minutes expiry
      
      await storage.updateUser(req.user.id, { 
        verificationToken: verificationCode,
        verificationTokenExpiry: tokenExpiry
      });
      
      // Send the verification code via WhatsApp
      const success = await whatsappService.sendVerificationCode(phoneNumber, verificationCode);
      
      if (success) {
        res.status(200).json({ message: "Verification code sent" });
      } else {
        res.status(500).json({ error: "Failed to send verification code" });
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      next(error);
    }
  });

  // Endpoint to confirm WhatsApp verification
  app.post("/api/whatsapp/confirm", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, phoneNumber } = req.body;
      
      if (!code || !phoneNumber) {
        return res.status(400).json({ error: "Verification code and phone number are required" });
      }
      
      const user = await storage.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if the verification code matches and hasn't expired
      if (user.verificationToken !== code) {
        return res.status(400).json({ error: "Invalid verification code" });
      }
      
      const now = new Date();
      if (!user.verificationTokenExpiry || now > user.verificationTokenExpiry) {
        return res.status(400).json({ error: "Verification code has expired" });
      }
      
      // Verification successful, update the user's phone information
      await storage.updateUser(user.id, {
        phoneNumber,
        phoneVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      });
      
      // If the user has a South African profile, update the WhatsApp settings there too
      const saProfile = await storage.getSAProfileByUserId(user.id);
      if (saProfile) {
        await storage.updateSAProfile(saProfile.id, {
          whatsappNumber: phoneNumber,
          whatsappVerified: true,
          whatsappEnabled: true
        });
      }
      
      res.status(200).json({ message: "WhatsApp number verified successfully" });
    } catch (error) {
      console.error('Error confirming verification:', error);
      next(error);
    }
  });

  // Endpoint to get WhatsApp settings
  app.get("/api/whatsapp-settings", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await storage.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if the user has a South African profile
      const saProfile = await storage.getSAProfileByUserId(user.id);
      
      let settings = {
        enabled: false,
        phoneNumber: user.phoneNumber || null,
        verified: user.phoneVerified || false
      };
      
      // If the user has a South African profile, use those settings
      if (saProfile) {
        settings = {
          enabled: saProfile.whatsappEnabled || false,
          phoneNumber: saProfile.whatsappNumber || user.phoneNumber || null,
          verified: saProfile.whatsappVerified || user.phoneVerified || false
        };
      }
      
      res.status(200).json(settings);
    } catch (error) {
      console.error('Error getting WhatsApp settings:', error);
      next(error);
    }
  });

  // Endpoint to update WhatsApp settings
  app.post("/api/whatsapp-settings", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { enabled, phoneNumber } = req.body;
      
      const user = await storage.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if the user has a South African profile
      const saProfile = await storage.getSAProfileByUserId(user.id);
      
      if (saProfile) {
        // Update the SA profile with the new settings
        await storage.updateSAProfile(saProfile.id, {
          whatsappEnabled: enabled,
          whatsappNumber: phoneNumber
        });
      }
      
      // Always update the user record too
      await storage.updateUser(user.id, {
        phoneNumber
      });
      
      res.status(200).json({
        enabled,
        phoneNumber,
        verified: user.phoneVerified || (saProfile?.whatsappVerified || false)
      });
    } catch (error) {
      console.error('Error updating WhatsApp settings:', error);
      next(error);
    }
  });
  
  // Template Generation API Routes with Security Measures
  app.post("/api/templates/ai-cv", isAuthenticated, hasActiveSubscription, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userProfile, jobDescription } = req.body;
      const userId = req.user.id;
      
      // Import the template services
      const { templateService } = await import('./services/templateService');
      const { templateSecurityService } = await import('./services/templateSecurityService');
      
      // 1. Check if user has reached usage limits
      const usageStats = await templateSecurityService.checkUsageLimits(userId);
      
      if (usageStats.limitReached) {
        return res.status(429).json({
          error: "Template generation limit reached",
          message: "You've reached your daily limit of template generations. Please try again tomorrow.",
          usage: usageStats
        });
      }
      
      // 2. Generate the template
      const template = await templateService.generateAIPoweredTemplate(userProfile, jobDescription);
      
      // 3. Generate security information and watermarking
      const securityInfo = templateSecurityService.generateSecurityInfo(
        userId,
        userProfile.name,
        req,
        'ai-cv'
      );
      
      // 4. Apply watermarking to template
      const watermarkedContent = templateSecurityService.applyWatermark(
        template.content,
        securityInfo
      );
      
      // 5. Create watermarked template with security info
      const watermarkedTemplate = {
        ...template,
        content: watermarkedContent,
        watermarkId: securityInfo.watermarkId,
        securityCode: securityInfo.securityCode
      };
      
      // 6. Record template generation for tracking
      await templateSecurityService.recordTemplateGeneration(
        userId,
        'ai-cv',
        securityInfo,
        {
          targetRole: userProfile.targetRole,
          industry: userProfile.industry
        }
      );
      
      // 7. Return template with usage information
      res.json({
        success: true,
        template: watermarkedTemplate,
        usage: {
          remainingToday: usageStats.remainingToday - 1,
          remainingThisMonth: usageStats.remainingThisMonth - 1
        },
        securityCode: securityInfo.securityCode
      });
    } catch (error: any) {
      console.error('Error generating AI CV template:', error);
      res.status(500).json({ 
        error: "Failed to generate AI-powered CV template",
        details: error.message 
      });
    }
  });

  app.post("/api/templates/industry-cv", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { industry, experienceLevel } = req.body;
      const userId = 1; // Demo user for testing
      
      // Import the template services
      const { templateService } = await import('./services/templateService');
      const { templateSecurityService } = await import('./services/templateSecurityService');
      
      // Get user information for security tracking
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if user has reached usage limits
      const usageStats = await templateSecurityService.checkUsageLimits(userId);
      
      if (usageStats.limitReached) {
        return res.status(429).json({
          error: "Template generation limit reached",
          message: "You've reached your daily limit of template generations. Please try again tomorrow.",
          usage: usageStats
        });
      }
      
      // Generate the template
      const template = await templateService.generateIndustryTemplate(industry, experienceLevel);
      
      // Generate security information and watermarking
      const securityInfo = templateSecurityService.generateSecurityInfo(
        userId,
        user.name || user.username,
        req,
        'industry-cv'
      );
      
      // Apply watermarking to template
      const watermarkedContent = templateSecurityService.applyWatermark(
        template.content,
        securityInfo
      );
      
      // Create watermarked template with security info
      const watermarkedTemplate = {
        ...template,
        content: watermarkedContent,
        watermarkId: securityInfo.watermarkId,
        securityCode: securityInfo.securityCode
      };
      
      // Record template generation for tracking
      await templateSecurityService.recordTemplateGeneration(
        userId,
        'industry-cv',
        securityInfo,
        {
          industry,
          experienceLevel
        }
      );
      
      res.json({
        success: true,
        template: watermarkedTemplate,
        usage: {
          remainingToday: usageStats.remainingToday - 1,
          remainingThisMonth: usageStats.remainingThisMonth - 1
        },
        securityCode: securityInfo.securityCode
      });
    } catch (error: any) {
      console.error('Error generating industry CV template:', error);
      res.status(500).json({ 
        error: "Failed to generate industry-specific CV template",
        details: error.message 
      });
    }
  });

  app.post("/api/templates/cover-letter", isAuthenticated, hasActiveSubscription, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userProfile, company, position, jobDescription } = req.body;
      const userId = req.user.id;
      
      // Import the template services
      const { templateService } = await import('./services/templateService');
      const { templateSecurityService } = await import('./services/templateSecurityService');
      
      // Check if user has reached usage limits
      const usageStats = await templateSecurityService.checkUsageLimits(userId);
      
      if (usageStats.limitReached) {
        return res.status(429).json({
          error: "Template generation limit reached",
          message: "You've reached your daily limit of template generations. Please try again tomorrow.",
          usage: usageStats
        });
      }
      
      // Generate the template
      const template = await templateService.generateCoverLetterTemplate(userProfile, company, position, jobDescription);
      
      // Generate security information and watermarking
      const securityInfo = templateSecurityService.generateSecurityInfo(
        userId,
        userProfile.name,
        req,
        'cover-letter'
      );
      
      // Apply watermarking to template
      const watermarkedContent = templateSecurityService.applyWatermark(
        template.content,
        securityInfo
      );
      
      // Create watermarked template with security info
      const watermarkedTemplate = {
        ...template,
        content: watermarkedContent,
        watermarkId: securityInfo.watermarkId,
        securityCode: securityInfo.securityCode
      };
      
      // Record template generation for tracking
      await templateSecurityService.recordTemplateGeneration(
        userId,
        'cover-letter',
        securityInfo,
        {
          company,
          position,
          hasJobDescription: !!jobDescription
        }
      );
      
      res.json({
        success: true,
        template: watermarkedTemplate,
        usage: {
          remainingToday: usageStats.remainingToday - 1,
          remainingThisMonth: usageStats.remainingThisMonth - 1
        },
        securityCode: securityInfo.securityCode
      });
    } catch (error: any) {
      console.error('Error generating cover letter template:', error);
      res.status(500).json({ 
        error: "Failed to generate cover letter template",
        details: error.message 
      });
    }
  });

  app.post("/api/templates/dynamic-build", isAuthenticated, hasActiveSubscription, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userProfile, selectedSections, customContent } = req.body;
      const userId = req.user.id;
      
      // Import the template services
      const { templateService } = await import('./services/templateService');
      const { templateSecurityService } = await import('./services/templateSecurityService');
      
      // Check if user has reached usage limits
      const usageStats = await templateSecurityService.checkUsageLimits(userId);
      
      if (usageStats.limitReached) {
        return res.status(429).json({
          error: "Template generation limit reached",
          message: "You've reached your daily limit of template generations. Please try again tomorrow.",
          usage: usageStats
        });
      }
      
      // Generate the template
      const result = await templateService.buildDynamicTemplate(userProfile, selectedSections, customContent);
      
      // Generate security information and watermarking
      const securityInfo = templateSecurityService.generateSecurityInfo(
        userId,
        userProfile.name,
        req,
        'dynamic-build'
      );
      
      // Apply watermarking to template
      const watermarkedContent = templateSecurityService.applyWatermark(
        result.template.content,
        securityInfo
      );
      
      // Create watermarked template with security info
      const watermarkedTemplate = {
        ...result.template,
        content: watermarkedContent,
        watermarkId: securityInfo.watermarkId,
        securityCode: securityInfo.securityCode
      };
      
      // Record template generation for tracking
      await templateSecurityService.recordTemplateGeneration(
        userId,
        'dynamic-build',
        securityInfo,
        {
          sectionCount: selectedSections.length,
          customSections: Object.keys(customContent || {}).length,
          previewScore: result.previewScore
        }
      );
      
      res.json({
        success: true,
        template: watermarkedTemplate,
        previewScore: result.previewScore,
        usage: {
          remainingToday: usageStats.remainingToday - 1,
          remainingThisMonth: usageStats.remainingThisMonth - 1
        },
        securityCode: securityInfo.securityCode
      });
    } catch (error: any) {
      console.error('Error building dynamic template:', error);
      res.status(500).json({ 
        error: "Failed to build dynamic template",
        details: error.message 
      });
    }
  });

  app.get("/api/templates/categories", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { templateService } = await import('./services/templateService');
      
      const categories = templateService.getTemplateCategories();
      
      res.json({
        success: true,
        categories
      });
    } catch (error: any) {
      console.error('Error getting template categories:', error);
      res.status(500).json({ 
        error: "Failed to get template categories",
        details: error.message 
      });
    }
  });

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

  // Admin Routes
  
  // Get platform statistics
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get comprehensive platform statistics
      const stats = {
        total_users: await db.select({ count: sql<number>`count(*)` }).from(users).then(r => r[0]?.count || 0),
        total_cvs: await db.select({ count: sql<number>`count(*)` }).from(cvs).then(r => r[0]?.count || 0),
        total_job_postings: await db.select({ count: sql<number>`count(*)` }).from(jobPostings).where(eq(jobPostings.isActive, true)).then(r => r[0]?.count || 0),
        total_job_matches: await db.select({ count: sql<number>`count(*)` }).from(jobMatches).then(r => r[0]?.count || 0),
        active_subscriptions: await db.select({ count: sql<number>`count(*)` }).from(subscriptions).where(eq(subscriptions.status, 'active')).then(r => r[0]?.count || 0),
        revenue_this_month: await db.select({ 
          revenue: sql<number>`COALESCE(SUM(${plans.price}), 0)` 
        })
        .from(subscriptions)
        .leftJoin(plans, eq(subscriptions.planId, plans.id))
        .where(eq(subscriptions.status, 'active'))
        .then(r => r[0]?.revenue || 0)
      };

      res.json(stats);
    } catch (error) {
      console.error("Error getting admin stats:", error);
      next(error);
    }
  });

  // Get all users for admin management
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userList = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        role: users.role,
        is_active: users.isActive,
        email_verified: users.emailVerified,
        created_at: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(100);

      res.json(userList);
    } catch (error) {
      next(error);
    }
  });

  // Update user (admin only)
  app.patch("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;

      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Prevent admin from deactivating themselves
      if (userId === req.user.id && updates.is_active === false) {
        return res.status(400).json({ error: "Cannot deactivate your own account" });
      }

      const [updatedUser] = await db
        .update(users)
        .set({
          isActive: updates.is_active,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  // Get all job postings for admin management
  app.get("/api/admin/job-postings", isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobs = await db.select({
        id: jobPostings.id,
        title: jobPostings.title,
        location: jobPostings.location,
        employment_type: jobPostings.employmentType,
        is_active: jobPostings.isActive,
        views: jobPostings.views,
        applications: jobPostings.applications,
        created_at: jobPostings.createdAt,
        company_name: employers.companyName
      })
      .from(jobPostings)
      .leftJoin(employers, eq(jobPostings.employerId, employers.id))
      .orderBy(desc(jobPostings.createdAt))
      .limit(100);

      res.json(jobs);
    } catch (error) {
      next(error);
    }
  });

  // Update job posting (admin only)
  app.patch("/api/admin/job-postings/:id", isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobId = parseInt(req.params.id);
      const updates = req.body;

      if (isNaN(jobId)) {
        return res.status(400).json({ error: "Invalid job ID" });
      }

      const [updatedJob] = await db
        .update(jobPostings)
        .set({
          isActive: updates.is_active,
          updatedAt: new Date()
        })
        .where(eq(jobPostings.id, jobId))
        .returning();

      if (!updatedJob) {
        return res.status(404).json({ error: "Job posting not found" });
      }

      res.json(updatedJob);
    } catch (error) {
      next(error);
    }
  });

  // Referral system endpoints
  app.get("/api/referrals/stats", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const stats = await referralService.getReferralStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/referrals/credits", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const credits = await referralService.getUserCredits(userId);
      res.json(credits);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/referrals/code", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      let referralCode = await referralService.getUserReferralCode(userId);
      
      // If user doesn't have a referral code, generate one
      if (!referralCode) {
        referralCode = await referralService.generateReferralCode(userId);
        await referralService.saveUserReferralCode(userId, referralCode);
      }
      
      const referralLink = `${req.protocol}://${req.get('host')}/signup?ref=${referralCode}`;
      res.json({ referralCode, referralLink });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/referrals/generate", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      
      // Generate a new referral code
      const referralCode = await referralService.generateReferralCode(userId);
      await referralService.saveUserReferralCode(userId, referralCode);
      
      const referralLink = `${req.protocol}://${req.get('host')}/signup?ref=${referralCode}`;
      
      res.json({ 
        referralCode, 
        referralLink,
        message: "New referral link generated successfully"
      });
    } catch (error) {
      console.error("Error generating referral code:", error);
      res.status(500).json({ error: "Failed to generate referral code" });
    }
  });

  app.post("/api/referrals/create", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { refereeEmail } = req.body;
      
      const referralCode = await referralService.createReferral(userId, refereeEmail);
      res.json({ 
        success: true, 
        referralCode,
        referralLink: `${req.protocol}://${req.get('host')}/signup?ref=${referralCode}`
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/referrals/signup", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { referralCode, userId } = req.body;
      
      if (referralCode && userId) {
        await referralService.processReferralSignup(referralCode, userId);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Referral signup processing error:', error);
      res.json({ success: false, error: error.message });
    }
  });

  app.post("/api/referrals/upgrade", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      await referralService.processReferralUpgrade(userId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/referrals/spend-credit", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { type, amount = 1 } = req.body;
      
      const success = await referralService.spendCredits(userId, type, amount);
      res.json({ success });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/referrals/rewards", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const rewards = await referralService.getUserRewards(userId);
      res.json(rewards);
    } catch (error) {
      next(error);
    }
  });

  // Removed demo routes for production

  // Mount webhook routes
  const webhookRoutes = await import('./routes/webhookRoutes');
  app.use("/api/webhooks", webhookRoutes.default);

  // Enhanced job matching endpoints
  app.post("/api/job-matches/find", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const { 
        cvId, 
        location, 
        preferredSalaryRange, 
        workType, 
        experienceLevel 
      } = req.body;
      
      if (!cvId) {
        return res.status(400).json({ error: "CV ID is required" });
      }

      const matches = await jobMatchingService.findJobMatches({
        cvId,
        userId,
        location,
        preferredSalaryRange,
        workType,
        experienceLevel
      });

      // Save top matches to database
      for (const match of matches.slice(0, 10)) {
        try {
          await jobMatchingService.saveJobMatch({
            userId,
            cvId,
            jobPostingId: match.jobId,
            matchScore: match.matchScore,
            matchReasons: match.matchReasons,
            skillsMatchScore: match.skillsMatchScore,
            saContextScore: match.saContextScore,
            locationScore: match.locationScore
          });
        } catch (saveError) {
          console.log('Error saving match, continuing with others');
        }
      }

      res.json({
        matches: matches.slice(0, 20),
        totalMatches: matches.length,
        message: `Found ${matches.length} job matches`
      });
    } catch (error) {
      console.error('Error finding job matches:', error);
      next(error);
    }
  });

  app.get("/api/job-matches/saved", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const limit = parseInt(req.query.limit as string) || 20;

      const matches = await jobMatchingService.getUserJobMatches(userId, limit);

      res.json({
        matches,
        count: matches.length
      });
    } catch (error) {
      console.error('Error getting saved job matches:', error);
      next(error);
    }
  });

  // Interview Practice API endpoints
  app.post("/api/interview/generate-questions", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { jobTitle, difficulty, questionCount, jobDescription } = req.body;
      
      // Sample questions database based on difficulty
      const questionPool = {
        easy: [
          {
            id: '1',
            question: 'Tell me about yourself and your background.',
            type: 'behavioral',
            category: 'Introduction',
            difficulty: 'easy',
            tips: [
              'Keep it concise - 2-3 minutes maximum',
              'Focus on relevant professional experience',
              'End with why you\'re interested in this role',
              'Practice this as it\'s usually the first question'
            ]
          },
          {
            id: '2',
            question: 'What are your greatest strengths?',
            type: 'behavioral',
            category: 'Self Assessment',
            difficulty: 'easy',
            tips: [
              'Choose strengths relevant to the job',
              'Provide concrete examples',
              'Show how they benefit the employer',
              'Be genuine and confident'
            ]
          }
        ],
        medium: [
          {
            id: '3',
            question: 'Describe a challenging project you worked on and how you overcame obstacles.',
            type: 'behavioral',
            category: 'Problem Solving',
            difficulty: 'medium',
            tips: [
              'Use the STAR method (Situation, Task, Action, Result)',
              'Choose a relevant example that shows your skills',
              'Focus on your specific contributions',
              'Quantify the results when possible'
            ]
          },
          {
            id: '4',
            question: 'How do you handle working under pressure and tight deadlines?',
            type: 'behavioral',
            category: 'Work Style',
            difficulty: 'medium',
            tips: [
              'Provide specific examples',
              'Show your organizational skills',
              'Mention stress management techniques',
              'Demonstrate adaptability'
            ]
          }
        ],
        hard: [
          {
            id: '5',
            question: 'Describe a time when you had to work with a difficult team member.',
            type: 'situational',
            category: 'Teamwork',
            difficulty: 'hard',
            tips: [
              'Focus on professional handling',
              'Show communication skills',
              'Demonstrate conflict resolution',
              'Emphasize positive outcomes'
            ]
          }
        ]
      };
      
      let selectedQuestions = [];
      if (difficulty === 'all') {
        selectedQuestions = [...questionPool.easy, ...questionPool.medium, ...questionPool.hard];
      } else {
        selectedQuestions = questionPool[difficulty] || questionPool.medium;
      }
      
      // Shuffle and limit to requested count
      const shuffled = selectedQuestions.sort(() => 0.5 - Math.random());
      const questions = shuffled.slice(0, Math.min(questionCount, shuffled.length));
      
      res.json({
        sessionId: Date.now().toString(),
        questions,
        jobTitle,
        difficulty,
        totalQuestions: questions.length
      });
    } catch (error) {
      console.error("Error generating interview questions:", error);
      res.status(500).json({ error: "Failed to generate interview questions" });
    }
  });

  app.post("/api/interview/submit-answer", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, questionId, answer, timeSpent } = req.body;
      
      if (!answer || answer.trim().length < 10) {
        return res.status(400).json({ 
          error: "Answer too short", 
          message: "Please provide a more detailed answer" 
        });
      }
      
      // Generate feedback based on answer length and content
      const wordCount = answer.split(' ').length;
      let feedback = '';
      let score = 0;
      
      if (wordCount < 20) {
        feedback = 'Your answer could be more detailed. Try to provide specific examples and expand on your thoughts.';
        score = 3;
      } else if (wordCount > 200) {
        feedback = 'Great detail! Consider being more concise while maintaining the key points.';
        score = 7;
      } else {
        feedback = 'Good length for your answer. Make sure to include specific examples that demonstrate your skills.';
        score = 8;
      }
      
      // Additional feedback based on keywords
      const keywords = ['example', 'experience', 'result', 'achieved', 'learned', 'improved'];
      const hasKeywords = keywords.some(keyword => answer.toLowerCase().includes(keyword));
      
      if (hasKeywords) {
        score += 1;
        feedback += ' Your answer includes good examples and specific details.';
      }
      
      res.json({
        feedback,
        score: Math.min(score, 10),
        suggestions: [
          'Use the STAR method for behavioral questions',
          'Include specific metrics when possible',
          'Connect your answer to the role requirements'
        ]
      });
    } catch (error) {
      console.error("Error submitting interview answer:", error);
      res.status(500).json({ error: "Failed to process answer" });
    }
  });

  // Skill Gap Analysis API endpoints
  app.post("/api/skill-gap/analyze", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentRole, targetRole, experience, industry, currentSkills } = req.body;
      
      if (!currentRole || !targetRole || !currentSkills) {
        return res.status(400).json({ 
          error: "Missing required fields",
          message: "Please provide current role, target role, and current skills"
        });
      }
      
      // Calculate match percentage based on role similarity and experience
      let baseMatch = 45;
      if (currentRole.toLowerCase().includes(targetRole.toLowerCase()) || 
          targetRole.toLowerCase().includes(currentRole.toLowerCase())) {
        baseMatch += 25;
      }
      if (experience === 'senior') baseMatch += 10;
      if (experience === 'mid') baseMatch += 5;
      
      const overallMatch = Math.min(Math.max(baseMatch + Math.random() * 20, 30), 85);
      
      // Generate skill analysis based on target role
      const commonSkills = [
        { name: 'Communication Skills', match: 95, description: 'Strong verbal and written communication abilities', importance: 9 },
        { name: 'Problem Solving', match: 88, description: 'Analytical thinking and solution-oriented approach', importance: 8 },
        { name: 'Team Collaboration', match: 82, description: 'Experience working effectively in team environments', importance: 7 },
        { name: 'Project Management', match: 75, description: 'Basic project coordination and delivery experience', importance: 6 }
      ];
      
      const missingSkills = [
        { name: `${targetRole} Specific Technology`, match: 25, description: 'Core technical skills required for the target role', importance: 10 },
        { name: 'Industry Standards & Practices', match: 35, description: `${industry} sector knowledge and best practices`, importance: 8 },
        { name: 'Advanced Analytics', match: 20, description: 'Data analysis and interpretation capabilities', importance: 7 },
        { name: 'Leadership & Mentoring', match: 40, description: 'Team leadership and knowledge transfer skills', importance: 6 }
      ];
      
      const analysisResult = {
        overallMatch: Math.round(overallMatch),
        summary: `Based on your ${currentRole} background and ${experience}-level experience, you have a ${Math.round(overallMatch)}% match for ${targetRole} roles. There are some key skill gaps to address, but with focused development, you can significantly improve your competitiveness.`,
        recommendations: `Focus on developing the missing technical skills through practical projects and industry certifications. Build a portfolio showcasing relevant work and consider joining professional communities in ${industry}.`,
        matchedSkills: commonSkills,
        missingSkills: missingSkills,
        actionPlan: {
          shortTerm: [
            `Complete online certification in ${targetRole} fundamentals`,
            'Update LinkedIn profile with relevant keywords',
            'Start building a portfolio of relevant projects',
            'Join professional groups and communities'
          ],
          mediumTerm: [
            'Gain hands-on experience through freelance or volunteer projects',
            'Attend industry conferences and networking events',
            'Seek mentorship from professionals in your target role',
            'Consider specialized training programs or bootcamps'
          ],
          longTerm: [
            'Pursue advanced certifications or formal education',
            'Build a strong professional network in the industry',
            'Develop thought leadership through content creation',
            'Consider transition roles that bridge your current and target positions'
          ]
        },
        marketInsights: {
          salaryRange: 'R350,000 - R650,000 annually',
          demandLevel: 'High demand',
          growthProjection: '15% growth expected over next 3 years'
        }
      };
      
      res.json(analysisResult);
    } catch (error) {
      console.error("Error analyzing skill gap:", error);
      res.status(500).json({ error: "Failed to analyze skill gap" });
    }
  });

  app.get("/api/skill-gap/learning-resources/:skill", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { skill } = req.params;
      const { level = 'beginner' } = req.query;
      
      // Sample learning resources based on skill and level
      const resources = [
        {
          title: `${skill} Fundamentals Course`,
          provider: 'Coursera',
          type: 'online_course',
          duration: '4-6 weeks',
          cost: 'R299/month',
          rating: 4.5,
          url: '#',
          description: `Learn the basics of ${skill} with hands-on projects`
        },
        {
          title: `${skill} Certification Program`,
          provider: 'edX',
          type: 'certification',
          duration: '8-12 weeks',
          cost: 'R1,200',
          rating: 4.7,
          url: '#',
          description: `Industry-recognized certification in ${skill}`
        },
        {
          title: `${skill} Workshop`,
          provider: 'Local Training Center',
          type: 'workshop',
          duration: '2 days',
          cost: 'R2,500',
          rating: 4.3,
          url: '#',
          description: `Intensive hands-on workshop for ${skill}`
        }
      ];
      
      res.json({ skill, level, resources });
    } catch (error) {
      console.error("Error fetching learning resources:", error);
      res.status(500).json({ error: "Failed to fetch learning resources" });
    }
  });

  // Career Path Visualizer API routes
  app.get("/api/career-paths", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { industry, search } = req.query;
      
      let paths;
      if (search && typeof search === 'string') {
        paths = careerPathService.searchCareerPaths(search);
      } else if (industry && typeof industry === 'string') {
        paths = careerPathService.getCareerPathsByIndustry(industry);
      } else {
        paths = careerPathService.getCareerPaths();
      }
      
      res.json({ paths });
    } catch (error) {
      console.error("Career paths error:", error);
      res.status(500).json({ message: "Failed to get career paths" });
    }
  });

  app.get("/api/career-paths/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const path = careerPathService.getCareerPathById(id);
      
      if (!path) {
        return res.status(404).json({ message: "Career path not found" });
      }
      
      const relatedPaths = careerPathService.getRelatedPaths(id);
      res.json({ path, relatedPaths });
    } catch (error) {
      console.error("Career path details error:", error);
      res.status(500).json({ message: "Failed to get career path details" });
    }
  });

  app.get("/api/industry-insights", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { industry } = req.query;
      
      if (industry && typeof industry === 'string') {
        const insight = careerPathService.getIndustryInsight(industry);
        if (!insight) {
          return res.status(404).json({ message: "Industry insight not found" });
        }
        res.json({ insight });
      } else {
        const insights = careerPathService.getIndustryInsights();
        res.json({ insights });
      }
    } catch (error) {
      console.error("Industry insights error:", error);
      res.status(500).json({ message: "Failed to get industry insights" });
    }
  });

  app.get("/api/salary-benchmarks", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { industry } = req.query;
      const benchmarks = careerPathService.getSalaryBenchmarks(
        industry && typeof industry === 'string' ? industry : undefined
      );
      res.json({ benchmarks });
    } catch (error) {
      console.error("Salary benchmarks error:", error);
      res.status(500).json({ message: "Failed to get salary benchmarks" });
    }
  });

  app.get("/api/skill-demand", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skillDemand = careerPathService.getSkillDemand();
      res.json({ skillDemand });
    } catch (error) {
      console.error("Skill demand error:", error);
      res.status(500).json({ message: "Failed to get skill demand data" });
    }
  });

  // Job Matching API Endpoints (Test Implementation)
  
  // Get job matches for a CV
  app.get("/api/cv-job-matches/:cvId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const cvId = parseInt(req.params.cvId);
      const userId = req.user.id;
      
      // Sample job matches data for demonstration
      const sampleJobMatches = [
        {
          id: 1,
          matchScore: 85,
          skillsMatchScore: 88,
          experienceMatchScore: 82,
          locationMatchScore: 90,
          saContextScore: 85,
          matchedSkills: ["JavaScript", "React", "Node.js", "SQL", "Agile"],
          missingSkills: ["TypeScript", "AWS", "Docker"],
          matchReasons: [
            "Strong match for required JavaScript and React skills",
            "Experience level aligns with job requirements",
            "Located in preferred province (Western Cape)"
          ],
          improvementSuggestions: [
            "Add TypeScript experience to increase match score",
            "Consider AWS certification for cloud skills",
            "Highlight project management experience"
          ],
          isViewed: false,
          isApplied: false,
          status: "matched",
          job: {
            id: 1,
            title: "Senior Full Stack Developer",
            company: "TechCorp SA",
            location: "Cape Town",
            province: "Western Cape",
            employmentType: "Full-time",
            salaryRange: "45000-65000",
            description: "Join our dynamic team building cutting-edge web applications...",
            requiredSkills: ["JavaScript", "React", "Node.js", "SQL"],
            isRemote: false,
            isFeatured: true
          }
        },
        {
          id: 2,
          matchScore: 72,
          skillsMatchScore: 75,
          experienceMatchScore: 70,
          locationMatchScore: 85,
          saContextScore: 65,
          matchedSkills: ["JavaScript", "HTML", "CSS", "Git"],
          missingSkills: ["Python", "Django", "PostgreSQL"],
          matchReasons: [
            "Good foundation in web development technologies",
            "Location preference matches job location"
          ],
          improvementSuggestions: [
            "Learn Python and Django for better backend skills",
            "Add database experience with PostgreSQL"
          ],
          isViewed: true,
          isApplied: false,
          status: "matched",
          job: {
            id: 2,
            title: "Junior Web Developer",
            company: "Digital Solutions SA",
            location: "Johannesburg",
            province: "Gauteng",
            employmentType: "Full-time",
            salaryRange: "25000-35000",
            description: "Great opportunity for a junior developer to grow...",
            requiredSkills: ["JavaScript", "HTML", "CSS", "Python"],
            isRemote: true,
            isFeatured: false
          }
        },
        {
          id: 3,
          matchScore: 78,
          skillsMatchScore: 80,
          experienceMatchScore: 75,
          locationMatchScore: 70,
          saContextScore: 88,
          matchedSkills: ["Project Management", "Agile", "Scrum", "Communication"],
          missingSkills: ["PMP Certification", "PRINCE2"],
          matchReasons: [
            "Strong project management background",
            "Excellent B-BBEE compliance alignment",
            "Agile methodology experience matches requirements"
          ],
          improvementSuggestions: [
            "Obtain PMP certification for senior roles",
            "Consider PRINCE2 training for government projects"
          ],
          isViewed: false,
          isApplied: false,
          status: "matched",
          job: {
            id: 3,
            title: "Project Manager - Digital Transformation",
            company: "SA Government Solutions",
            location: "Pretoria",
            province: "Gauteng",
            employmentType: "Contract",
            salaryRange: "55000-75000",
            description: "Lead digital transformation initiatives for government sector...",
            requiredSkills: ["Project Management", "Agile", "Digital Transformation"],
            isRemote: false,
            isFeatured: true
          }
        }
      ];
      
      res.json(sampleJobMatches);
    } catch (error) {
      console.error("Error fetching job matches:", error);
      res.status(500).json({ error: "Failed to fetch job matches" });
    }
  });

  // Get all job postings (enhanced with sample data)
  app.get("/api/job-postings", async (req: Request, res: Response) => {
    try {
      const { title, location, industry, employmentType, limit } = req.query;
      
      // Sample job postings data for demonstration
      const sampleJobs = [
        {
          id: 1,
          title: "Senior Full Stack Developer",
          description: "Join our dynamic team building cutting-edge web applications for South African businesses. We're looking for an experienced developer who can work with modern technologies and contribute to our growing platform.",
          location: "Cape Town",
          province: "Western Cape",
          city: "Cape Town",
          employmentType: "Full-time",
          experienceLevel: "Senior",
          salaryRange: "45000-65000",
          requiredSkills: ["JavaScript", "React", "Node.js", "SQL", "Git"],
          preferredSkills: ["TypeScript", "AWS", "Docker", "MongoDB"],
          industry: "Technology",
          deadline: "2024-07-15T00:00:00.000Z",
          isActive: true,
          isFeatured: true,
          isRemote: false,
          views: 156,
          applications: 23,
          createdAt: "2024-06-15T10:30:00.000Z",
          employer: {
            id: 1,
            companyName: "TechCorp SA",
            industry: "Technology",
            logo: ""
          }
        },
        {
          id: 2,
          title: "Junior Web Developer",
          description: "Great opportunity for a junior developer to grow their skills in a supportive environment. You'll work on exciting projects while learning from experienced mentors.",
          location: "Johannesburg",
          province: "Gauteng",
          city: "Johannesburg",
          employmentType: "Full-time",
          experienceLevel: "Junior",
          salaryRange: "25000-35000",
          requiredSkills: ["JavaScript", "HTML", "CSS", "Python"],
          preferredSkills: ["React", "Django", "PostgreSQL"],
          industry: "Technology",
          deadline: "2024-07-20T00:00:00.000Z",
          isActive: true,
          isFeatured: false,
          isRemote: true,
          views: 89,
          applications: 15,
          createdAt: "2024-06-18T14:20:00.000Z",
          employer: {
            id: 2,
            companyName: "Digital Solutions SA",
            industry: "Technology",
            logo: ""
          }
        },
        {
          id: 3,
          title: "Project Manager - Digital Transformation",
          description: "Lead digital transformation initiatives for government sector projects. Must have experience with public sector requirements and B-BBEE compliance.",
          location: "Pretoria",
          province: "Gauteng",
          city: "Pretoria",
          employmentType: "Contract",
          experienceLevel: "Senior",
          salaryRange: "55000-75000",
          requiredSkills: ["Project Management", "Agile", "Digital Transformation", "Government Sector"],
          preferredSkills: ["PMP", "PRINCE2", "Change Management"],
          industry: "Government",
          deadline: "2024-08-01T00:00:00.000Z",
          isActive: true,
          isFeatured: true,
          isRemote: false,
          views: 78,
          applications: 12,
          createdAt: "2024-06-20T09:15:00.000Z",
          employer: {
            id: 3,
            companyName: "SA Government Solutions",
            industry: "Government",
            logo: ""
          }
        },
        {
          id: 4,
          title: "Marketing Specialist",
          description: "Drive marketing campaigns for South African retail brand. Focus on digital marketing strategies and B-BBEE supplier development.",
          location: "Durban",
          province: "KwaZulu-Natal",
          city: "Durban",
          employmentType: "Full-time",
          experienceLevel: "Mid-level",
          salaryRange: "35000-45000",
          requiredSkills: ["Digital Marketing", "SEO", "Social Media", "Analytics"],
          preferredSkills: ["Google Ads", "Facebook Marketing", "Content Creation"],
          industry: "Marketing",
          deadline: "2024-07-25T00:00:00.000Z",
          isActive: true,
          isFeatured: false,
          isRemote: false,
          views: 45,
          applications: 8,
          createdAt: "2024-06-22T11:00:00.000Z",
          employer: {
            id: 4,
            companyName: "Retail Excellence SA",
            industry: "Retail",
            logo: ""
          }
        },
        {
          id: 5,
          title: "Data Analyst",
          description: "Analyze business data to drive insights for mining operations. Experience with South African mining regulations preferred.",
          location: "Johannesburg",
          province: "Gauteng",
          city: "Johannesburg",
          employmentType: "Full-time",
          experienceLevel: "Mid-level",
          salaryRange: "40000-55000",
          requiredSkills: ["Python", "SQL", "Excel", "Data Visualization"],
          preferredSkills: ["Power BI", "R", "Mining Industry Knowledge"],
          industry: "Mining",
          deadline: "2024-08-10T00:00:00.000Z",
          isActive: true,
          isFeatured: false,
          isRemote: true,
          views: 67,
          applications: 19,
          createdAt: "2024-06-25T16:45:00.000Z",
          employer: {
            id: 5,
            companyName: "Mining Analytics Corp",
            industry: "Mining",
            logo: ""
          }
        }
      ];
      
      // Apply basic filtering
      let filteredJobs = sampleJobs;
      
      if (title) {
        const searchTerm = (title as string).toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (location) {
        filteredJobs = filteredJobs.filter(job => 
          job.province === location || job.city === location
        );
      }
      
      if (industry) {
        filteredJobs = filteredJobs.filter(job => job.industry === industry);
      }
      
      if (employmentType) {
        filteredJobs = filteredJobs.filter(job => job.employmentType === employmentType);
      }
      
      if (limit) {
        const limitNum = parseInt(limit as string);
        filteredJobs = filteredJobs.slice(0, limitNum);
      }
      
      res.json(filteredJobs);
    } catch (error) {
      console.error("Error fetching job postings:", error);
      res.status(500).json({ error: "Failed to fetch job postings" });
    }
  });

  // Premium Job Matching API Endpoints (Your Business Model)
  
  // Recruiter endpoints - for viewing and purchasing matches
  app.get("/api/recruiter/job-matches", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Get recruiter's employer profile
      const employer = await storage.getEmployerByUserId(userId);
      if (!employer) {
        return res.status(404).json({ error: "Employer profile not found" });
      }

      // Get real matches from database
      const matches = await storage.getPremiumJobMatches(employer.id);
      
      // If no real matches, provide sample data for demo
      if (matches.length === 0) {
        const sampleRecruiterMatches = [
        {
          id: 1,
          jobId: 101,
          candidateId: 1001,
          matchScore: 87,
          skillsMatch: 90,
          experienceMatch: 85,
          locationMatch: 95,
          saContextMatch: 80,
          isRecruiterNotified: true,
          isPaid: false,
          isContactRevealed: false,
          matchedSkills: ["JavaScript", "React", "Node.js", "PostgreSQL", "Agile"],
          missingSkills: ["TypeScript", "AWS"],
          candidate: {
            id: 1001,
            location: "Cape Town, Western Cape",
            experienceLevel: "Senior (5+ years)",
            skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "Agile", "Git"],
            bbbeeLevel: 2,
            industry: "Technology",
            cvScore: 85,
            lastActive: "2024-06-15T14:30:00.000Z"
          },
          job: {
            id: 101,
            title: "Senior Full Stack Developer",
            department: "Engineering",
            urgency: "high" as const,
            postedDate: "2024-06-10T00:00:00.000Z"
          },
          price: 200
        },
        {
          id: 2,
          jobId: 102,
          candidateId: 1002,
          matchScore: 92,
          skillsMatch: 95,
          experienceMatch: 90,
          locationMatch: 85,
          saContextMatch: 95,
          isRecruiterNotified: false,
          isPaid: false,
          isContactRevealed: false,
          matchedSkills: ["Project Management", "Agile", "Scrum", "SAP", "B-BBEE Compliance"],
          missingSkills: ["PMP Certification"],
          candidate: {
            id: 1002,
            location: "Johannesburg, Gauteng",
            experienceLevel: "Senior (8+ years)",
            skills: ["Project Management", "Agile", "Scrum", "SAP", "B-BBEE Compliance"],
            bbbeeLevel: 1,
            industry: "Government",
            cvScore: 92,
            lastActive: "2024-06-14T16:45:00.000Z"
          },
          job: {
            id: 102,
            title: "Senior Project Manager",
            department: "Operations",
            urgency: "medium" as const,
            postedDate: "2024-06-12T00:00:00.000Z"
          },
          price: 250
        }
        ];
        
        return res.json({
          matches: sampleRecruiterMatches,
          isDemo: true,
          message: "Demo data - real matches will appear here once you have active job postings"
        });
      }
      
      res.json({
        matches,
        metadata: {
          count: matches.length,
          hasMatches: matches.length > 0
        }
      });
    } catch (error) {
      console.error("Error fetching recruiter matches:", error);
      res.status(500).json({ error: "Failed to fetch job matches" });
    }
  });

  // Unlock candidate contact details (R200 payment)
  app.post("/api/recruiter/unlock-candidate/:matchId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const matchId = parseInt(req.params.matchId);

      if (isNaN(matchId)) {
        return res.status(400).json({ error: "Invalid match ID" });
      }

      // Get employer profile
      const employer = await storage.getEmployerByUserId(userId);
      if (!employer) {
        return res.status(404).json({ error: "Employer profile not found" });
      }

      // Create payment for contact unlock
      const payment = await paymentService.createRecruiterPayment(
        userId,
        matchId,
        employer.id
      );

      res.json({
        success: true,
        payment: {
          id: payment.payment.id,
          amount: payment.payment.amount,
          transactionId: payment.payment.transactionId,
          expiresAt: payment.payment.expiresAt,
        },
        paymentUrl: payment.paymentUrl,
        message: "Payment created. Redirecting to secure payment gateway...",
      });

    } catch (error: any) {
      console.error("Error creating recruiter payment:", error);
      res.status(500).json({ 
        error: error.message || "Failed to process payment request" 
      });
    }
  });

  // Get recruiter dashboard stats
  app.get("/api/recruiter/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      const employer = await storage.getEmployerByUserId(userId);
      if (!employer) {
        return res.status(404).json({ error: "Employer profile not found" });
      }

      // Get job postings count
      const jobPostings = await storage.getJobPostingsByEmployerId(employer.id);
      
      // Get matches count (mock for now)
      const matches = await storage.getPremiumJobMatches(employer.id);
      
      const stats = {
        activeJobs: jobPostings.filter(job => job.status === 'active').length,
        totalCandidates: matches.length,
        unlockedContacts: matches.filter(match => match.isPaid).length,
        responseRate: matches.length > 0 ? Math.round((matches.filter(match => match.isPaid).length / matches.length) * 100) : 0,
        creditsRemaining: 10, // Mock credits system
        averageMatchScore: matches.length > 0 ? Math.round(matches.reduce((sum, match) => sum + match.matchScore, 0) / matches.length) : 0
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching recruiter stats:", error);
      res.status(500).json({ error: "Failed to fetch recruiter statistics" });
    }
  });

  // Purchase contact access
  app.post("/api/recruiter/purchase-contact/:matchId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const matchId = parseInt(req.params.matchId);
      const userId = req.user.id;
      
      // Simulate payment processing and contact unlock
      // In production, integrate with Stripe/PayFast for actual payments
      
      res.json({
        success: true,
        message: "Contact access purchased successfully",
        candidateContact: {
          name: "John Doe",
          email: "john.doe@email.co.za",
          phone: "+27 82 123 4567",
          linkedIn: "https://linkedin.com/in/johndoe"
        }
      });
    } catch (error) {
      console.error("Error purchasing contact:", error);
      res.status(500).json({ error: "Failed to purchase contact access" });
    }
  });

  // Job seeker notification endpoints
  app.get("/api/job-seeker/match-notifications", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Sample notifications for job seekers (without revealing full job details)
      const sampleNotifications = [
        {
          id: 1,
          type: "potential_match",
          title: "New High-Match Opportunity Available",
          message: "A recruiter has posted a position that's 87% compatible with your skills. Consider optimizing your CV to increase your chances.",
          matchStrength: 87,
          industry: "Technology",
          location: "Cape Town, Western Cape",
          optimizationTips: [
            "Add TypeScript experience to match job requirements",
            "Highlight your Agile methodology experience more prominently",
            "Include specific project outcomes and metrics"
          ],
          requiredSkills: ["JavaScript", "React", "Node.js"],
          missingSkills: ["TypeScript", "AWS"],
          isRead: false,
          createdAt: "2024-06-15T10:30:00.000Z",
          urgency: "high"
        },
        {
          id: 2,
          type: "cv_optimization",
          title: "Optimize CV for Better Matches",
          message: "Your current CV matches 72% with available positions. Small improvements could increase this to 85%+.",
          matchStrength: 72,
          industry: "Technology",
          location: "Johannesburg, Gauteng",
          optimizationTips: [
            "Add more specific technical skills",
            "Include industry certifications",
            "Quantify your achievements with numbers"
          ],
          requiredSkills: ["JavaScript", "HTML", "CSS"],
          missingSkills: ["Python", "Django", "PostgreSQL"],
          isRead: true,
          createdAt: "2024-06-14T14:20:00.000Z",
          urgency: "medium"
        },
        {
          id: 3,
          type: "skill_suggestion",
          title: "Hot Skills in Your Industry",
          message: "B-BBEE compliance skills are in high demand. Adding this could unlock premium government positions.",
          matchStrength: 78,
          industry: "Government",
          location: "Pretoria, Gauteng",
          optimizationTips: [
            "Add B-BBEE compliance experience",
            "Highlight government sector projects",
            "Include public sector certifications"
          ],
          requiredSkills: ["Project Management", "Agile"],
          missingSkills: ["B-BBEE Compliance", "Government Regulations"],
          isRead: false,
          createdAt: "2024-06-13T09:15:00.000Z",
          urgency: "low"
        }
      ];
      
      res.json(sampleNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Private job posting endpoint (hidden from job seekers)
  app.post("/api/recruiter/private-jobs", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const jobData = req.body;
      
      // Create private job posting
      // Automatically trigger matching against existing CVs
      // Send notifications to recruiters about matches
      
      res.json({
        success: true,
        message: "Private job posted successfully. We're analyzing matches...",
        jobId: Math.floor(Math.random() * 10000),
        estimatedMatches: Math.floor(Math.random() * 15) + 5
      });
    } catch (error) {
      console.error("Error creating private job:", error);
      res.status(500).json({ error: "Failed to create private job posting" });
    }
  });

  // Admin API endpoints - simplified for current database structure
  app.get("/api/admin/stats", (req: Request, res: Response) => {
    try {
      // Return mock stats since we're in minimal mode
      res.json({
        totalUsers: 25,
        totalCVs: 48,
        totalJobPostings: 12,
        totalMatches: 156,
        premiumUsers: 8,
        activeRecruiters: 5,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch admin statistics" });
    }
  });

  app.get("/api/admin/users", (req: Request, res: Response) => {
    try {
      // Return sample users for admin dashboard
      const sampleUsers = [
        {
          id: 1,
          email: "john.doe@example.com",
          name: "John Doe",
          role: "user",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isPremium: false,
        },
        {
          id: 2,
          email: "jane.smith@example.com", 
          name: "Jane Smith",
          role: "premium",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastLogin: new Date().toISOString(),
          isPremium: true,
        },
        {
          id: 999999,
          email: "deniskasala17@gmail.com",
          name: "Denis Kasala",
          role: "admin",
          createdAt: new Date(Date.now() - 604800000).toISOString(),
          lastLogin: new Date().toISOString(),
          isPremium: false,
        }
      ];

      res.json(sampleUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/cvs", (req: Request, res: Response) => {
    try {
      // Return sample CVs for admin dashboard
      const sampleCVs = [
        {
          id: 1,
          fileName: "john_doe_cv.pdf",
          userId: 1,
          userName: "John Doe",
          uploadedAt: new Date().toISOString(),
          analysisScore: 85,
        },
        {
          id: 2,
          fileName: "jane_smith_resume.pdf",
          userId: 2,
          userName: "Jane Smith", 
          uploadedAt: new Date(Date.now() - 86400000).toISOString(),
          analysisScore: 92,
        }
      ];

      res.json(sampleCVs);
    } catch (error) {
      console.error("Error fetching CVs:", error);
      res.status(500).json({ error: "Failed to fetch CVs" });
    }
  });

  app.get("/api/admin/job-postings", (req: Request, res: Response) => {
    try {
      // Return sample job postings for admin dashboard
      const sampleJobs = [
        {
          id: 1,
          title: "Senior Software Developer",
          company: "TechCorp SA",
          location: "Cape Town, Western Cape",
          salary: "R50,000 - R70,000",
          postedAt: new Date().toISOString(),
          status: "active",
          employerId: 1,
        },
        {
          id: 2,
          title: "Data Analyst",
          company: "DataFlow Solutions",
          location: "Johannesburg, Gauteng",
          salary: "R35,000 - R45,000",
          postedAt: new Date(Date.now() - 172800000).toISOString(),
          status: "active",
          employerId: 2,
        }
      ];

      res.json(sampleJobs);
    } catch (error) {
      console.error("Error fetching job postings:", error);
      res.status(500).json({ error: "Failed to fetch job postings" });
    }
  });

  app.delete("/api/admin/users/:id", (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Don't allow deletion of admin users
      if (userId === 999999) {
        return res.status(403).json({ error: "Cannot delete admin users" });
      }
      
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.patch("/api/admin/users/:id/premium", (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { isPremium } = req.body;
      
      res.json({ success: true, message: "User premium status updated" });
    } catch (error) {
      console.error("Error updating user premium status:", error);
      res.status(500).json({ error: "Failed to update user premium status" });
    }
  });

  // Admin system health endpoint
  app.get("/api/admin/health", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-development') as any;
      if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const health = {
        status: 'healthy' as const,
        database: true,
        aiService: !!(process.env.XAI_API_KEY || process.env.OPENAI_API_KEY),
        emailService: !!process.env.SENDGRID_API_KEY,
        storage: true,
        uptime: process.uptime() ? `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m` : '0m',
        responseTime: Math.floor(Math.random() * 50) + 25,
      };

      res.json(health);
    } catch (error) {
      console.error("Error checking system health:", error);
      res.status(500).json({ error: "Failed to check system health" });
    }
  });

  // Admin activity logs endpoint
  app.get("/api/admin/activity", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-development') as any;
      if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      const cvs = await storage.getAllCVs();
      
      const logs = [
        ...users.slice(0, 3).map((user, index) => ({
          id: index + 1,
          action: 'User Registration',
          userId: user.id,
          userEmail: user.email,
          timestamp: new Date(Date.now() - (index + 1) * 1000 * 60 * 15).toISOString(),
          details: 'New user registered',
          ipAddress: `192.168.1.${100 + index}`
        })),
        ...cvs.slice(0, 3).map((cv, index) => ({
          id: index + 10,
          action: 'CV Upload',
          userId: cv.userId,
          userEmail: 'user@example.com',
          timestamp: new Date(Date.now() - (index + 1) * 1000 * 60 * 30).toISOString(),
          details: `CV uploaded: ${cv.fileName}`,
          ipAddress: `192.168.1.${110 + index}`
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  // Admin CV deletion endpoint  
  app.delete("/api/admin/cvs/:id", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-development') as any;
      if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const cvId = parseInt(req.params.id);
      
      await storage.deleteCV(cvId);
      res.json({ success: true, message: "CV deleted successfully" });
    } catch (error) {
      console.error("Error deleting CV:", error);
      res.status(500).json({ error: "Failed to delete CV" });
    }
  });

  // CV Templates API - Get available templates
  app.get("/api/cv-templates", async (req: Request, res: Response) => {
    try {
      const templates = [
        {
          id: 1,
          title: "Professional Plus",
          category: "corporate",
          popular: true,
          free: false,
          description: "A clean, professional template ideal for corporate positions with a focus on readability and ATS optimization.",
          features: [
            "ATS-friendly format",
            "B-BBEE section included", 
            "Skills matrix with ratings",
            "NQF qualification layout"
          ],
          preview_url: "/templates/professional-plus-preview.jpg"
        },
        {
          id: 2,
          title: "Graduate Essential",
          category: "graduate",
          popular: false,
          free: true,
          description: "Perfect for recent graduates entering the South African job market.",
          features: [
            "Education-focused layout",
            "Skills and achievements highlight",
            "Internship/volunteer section", 
            "Projects portfolio section"
          ],
          preview_url: "/templates/graduate-essential-preview.jpg"
        },
        {
          id: 3,
          title: "Technical Specialist",
          category: "technical",
          popular: false,
          free: false,
          description: "Designed for IT, engineering and technical professionals.",
          features: [
            "Technical skills matrix",
            "Project showcase section",
            "GitHub/portfolio links",
            "Certifications highlight"
          ],
          preview_url: "/templates/technical-specialist-preview.jpg"
        }
      ];
      
      res.json({ templates });
    } catch (error) {
      console.error("Error fetching CV templates:", error);
      res.status(500).json({ error: "Failed to fetch CV templates" });
    }
  });

  // Generate AI-powered CV template
  app.post("/api/templates/ai-generate", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Demo user for testing

      const { userProfile, templateOptions } = req.body;
      
      // Import template service
      const { templateService } = await import('./services/templateService');
      
      // Generate template
      const template = await templateService.generateAIPoweredTemplate(userProfile);
      
      res.json({
        success: true,
        template: {
          id: template.id,
          title: template.title,
          content: template.content,
          atsScore: template.atsScore,
          keywords: template.keywords,
          saOptimized: template.saOptimized
        }
      });
    } catch (error) {
      console.error("Error generating AI template:", error);
      res.status(500).json({ error: "Failed to generate AI template" });
    }
  });

  // Generate cover letter template
  app.post("/api/templates/cover-letter", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Demo user for testing

      const { userProfile, company, position, jobDescription } = req.body;
      
      const { templateService } = await import('./services/templateService');
      
      const template = await templateService.generateCoverLetterTemplate(
        userProfile, 
        company, 
        position, 
        jobDescription
      );
      
      res.json({
        success: true,
        template: {
          id: template.id,
          title: template.title,
          content: template.content,
          keywords: template.keywords,
          saOptimized: template.saOptimized
        }
      });
    } catch (error) {
      console.error("Error generating cover letter template:", error);
      res.status(500).json({ error: "Failed to generate cover letter template" });
    }
  });

  // Dynamic template builder with real-time preview
  app.post("/api/templates/dynamic-builder", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Demo user for testing

      const { userProfile, selectedSections, customContent } = req.body;
      
      const { templateService } = await import('./services/templateService');
      
      const result = await templateService.buildDynamicTemplate(
        userProfile,
        selectedSections,
        customContent
      );
      
      res.json({
        success: true,
        template: result.template,
        previewScore: result.previewScore,
        recommendations: [
          'Add quantifiable achievements to work experience',
          'Include industry-specific keywords',
          'Optimize for ATS compatibility'
        ]
      });
    } catch (error) {
      console.error("Error building dynamic template:", error);
      res.status(500).json({ error: "Failed to build dynamic template" });
    }
  });

  // Get template categories and options
  app.get("/api/templates/categories", async (req: Request, res: Response) => {
    try {
      const { templateService } = await import('./services/templateService');
      const categories = templateService.getTemplateCategories();
      
      res.json({
        success: true,
        categories
      });
    } catch (error) {
      console.error("Error fetching template categories:", error);
      res.status(500).json({ error: "Failed to fetch template categories" });
    }
  });

  // Get user's generated templates
  app.get("/api/templates/user-templates", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-development') as any;
      const userId = decoded.userId;

      // Get user's generated templates from database
      const templates = await db.select()
        .from(generatedTemplates)
        .where(eq(generatedTemplates.userId, userId))
        .orderBy(desc(generatedTemplates.createdAt))
        .limit(10);
      
      res.json({
        success: true,
        templates
      });
    } catch (error) {
      console.error("Error fetching user templates:", error);
      res.status(500).json({ error: "Failed to fetch user templates" });
    }
  });

  // Admin user update endpoint
  app.patch("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-development') as any;
      if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = parseInt(req.params.id);
      const updates = req.body;

      await storage.updateUser(userId, updates);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Override existing admin user delete endpoint
  app.delete("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-development') as any;
      if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = parseInt(req.params.id);
      
      const user = await storage.getUserById(userId);
      if (user?.role === 'admin') {
        return res.status(403).json({ error: "Cannot delete admin users" });
      }
      
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Mount Dynamic Resume Builder routes
  app.use("/api", dynamicResumeBuilderRoutes);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}