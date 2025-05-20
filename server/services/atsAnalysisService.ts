import { analyzeCV as analyzeWithXAI } from './xaiService';
import { CV } from '@shared/schema';
import { sanitizeHtml } from '../utils/textUtil';

/**
 * ATS Analysis Service
 * 
 * Handles CV analysis using the xAI API for detailed ATS compatibility scoring
 * and South African job market relevance assessment
 */

interface AnalysisResult {
  success: boolean;
  score?: number;
  rating?: string;
  strengths?: string[];
  improvements?: string[];
  skills?: string[];
  skillsScore?: number;
  formatScore?: number;
  contextScore?: number;
  saKeywordsFound?: string[];
  error?: string;
}

/**
 * Process and analyze a CV for ATS compatibility
 * 
 * @param cv CV object containing content to analyze
 * @param jobDescription Optional job description for targeted analysis
 * @returns Detailed analysis result
 */
export async function analyzeCVContent(
  cv: CV, 
  jobDescription?: string
): Promise<AnalysisResult> {
  try {
    // Process the CV content for analysis
    let textContent = cv.content || "";
    
    // Check and sanitize content if it's HTML
    if (
      textContent.includes('<!DOCTYPE') || 
      textContent.includes('<html') || 
      textContent.includes('<body') ||
      (textContent.includes('<') && textContent.includes('>'))
    ) {
      console.log("Detected HTML content, sanitizing for analysis");
      textContent = sanitizeHtml(textContent);
    }
    
    // Analyze the CV using xAI
    const analysis = await analyzeWithXAI(textContent, jobDescription);
    
    if (!analysis.success || !analysis.result) {
      return {
        success: false,
        error: analysis.error || "Failed to analyze CV with AI service"
      };
    }
    
    // Extract the relevant information from the AI service response
    const result = analysis.result;
    
    // Prepare the standardized response format
    return {
      success: true,
      score: result.overall_score,
      rating: result.rating,
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      skills: result.skills_identified || [],
      skillsScore: result.skill_score,
      formatScore: result.format_score,
      contextScore: result.sa_score,
      saKeywordsFound: result.south_african_context ? [
        ...(result.south_african_context.b_bbee_mentions || []),
        ...(result.south_african_context.nqf_levels || []),
        ...(result.south_african_context.locations || []),
        ...(result.south_african_context.regulations || []),
        ...(result.south_african_context.languages || [])
      ] : []
    };
  } catch (error: any) {
    console.error('Error in ATS analysis service:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during CV analysis'
    };
  }
}

/**
 * Utility function for organizing the analysis results into a user-friendly format
 */
export function formatAnalysisForResponse(analysis: any): any {
  // Format the analysis result for the API response
  // This can be used to standardize the output from different AI services
  return {
    success: true,
    score: analysis.score,
    rating: analysis.rating,
    strengths: analysis.strengths || [],
    improvements: analysis.improvements || [],
    skills: analysis.skills || [],
    skillsScore: analysis.skillsScore,
    formatScore: analysis.formatScore,
    contextScore: analysis.contextScore,
    saKeywordsFound: analysis.saKeywordsFound || [],
    breakdown: {
      skills_weight: "40%",
      format_weight: "40%",
      sa_context_weight: "20%"
    }
  };
}

/**
 * Analyze CV with job description for targeted recommendations
 */
export async function analyzeCVForJobMatch(
  cv: CV,
  jobDescription: string
): Promise<any> {
  const analysis = await analyzeCVContent(cv, jobDescription);
  return formatAnalysisForResponse(analysis);
}

export default {
  analyzeCVContent,
  formatAnalysisForResponse,
  analyzeCVForJobMatch
};