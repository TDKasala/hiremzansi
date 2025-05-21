/**
 * Optimized xAI Service for CV Analysis
 * 
 * This service provides an optimized implementation of the xAI Grok API integration
 * with specific focus on mobile-first performance (<2s load on 3G, <500KB/page)
 */

import OpenAI from "openai";

// Initialize xAI client using the X.AI API
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

// Define analysis response type with optimized structure
interface AnalysisResponse {
  success: boolean;
  result?: {
    score: number;
    rating: string;
    skills_score: number; 
    format_score: number;
    sa_score: number;
    strengths: string[];
    improvements: string[];
    skills: string[];
    sa_context: {
      bbbee: string[];
      nqf: string[];
      locations: string[];
      regulations: string[];
      languages: string[];
    };
  };
  error?: string;
}

/**
 * Analyze CV content using xAI's Grok model with optimized prompting
 * and response handling for mobile-first performance
 * 
 * @param cvText CV text content to analyze
 * @param jobDescription Optional job description for targeted analysis
 * @returns Optimized analysis with South African context scoring
 */
export async function analyzeCV(
  cvText: string, 
  jobDescription?: string
): Promise<AnalysisResponse> {
  try {
    console.log("Starting optimized CV analysis with AI");
    
    // Extract a summary of the CV to reduce payload size
    const summarizedCV = summarizeCV(cvText);
    
    // Create optimized prompt with reduced token count
    const optimizedPrompt = createOptimizedPrompt(summarizedCV, jobDescription);
    
    // Try xAI first if available
    if (process.env.XAI_API_KEY) {
      try {
        console.log("Attempting analysis with xAI");
        
        // Send optimized request to xAI
        const response = await xai.chat.completions.create({
          model: "grok-2-1212", // Using Grok 2 model for analysis
          messages: [
            { 
              role: "system", 
              content: "You are an ATS expert for South African job market, focusing on concise analysis." 
            },
            { role: "user", content: optimizedPrompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 800, // Reduced token limit for faster response
          temperature: 0.1 // Lower temperature for more consistent results
        });
        
        // Parse and retain comprehensive analysis while optimizing response structure
        const rawResult = JSON.parse(response.choices[0].message.content || '{}');
        const enhancedResult = optimizeResponseFormat(rawResult);
        
        return {
          success: true,
          result: enhancedResult
        };
      } catch (xaiError: any) {
        console.log("xAI analysis failed, trying fallback options:", xaiError.message);
        // Continue to fallback options
      }
    }
    
    // Try OpenAI as backup if available
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log("Attempting analysis with OpenAI");
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // Using GPT-4o model for analysis
          messages: [
            { 
              role: "system", 
              content: "You are an ATS expert for South African job market, focusing on concise analysis." 
            },
            { role: "user", content: optimizedPrompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 800,
          temperature: 0.1
        });
        
        const rawResult = JSON.parse(response.choices[0].message.content || '{}');
        const enhancedResult = optimizeResponseFormat(rawResult);
        
        return {
          success: true,
          result: enhancedResult
        };
      } catch (openaiError: any) {
        console.log("OpenAI analysis failed, using local analysis:", openaiError.message);
        // Continue to local fallback
      }
    }
    
    // If both AI options failed, use local analysis
    console.log("Using local fallback analysis");
    return provideFallbackAnalysis(cvText);
    
  } catch (error: any) {
    console.error("Error in AI CV analysis:", error);
    // Always provide a result even if everything fails
    return provideFallbackAnalysis(cvText);
  }
}

/**
 * Provide a local fallback analysis when AI services are unavailable
 * This ensures mobile users always get a response
 */
function provideFallbackAnalysis(cvText: string): AnalysisResponse {
  console.log("Using local fallback analysis method");
  
  // Calculate some basic metrics from the CV text
  const text = cvText.toLowerCase();
  const wordCount = text.split(/\s+/).length;
  const hasContactInfo = /email|phone|tel|contact|address/.test(text);
  const hasEducation = /education|university|college|school|degree|diploma/.test(text);
  const hasExperience = /experience|work|employment|job|position|career/.test(text);
  const hasSkills = /skills|abilities|competencies|proficient|experienced in/.test(text);
  
  // South African context detection
  const hasBBBEE = /b-bbee|bbbee|bee|black economic empowerment|level \d/.test(text);
  const hasNQF = /nqf|national qualifications framework|level \d/.test(text);
  const saCities = ['johannesburg', 'cape town', 'durban', 'pretoria', 'bloemfontein', 'port elizabeth'].filter(city => text.includes(city));
  const saLanguages = ['english', 'afrikaans', 'zulu', 'xhosa', 'sotho', 'tswana'].filter(lang => text.includes(lang));
  
  // Calculate a basic score based on CV content
  let score = 0;
  if (wordCount > 300) score += 10;
  if (wordCount > 600) score += 10;
  if (hasContactInfo) score += 15;
  if (hasEducation) score += 15;
  if (hasExperience) score += 15;
  if (hasSkills) score += 15;
  if (hasBBBEE) score += 10;
  if (hasNQF) score += 5;
  score += saCities.length * 2;
  score += saLanguages.length * 3;
  
  // Clamp score to 0-100
  score = Math.min(100, Math.max(0, score));
  
  // Calculate component scores
  const formatScore = Math.min(40, Math.floor(score * 0.4));
  const skillsScore = Math.min(40, Math.floor(score * 0.4));
  const saScore = Math.min(20, Math.floor(score * 0.2));
  
  // Determine rating based on score
  let rating = 'Poor';
  if (score >= 80) rating = 'Excellent';
  else if (score >= 65) rating = 'Good';
  else if (score >= 50) rating = 'Average';
  
  // Extract skills from text using basic pattern matching
  const skillsPattern = /\b(microsoft|excel|word|powerpoint|leadership|management|communication|teamwork|problem[-\s]solving|customer service|sales|marketing|research|analysis|development|programming|design|project management|accounting|finance|administration|operations|logistics|procurement|human resources|training|coaching|mentoring|negotiation|presentation|reporting|budgeting|forecasting|planning|strategy|organization|time management|detail[-\s]oriented|creative|innovative|adaptable|flexible|resilient|proactive|motivated|driven|results[-\s]oriented)\b/gi;
  const skills = [...new Set(text.match(skillsPattern) || [])].slice(0, 15);
  
  return {
    success: true,
    result: {
      score: score,
      rating: rating,
      skills_score: skillsScore,
      format_score: formatScore,
      sa_score: saScore,
      strengths: [
        hasContactInfo ? "Contact information is clearly provided" : "CV has a professional structure",
        hasEducation ? "Education section is well formatted" : "Layout is consistent throughout the document",
        hasExperience ? "Work experience is detailed and comprehensive" : "Content is presented in a readable format"
      ],
      improvements: [
        "Consider adding more detailed accomplishments with quantifiable results",
        "Add industry-specific keywords to improve ATS compatibility",
        hasBBBEE ? "Continue highlighting B-BBEE status for South African employers" : "Consider including B-BBEE status if applicable"
      ],
      skills: skills,
      sa_context: {
        bbbee: hasBBBEE ? ["B-BBEE mentioned"] : [],
        nqf: hasNQF ? ["NQF level mentioned"] : [],
        locations: saCities,
        regulations: [],
        languages: saLanguages
      }
    }
  };
}

/**
 * Create an optimized prompt for xAI analysis with reduced token count
 * 
 * @param cvText Summarized CV text
 * @param jobDescription Optional job description
 * @returns Optimized prompt string
 */
function createOptimizedPrompt(cvText: string, jobDescription?: string): string {
  return `
You are an expert ATS (Applicant Tracking System) analyzer specialized in the South African job market.

Analyze the provided CV text with thorough attention to detail while ensuring efficient processing. If no CV text is provided, return general ATS optimization guidelines for the South African job market. If a job description is provided, tailor the analysis to align with its requirements; otherwise, assume a general professional role in South Africa.

${cvText}

${jobDescription ? `${jobDescription}` : ''}

Provide a comprehensive analysis with the following components:

Overall ATS Compatibility Score (0-100 scale):
Calculate based on format (40%), skills (40%), and South African context (20%).
Format subcomponents (total 40 points): professional layout (10), consistent headers/sections (8), bullet point usage (8), date formats (e.g., YYYY-MM or MM/YYYY, 6), readable font/spacing (e.g., Arial 10-12pt, 8).
Skills subcomponents (total 40 points): technical skills (10), soft skills (8), certifications/qualifications (8), work experience alignment (8), keyword optimization (6).
South African context subcomponents (total 20 points): B-BBEE mentions (up to 6), NQF levels (up to 4), locations (up to 4), regulations (up to 3), languages (up to 3).
Provide detailed reasoning for the score, including how each subcomponent contributes.

Format Evaluation (40% of total score):
Assess professional layout (e.g., clear section titles like "Work Experience," "Education").
Check for consistent headers and sections (e.g., uniform formatting, no missing sections).
Evaluate use of bullet points for readability and ATS compatibility.
Verify date formats (e.g., YYYY-MM or MM/YYYY, no text-based months).
Confirm readable font (e.g., Arial, Times New Roman, 10-12pt) and consistent spacing.
Ensure no graphics, tables, or headers/footers that may disrupt ATS parsing.
Flag missing standard sections (e.g., education, work experience) if applicable.

Skills Identification (40% of total score):
Identify relevant technical skills (e.g., Python, project management) and soft skills (e.g., teamwork, communication) based on job description or general South African market demands.
Evaluate certifications and qualifications for relevance and clarity.
Assess work experience alignment with job requirements or industry standards.
Weight high-demand South African skills (e.g., cloud computing, data analysis, financial compliance) 1.5x higher, using real-time data from X posts or job market reports if needed.
Optimize for ATS keywords by checking for industry-specific terms and repetition in context.

South African Context Detection (20% of score):
Detect B-BBEE status mentions (e.g., Level 1, Level 2) and assign up to 6 points based on relevance.
Identify NQF levels in qualifications (e.g., NQF 7) and assign up to 4 points for correct usage.
Recognize South African cities/provinces (e.g., Cape Town, Gauteng) and assign up to 4 points.
Identify local regulations (e.g., POPIA, FICA, Labour Relations Act) and assign up to 3 points.
Detect South African languages (e.g., isiZulu, Afrikaans, excluding English) and assign up to 3 points.
If no context elements are detected, provide default suggestions for inclusion.

Return a JSON response with these fields:
{
  "score": number (0-100),
  "rating": string ("Excellent" for 80-100, "Good" for 60-79, "Average" for 40-59, "Poor" for 0-39),
  "skill_score": number (0-40),
  "format_score": number (0-40),
  "sa_score": number (0-20),
  "strengths": array of strings (3-5 key strengths with detailed descriptions tied to ATS or South African market),
  "improvements": array of strings (3-5 actionable suggestions linked to ATS optimization or South African context),
  "skills": array of strings (all identified skills, prioritized by relevance to job or market),
  "south_african_context": {
    "b_bbee_mentions": array of strings (any B-BBEE mentions found or "None"),
    "nqf_levels": array of strings (any NQF levels mentioned or "None"),
    "locations": array of strings (South African cities/provinces found or "None"),
    "regulations": array of strings (South African regulations identified or "None"),
    "languages": array of strings (South African languages found, excluding English, or "None")
  }
}
`;
}

/**
 * Summarize CV text to reduce token count for analysis
 * 
 * @param cvText Original CV text
 * @returns Summarized CV text
 */
function summarizeCV(cvText: string): string {
  // Remove excessive whitespace
  let summarized = cvText.replace(/\s+/g, ' ').trim();
  
  // If CV is over 3000 characters, summarize it
  if (summarized.length > 3000) {
    // Keep key sections by identifying headers and extracting important content
    const sections = [
      'PROFILE', 'SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 
      'CERTIFICATIONS', 'LANGUAGES', 'CONTACT'
    ];
    
    let extractedSections = '';
    
    // Extract sections that are most relevant for analysis
    for (const section of sections) {
      const regex = new RegExp(`(${section}|${section.toLowerCase()}|${section.charAt(0)}${section.slice(1).toLowerCase()}).*?(?=\\n\\s*\\n|$)`, 's');
      const match = summarized.match(regex);
      if (match) {
        extractedSections += match[0] + '\n\n';
      }
    }
    
    // If extracted sections are substantial, use them; otherwise use the first 3000 chars
    summarized = extractedSections.length > 1000 ? extractedSections : summarized.substring(0, 3000);
  }
  
  return summarized;
}

/**
 * Optimize the response format for reduced payload size
 * 
 * @param rawResult Raw result from xAI
 * @returns Optimized result structure
 */
function optimizeResponseFormat(rawResult: any): any {
  // Transform data structure while preserving comprehensive analysis
  const enhanced = {
    // Core scores for immediate display
    score: rawResult.overall_score || rawResult.score || 0,
    rating: rawResult.rating || 'Unknown',
    skills_score: rawResult.skill_score || rawResult.skills_score || 0,
    format_score: rawResult.format_score || 0,
    sa_score: rawResult.sa_score || rawResult.sa_context_score || 0,
    
    // Preserve all strengths for detailed analysis
    strengths: rawResult.strengths || [],
    
    // Keep all improvements for comprehensive feedback
    improvements: rawResult.improvements || [],
    
    // Maintain full skills list for complete assessment
    skills: rawResult.skills_identified || rawResult.skills || [],
    
    // Preserve all South African context data
    sa_context: {
      bbbee: rawResult.south_african_context?.b_bbee_mentions || [],
      nqf: rawResult.south_african_context?.nqf_levels || [],
      locations: rawResult.south_african_context?.locations || [],
      regulations: rawResult.south_african_context?.regulations || [],
      languages: rawResult.south_african_context?.languages || []
    }
  };
  
  return enhanced;
}

/**
 * Lightweight connection test function
 */
export async function testConnectionLightweight(): Promise<boolean> {
  try {
    if (!process.env.XAI_API_KEY) {
      return false;
    }
    
    const response = await xai.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: "Reply with 'OK'" }],
      max_tokens: 5
    });
    
    const content = response.choices[0].message.content || '';
    return content.includes("OK");
  } catch (error) {
    return false;
  }
}

export default {
  analyzeCV,
  testConnectionLightweight
};