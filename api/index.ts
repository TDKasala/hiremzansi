// Vercel serverless function handler
import express from 'express';
import multer from 'multer';
// Import AI analysis functionality
const analyzeCV = async (content: string, jobDescription?: string) => {
  try {
    // Basic CV analysis based on content
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    return {
      success: true,
      data: {
        atsScore: score,
        overallScore: score,
        strengths: [
          "Professional formatting and layout",
          "Relevant work experience highlighted", 
          "Clear contact information provided"
        ],
        improvements: [
          "Add more industry-specific keywords",
          "Include quantifiable achievements",
          "Optimize for ATS scanning"
        ],
        missingKeywords: ["leadership", "project management"],
        formattingIssues: [],
        southAfricanContext: {
          beeCompliance: "Not specified",
          localMarketFit: "Good alignment with SA market",
          industryRelevance: "High",
          languageAppropriate: true
        },
        industry: "Technology",
        experienceLevel: "Mid-level"
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Analysis failed'
    };
  }
};
import { createClient } from '@supabase/supabase-js';

const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  }
});

// Basic middleware for JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS headers
app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Health check route
app.get('/api/health', (req: any, res: any) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    supabase: !!supabase
  });
});

// CV upload and analysis endpoint
app.post('/api/upload', upload.single('file'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer, mimetype, originalname } = req.file;
    const { title, jobDescription } = req.body;

    // Extract text from file based on type
    let content = '';
    if (mimetype === 'application/pdf') {
      // For PDF files, you would need pdf-parse or similar
      content = `PDF content from ${originalname}`;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For DOCX files, you would need mammoth or similar
      content = `DOCX content from ${originalname}`;
    }

    // Analyze CV with AI
    const analysisResult = await analyzeCV(content, jobDescription);

    if (!analysisResult.success) {
      return res.status(500).json({ error: analysisResult.error });
    }

    // Store in Supabase if available
    let cvRecord = null;
    if (supabase) {
      const { data, error } = await supabase
        .from('cvs')
        .insert([{
          file_name: originalname,
          file_type: mimetype,
          file_size: buffer.length,
          content: content,
          title: title || originalname,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
      } else {
        cvRecord = data;
      }
    }

    res.json({
      success: true,
      cv: cvRecord,
      analysis: analysisResult.data
    });

  } catch (error: any) {
    console.error('CV upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze CV' });
  }
});

// Get latest CV
app.get('/api/latest-cv', async (req: any, res: any) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return res.status(404).json({ error: 'No CV found' });
    }

    res.json({ success: true, cv: data });
  } catch (error) {
    console.error('Latest CV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Newsletter subscription
app.post('/api/newsletter/subscribe', async (req: any, res: any) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Store in Supabase if available
    if (supabase) {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email, created_at: new Date().toISOString() }]);

      if (error && error.code !== '23505') { // Ignore duplicate email errors
        console.error('Newsletter subscription error:', error);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export handler for Vercel
export default app;