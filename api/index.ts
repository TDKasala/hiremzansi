// Vercel serverless function handler
import express from 'express';

const app = express();

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

// Basic health check route
app.get('/api/health', (req: any, res: any) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Newsletter subscription endpoint
app.post('/api/newsletter/subscribe', async (req: any, res: any) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    // In production, integrate with email service
    console.log('Newsletter subscription:', email);
    
    res.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CV upload endpoint
app.post('/api/upload-cv', async (req: any, res: any) => {
  try {
    const { fileName, fileSize } = req.body;
    
    // Basic validation
    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }
    
    // Simulate CV analysis
    const analysisResults = {
      id: Date.now(),
      fileName,
      score: Math.floor(Math.random() * 40) + 60, // 60-100
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
      issues: []
    };
    
    res.json({
      success: true,
      analysis: analysisResults
    });
  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({ error: 'Failed to analyze CV' });
  }
});

// Latest CV endpoint
app.get('/api/latest-cv', (req: any, res: any) => {
  res.json({ 
    success: false, 
    message: 'No CVs found' 
  });
});

// Export handler for Vercel
export default app;