import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { extractTextFromPDF } from "./services/simplePdfParser";
import { extractTextFromDOCX } from "./services/docxParser";
import { performDeepAnalysis } from "./services/atsScoring";
import { localAIService } from "./services/localAI";
import { analyzeCV as analyzeResume } from "./services/simpleAtsAnalysis";
import { analyzeCVContent, formatAnalysisForResponse } from "./services/atsAnalysisService";
import { generateQuizQuestions } from "./services/quizGeneratorService";
import { 
  insertUserSchema, 
  insertCvSchema, 
  insertAtsScoreSchema, 
  insertDeepAnalysisReportSchema,

  saProfiles,
  users,
  cvs,

  skills,
  subscriptions,
  plans,
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { authenticateAdmin, generateAdminToken, requireAdmin, initializeAdmin } from "./adminAuth";
import { verifyToken, hashPassword, authenticateUser, generateToken } from "./auth";
import { simpleAuth, authenticateToken } from "./simpleAuth";
import jwt from "jsonwebtoken";
import { payfastService } from "./services/payfastService";
import { whatsappService } from "./services/whatsappService";
import { jobBoardService } from "./services/jobBoardService";
import { interviewSimulationService } from "./services/interviewSimulationService";
import { jobMatchingService } from "./services/jobMatchingService";
import { skillGapAnalyzerService } from "./services/skillGapAnalyzerService";
import * as employerStorage from "./employerStorage";
import adminRoutes from "./routes/admin";
import testXaiApiRoutes from "./routes/testXaiApi";
import mockCvAnalysisRoutes from "./routes/mockCvAnalysis";
import jobMatchingDemoRoutes from "./routes/jobMatchingDemo";
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
});

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = verifyToken(token);
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
      const decoded = verifyToken(token);
      if (decoded && decoded.role === "admin") {
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
    const subscription = await storage.getActiveSubscription(userId);
    
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

  // User Authentication Routes - Simple Implementation
  app.post("/api/auth/signup", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, username } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user already exists
      const existingUser = await simpleAuth.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Create user using simplified auth system
      const result = await simpleAuth.createUser({
        username: username || email.split('@')[0],
        email,
        password,
        name: name || ''
      });
      
      const newUser = result.user;
      const verificationToken = result.verificationToken;
      
      // Store user in session
      (req as any).session.userId = newUser.id;
      (req as any).session.user = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role
      };

      // Send verification email
      await simpleAuth.sendVerificationEmail(newUser.email, verificationToken);

      res.status(201).json({ 
        message: "User created successfully. Please check your email to verify your account.",
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role,
          emailVerified: newUser.emailVerified
        }
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
      const user = await simpleAuth.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await simpleAuth.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
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

      const verified = await simpleAuth.verifyEmailToken(token);
      if (verified) {
        res.redirect("/?verified=true");
      } else {
        res.redirect("/?verified=false");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      res.redirect("/?verified=false");
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
      const user = await simpleAuth.getUserByEmail(sessionUser.email);
      
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
  app.get("/api/admin/stats", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
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
        
        // Mock premium and revenue data
        stats.premiumUsers = Math.floor(users.length * 0.15);
        stats.monthlyRevenue = stats.premiumUsers * 99;
        stats.totalRevenue = stats.monthlyRevenue * 6;
      } catch (error) {
        console.log("Using mock stats due to storage error:", error.message);
      }

      res.json(stats);
    } catch (error) {
      next(error);
    }
  });
  
  // Health check endpoints
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
  
  // Employer Routes
  
  // Get current user's employer profile
  app.get("/api/employers/me", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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
      
      // Create base query for job postings
      let baseQuery = db.select({
        job: jobPostings,
        employer: employers
      })
      .from(jobPostings)
      .innerJoin(employers, eq(jobPostings.employerId, employers.id))
      .where(eq(jobPostings.isActive, true));
      
      // Apply South African specific filters
      if (province) {
        baseQuery = baseQuery.where(eq(employers.location, province as string));
      }
      
      if (bbbeeLevel) {
        baseQuery = baseQuery.where(eq(employers.bbbeeLevel, bbbeeLevel as string));
      }
      
      if (industry) {
        baseQuery = baseQuery.where(eq(jobPostings.industry, industry as string));
      }
      
      if (jobType) {
        baseQuery = baseQuery.where(eq(jobPostings.employmentType, jobType as string));
      }
      
      // Prepare skills filter
      if (skills) {
        const skillsList = (skills as string).split(',');
        
        // For each skill, check if it's in the required skills array
        skillsList.forEach(skill => {
          // Using SQL like to check array contents (simple approach)
          baseQuery = baseQuery.where(
            sql`${jobPostings.requiredSkills}::text LIKE ${'%' + skill.trim() + '%'}`
          );
        });
      }
      
      // Apply pagination
      if (limit) {
        baseQuery = baseQuery.limit(parseInt(limit as string));
      } else {
        baseQuery = baseQuery.limit(20); // Default limit
      }
      
      if (offset) {
        baseQuery = baseQuery.offset(parseInt(offset as string));
      }
      
      // Order by newest first
      baseQuery = baseQuery.orderBy(desc(jobPostings.createdAt));
      
      // Execute query
      const results = await baseQuery;
      
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
      if (isNaN(cvId)) {
        return res.status(400).json({ error: "Invalid CV ID" });
      }
      
      // Get CV
      const cv = await storage.getCV(cvId);
      
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
      const userId = req.user.id;
      
      if (!cvId || !jobId) {
        return res.status(400).json({ error: "CV ID and Job ID are required" });
      }
      
      // Get CV
      const cv = await storage.getCV(cvId);
      
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
      const matchedSkills = [];
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
        jobId,
        userId,
        matchScore: analysisResult.overallScore || 0,
        skillsMatched: analysisResult.matchedSkills || []
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
      const recommendations = await saJobMatchingService.getPersonalizedJobRecommendations(
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
      const template = saJobMatchingService.getIndustrySearchTemplate(industry);
      
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
      const cvs = await storage.getCVsByUser(userId);
      res.json(cvs);
    } catch (error) {
      next(error);
    }
  });
  
  // CV Upload endpoint - supports both authenticated and guest users
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
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
        const decoded = simpleAuth.verifyToken(token);
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
      const cv = await storage.createCV(cvData);
      
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
        const atsScore = await storage.createATSScore({
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
      const cv = await storage.getLatestCVByUser(userId);
      
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
      
      const cv = await storage.getCV(cvId);
      
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
      
      const cv = await storage.getCV(cvId);
      
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
  
  // Mock CV analysis routes for demonstration
  app.use("/api", mockCvAnalysisRoutes);
  
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
      
      const user = await storage.getUser(req.user.id);
      
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
      const saProfile = await storage.getSaProfileByUserId(user.id);
      if (saProfile) {
        await storage.updateSaProfile(saProfile.id, {
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
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if the user has a South African profile
      const saProfile = await storage.getSaProfileByUserId(user.id);
      
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
      
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if the user has a South African profile
      const saProfile = await storage.getSaProfileByUserId(user.id);
      
      if (saProfile) {
        // Update the SA profile with the new settings
        await storage.updateSaProfile(saProfile.id, {
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

  app.post("/api/templates/industry-cv", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { industry, experienceLevel } = req.body;
      const userId = req.user.id;
      
      // Import the template services
      const { templateService } = await import('./services/templateService');
      const { templateSecurityService } = await import('./services/templateSecurityService');
      
      // Get user information for security tracking
      const user = await storage.getUser(userId);
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
      const referralCode = await referralService.generateReferralCode(userId);
      res.json({ referralCode, referralLink: `${req.protocol}://${req.get('host')}/signup?ref=${referralCode}` });
    } catch (error) {
      next(error);
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

  // Mount demo job matching routes
  app.use("/api", jobMatchingDemoRoutes);

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

  // Mount Dynamic Resume Builder routes
  app.use("/api", dynamicResumeBuilderRoutes);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}