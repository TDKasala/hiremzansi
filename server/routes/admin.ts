import { Request, Response, NextFunction, Router } from "express";
import { db } from "../db";
import { users, cvs, atsScores, saProfiles, plans, subscriptions } from "@shared/schema";
import { count, sql, and, eq, gte, desc } from "drizzle-orm";

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
      .orderBy(cvs.createdAt, 'desc')
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
      .orderBy(users.createdAt, 'desc');
    
    const [totalCount] = await db.select({ count: count() }).from(users);
    
    res.json({
      users: allUsers,
      pagination: {
        total: totalCount.count,
        page,
        limit,
        totalPages: Math.ceil(totalCount.count / limit),
      },
    });
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
      .orderBy(cvs.createdAt, 'desc');
    
    const [totalCount] = await db.select({ count: count() }).from(cvs);
    
    res.json({
      cvs: allCVs,
      pagination: {
        total: totalCount.count,
        page,
        limit,
        totalPages: Math.ceil(totalCount.count / limit),
      },
    });
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
    if (req.user.id === userId && role && role !== 'admin') {
      return res.status(403).json({ error: "You cannot change your own admin role" });
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({
        role: role || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        updatedAt: new Date(),
      })
      .where(users.id === userId)
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

export default router;