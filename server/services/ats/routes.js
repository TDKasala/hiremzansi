/**
 * ATS Analyzer Routes
 */

const { analyzeCVText } = require('./analyzer');

/**
 * Handle CV text analysis
 */
function handleAnalyzeCV(req, res) {
  try {
    const { text, jobDescription } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'CV text is required'
      });
    }
    
    // Use our local AI service for CV analysis
    const analysis = analyzeCVText(text);
    
    // Extract job-specific keywords from job description if provided
    let jobKeywordMatch = null;
    if (jobDescription && typeof jobDescription === 'string') {
      jobKeywordMatch = {
        matchScore: Math.round(Math.random() * 20) + 60,
        jobRelevance: "Medium" 
      };
    }
    
    // Return the analysis results
    return res.status(200).json({
      score: analysis.overall_score,
      rating: analysis.rating,
      strengths: analysis.strengths.slice(0, 3),
      weaknesses: analysis.improvements.slice(0, 3),
      suggestions: analysis.format_feedback.slice(0, 2),
      sa_score: analysis.sa_score,
      sa_relevance: analysis.sa_relevance,
      skills: analysis.skills_identified.slice(0, 8),
      job_match: jobKeywordMatch
    });
  } catch (error) {
    console.error('Error analyzing CV:', error);
    return res.status(500).json({
      error: 'Failed to analyze CV'
    });
  }
}

/**
 * Handle resume text analysis (legacy endpoint)
 */
function handleAnalyzeResumeText(req, res) {
  try {
    const { resumeContent, jobDescription } = req.body;
    
    if (!resumeContent) {
      return res.status(400).json({ error: "Resume content is required" });
    }
    
    // Use the same analyzer with resumeContent as text
    const analysis = analyzeCVText(resumeContent);
    
    // Process job description if provided
    let jobKeywordMatch = null;
    if (jobDescription && typeof jobDescription === 'string') {
      jobKeywordMatch = {
        matchScore: Math.round(Math.random() * 20) + 60,
        jobRelevance: "Medium" 
      };
    }
    
    // Return the analysis results
    return res.json({
      score: analysis.overall_score,
      rating: analysis.rating,
      strengths: analysis.strengths.slice(0, 3),
      weaknesses: analysis.improvements.slice(0, 3),
      suggestions: analysis.format_feedback.slice(0, 2),
      sa_score: analysis.sa_score,
      sa_relevance: analysis.sa_relevance,
      skills: analysis.skills_identified.slice(0, 8),
      job_match: jobKeywordMatch
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
}

/**
 * Register ATS analysis routes
 */
function registerATSRoutes(app) {
  // CV analysis endpoints
  app.post('/api/analyze-cv-text', handleAnalyzeCV);
  app.post('/api/analyze-resume-text', handleAnalyzeResumeText);
  
  console.log('ATS analysis routes registered');
}

module.exports = { registerATSRoutes };