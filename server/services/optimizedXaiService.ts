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
    if (!process.env.XAI_API_KEY) {
      throw new Error("XAI_API_KEY is not set in environment variables");
    }
    
    console.log("Starting optimized CV analysis with xAI");
    
    // Extract a summary of the CV to reduce payload size
    const summarizedCV = summarizeCV(cvText);
    
    // Create optimized prompt with reduced token count
    const optimizedPrompt = createOptimizedPrompt(summarizedCV, jobDescription);
    
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
    
    // Parse and optimize the response
    const rawResult = JSON.parse(response.choices[0].message.content);
    const optimizedResult = optimizeResponseFormat(rawResult);
    
    return {
      success: true,
      result: optimizedResult
    };
  } catch (error: any) {
    console.error("Error in optimized xAI CV analysis:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze CV with xAI Grok API"
    };
  }
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

Analyze the following CV text with thorough attention to detail while maintaining fast performance:

${cvText}

${jobDescription ? `Consider relevance to this job description: ${jobDescription}` : ''}

Provide comprehensive analysis with these components:

1. Overall ATS compatibility score (0-100 scale):
   - Calculate based on format (40%), skills (40%), and South African context (20%)
   - Provide detailed reasoning for the score

2. Format evaluation (40% of total score):
   - Professional layout and structure
   - Consistent headers and sections
   - Proper use of bullet points
   - Appropriate date formats
   - Readable font and spacing
   - Clear organization of information

3. Skills identification (40% of total score):
   - Relevant technical skills
   - Soft skills appropriate for position level
   - Certifications and qualifications
   - Work experience alignment
   - High-demand skills in South Africa weighted 1.5x higher
   - Keywords optimization for ATS systems

4. South African context detection (20% of score):
   - B-BBEE status mentions (e.g., Level 1, Level 2) - 10 points per mention (max 20)
   - NQF levels in qualifications (5 points per correct level, max 10)
   - South African cities/provinces (2 points each, max 5 per category)
   - Local regulatory knowledge (POPIA, FICA, etc.) (3 points per mention, max 5)
   - South African languages (3 points per language, max 5)

Return a JSON response with these fields:
{
  "score": number (0-100),
  "rating": string ('Excellent', 'Good', 'Average', 'Poor'),
  "skill_score": number (0-40),
  "format_score": number (0-40),
  "sa_score": number (0-20),
  "strengths": array of strings (3-5 key strengths with thorough descriptions),
  "improvements": array of strings (3-5 detailed improvement suggestions),
  "skills": array of strings (all identified skills, prioritized by relevance),
  "south_african_context": {
    "b_bbee_mentions": array of strings (any B-BBEE mentions found),
    "nqf_levels": array of strings (any NQF levels mentioned),
    "locations": array of strings (South African cities/provinces found),
    "regulations": array of strings (South African regulations identified),
    "languages": array of strings (South African languages found)
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
  // Extract only the fields we need
  const optimized = {
    score: rawResult.overall_score || rawResult.score || 0,
    rating: rawResult.rating || 'Unknown',
    skills_score: rawResult.skill_score || rawResult.skills_score || 0,
    format_score: rawResult.format_score || 0,
    sa_score: rawResult.sa_score || rawResult.sa_context_score || 0,
    strengths: (rawResult.strengths || []).slice(0, 3), // Limit to top 3
    improvements: (rawResult.improvements || []).slice(0, 3), // Limit to top 3
    skills: (rawResult.skills_identified || rawResult.skills || []).slice(0, 15), // Limit skills list
    sa_context: {
      bbbee: (rawResult.south_african_context?.b_bbee_mentions || []).slice(0, 5),
      nqf: (rawResult.south_african_context?.nqf_levels || []).slice(0, 3),
      locations: (rawResult.south_african_context?.locations || []).slice(0, 5),
      regulations: (rawResult.south_african_context?.regulations || []).slice(0, 5),
      languages: (rawResult.south_african_context?.languages || []).slice(0, 5)
    }
  };
  
  return optimized;
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
    
    return response.choices[0].message.content.includes("OK");
  } catch (error) {
    return false;
  }
}

export default {
  analyzeCV,
  testConnectionLightweight
};