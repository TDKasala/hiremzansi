/**
 * Mock xAI Service for CV Analysis Testing
 * 
 * This service provides mock responses to simulate the xAI Grok API
 * for CV analysis with South African context scoring
 */

import { findSouthAfricanContext } from '../utils/textUtil';

// Define analysis response type (same as real service)
interface AnalysisResponse {
  success: boolean;
  result?: any;
  error?: string;
}

/**
 * Analyze CV content using a mock of xAI's Grok model
 * 
 * @param cvText CV text content to analyze
 * @param jobDescription Optional job description for targeted analysis
 * @returns Detailed mock analysis with South African context scoring
 */
export async function mockAnalyzeCV(
  cvText: string,
  jobDescription?: string
): Promise<AnalysisResponse> {
  try {
    console.log("Using mock xAI Grok API analysis");
    
    // Use our textUtil to find South African context
    const saContext = findSouthAfricanContext(cvText);
    
    // Count skills based on common skill keywords
    const skillKeywords = [
      'software', 'management', 'project', 'development', 'sales',
      'marketing', 'accounting', 'finance', 'analysis', 'customer',
      'service', 'leadership', 'java', 'python', 'javascript',
      'react', 'node', 'express', 'sql', 'database',
      'excel', 'word', 'powerpoint', 'communication', 'problem-solving',
      'teamwork', 'time management', 'critical thinking', 'adaptability',
      'creativity', 'interpersonal', 'presentation', 'negotiation'
    ];
    
    // Count skills in CV
    const skills = skillKeywords.filter(skill => 
      cvText.toLowerCase().includes(skill.toLowerCase())
    );
    
    // Calculate scores with better detection for South African context
    const bbbeeScore = cvText.toLowerCase().includes('b-bbee') || cvText.toLowerCase().includes('bbbee') ? 
      Math.min(20, 10) : 0;
    
    const nqfScore = cvText.toLowerCase().includes('nqf') ? 
      Math.min(10, 5) : 0;
    
    const locationScore = ['johannesburg', 'pretoria', 'durban', 'cape town', 'gauteng', 'western cape', 'kwazulu-natal'].filter(
      location => cvText.toLowerCase().includes(location.toLowerCase())
    ).length * 2;
    
    const regulationScore = ['popia', 'fica', 'employment equity', 'skills development', 'consumer protection act'].filter(
      reg => cvText.toLowerCase().includes(reg.toLowerCase())
    ).length * 3;
    
    const languageScore = ['english', 'afrikaans', 'zulu', 'isizulu', 'xhosa', 'isixhosa', 'sesotho', 'sotho'].filter(
      lang => cvText.toLowerCase().includes(lang.toLowerCase())
    ).length * 3;
    
    const saScore = Math.min(20, bbbeeScore + nqfScore + Math.min(10, locationScore) + 
      Math.min(9, regulationScore) + Math.min(9, languageScore));
    
    // Skills score based on number of skills found (max 40)
    const skillScore = Math.min(40, skills.length * 3);
    
    // Format score calculation based on structure indicators
    const hasBulletPoints = cvText.includes('•') || cvText.includes('-') || cvText.includes('*');
    const hasHeaders = /^[A-Z\s]{3,25}$/m.test(cvText);
    const hasDates = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)(\s+\d{4}|\s+\d{1,2},\s+\d{4})/i.test(cvText);
    const formatScore = Math.min(40, [
      hasHeaders ? 15 : 0,
      hasBulletPoints ? 15 : 0,
      hasDates ? 10 : 0
    ].reduce((sum, val) => sum + val, 0));
    
    // Overall score
    const overallScore = Math.round(skillScore + formatScore + saScore);
    
    // Rating based on overall score
    let rating;
    if (overallScore >= 80) rating = 'Excellent';
    else if (overallScore >= 65) rating = 'Good';
    else if (overallScore >= 50) rating = 'Average';
    else rating = 'Poor';
    
    // Generate mock strengths and improvements
    const strengths = [];
    const improvements = [];
    
    if (skills.length > 8) {
      strengths.push('Strong skill set with diverse capabilities');
    }
    if (hasHeaders) {
      strengths.push('Well-structured CV with clear sections');
    }
    if (hasBulletPoints) {
      strengths.push('Good use of bullet points for readability');
    }
    if (saContext.bbbee.length > 0) {
      strengths.push('Includes relevant B-BBEE information for South African context');
    }
    
    if (skills.length < 8) {
      improvements.push('Add more relevant skills to strengthen your profile');
    }
    if (!hasHeaders) {
      improvements.push('Add clear section headers to improve structure');
    }
    if (!hasBulletPoints) {
      improvements.push('Use bullet points to highlight achievements and responsibilities');
    }
    if (saContext.bbbee.length === 0) {
      improvements.push('Include B-BBEE status for South African employers');
    }
    if (saContext.nqf.length === 0) {
      improvements.push('Mention NQF levels of your qualifications');
    }
    
    // Mock response in the same format as the real xAI API
    const mockResult = {
      overall_score: overallScore,
      rating: rating,
      skill_score: skillScore,
      format_score: formatScore,
      sa_score: saScore,
      strengths: strengths.slice(0, 5),
      improvements: improvements.slice(0, 5),
      skills_identified: skills,
      south_african_context: {
        b_bbee_mentions: saContext.bbbee,
        nqf_levels: saContext.nqf,
        locations: saContext.locations,
        regulations: saContext.regulations,
        languages: saContext.languages
      }
    };
    
    return {
      success: true,
      result: mockResult
    };
  } catch (error: any) {
    console.error("Error in mock xAI CV analysis:", error);
    return {
      success: false,
      error: error.message || "Failed to perform mock CV analysis"
    };
  }
}

/**
 * Export a test function that always returns true
 */
export async function testMockXaiConnection(): Promise<boolean> {
  return true;
}

export default {
  mockAnalyzeCV,
  testMockXaiConnection
};