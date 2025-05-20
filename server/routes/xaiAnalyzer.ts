/**
 * xAI-Powered CV Analysis Routes
 * 
 * Handles API routes for CV analysis using the xAI Grok API service
 */

import { Request, Response, NextFunction, Router } from 'express';
import { analyzeCVContent, formatAnalysisForResponse } from '../services/atsAnalysisService';
import { sanitizeHtml } from '../utils/textUtil';

const router = Router();

/**
 * Analyze CV text with xAI
 * POST /api/analyze-cv-text
 * 
 * Analyzes CV text content using xAI's Grok model and returns detailed analysis
 */
router.post('/analyze-cv-text', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, jobDescription } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'CV text is required'
      });
    }
    
    // Check if text is HTML and sanitize if needed
    let processedText = text;
    if (text.includes('<') && text.includes('>')) {
      processedText = sanitizeHtml(text);
    }
    
    // Create a mock CV object to use with our service
    const mockCV = {
      id: 0,
      content: processedText,
      fileName: 'uploaded-cv.txt',
      mimeType: 'text/plain'
    };
    
    // Use xAI to analyze the CV text
    const analysis = await analyzeCVContent(mockCV, jobDescription);
    
    if (!analysis.success) {
      return res.status(500).json({
        success: false,
        error: analysis.error || 'Failed to analyze CV with xAI'
      });
    }
    
    // Format and return the analysis results
    return res.status(200).json(formatAnalysisForResponse(analysis));
  } catch (error) {
    console.error('Error analyzing CV text with xAI:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze CV'
    });
  }
});

/**
 * Test connection to xAI service
 * GET /api/xai/test
 */
router.get('/xai/test', async (_req: Request, res: Response) => {
  try {
    const xaiService = require('../services/xaiService').default;
    const isConnected = await xaiService.testConnection();
    
    if (isConnected) {
      return res.json({ 
        success: true, 
        message: 'Successfully connected to xAI service' 
      });
    } else {
      return res.status(503).json({ 
        success: false, 
        message: 'Could not connect to xAI service' 
      });
    }
  } catch (error) {
    console.error('Error testing xAI connection:', error);
    return res.status(500).json({
      success: false,
      error: 'Error testing xAI connection'
    });
  }
});

export default router;