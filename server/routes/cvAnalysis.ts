import { Router } from 'express';
import multer from 'multer';
import { xaiService } from '../services/xaiService';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Extract text from uploaded file
async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  try {
    switch (file.mimetype) {
      case 'application/pdf':
        const pdfData = await pdfParse(file.buffer);
        return pdfData.text;
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxResult = await mammoth.extractRawText({ buffer: file.buffer });
        return docxResult.value;
      
      case 'application/msword':
        // For older .doc files, try to extract as text
        return file.buffer.toString('utf8');
      
      case 'text/plain':
        return file.buffer.toString('utf8');
      
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error('Failed to extract text from file');
  }
}

// CV Analysis endpoint
router.post('/analyze', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CV file uploaded' });
    }

    const { jobDescription, targetRole } = req.body;

    // Extract text from uploaded CV
    const cvText = await extractTextFromFile(req.file);

    if (!cvText || cvText.trim().length < 50) {
      return res.status(400).json({ error: 'CV file appears to be empty or too short' });
    }

    // Analyze CV using xAI
    const analysis = await xaiService.analyzeCVForATS(cvText, jobDescription);

    // Store analysis in session/memory for demo purposes
    const analysisResult = {
      id: Date.now(),
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedAt: new Date(),
      analysis,
      originalText: cvText
    };

    res.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('CV Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze CV',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Job matching endpoint
router.post('/match-job', async (req, res) => {
  try {
    const { cvText, jobDescription } = req.body;

    if (!cvText || !jobDescription) {
      return res.status(400).json({ error: 'CV text and job description are required' });
    }

    const matchResult = await xaiService.matchJobToCV(cvText, jobDescription);

    res.json({
      success: true,
      data: matchResult
    });

  } catch (error) {
    console.error('Job matching error:', error);
    res.status(500).json({ 
      error: 'Failed to match job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Career guidance endpoint
router.post('/career-guidance', async (req, res) => {
  try {
    const { cvText, targetRole } = req.body;

    if (!cvText) {
      return res.status(400).json({ error: 'CV text is required' });
    }

    const guidance = await xaiService.generateCareerGuidance(cvText, targetRole);

    res.json({
      success: true,
      data: guidance
    });

  } catch (error) {
    console.error('Career guidance error:', error);
    res.status(500).json({ 
      error: 'Failed to generate career guidance',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cover letter generation endpoint
router.post('/generate-cover-letter', async (req, res) => {
  try {
    const { cvText, jobDescription, companyName } = req.body;

    if (!cvText || !jobDescription || !companyName) {
      return res.status(400).json({ error: 'CV text, job description, and company name are required' });
    }

    const coverLetter = await xaiService.generateCoverLetter(cvText, jobDescription, companyName);

    res.json({
      success: true,
      data: { coverLetter }
    });

  } catch (error) {
    console.error('Cover letter generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate cover letter',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// LinkedIn optimization endpoint
router.post('/optimize-linkedin', async (req, res) => {
  try {
    const { cvText } = req.body;

    if (!cvText) {
      return res.status(400).json({ error: 'CV text is required' });
    }

    const optimization = await xaiService.optimizeLinkedInProfile(cvText);

    res.json({
      success: true,
      data: optimization
    });

  } catch (error) {
    console.error('LinkedIn optimization error:', error);
    res.status(500).json({ 
      error: 'Failed to optimize LinkedIn profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Interview questions generation endpoint
router.post('/interview-questions', async (req, res) => {
  try {
    const { jobDescription, experienceLevel } = req.body;

    if (!jobDescription || !experienceLevel) {
      return res.status(400).json({ error: 'Job description and experience level are required' });
    }

    const questions = await xaiService.generateInterviewQuestions(jobDescription, experienceLevel);

    res.json({
      success: true,
      data: { questions }
    });

  } catch (error) {
    console.error('Interview questions generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate interview questions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Salary benchmark endpoint
router.post('/salary-benchmark', async (req, res) => {
  try {
    const { position, location, experience } = req.body;

    if (!position || !location || !experience) {
      return res.status(400).json({ error: 'Position, location, and experience are required' });
    }

    const benchmark = await xaiService.analyzeSalaryBenchmark(position, location, experience);

    res.json({
      success: true,
      data: benchmark
    });

  } catch (error) {
    console.error('Salary benchmark error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze salary benchmark',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get latest CV analysis (for demo/testing)
router.get('/latest', (req, res) => {
  // This would typically fetch from database
  // For now, return a placeholder response
  res.json({
    success: false,
    message: 'No recent CV analyses found'
  });
});

export default router;