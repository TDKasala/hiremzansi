/**
 * ATS CV Analysis API 
 * 
 * Provides CV analysis using local AI service optimized for South African job market
 */

import { Request, Response } from 'express';
import { analyzeCVText } from '../services/localAI';

/**
 * Analyze CV text and return detailed analysis results
 */
export async function analyzeCV(req: Request, res: Response) {
  try {
    const { text, jobDescription } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'CV text is required'
      });
    }
    
    // Use local AI to analyze the CV text
    const analysis = analyzeCVText(text);
    
    // Extract job-specific keywords from job description if provided
    let jobKeywordMatch = null;
    if (jobDescription && typeof jobDescription === 'string') {
      // Could be enhanced to extract keywords from job description
      // and match them against the CV
      jobKeywordMatch = {
        matchScore: Math.round(Math.random() * 20) + 60, // Placeholder for now
        jobRelevance: "Medium" 
      };
    }
    
    // Return the analysis results in a format the frontend expects
    return res.status(200).json({
      success: true,
      score: analysis.overall_score,
      rating: analysis.rating,
      strengths: analysis.strengths.slice(0, 3),
      weaknesses: analysis.improvements.slice(0, 3),
      suggestions: analysis.format_feedback.slice(0, 2),
      sa_score: analysis.sa_score,
      sa_relevance: analysis.sa_relevance,
      skills: analysis.skills_identified.slice(0, 8),
      job_match: jobKeywordMatch
    });
  } catch (error) {
    console.error('Error analyzing CV:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze CV'
    });
  }
}

/**
 * Register the ATS Analysis routes with the Express app
 */
export function registerATSRoutes(app: any) {
  // Analyze CV text directly
  app.post('/api/analyze-resume-text', analyzeCV);
  
  // Alternative endpoint (alias)
  app.post('/api/analyze-cv-text', analyzeCV);
  
  console.log('ATS Analysis routes registered');
}