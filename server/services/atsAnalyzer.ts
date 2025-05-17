/**
 * ATS Analyzer Service
 * 
 * This service provides rule-based CV analysis for the South African job market
 * without requiring external API calls.
 */

import { Router, Request, Response, NextFunction } from 'express';

interface AnalysisResult {
  overall_score: number;
  rating: string;
  strengths: string[];
  improvements: string[];
  format_feedback: string[];
  skills_identified: string[];
  sa_score: number;
  sa_relevance: string;
}

// South African specific keywords
const SA_KEYWORDS = [
  "south africa", "sa", "cape town", "johannesburg", "pretoria", "durban", 
  "bloemfontein", "port elizabeth", "east london", "pietermaritzburg", "polokwane",
  "nelspruit", "kimberley", "rustenburg", "b-bbee", "bee", "bbbee", "nqf", "saqa", 
  "matric", "seta", "ieb", "unisa", "wits", "uct", "ukzn", "up", "uj", "ufs", "uwc",
  "tut", "cput", "vut", "cut", "dut", "nmmu", "spu", "sol plaatje", "rhodes", "ump",
  "zulu", "xhosa", "afrikaans", "sesotho", "setswana", "sepedi", "venda", "tsonga", 
  "swazi", "ndebele", "south african", "rsa", "republic of south africa"
];

// Common skills to detect
const COMMON_SKILLS = [
  "javascript", "python", "java", "c#", "c++", "react", "angular", "vue",
  "node.js", "express", "django", "flask", "spring", "asp.net", "php", "ruby",
  "html", "css", "sql", "nosql", "mongodb", "mysql", "postgresql", "oracle",
  "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "terraform",
  "typescript", "redux", "graphql", "rest api", "soap", "microservices", "agile",
  "scrum", "kanban", "jira", "confluence", "bitbucket", "github", "gitlab",
  "ci/cd", "testing", "tdd", "bdd", "junit", "jest", "mocha", "selenium",
  "cypress", "postman", "swagger", "oauth", "jwt", "authentication", "authorization"
];

// South African professional bodies and certifications
const SA_CERTIFICATIONS = [
  "sacnasp", "ecsa", "saica", "saipa", "iacsa", "cisa", "acca", "cia", "cfa", 
  "fpi", "sabpp", "pmsa", "saiee", "cssa", "icsa", "pmi-sa", "isaca", "iitpsa", 
  "bla", "saia", "asaqs", "sacpcmp", "sacap", "saci", "ilasa", "saiw", "plato", 
  "hpcsa", "sanc", "sapc", "sama", "sacssp", "sabs", "nrcs", "sanas", "sans"
];

/**
 * Analyze CV text and return detailed analysis results
 * 
 * @param text The CV text content to analyze
 * @returns Analysis result with scores, ratings, and recommendations
 */
export function analyzeCVText(text: string): AnalysisResult {
  const content = text.trim().toLowerCase();
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  // Check formatting factors
  const hasSections = /education|experience|skills|qualifications|work history|employment|references|personal details/i.test(content);
  const hasBulletPoints = /•|-|\*/i.test(content);
  const hasContactInfo = /email|phone|tel|mobile|address|linkedin/i.test(content);
  const hasDateRanges = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec).+?-|to\b.+?(20\d{2}|present)/i.test(content);
  const hasDates = /\b(20\d{2}|19\d{2})\b/i.test(content);
  
  // Calculate format score
  const formatScore = Math.round(
    (hasSections ? 25 : 0) +
    (hasBulletPoints ? 25 : 0) +
    (hasContactInfo ? 20 : 0) +
    (hasDateRanges ? 15 : 0) +
    (hasDates ? 15 : 0)
  );
  
  // Check content quality
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  const hasActionVerbs = /\b(managed|developed|created|implemented|led|designed|improved|increased|reduced|achieved|launched|organized|coordinated|established|executed|generated|maintained|negotiated|operated|performed|planned|resolved|supervised|trained|transformed|won|delivered|enabled|guided)\b/i.test(content);
  const hasNumbers = /\b\d+%|\d+ percent|increased by \d+|decreased by \d+|reduced \d+|improved \d+|generated \d+|saved \d+|over \d+|more than \d+/i.test(content);
  const hasKeySkills = COMMON_SKILLS.some(skill => content.includes(skill.toLowerCase()));
  
  // Calculate content score
  const contentScore = Math.round(
    (avgLineLength > 30 && avgLineLength < 200 ? 25 : 0) +
    (hasActionVerbs ? 25 : 0) +
    (hasNumbers ? 25 : 0) +
    (hasKeySkills ? 25 : 0)
  );
  
  // Calculate South African context score
  const foundSaKeywords = SA_KEYWORDS.filter(keyword => content.includes(keyword.toLowerCase()));
  const foundSaCertifications = SA_CERTIFICATIONS.filter(cert => content.includes(cert.toLowerCase()));
  
  const hasB_BBEE = /\b(b-bbee|bbbee|bee|broad.based black economic empowerment|level \d b-bbee|previously disadvantaged|employment equity|affirmative action)\b/i.test(content);
  const hasNQF = /\bnqf level \d+\b|national qualifications framework|saqa/i.test(content);
  const hasSaAddress = /\b(south africa|gauteng|western cape|eastern cape|northern cape|kwazulu-natal|kzn|free state|north west|limpopo|mpumalanga)\b/i.test(content);
  const hasSaLanguages = /\b(zulu|xhosa|afrikaans|sesotho|setswana|sepedi|venda|tsonga|swazi|ndebele)\b/i.test(content);
  
  const saContextScore = Math.round(
    ((foundSaKeywords.length > 0 ? Math.min(foundSaKeywords.length * 5, 30) : 0)) +
    ((foundSaCertifications.length > 0 ? Math.min(foundSaCertifications.length * 10, 20) : 0)) +
    (hasB_BBEE ? 20 : 0) +
    (hasNQF ? 15 : 0) + 
    (hasSaAddress ? 10 : 0) +
    (hasSaLanguages ? 5 : 0)
  );
  
  // Extract skills
  const skillsFound = COMMON_SKILLS.filter(skill => 
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(content)
  );
  
  // Calculate overall ATS score (format, content, and SA context)
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
  let saRelevance = '';
  if (saContextScore >= 80) saRelevance = 'Excellent';
  else if (saContextScore >= 60) saRelevance = 'Good';
  else if (saContextScore >= 40) saRelevance = 'Average';
  else saRelevance = 'Low';
  
  // Generate strengths
  const strengths: string[] = [];
  
  if (hasSections) strengths.push('Well-structured CV with clear sections');
  if (hasBulletPoints) strengths.push('Effective use of bullet points improves readability');
  if (hasActionVerbs) strengths.push('Uses strong action verbs to highlight achievements');
  if (hasNumbers) strengths.push('Quantifies achievements with specific numbers and percentages');
  if (hasKeySkills) strengths.push('Contains relevant skills that ATS systems look for');
  if (hasDateRanges) strengths.push('Clear timeline of work experience');
  if (hasB_BBEE) strengths.push('Includes B-BBEE status, important for South African employers');
  if (hasNQF) strengths.push('Specifies NQF levels for qualifications, aligning with SA standards');
  if (hasSaAddress) strengths.push('Includes South African location information');
  if (foundSaKeywords.length > 3) strengths.push('Well-optimized for South African job market');
  if (foundSaCertifications.length > 0) strengths.push('Includes relevant South African certifications/professional bodies');
  
  // Generate improvements
  const improvements: string[] = [];
  
  if (!hasSections) improvements.push('Add clear section headings (Education, Experience, Skills, etc.)');
  if (!hasBulletPoints) improvements.push('Use bullet points to highlight achievements and responsibilities');
  if (!hasActionVerbs) improvements.push('Include strong action verbs to describe achievements');
  if (!hasNumbers) improvements.push('Quantify achievements with specific numbers and percentages');
  if (!hasKeySkills) improvements.push('Add industry-relevant skills and keywords');
  if (!hasDateRanges) improvements.push('Include clear date ranges for education and work experience');
  if (!hasB_BBEE && saContextScore < 60) improvements.push('Consider adding B-BBEE status information if applicable');
  if (!hasNQF && saContextScore < 60) improvements.push('Add NQF levels to your qualifications');
  if (!hasSaAddress && saContextScore < 60) improvements.push('Include your location in South Africa');
  if (foundSaCertifications.length === 0 && saContextScore < 60) improvements.push('Add relevant South African certifications or professional body memberships');
  if (lines.some(line => line.length > 200)) improvements.push('Shorten long paragraphs for better readability');
  
  // Format feedback
  const formatFeedback: string[] = [];
  
  if (avgLineLength > 200) formatFeedback.push('Shorten your bullet points to 1-2 lines each');
  if (!hasContactInfo) formatFeedback.push('Add complete contact information (phone, email, LinkedIn)');
  if (content.length > 5000) formatFeedback.push('Consider shortening your CV to 2-3 pages maximum');
  if (content.length < 1500) formatFeedback.push('Your CV may be too short - add more relevant details');
  if (!hasDates) formatFeedback.push('Add dates to your work experience and education sections');
  
  // Return the analysis result
  return {
    overall_score: overallScore,
    rating,
    strengths: shuffle(strengths),
    improvements: shuffle(improvements),
    format_feedback: shuffle(formatFeedback),
    skills_identified: shuffle(skillsFound.slice(0, 15)),
    sa_score: saContextScore,
    sa_relevance: saRelevance
  };
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Create a router for ATS analysis endpoints
export const atsRouter = Router();

// Analyze CV text directly
atsRouter.post('/analyze-cv-text', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, jobDescription } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'CV text is required'
      });
    }
    
    // Use local AI to analyze the CV text
    const analysis = analyzeCVText(text);
    
    // Extract job-specific keywords from job description if provided
    let jobKeywordMatch = null;
    if (jobDescription && typeof jobDescription === 'string') {
      // Could be enhanced to extract keywords from job description
      // and match them against the CV
      jobKeywordMatch = {
        matchScore: Math.round(Math.random() * 20) + 60, // Placeholder for now
        jobRelevance: "Medium" 
      };
    }
    
    // Return the analysis results in a format the frontend expects
    return res.status(200).json({
      success: true,
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
      success: false,
      error: 'Failed to analyze CV'
    });
  }
});

// Alternative endpoint for backward compatibility
atsRouter.post('/analyze-resume-text', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resumeContent, jobDescription } = req.body;
    
    if (!resumeContent || typeof resumeContent !== 'string' || resumeContent.trim().length === 0) {
      return res.status(400).json({ 
        error: "Resume content is required" 
      });
    }
    
    // Use our local AI service for CV analysis
    const analysis = analyzeCVText(resumeContent);
    
    // Extract job-specific keywords from job description if provided
    let jobKeywordMatch = null;
    if (jobDescription && typeof jobDescription === 'string') {
      // This could be enhanced to extract keywords from job description
      // and match them against the CV
      jobKeywordMatch = {
        matchScore: Math.round(Math.random() * 20) + 60, // Placeholder for now
        jobRelevance: "Medium" 
      };
    }
    
    // Return the analysis results in a structured format
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
    console.error("Error in CV analysis:", error);
    next(error);
  }
});