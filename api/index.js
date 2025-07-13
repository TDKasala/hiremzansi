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

    // Serve the main application for all non-API routes
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Hire Mzansi - CV Optimization Platform</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            }
            .container {
              text-align: center;
              max-width: 600px;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 20px;
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            .logo {
              font-size: 3rem;
              margin-bottom: 1rem;
              font-weight: bold;
            }
            h1 {
              font-size: 2.5rem;
              margin-bottom: 1rem;
              font-weight: 300;
            }
            .subtitle {
              font-size: 1.2rem;
              margin-bottom: 2rem;
              opacity: 0.9;
            }
            .features {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 1rem;
              margin: 2rem 0;
            }
            .feature {
              background: rgba(255, 255, 255, 0.1);
              padding: 1rem;
              border-radius: 10px;
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .feature h3 {
              margin-bottom: 0.5rem;
              color: #4ade80;
            }
            .cta {
              margin-top: 2rem;
            }
            .btn {
              display: inline-block;
              background: #4ade80;
              color: #1f2937;
              padding: 1rem 2rem;
              border-radius: 50px;
              text-decoration: none;
              font-weight: bold;
              transition: all 0.3s ease;
              margin: 0.5rem;
            }
            .btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 20px rgba(74, 222, 128, 0.3);
            }
            .api-status {
              margin-top: 2rem;
              padding: 1rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
            }
            .status-item {
              margin: 0.5rem 0;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
            }
            .status-ok { color: #4ade80; }
            .status-loading { color: #fbbf24; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🚀</div>
            <h1>Hire Mzansi</h1>
            <p class="subtitle">AI-Powered CV Optimization Platform for South African Job Seekers</p>
            
            <div class="features">
              <div class="feature">
                <h3>🤖 AI Analysis</h3>
                <p>Advanced CV optimization with AI insights</p>
              </div>
              <div class="feature">
                <h3>🇿🇦 SA Focus</h3>
                <p>B-BBEE compliant and locally optimized</p>
              </div>
              <div class="feature">
                <h3>📊 ATS Friendly</h3>
                <p>Get past Applicant Tracking Systems</p>
              </div>
            </div>
            
            <div class="cta">
              <a href="/api/health" class="btn" target="_blank">Test API</a>
              <a href="#" class="btn" onclick="testUpload()">Test CV Upload</a>
            </div>
            
            <div class="api-status">
              <h3>System Status</h3>
              <div class="status-item">
                <span class="status-ok">✅</span>
                <span>Server Running</span>
              </div>
              <div class="status-item">
                <span class="status-loading">⏳</span>
                <span>Full App Loading...</span>
              </div>
            </div>
          </div>
          
          <script>
            async function testUpload() {
              try {
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title: 'Test CV' })
                });
                const data = await response.json();
                alert('API Test: ' + JSON.stringify(data, null, 2));
              } catch (error) {
                alert('API Error: ' + error.message);
              }
            }
            
            // Test API health on load
            fetch('/api/health')
              .then(response => response.json())
              .then(data => {
                console.log('API Health:', data);
              })
              .catch(error => {
                console.error('API Error:', error);
              });
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};