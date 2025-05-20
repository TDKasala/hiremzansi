import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { analyzeCV } from '../services/optimizedXaiService';

const router = Router();

/**
 * Get optimized ATS score with minimal payload size
 * Designed for mobile-first performance (<2s load on 3G, <500KB/page)
 * GET /api/ats-score/:cvId/optimize
 */
router.get('/ats-score/:cvId/optimize', async (req: Request, res: Response, next: NextFunction) => {
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
    
    // Try to get existing ATS score first (most efficient)
    const atsScore = await storage.getATSScoreByCV(cvId);
    
    if (atsScore) {
      // Return optimized response format for mobile
      return res.json({
        score: atsScore.score,
        skillsScore: atsScore.skillsScore,
        formatScore: atsScore.formatScore,
        contextScore: atsScore.contextScore,
        // Limit data size for faster mobile loading
        strengths: (atsScore.strengths || []).slice(0, 3),
        improvements: (atsScore.improvements || []).slice(0, 3)
      });
    }
    
    // If no existing score, generate a quick analysis
    if (cv.content) {
      console.log("Generating optimized mobile analysis");
      const analysis = await analyzeCV(cv.content);
      
      if (analysis.success && analysis.result) {
        return res.json({
          score: analysis.result.score,
          rating: analysis.result.rating,
          skillsScore: analysis.result.skills_score,
          formatScore: analysis.result.format_score,
          contextScore: analysis.result.sa_score,
          strengths: (analysis.result.strengths || []).slice(0, 3),
          improvements: (analysis.result.improvements || []).slice(0, 3),
          skills: (analysis.result.skills || []).slice(0, 10)
        });
      }
    }
    
    return res.status(404).json({ error: "ATS score not found and analysis failed" });
  } catch (error) {
    next(error);
  }
});

/**
 * Progressive loading endpoint for basic ATS score data
 * GET /api/ats-score/:cvId/basic
 */
router.get('/ats-score/:cvId/basic', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cvId = parseInt(req.params.cvId);
    
    if (isNaN(cvId)) {
      return res.status(400).json({ error: "Invalid CV ID" });
    }
    
    // Get only the basic score data for fast initial load
    const atsScore = await storage.getATSScoreByCV(cvId);
    
    if (!atsScore) {
      return res.status(404).json({ error: "ATS score not found" });
    }
    
    // Return minimal data for first render
    return res.json({
      score: atsScore.score,
      rating: getRatingFromScore(atsScore.score),
      skillsScore: atsScore.skillsScore,
      formatScore: atsScore.formatScore,
      contextScore: atsScore.contextScore
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Progressive loading endpoint for detailed recommendations
 * GET /api/ats-score/:cvId/details
 */
router.get('/ats-score/:cvId/details', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cvId = parseInt(req.params.cvId);
    
    if (isNaN(cvId)) {
      return res.status(400).json({ error: "Invalid CV ID" });
    }
    
    // Get only the detailed recommendations for second stage load
    const atsScore = await storage.getATSScoreByCV(cvId);
    
    if (!atsScore) {
      return res.status(404).json({ error: "ATS score not found" });
    }
    
    // Return detailed recommendations
    return res.json({
      strengths: atsScore.strengths || [],
      improvements: atsScore.improvements || []
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get rating text from numeric score
 */
function getRatingFromScore(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Average';
  return 'Poor';
}

export default router;