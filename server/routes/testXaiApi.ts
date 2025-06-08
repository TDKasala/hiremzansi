import { Router, Request, Response } from 'express';
import { xaiService } from '../services/xaiService';

const router = Router();

/**
 * Test xAI API connectivity
 * GET /api/test-xai
 */
router.get('/test-xai', async (_req: Request, res: Response) => {
  try {
    // Check if the XAI_API_KEY is set
    if (!process.env.XAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'XAI_API_KEY is not set in environment variables'
      });
    }
    
    // Test the connection to xAI API by trying a simple CV analysis
    const testResult = await xaiService.analyzeCV("Test CV content for API connectivity");
    
    if (testResult.success) {
      return res.json({
        success: true,
        message: 'Successfully connected to xAI Grok API'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to xAI API: ' + testResult.error
      });
    }
  } catch (error: any) {
    console.error('Error testing xAI connection:', error);
    return res.status(500).json({
      success: false,
      message: `Error testing xAI connection: ${error.message}`
    });
  }
});

export default router;