const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;
  const pathname = url?.split('?')[0] || '';

  try {
    // Health check endpoint
    if (method === 'GET' && pathname.includes('health')) {
      return res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        supabase: !!supabase
      });
    }

    // CV upload and analysis endpoint
    if (method === 'POST' && pathname.includes('upload')) {
      const score = Math.floor(Math.random() * 40) + 60;
      const content = req.body?.title || 'Sample CV content';
      
      const analysis = {
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
        missingKeywords: ["leadership", "project management", "teamwork"],
        formattingIssues: [],
        southAfricanContext: {
          beeCompliance: "Not specified",
          localMarketFit: "Good alignment with SA market requirements",
          industryRelevance: "High relevance for target industry",
          languageAppropriate: true
        },
        industry: "Technology",
        experienceLevel: "Mid-level"
      };

      let cvRecord = null;
      if (supabase && supabaseUrl !== 'https://placeholder.supabase.co') {
        try {
          const { data } = await supabase
            .from('cvs')
            .insert([{
              file_name: 'demo-cv.pdf',
              file_type: 'application/pdf',
              file_size: 1024,
              content: content,
              title: req.body?.title || 'Demo CV',
              created_at: new Date().toISOString()
            }])
            .select()
            .single();
          cvRecord = data;
        } catch (error) {
          console.error('Database error:', error);
        }
      }

      return res.status(200).json({
        success: true,
        cv: cvRecord,
        analysis
      });
    }

    // Newsletter subscription endpoint
    if (method === 'POST' && pathname.includes('newsletter')) {
      const { email } = req.body || {};
      
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      if (supabase && supabaseUrl !== 'https://placeholder.supabase.co') {
        try {
          await supabase
            .from('newsletter_subscriptions')
            .insert([{ email, created_at: new Date().toISOString() }]);
        } catch (error) {
          console.error('Newsletter error:', error);
        }
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Successfully subscribed'
      });
    }

    // Default response for unmatched API routes
    return res.status(404).json({ error: 'API endpoint not found' });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};