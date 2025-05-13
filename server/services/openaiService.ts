import OpenAI from "openai";
import { AnalysisReport } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyze CV content and generate ATS scoring analysis
 * Tailored for the South African job market
 * 
 * @param content The CV content to analyze
 * @param jobDescription Optional job description to compare against
 * @returns Detailed AnalysisReport with scores and recommendations
 */
export async function analyzeCV(content: string, jobDescription?: string): Promise<AnalysisReport> {
  try {
    const promptSystem = createSystemPrompt();
    const promptUser = createUserPrompt(content, jobDescription);

    // Use GPT-3.5 Turbo for free users (basic analysis)
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: promptSystem },
        { role: "user", content: promptUser }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return processResponse(result);
  } catch (error) {
    console.error("Error analyzing CV:", error);
    throw new Error("Failed to analyze CV content. Please try again.");
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
export async function createDeepAnalysis(content: string, jobDescription?: string): Promise<AnalysisReport> {
  try {
    const promptSystem = createDeepAnalysisSystemPrompt();
    const promptUser = createUserPrompt(content, jobDescription);

    // Use GPT-4o for premium paid analysis (R30 deep analysis)
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: promptSystem },
        { role: "user", content: promptUser }
      ],
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return processResponse(result);
  } catch (error) {
    console.error("Error creating deep analysis:", error);
    throw new Error("Failed to create deep analysis report. Please try again.");
  }
}

/**
 * Process and validate the response from OpenAI
 */
function processResponse(result: any): AnalysisReport {
  // Ensure all required fields exist with defaults if missing
  return {
    score: typeof result.score === 'number' ? result.score : 0,
    skillsScore: typeof result.skillsScore === 'number' ? result.skillsScore : undefined,
    contextScore: typeof result.contextScore === 'number' ? result.contextScore : undefined,
    formatScore: typeof result.formatScore === 'number' ? result.formatScore : undefined,
    jobMatchScore: typeof result.jobMatchScore === 'number' ? result.jobMatchScore : undefined,
    jobDescKeywords: Array.isArray(result.jobDescKeywords) ? result.jobDescKeywords : undefined,
    jobDescMatches: typeof result.jobDescMatches === 'number' ? result.jobDescMatches : undefined,
    strengths: Array.isArray(result.strengths) ? result.strengths : [],
    improvements: Array.isArray(result.improvements) ? result.improvements : [],
    issues: Array.isArray(result.issues) ? result.issues : [],
    saKeywordsFound: Array.isArray(result.saKeywordsFound) ? result.saKeywordsFound : undefined,
    saContextScore: typeof result.saContextScore === 'number' ? result.saContextScore : undefined,
    bbbeeDetected: typeof result.bbbeeDetected === 'boolean' ? result.bbbeeDetected : undefined,
    nqfDetected: typeof result.nqfDetected === 'boolean' ? result.nqfDetected : undefined,
    keywordRecommendations: Array.isArray(result.keywordRecommendations) ? result.keywordRecommendations : undefined,
  };
}

/**
 * Create the system prompt for standard CV analysis
 */
function createSystemPrompt(): string {
  return `You are ATSBoost, a professional CV analyzer specializing in the South African job market. Your task is to analyze CVs and provide detailed feedback tailored to South African hiring practices.

INSTRUCTIONS:
1. Evaluate the CV based on ATS compatibility, content quality, and alignment with South African standards.
2. Assess B-BBEE information, NQF levels, and South African-specific qualifications/certifications.
3. If a job description is provided, compare the CV against it for keyword matches and overall fit.
4. Generate actionable recommendations specific to South African job applications.
5. Return your analysis in the following JSON format ONLY:

{
  "score": [0-100 overall score],
  "skillsScore": [0-100 score for skills presentation],
  "contextScore": [0-100 score for content relevance],
  "formatScore": [0-100 score for ATS-friendly formatting],
  "jobMatchScore": [0-100 score for job fit, if job description provided],
  "jobDescKeywords": [array of 5-10 key terms from job description, if provided],
  "jobDescMatches": [number of job keywords found in CV],
  "strengths": [array of 3-5 strongest aspects of the CV],
  "improvements": [array of 3-5 actionable improvements],
  "issues": [array of specific formatting or content issues],
  "saKeywordsFound": [array of South African specific terms found],
  "saContextScore": [0-100 score for South African market relevance],
  "bbbeeDetected": [boolean indicating if B-BBEE status is mentioned],
  "nqfDetected": [boolean indicating if NQF levels are included],
  "keywordRecommendations": [array of arrays, each containing related keywords to add]
}

SPECIAL CONSIDERATIONS FOR SOUTH AFRICAN CONTEXT:
- Look for and evaluate B-BBEE (Broad-Based Black Economic Empowerment) status information
- Identify NQF (National Qualifications Framework) levels
- Note relevant South African certifications, associations, and qualifications
- Consider provincial/regional targeting if mentioned (Western Cape, Gauteng, etc.)
- Evaluate inclusion of South African ID number or citizenship/residency status where appropriate
- Assess for South African-specific industry terminology

Your analysis must be professional, constructive, and specifically tailored to the South African job market.`;
}

/**
 * Create the system prompt for premium deep analysis
 */
function createDeepAnalysisSystemPrompt(): string {
  return `You are ATSBoost Premium, an expert CV analyst specializing in the South African job market. Your task is to perform an in-depth professional analysis of CVs, providing comprehensive feedback tailored to South African hiring practices.

INSTRUCTIONS:
1. Perform a deep, thorough evaluation of the CV based on ATS compatibility, content quality, format, and alignment with South African standards.
2. Carefully assess B-BBEE information, NQF levels, and South African-specific qualifications/certifications.
3. If a job description is provided, perform detailed comparison against it for keyword matches, competency alignment, and overall fit.
4. Generate highly specific, actionable recommendations relevant to South African job seekers.
5. Return your comprehensive analysis in the following JSON format ONLY:

{
  "score": [0-100 overall score with precise breakdown],
  "skillsScore": [0-100 detailed score for skills presentation],
  "contextScore": [0-100 detailed score for content relevance],
  "formatScore": [0-100 detailed score for ATS-friendly formatting],
  "jobMatchScore": [0-100 detailed score for job fit, if job description provided],
  "jobDescKeywords": [extensive array of key terms from job description, if provided],
  "jobDescMatches": [detailed number of job keywords found in CV],
  "strengths": [comprehensive array of 5-8 strongest aspects of the CV with specific examples],
  "improvements": [comprehensive array of 5-8 detailed, actionable improvements with examples],
  "issues": [detailed array of specific formatting or content issues with remediation steps],
  "saKeywordsFound": [comprehensive array of South African specific terms found],
  "saContextScore": [0-100 detailed score for South African market relevance],
  "bbbeeDetected": [boolean indicating if B-BBEE status is mentioned, with assessment of presentation],
  "nqfDetected": [boolean indicating if NQF levels are included, with assessment of relevance],
  "keywordRecommendations": [extensive array of arrays, each containing related keywords to add, with context]
}

SPECIAL CONSIDERATIONS FOR SOUTH AFRICAN CONTEXT:
- Thoroughly evaluate B-BBEE (Broad-Based Black Economic Empowerment) status information and suggest improvements
- Analyze NQF (National Qualifications Framework) levels presentation and relevance
- Evaluate South African certifications, associations, qualifications in detail
- Assess provincial/regional targeting strategy (Western Cape, Gauteng, KwaZulu-Natal, etc.)
- Evaluate inclusion and presentation of South African ID number or citizenship/residency status
- Perform detailed assessment of South African-specific industry terminology usage
- Consider sectoral specifics (mining, finance, IT, etc.) in the South African context
- Assess alignment with Employment Equity considerations where relevant

Your analysis must be exceptionally thorough, professional, constructive, and specifically tailored to South African job market demands and standards.`;
}

/**
 * Create the user prompt with CV content and optional job description
 */
function createUserPrompt(content: string, jobDescription?: string): string {
  if (jobDescription) {
    return `Please analyze this CV for the South African job market:

CV CONTENT:
${content}

JOB DESCRIPTION:
${jobDescription}

Provide a detailed analysis with specific scores and recommendations.`;
  }

  return `Please analyze this CV for the South African job market:

CV CONTENT:
${content}

Provide a detailed analysis with specific scores and recommendations.`;
}