import { Request, Response, NextFunction, Router } from "express";
import { db } from "../db";
import { users, cvs, atsScores, saProfiles, plans, subscriptions } from "@shared/schema";
import { count, sql, and, eq, gte, desc } from "drizzle-orm";
import { sendWeeklyCareerDigests } from "../services/recommendationService";

const router = Router();

// Middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }

  next();
};

// Get admin dashboard stats
router.get("/stats", isAdmin, async (req: Request, res: Response) => {
  try {
    // Get total users count
    const [userCount] = await db.select({ count: count() }).from(users);
    
    // Get total CVs count
    const [cvCount] = await db.select({ count: count() }).from(cvs);
    
    // Get total ATS analyses count
    const [atsCount] = await db.select({ count: count() }).from(atsScores);
    
    // Get total SA profiles count
    const [saProfileCount] = await db.select({ count: count() }).from(saProfiles);
    
    // Get subscription stats
    const [subscriptionCount] = await db.select({ count: count() }).from(subscriptions);
    
    // Get active user count (users who have logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Use SQL for date comparison to avoid TypeScript errors
    const [activeUserCount] = await db.select({ count: count() })
      .from(users)
      .where(
        sql`${users.lastLogin} >= ${thirtyDaysAgo}`
      );
    
    // Calculate average ATS score
    const avgScoreResult = await db.execute<{ avg: number }>(
      `SELECT AVG(score) as avg FROM ats_scores`
    );
    const avgScore = avgScoreResult.rows[0]?.avg || 0;
    
    // Get latest users
    const latestUsers = await db
      .select({
        id: users.id,
        username: users.username,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
        role: users.role,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5);
    
    // Get latest CVs
    const latestCVs = await db
      .select({
        id: cvs.id,
        userId: cvs.userId,
        fileName: cvs.fileName,
        createdAt: cvs.createdAt,
      })
      .from(cvs)
      .orderBy(desc(cvs.createdAt))
      .limit(5);
    
    res.json({
      userCount: userCount.count,
      activeUserCount: activeUserCount.count,
      cvCount: cvCount.count,
      atsCount: atsCount.count,
      saProfileCount: saProfileCount.count,
      subscriptionCount: subscriptionCount.count,
      avgScore: Math.round(avgScore),
      latestUsers,
      latestCVs,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

// Get all users with pagination
router.get("/users", isAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
      })
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));
    
    const [totalCount] = await db.select({ count: count() }).from(users);
    
    // Return just the users array instead of an object with pagination
    // This matches what our frontend expects
    res.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get all CVs with pagination
router.get("/cvs", isAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const allCVs = await db
      .select({
        id: cvs.id,
        userId: cvs.userId,
        fileName: cvs.fileName,
        fileType: cvs.fileType,
        fileSize: cvs.fileSize,
        title: cvs.title,
        isGuest: cvs.isGuest,
        createdAt: cvs.createdAt,
      })
      .from(cvs)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(cvs.createdAt));
    
    const [totalCount] = await db.select({ count: count() }).from(cvs);
    
    // Get usernames for each CV
    const cvsWithUsername = await Promise.all(
      allCVs.map(async (cv) => {
        // Get user info for this CV
        const [user] = await db
          .select({ username: users.username })
          .from(users)
          .where(sql`${users.id} = ${cv.userId}`);
          
        // Get ATS score if available
        const [atsScore] = await db
          .select({ score: atsScores.score })
          .from(atsScores)
          .where(sql`${atsScores.cvId} = ${cv.id}`);
        
        return {
          ...cv,
          username: user?.username || 'Guest',
          score: atsScore?.score || 0
        };
      })
    );
    
    // Return just the CVs array instead of an object with pagination
    // This matches what our frontend expects
    res.json(cvsWithUsername);
  } catch (error) {
    console.error("Error fetching CVs:", error);
    res.status(500).json({ error: "Failed to fetch CVs" });
  }
});

// Update user (role, active status, etc.)
router.put("/users/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { role, isActive } = req.body;
    
    // Prevent changing your own role (admin can't demote themselves)
    if (req.user && req.user.id === userId && role && role !== 'admin') {
      return res.status(403).json({ error: "You cannot change your own admin role" });
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({
        role: role || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        updatedAt: new Date(),
      })
      .where(sql`${users.id} = ${userId}`)
      .returning();
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Admin route to trigger career recommendation email digests
router.post("/send-career-digests", isAdmin, async (req: Request, res: Response) => {
  try {
    // Send personalized career recommendation emails to eligible users
    const sentCount = await sendWeeklyCareerDigests();
    
    res.json({
      success: true,
      message: `Successfully sent ${sentCount} career recommendation digest emails`,
      sentCount
    });
  } catch (error) {
    console.error("Error sending career digest emails:", error);
    res.status(500).json({ error: "Failed to send career digest emails" });
  }
});

export default router;