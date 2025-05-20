import { Router, Request, Response } from 'express';
import { mockAnalyzeCV } from '../services/mockXaiService';
import { formatAnalysisForResponse } from '../services/atsAnalysisService';
import { storage } from '../storage';

const router = Router();

/**
 * Test CV analysis with demonstration data
 * POST /api/test-cv-analysis/:id
 */
router.post('/test-cv-analysis/:id', async (req: Request, res: Response) => {
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
    
    console.log("Starting mock CV analysis demonstration");
    
    // Use our mock analysis service
    const analysis = await mockAnalyzeCV(cv.content, jobDescription);
    
    if (!analysis.success) {
      console.error("Mock analysis failed:", analysis.error);
      return res.status(500).json({
        error: "CV analysis failed",
        message: analysis.error || "Failed to analyze CV with demonstration service"
      });
    }
    
    // Format the analysis for the response
    const formattedAnalysis = formatAnalysisForResponse(analysis);
    
    // Add demo notice
    formattedAnalysis.demo = true;
    formattedAnalysis.notice = "This is a demonstration of the CV analysis with South African context";
    
    // Send the comprehensive analysis response
    return res.json(formattedAnalysis);
    
  } catch (error: any) {
    console.error("Error in mock CV analysis:", error);
    return res.status(500).json({
      error: "Analysis failed",
      message: error.message || "An unexpected error occurred"
    });
  }
});

export default router;