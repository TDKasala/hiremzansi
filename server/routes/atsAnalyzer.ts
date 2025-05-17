/**
 * ATS CV Analysis Routes
 * 
 * Handles API routes for CV analysis using the local AI service
 */

import { Request, Response, NextFunction, Router } from 'express';
import { analyzeCVText } from '../services/localAI';

const router = Router();

/**
 * Analyze CV text
 * POST /api/analyze-cv-text
 * 
 * Analyzes CV text content and returns detailed analysis
 */
router.post('/analyze-cv-text', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'CV text is required'
      });
    }
    
    // Use local AI to analyze the CV text
    const analysis = analyzeCVText(text);
    
    // Return the analysis results
    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing CV text:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze CV'
    });
  }
});

/**
 * Calculate ATS score for a CV
 * POST /api/ats-score
 * 
 * Analyzes CV text and returns a simplified ATS score
 */
router.post('/ats-score', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'CV text is required'
      });
    }
    
    // Get full analysis
    const analysis = analyzeCVText(text);
    
    // Create simplified version for basic score endpoint
    const scoreResults = {
      success: analysis.success,
      score: analysis.overall_score,
      rating: analysis.rating,
      strengths: analysis.strengths.slice(0, 3),
      improvements: analysis.improvements.slice(0, 3),
      sa_relevance: analysis.sa_relevance
    };
    
    // Return simplified results
    return res.status(200).json(scoreResults);
  } catch (error) {
    console.error('Error calculating ATS score:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate ATS score'
    });
  }
});

export default router;