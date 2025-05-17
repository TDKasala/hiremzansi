const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

// South African specific keywords
const SA_KEYWORDS = [
  "south africa", "sa", "cape town", "johannesburg", "pretoria", "durban", 
  "b-bbee", "bee", "bbbee", "nqf", "saqa", "matric", "seta", "unisa", "wits"
];

// Common skills to detect
const COMMON_SKILLS = [
  "javascript", "python", "java", "react", "angular", "node.js", 
  "html", "css", "sql", "aws", "communication", "leadership", "excel"
];

/**
 * Analyze CV text and return detailed analysis results
 */
function analyzeCVText(text) {
  const content = text.trim().toLowerCase();
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  // Check formatting factors
  const hasSections = /education|experience|skills|qualifications|work history/i.test(content);
  const hasBulletPoints = /•|-|\*/i.test(content);
  const hasContactInfo = /email|phone|tel|mobile|address|linkedin/i.test(content);
  
  // Calculate format score
  const formatScore = 75; // Simplified for the test
  
  // Calculate content score
  const contentScore = 65; // Simplified for the test
  
  // Calculate South African context score
  const saContextScore = 80; // Simplified for the test
  
  // Calculate overall ATS score
  const overallScore = Math.round(
    formatScore * 0.3 + 
    contentScore * 0.4 + 
    saContextScore * 0.3
  );
  
  // Determine rating
  let rating = '';
  if (overallScore >= 80) rating = 'Excellent';
  else if (overallScore >= 65) rating = 'Good';
  else if (overallScore >= 50) rating = 'Average';
  else rating = 'Needs Improvement';
  
  // Determine SA relevance rating
  let saRelevance = 'Good';
  
  // Generate strengths
  const strengths = [
    'Well-structured CV with clear sections',
    'Effective use of bullet points improves readability',
    'Uses strong action verbs to highlight achievements',
    'Quantifies achievements with specific numbers',
    'Contains relevant skills that ATS systems look for'
  ];
  
  // Generate improvements
  const improvements = [
    'Add more industry-relevant skills and keywords',
    'Include clear date ranges for education and work experience',
    'Consider adding B-BBEE status information if applicable',
    'Add NQF levels to your qualifications',
    'Include your location in South Africa'
  ];
  
  // Format feedback
  const formatFeedback = [
    'Shorten your bullet points to 1-2 lines each',
    'Add complete contact information (phone, email, LinkedIn)',
    'Consider shortening your CV to 2-3 pages maximum'
  ];
  
  // Return analysis result
  return {
    overall_score: overallScore,
    rating,
    strengths,
    improvements,
    format_feedback: formatFeedback,
    skills_identified: COMMON_SKILLS.slice(0, 8),
    sa_score: saContextScore,
    sa_relevance: saRelevance
  };
}

// Test API endpoints
app.post('/api/analyze-cv-text', (req, res) => {
  const { text, jobDescription } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: "CV text is required" });
  }
  
  // Analyze the CV text
  const analysis = analyzeCVText(text);
  
  // Return results
  res.json({
    score: analysis.overall_score,
    rating: analysis.rating,
    strengths: analysis.strengths.slice(0, 3),
    weaknesses: analysis.improvements.slice(0, 3),
    suggestions: analysis.format_feedback.slice(0, 2),
    sa_score: analysis.sa_score,
    sa_relevance: analysis.sa_relevance,
    skills: analysis.skills_identified,
    job_match: jobDescription ? {
      matchScore: 70,
      jobRelevance: "Medium"
    } : null
  });
});

app.post('/api/analyze-resume-text', (req, res) => {
  const { resumeContent, jobDescription } = req.body;
  
  if (!resumeContent) {
    return res.status(400).json({ error: "Resume content is required" });
  }
  
  // Use the CV analyzer
  const analysis = analyzeCVText(resumeContent);
  
  // Return results
  res.json({
    score: analysis.overall_score,
    rating: analysis.rating,
    strengths: analysis.strengths.slice(0, 3),
    weaknesses: analysis.improvements.slice(0, 3),
    suggestions: analysis.format_feedback.slice(0, 2),
    sa_score: analysis.sa_score,
    sa_relevance: analysis.sa_relevance,
    skills: analysis.skills_identified,
    job_match: jobDescription ? {
      matchScore: 70,
      jobRelevance: "Medium"
    } : null
  });
});

// Start the server
app.listen(port, () => {
  console.log(`ATS analyzer test server running on port ${port}`);
});

// Export functions for testing
module.exports = { analyzeCVText };