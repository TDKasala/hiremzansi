import OpenAI from "openai";

/**
 * xAI Service for CV Analysis
 * 
 * This service uses the xAI Grok API to analyze CVs for ATS compatibility
 * with special focus on South African job market context
 */

// Initialize xAI client using the X.AI API
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

// Define analysis response type
interface AnalysisResponse {
  success: boolean;
  result?: any;
  error?: string;
}

/**
 * Analyze CV content using xAI's Grok model
 * 
 * @param cvText CV text content to analyze
 * @param jobDescription Optional job description for targeted analysis
 * @returns Detailed analysis with South African context scoring
 */
export async function analyzeCV(
  cvText: string, 
  jobDescription?: string
): Promise<AnalysisResponse> {
  try {
    if (!process.env.XAI_API_KEY) {
      throw new Error("XAI_API_KEY is not set in environment variables");
    }
    
    console.log("Analyzing CV with xAI Grok API");
    
    // Create analysis prompt with CV text and South African context instructions
    const saContextPrompt = `
    You are an expert ATS (Applicant Tracking System) analyzer specialized in the South African job market.
    
    Analyze the following CV text and provide a detailed scoring with these components:
    
    1. Overall ATS compatibility score (0-100)
    2. Format evaluation (40% of total score):
       - Professional layout and structure
       - Consistent headers and sections
       - Proper use of bullet points
       - Appropriate date formats
       - Readable font and spacing

    3. Skills identification (40% of total score):
       - Relevant technical skills
       - Soft skills
       - Certifications and qualifications
       - Work experience alignment
       - Consider high-demand skills in South Africa with 1.5x weight

    4. South African context detection (20% of score):
       - Identify mentions of B-BBEE status (e.g., Level 1, Level 2) - 10 points per mention (max 20)
       - NQF levels mentioned (5 points per correct level, max 10)
       - South African cities/provinces (2 points each, max 5 per category)
       - Local regulatory knowledge (3 points per mention, max 5)
       - South African languages (3 points per language, max 5)

    ${jobDescription ? `Consider relevance to this job description: ${jobDescription}` : ''}

    CV TEXT:
    ${cvText}

    Provide a JSON response with these fields:
    - overall_score: number (0-100)
    - rating: string ('Excellent', 'Good', 'Average', 'Poor')
    - skill_score: number (0-40)
    - format_score: number (0-40)
    - sa_score: number (0-20)
    - strengths: array of strings (3-5 key strengths)
    - improvements: array of strings (3-5 suggested improvements)
    - skills_identified: array of strings (all identified skills)
    - south_african_context: {
        b_bbee_mentions: array of strings (any B-BBEE mentions),
        nqf_levels: array of strings (any NQF levels mentioned),
        locations: array of strings (South African cities/provinces),
        regulations: array of strings (South African regulations),
        languages: array of strings (South African languages)
      }
    `;
    
    const response = await xai.chat.completions.create({
      model: "grok-2-1212", // Using Grok 2 model for advanced analysis
      messages: [
        { role: "system", content: "You're an ATS expert for the South African job market." },
        { role: "user", content: saContextPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2048,
      temperature: 0.2 // Lower temperature for more consistent results
    });
    
    // Parse the JSON response from xAI
    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      success: true,
      result: result
    };
  } catch (error: any) {
    console.error("Error in xAI CV analysis:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze CV with xAI Grok API"
    };
  }
}

/**
 * Export a test function to check API connectivity and response format
 */
export async function testXaiConnection(): Promise<boolean> {
  try {
    if (!process.env.XAI_API_KEY) {
      console.error("XAI_API_KEY is not set in environment variables");
      return false;
    }
    
    const response = await xai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { 
          role: "user", 
          content: "Respond with 'connected' if you can receive this message." 
        }
      ],
      max_tokens: 10
    });
    
    return response.choices[0].message.content.toLowerCase().includes("connected");
  } catch (error) {
    console.error("xAI connection test failed:", error);
    return false;
  }
}

export default {
  analyzeCV,
  testXaiConnection
};