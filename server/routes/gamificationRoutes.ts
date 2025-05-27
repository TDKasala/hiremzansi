import { Router } from "express";
import { gamificationService } from "../services/gamificationService";

const router = Router();

/**
 * Get user's complete gamification progress
 * GET /api/gamification/progress
 */
router.get("/progress", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const progress = await gamificationService.getUserProgress(req.user.id);

    res.json({
      success: true,
      progress,
      message: "Progress retrieved successfully"
    });
  } catch (error) {
    console.error("Gamification progress error:", error);
    res.status(500).json({ error: "Failed to get progress" });
  }
});

/**
 * Check achievements for a user action
 * POST /api/gamification/check-achievements
 */
router.post("/check-achievements", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { action, data } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: "Action is required" });
    }

    const newAchievements = await gamificationService.checkAchievements(req.user.id, action, data);

    res.json({
      success: true,
      newAchievements,
      message: newAchievements.length > 0 
        ? `Congratulations! You earned ${newAchievements.length} new achievements!`
        : "Keep going! More achievements await!"
    });
  } catch (error) {
    console.error("Achievement check error:", error);
    res.status(500).json({ error: "Failed to check achievements" });
  }
});

/**
 * Get leaderboard
 * GET /api/gamification/leaderboard
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const { timeframe = 'weekly', limit = 10 } = req.query;
    
    const leaderboard = await gamificationService.getLeaderboard(
      timeframe as 'weekly' | 'monthly' | 'all_time',
      Number(limit)
    );

    res.json({
      success: true,
      leaderboard,
      timeframe,
      message: "Leaderboard retrieved successfully"
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

/**
 * Generate new weekly goals
 * POST /api/gamification/weekly-goals
 */
router.post("/weekly-goals", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const weeklyGoals = await gamificationService.generateWeeklyGoals(req.user.id);

    res.json({
      success: true,
      weeklyGoals,
      message: "New weekly goals generated! Time to level up your career!"
    });
  } catch (error) {
    console.error("Weekly goals error:", error);
    res.status(500).json({ error: "Failed to generate weekly goals" });
  }
});

export default router;