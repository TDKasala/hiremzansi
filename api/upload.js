import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const analyzeCV = async (content, jobDescription) => {
  const score = Math.floor(Math.random() * 40) + 60;
  
  const hasExperience = content.toLowerCase().includes('experience') || content.toLowerCase().includes('work');
  const hasEducation = content.toLowerCase().includes('education') || content.toLowerCase().includes('degree');
  const hasSkills = content.toLowerCase().includes('skills') || content.toLowerCase().includes('technical');
  
  const strengths = [];
  const improvements = [];
  
  if (hasExperience) strengths.push("Clear work experience section");
  if (hasEducation) strengths.push("Educational background well presented");
  if (hasSkills) strengths.push("Technical skills clearly listed");
  
  if (!content.includes('project')) improvements.push("Add project examples with quantified results");
  if (!content.toLowerCase().includes('achievement')) improvements.push("Include specific achievements and metrics");
  if (content.length < 500) improvements.push("Expand CV with more detailed descriptions");
  
  return {
    success: true,
    data: {
      atsScore: score,
      overallScore: score,
      strengths: strengths.length > 0 ? strengths : [
        "Professional formatting and layout",
        "Relevant work experience highlighted", 
        "Clear contact information provided"
      ],
      improvements: improvements.length > 0 ? improvements : [
        "Add more industry-specific keywords",
        "Include quantifiable achievements",
        "Optimize for ATS scanning"
      ],
      missingKeywords: ["leadership", "project management", "teamwork"],
      formattingIssues: [],
      southAfricanContext: {
        beeCompliance: content.toLowerCase().includes('bee') || content.toLowerCase().includes('equity') ? "Mentioned" : "Not specified",
        localMarketFit: "Good alignment with SA market requirements",
        industryRelevance: "High relevance for target industry",
        languageAppropriate: true
      },
      industry: "Technology",
      experienceLevel: content.includes('senior') || content.includes('lead') ? "Senior-level" : "Mid-level"
    }
  };
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, jobDescription } = req.body || {};
    
    const content = `Professional CV Analysis

Professional Experience:
- Software Developer with 5+ years experience in full-stack development
- Led cross-functional teams and managed client relationships
- Developed scalable web applications using modern technologies

Education:
- Bachelor's Degree in Computer Science from University of Cape Town
- Additional certifications in AWS and project management

Technical Skills:
- Programming: JavaScript, Python, Java, C#
- Frameworks: React, Node.js, Django, .NET
- Tools: Git, Docker, AWS, Azure
- Databases: PostgreSQL, MongoDB, MySQL

Languages:
- English (Native)
- Afrikaans (Fluent)
- Zulu (Conversational)

Achievements:
- Increased system performance by 40% through optimization
- Led successful deployment of enterprise software for 10,000+ users
- Mentored junior developers and improved team productivity`;

    const analysisResult = await analyzeCV(content, jobDescription);

    let cvRecord = null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('cvs')
          .insert([{
            file_name: title || 'demo-cv.pdf',
            file_type: 'application/pdf',
            file_size: 1024,
            content: content,
            title: title || 'Demo CV',
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (!error) {
          cvRecord = data;
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
      }
    }

    return res.status(200).json({
      success: true,
      cv: cvRecord,
      analysis: analysisResult.data
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}