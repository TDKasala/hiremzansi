import type { Express, Request, Response, NextFunction } from "express";
import { premiumMatchingService } from "../services/premiumMatchingService";
import { matchingPaymentService } from "../services/matchingPaymentService";

/**
 * Premium Matching Service Routes
 * Separate service for paid job matching between recruiters and job seekers
 */
export function registerPremiumMatchingRoutes(app: Express) {
  
  // Get matches for recruiter
  app.get("/api/premium/recruiter/matches", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      // TODO: Verify user is a recruiter
      const matches = await premiumMatchingService.getRecruiterMatches(req.user.id, page, limit);
      
      res.json({
        matches,
        page,
        limit,
        message: "Premium matches found - contact details available after payment"
      });
      
    } catch (error) {
      next(error);
    }
  });
  
  // Get matches for job seeker
  app.get("/api/premium/jobseeker/matches", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      // TODO: Verify user has job seeker profile
      const matches = await premiumMatchingService.getJobSeekerMatches(req.user.id, page, limit);
      
      res.json({
        matches,
        page,
        limit,
        message: "Premium matches found - contact details available after payment"
      });
      
    } catch (error) {
      next(error);
    }
  });
  
  // Create payment for contact unlock
  app.post("/api/premium/unlock-contact", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { matchId, userType } = req.body;
      
      if (!matchId || !userType) {
        return res.status(400).json({ error: "Match ID and user type required" });
      }
      
      if (!['recruiter', 'job_seeker'].includes(userType)) {
        return res.status(400).json({ error: "Invalid user type" });
      }
      
      // Create payment intent
      const payment = await matchingPaymentService.createContactUnlockPayment(
        req.user.id,
        userType as 'recruiter' | 'job_seeker',
        matchId
      );
      
      res.json({
        ...payment,
        message: "Payment created - complete payment to unlock contact details"
      });
      
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  });
  
  // Run AI matching engine (admin only)
  app.post("/api/premium/run-matching", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      // Run the AI matching engine
      await premiumMatchingService.runMatchingEngine();
      
      res.json({
        success: true,
        message: "AI matching engine completed successfully"
      });
      
    } catch (error) {
      next(error);
    }
  });
}