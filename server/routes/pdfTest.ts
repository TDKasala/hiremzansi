import { Router, Request, Response } from 'express';
import multer from 'multer';
import { extractTextFromPDF } from '../services/simplePdfParser';

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
    
    // Extract text from the PDF using our OCR-enhanced process
    const extractedText = await extractTextFromPDF(req.file.buffer);
    
    // Calculate some basic statistics
    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
    const lineCount = extractedText.split('\n').length;
    
    return res.json({
      success: true,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      extractionStats: {
        characterCount: extractedText.length,
        wordCount,
        lineCount,
        quality: wordCount > 300 ? "Good" : wordCount > 100 ? "Fair" : "Poor"
      },
      extractedText: extractedText.substring(0, 1000) + (extractedText.length > 1000 ? "..." : "")
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