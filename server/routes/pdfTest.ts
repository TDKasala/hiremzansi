import { Router, Request, Response } from 'express';
import multer from 'multer';
import { testExtractionQuality } from '../services/enhancedPdfParser';

const router = Router();

// Configure multer for PDF upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * Test the enhanced PDF extraction quality
 * POST /api/test-pdf-extraction
 */
router.post('/test-pdf-extraction', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }
    
    const result = await testExtractionQuality(req.file.buffer);
    
    return res.json({
      success: true,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      extractionResults: result
    });
  } catch (error: any) {
    console.error("Error testing PDF extraction:", error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to test PDF extraction'
    });
  }
});

export default router;