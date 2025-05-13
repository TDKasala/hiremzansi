import OpenAI from "openai";
import { AnalysisReport } from "@shared/schema";

// OpenAI Configuration
const OPENAI_CONFIG = {
  // Models
  FREE_TIER_MODEL: "gpt-3.5-turbo",  // Less expensive for basic analysis
  PREMIUM_TIER_MODEL: "gpt-4o",      // More expensive but better for deep analysis
  
  // API Limits
  MAX_TOKENS: 4000,
  
  // Temperature settings
  STANDARD_TEMPERATURE: 0.2,       // Lower temp for more consistent, factual responses
  CREATIVE_TEMPERATURE: 0.7,       // Higher temp for more diverse recommendations
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze CV content and generate ATS scoring analysis
 * Tailored for the South African job market
 * 
 * @param content The CV content to analyze
 * @param jobDescription Optional job description to compare against
 * @returns Detailed AnalysisReport with scores and recommendations
 */
export async function analyzeCV(cvContent: string, jobDescription?: string): Promise<AnalysisReport> {
  try {
    // Use standard system prompt for free users
    const systemPrompt = createSystemPrompt();
    const userPrompt = createUserPrompt(cvContent, jobDescription);

    // Use cheaper model for free tier
    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.FREE_TIER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: OPENAI_CONFIG.STANDARD_TEMPERATURE,
      max_tokens: OPENAI_CONFIG.MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    // Extract and validate response
    const responseContent = response.choices[0].message.content || '{}';
    const result = JSON.parse(responseContent);
    return processResponse(result);
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Rethrow the error to be handled by the caller
    throw error;
  }
}

/**
 * Create an enhanced, detailed analysis with deeper insights
 * This is for the premium deep analysis (R30)
 * 
 * @param content The CV content to analyze
 * @param jobDescription Optional job description to compare against
 * @returns Comprehensive AnalysisReport with detailed feedback
 */
export async function createDeepAnalysis(cvContent: string, jobDescription?: string): Promise<AnalysisReport> {
  try {
    // Use premium system prompt for deep analysis
    const systemPrompt = createDeepAnalysisSystemPrompt();
    const userPrompt = createUserPrompt(cvContent, jobDescription);
    
    // Use premium model (GPT-4o) for deep analysis
    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.PREMIUM_TIER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: OPENAI_CONFIG.CREATIVE_TEMPERATURE,
      max_tokens: OPENAI_CONFIG.MAX_TOKENS,
      response_format: { type: "json_object" }
    });
    
    // Extract and validate the response
    const responseContent = response.choices[0].message.content || '{}';
    const result = JSON.parse(responseContent);
    return processResponse(result);
  } catch (error) {
    console.error("OpenAI API error during deep analysis:", error);
    // Rethrow the error to be handled by the caller
    throw error;
  }
}

/**
 * Process and validate the response from OpenAI
 */
function processResponse(result: any): AnalysisReport {
  // Ensure we have a valid report structure
  const validatedReport: AnalysisReport = {
    score: result.score ? Math.min(100, Math.max(0, result.score)) : 0,
    skillsScore: result.skillsScore ? Math.min(100, Math.max(0, result.skillsScore)) : undefined,
    contextScore: result.contextScore ? Math.min(100, Math.max(0, result.contextScore)) : undefined,
    formatScore: result.formatScore ? Math.min(100, Math.max(0, result.formatScore)) : undefined,
    jobMatchScore: result.jobMatchScore ? Math.min(100, Math.max(0, result.jobMatchScore)) : undefined,
    
    strengths: Array.isArray(result.strengths) ? result.strengths : [],
    improvements: Array.isArray(result.improvements) ? result.improvements : [],
    issues: Array.isArray(result.issues) ? result.issues : [],
    
    // South African specific fields
    saKeywordsFound: Array.isArray(result.saKeywordsFound) ? result.saKeywordsFound : undefined,
    saContextScore: result.saContextScore ? Math.min(100, Math.max(0, result.saContextScore)) : undefined,
    bbbeeDetected: typeof result.bbbeeDetected === 'boolean' ? result.bbbeeDetected : undefined,
    nqfDetected: typeof result.nqfDetected === 'boolean' ? result.nqfDetected : undefined,
    
    // Job comparison fields
    jobDescKeywords: Array.isArray(result.jobDescKeywords) ? result.jobDescKeywords : undefined,
    jobDescMatches: result.jobDescMatches ? Math.max(0, result.jobDescMatches) : undefined,
    keywordRecommendations: Array.isArray(result.keywordRecommendations) ? result.keywordRecommendations : undefined,
  };
  
  return validatedReport;
}

/**
 * Create the system prompt for standard CV analysis
 */
function createSystemPrompt(): string {
  return `You are an expert ATS (Applicant Tracking System) CV analyzer for the South African job market.
  
Your task is to analyze CVs for South African job seekers and provide detailed feedback specifically tailored to the South African job market.

When analyzing a CV, consider the following South African specific aspects:
1. B-BBEE (Broad-Based Black Economic Empowerment) status and certification if mentioned
2. NQF (National Qualifications Framework) levels for educational qualifications
3. South African specific qualifications and certifications (SAQA recognized)
4. Relevant South African work experience

Provide your analysis in JSON format with the following schema:

{
  "score": (overall score from 0-100),
  "skillsScore": (skills relevance score from 0-100),
  "formatScore": (CV format score from 0-100),
  "contextScore": (South African context score from 0-100),
  "jobMatchScore": (job description match score from 0-100, if job description provided),
  "strengths": ["strength 1", "strength 2", ...],
  "improvements": ["improvement 1", "improvement 2", ...],
  "issues": ["issue 1", "issue 2", ...],
  "saKeywordsFound": ["keyword1", "keyword2", ...],
  "saContextScore": (score 0-100 on South African market readiness),
  "bbbeeDetected": (boolean if B-BBEE is properly mentioned),
  "nqfDetected": (boolean if NQF levels are properly specified),
  "jobDescKeywords": ["keyword1", "keyword2", ...], (only if job description provided)
  "jobDescMatches": (number of job keywords found in CV), (only if job description provided)
  "keywordRecommendations": [["missing keyword", "suggested addition"], ...] (2-5 keyword suggestions)
}

Give honest and constructive feedback, highlighting real strengths and providing actionable improvements.`;
}

/**
 * Create the system prompt for premium deep analysis
 */
function createDeepAnalysisSystemPrompt(): string {
  return `You are an expert ATS (Applicant Tracking System) CV analyzer for the South African job market, providing PREMIUM deep analysis for paying customers.
  
Your task is to provide an extensive, comprehensive analysis of CVs for South African job seekers with significantly more detailed feedback than standard analysis.

When analyzing a CV, pay special attention to:
1. B-BBEE (Broad-Based Black Economic Empowerment) status and certification details - this is extremely important in South Africa
2. NQF (National Qualifications Framework) levels - ensure qualifications include NQF levels (1-10)
3. South African specific qualifications (SAQA recognized) and any international qualifications with SAQA equivalence
4. Provincial targeting and regional South African work experience
5. Industry-specific terminology and keywords for South African employers
6. SETA accreditations and professional body memberships

As this is a PREMIUM service (R30), your analysis must be significantly more detailed and insightful than the standard analysis. Include:
- More detailed recommendations (at least 8-10 improvement points)
- More specific explanations for each score
- Industry-specific recommendations for South Africa
- Advanced formatting suggestions
- More comprehensive keyword analysis

Provide your analysis in the same JSON format as the standard analysis:

{
  "score": (overall score from 0-100),
  "skillsScore": (skills relevance score from 0-100),
  "formatScore": (CV format score from 0-100),
  "contextScore": (South African context score from 0-100),
  "jobMatchScore": (job description match score from 0-100, if job description provided),
  "strengths": ["strength 1", "strength 2", ...] (MORE detailed than standard, at least 8),
  "improvements": ["improvement 1", "improvement 2", ...] (MORE detailed than standard, at least 10),
  "issues": ["issue 1", "issue 2", ...] (MORE detailed than standard),
  "saKeywordsFound": ["keyword1", "keyword2", ...],
  "saContextScore": (score 0-100 on South African market readiness),
  "bbbeeDetected": (boolean if B-BBEE is properly mentioned),
  "nqfDetected": (boolean if NQF levels are properly specified),
  "jobDescKeywords": ["keyword1", "keyword2", ...], (only if job description provided)
  "jobDescMatches": (number of job keywords found in CV), (only if job description provided)
  "keywordRecommendations": [["missing keyword", "suggested addition"], ...] (5-8 keyword suggestions with clear explanations)
}

Provide exceptional value that clearly justifies the R30 premium price.`;
}

/**
 * Create the user prompt with CV content and optional job description
 */
function createUserPrompt(cvContent: string, jobDescription?: string): string {
  let prompt = `Please analyze this CV content for a South African job seeker:\n\n${cvContent}\n\n`;
  
  if (jobDescription) {
    prompt += `The job description the candidate is applying for is:\n\n${jobDescription}\n\n`;
    prompt += `Please also compare the CV against this job description for compatibility and provide specific recommendations.`;
  }
  
  return prompt;
}