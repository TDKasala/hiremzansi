/**
 * CV Analysis Route with xAI Grok Integration
 * 
 * This route handles the analysis of CVs using xAI's Grok API
 * to provide detailed ATS compatibility scoring and recommendations
 * specifically for the South African job market
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { analyzeCVContent, formatAnalysisForResponse } from '../services/atsAnalysisService';
import { insertAtsScoreSchema } from '@shared/schema';
import { z } from 'zod';

export async function handleCVAnalysis(req: Request, res: Response, next: NextFunction) {
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
    
    // Use our xAI-powered analysis service instead of local AI
    const analysis = await analyzeCVContent(cv, jobDescription);
    
    if (!analysis.success) {
      console.error("xAI analysis failed:", analysis.error);
      return res.status(500).json({
        error: "CV analysis failed",
        message: analysis.error || "Failed to analyze CV with xAI service"
      });
    }
    
    // Prepare the formatted response from xAI
    const formattedAnalysis = formatAnalysisForResponse(analysis);
    
    // Check if we have enough meaningful data
    if (!formattedAnalysis.skills || formattedAnalysis.skills.length === 0) {
      console.warn("Analysis didn't identify any skills in the CV");
      return res.status(400).json({
        error: "Insufficient CV content",
        message: "The CV doesn't contain enough recognizable content to analyze. Please upload a CV with more relevant information."
      });
    }
    
    // Now create an ATS score record in the database with results from xAI
    try {
      const atsScoreData = {
        cvId,
        score: formattedAnalysis.score,
        skillsScore: formattedAnalysis.skillsScore || 0,
        formatScore: formattedAnalysis.formatScore || 0,
        contextScore: formattedAnalysis.contextScore || 0,
        strengths: formattedAnalysis.strengths || [],
        improvements: formattedAnalysis.improvements || [],
        issues: []
      };
      
      // Validate data with Zod schema
      const validatedData = insertAtsScoreSchema.parse(atsScoreData);
      
      // Store in database
      const atsScore = await storage.createATSScore(validatedData);
      
      // Add the ATS score ID to the response
      formattedAnalysis.scoreId = atsScore.id;
      
      console.log("Successfully created ATS score record with ID:", atsScore.id);
    } catch (error) {
      console.error("Error creating ATS score:", error);
      // Continue to send the analysis even if saving to DB fails
    }
    
    // Send the comprehensive analysis response
    return res.json(formattedAnalysis);
    
  } catch (error) {
    console.error("Error analyzing CV:", error);
    next(error);
  }
}

export default handleCVAnalysis;