import { Router, Request, Response } from 'express';
import { testXaiConnection } from '../services/xaiService';

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
    
    // Test the connection to xAI API
    const connected = await testXaiConnection();
    
    if (connected) {
      return res.json({
        success: true,
        message: 'Successfully connected to xAI Grok API'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to xAI Grok API'
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