const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vkfqohfaxapfajwrzebz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZnFvaGZheGFwZmFqd3J6ZWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjAyODgsImV4cCI6MjA2NDg5NjI4OH0.-qVAAZSOYmkN6IPQOxgagMjd5ywfQqsosp9udH2lpTA';
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;
  const path = url?.split('?')[0] || '';

  try {
    if (method === 'GET' && path.includes('health')) {
      return res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        supabase: !!supabase
      });
    }

    if (method === 'POST' && path.includes('upload')) {
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
      if (supabase) {
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

    if (method === 'POST' && path.includes('newsletter')) {
      const { email } = req.body || {};
      
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      if (supabase) {
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

    return res.status(404).json({ error: 'Not found' });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};