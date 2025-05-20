import OpenAI from "openai";

// Configure xAI client
const openai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

/**
 * xAI API integration for CV analysis and other AI features
 * Uses the Grok API which follows similar patterns to OpenAI
 */

interface XaiResponseFormat {
  success: boolean;
  result?: any;
  error?: string;
}

/**
 * Analyze a CV using xAI's Grok model
 * 
 * @param cvText Full text content of the CV
 * @param jobDescription Optional job description for targeted analysis
 * @returns Structured analysis of the CV
 */
export async function analyzeCV(
  cvText: string, 
  jobDescription?: string
): Promise<XaiResponseFormat> {
  try {
    // Build the system prompt for South African CV analysis
    let systemPrompt = `
    You are an expert CV analyzer for the South African job market. Analyze the following CV content and provide detailed feedback on:

    1. Format Analysis (40% of total score):
       - Structure clarity and organization
       - Consistent formatting and styling
       - Appropriate use of bullet points
       - Clear section headings
       - Proper date formats (DD/MM/YYYY or MM/YYYY as per South African conventions)
       - Proper contact information format

    2. Skills Identification (40% of total score):
       - Technical skills relevant to the position
       - Soft skills and transferable abilities
       - Industry-specific certifications
       - Quantifiable achievements
       - South African high-demand skills get 1.5x weighting

    3. South African Context Detection (20% of score):
       - Identify mentions of B-BBEE status (e.g., "Level 1", "B-BBEE contributor")
       - Recognize NQF level specifications (e.g., "NQF Level 5")
       - Detect South African locations/provinces
       - Identify South African regulatory compliance knowledge
       - Reference to local languages (Zulu, Xhosa, Afrikaans, etc.)

    Respond in JSON format with the following structure:
    {
      "overall_score": number between 0-100,
      "rating": "Excellent" | "Good" | "Average" | "Needs Improvement",
      "format_score": number between 0-100,
      "skill_score": number between 0-100,
      "sa_score": number between 0-100,
      "strengths": [list of 3 specific strengths],
      "improvements": [list of 3 specific improvements],
      "skills_identified": [list of all skills identified],
      "south_african_context": {
        "b_bbee_mentions": [list of B-BBEE references],
        "nqf_levels": [list of NQF references],
        "locations": [list of South African locations],
        "regulations": [list of regulatory knowledge],
        "languages": [list of South African languages]
      },
      "sa_relevance_score": number between 0-100
    }
    `;

    // If job description is provided, include targeted analysis
    if (jobDescription) {
      systemPrompt += `\n\nAdditionally, analyze how well the CV aligns with this job description:\n${jobDescription}\n\nInclude a "job_match_score" field (0-100) in your response and a list of "missing_skills" that the job requires but are not evident in the CV.`;
    }

    // Make the API call to xAI Grok
    const response = await openai.chat.completions.create({
      model: "grok-2-1212", // Use Grok 2 for comprehensive analysis
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: cvText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for more consistent analysis
      max_tokens: 2048
    });

    // Parse the JSON response
    const content = response.choices[0].message.content || '';
    const parsedResponse = JSON.parse(content);

    return {
      success: true,
      result: parsedResponse
    };
  } catch (error: any) {
    console.error("Error using xAI for CV analysis:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze CV with xAI"
    };
  }
}

/**
 * Generate personalized career recommendations using xAI
 * 
 * @param userProfile User profile data including skills, experience, and preferences
 * @param cvAnalysis Previous CV analysis results
 * @returns Career development recommendations
 */
export async function generateCareerRecommendations(
  userProfile: any,
  cvAnalysis: any
): Promise<XaiResponseFormat> {
  try {
    const prompt = `
    Based on this user's profile and CV analysis, provide personalized South African career development recommendations:
    
    USER PROFILE:
    ${JSON.stringify(userProfile, null, 2)}
    
    CV ANALYSIS:
    ${JSON.stringify(cvAnalysis, null, 2)}
    
    Focus on:
    1. Skills to develop for increased employability in South Africa
    2. Industry-specific advice for the South African job market
    3. Relevant certifications or qualifications valued by South African employers
    4. Specific courses or resources available in South Africa
    5. B-BBEE optimization strategies if applicable
    
    Format the recommendations as a structured JSON object.
    `;

    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { 
          role: "system", 
          content: "You are a South African career development expert with deep knowledge of the local job market, skills in demand, and employment trends." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1024
    });

    // Parse the JSON response
    const content = response.choices[0].message.content || '';
    const parsedResponse = JSON.parse(content);

    return {
      success: true,
      result: parsedResponse
    };
  } catch (error: any) {
    console.error("Error generating career recommendations with xAI:", error);
    return {
      success: false,
      error: error.message || "Failed to generate career recommendations"
    };
  }
}

/**
 * Test connection to xAI API
 * @returns Boolean indicating if connection was successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "user", content: "Please respond with the word 'connected' if you can receive this message." }
      ],
      max_tokens: 10
    });

    const result = response.choices[0].message.content;
    if (result) {
      return result.toLowerCase().includes('connected');
    }
    return false;
  } catch (error) {
    console.error("xAI connection test failed:", error);
    return false;
  }
}

export default {
  analyzeCV,
  generateCareerRecommendations,
  testConnection
};