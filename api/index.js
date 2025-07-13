const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

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
    // API routes
    if (pathname.startsWith('/api/')) {
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
    }

    // Serve static files and React app for non-API routes
    const distPath = path.join(__dirname, '..', 'dist', 'public');
    const indexPath = path.join(distPath, 'index.html');
    
    // Check if the requested path is a file
    const filePath = path.join(distPath, pathname);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      // Serve the static file
      return res.sendFile(filePath);
    } else {
      // Serve the React app (SPA fallback)
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      } else {
        // If no build files exist, serve a simple HTML response
        return res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Hire Mzansi - CV Optimization Platform</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .container { max-width: 600px; margin: 0 auto; }
                .logo { font-size: 2em; color: #4ade80; margin-bottom: 20px; }
                .status { color: #666; margin: 20px 0; }
                .api-test { margin: 20px 0; }
                a { color: #4ade80; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">🚀 Hire Mzansi</div>
                <h1>CV Optimization Platform</h1>
                <div class="status">
                  <p>✅ Server is running</p>
                  <p>🔧 Build in progress...</p>
                </div>
                <div class="api-test">
                  <h3>API Status:</h3>
                  <p><a href="/api/health" target="_blank">Test API Health</a></p>
                </div>
                <p>Please wait while the application builds...</p>
              </div>
            </body>
          </html>
        `);
      }
    }

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};