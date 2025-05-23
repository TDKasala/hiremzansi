import OpenAI from "openai";

// Initialize OpenAI client with xAI configuration
const openai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY,
});

// Fallback to OpenAI if xAI is not available
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Service for handling AI analysis using xAI's API
 */
class XAIService {
  /**
   * Analyze CV text content using xAI Grok model
   * With fallback to OpenAI if xAI is unavailable
   */
  async analyzeCV(text: string): Promise<{
    score: number;
    breakdown: {
      format: number;
      skills: number;
      context: number;
    };
    recommendations: { category: string; suggestion: string }[];
  }> {
    try {
      return await this.analyzeWithXAI(text);
    } catch (error) {
      console.warn('xAI analysis failed, falling back to OpenAI:', error);
      return await this.analyzeWithOpenAI(text);
    }
  }

  /**
   * Analyze CV with xAI's Grok model
   */
  private async analyzeWithXAI(text: string) {
    const prompt = this.createAnalysisPrompt(text);
    
    try {
      const response = await openai.chat.completions.create({
        model: "grok-2-1212", // Using the latest text model
        messages: [
          {
            role: "system",
            content: 
              "You are an expert CV analyzer for South African job seekers. " +
              "Evaluate CVs based on format (40%), skills (40%), and South African context (20%). " +
              "Provide a detailed breakdown and specific recommendations."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content || "{}";
      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Error analyzing CV with xAI:', error);
      throw error;
    }
  }

  /**
   * Analyze CV with OpenAI as fallback
   */
  private async analyzeWithOpenAI(text: string) {
    const prompt = this.createAnalysisPrompt(text);
    
    try {
      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o", // The newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: 
              "You are an expert CV analyzer for South African job seekers. " +
              "Evaluate CVs based on format (40%), skills (40%), and South African context (20%). " +
              "Provide a detailed breakdown and specific recommendations."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content || "{}";
      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Error analyzing CV with OpenAI fallback:', error);
      // If both services fail, use the default analyzer
      throw error;
    }
  }

  /**
   * Create analysis prompt for AI models
   */
  private createAnalysisPrompt(text: string): string {
    return `
Analyze this CV for a South African job seeker:

${text}

Evaluate based on these criteria:
1. Format (40% of score):
   - Layout and organization (10pts)
   - Clear section headers (8pts)
   - Effective use of bullet points (8pts)
   - Consistent date formats (6pts)
   - Appropriate spacing (8pts)

2. Skills (40% of score):
   - Technical skills relevance (10pts)
   - Soft skills presentation (8pts)
   - Qualifications presentation (8pts)
   - Experience description quality (8pts)
   - Keyword optimization (6pts)

3. South African Context (20% of score):
   - B-BBEE status mention (6pts)
   - NQF level specification (4pts)
   - South African locations/experience (4pts)
   - Industry-specific regulations/compliance (3pts)
   - Local languages (3pts)

Provide:
1. A total score out of 100
2. Breakdown of points for each main category
3. At least 3 specific recommendations for improvement

Return response in this JSON format:
{
  "score": <total_score>,
  "breakdown": {
    "format": <format_score>,
    "skills": <skills_score>,
    "context": <context_score>
  },
  "recommendations": [
    {
      "category": "<category_name>",
      "suggestion": "<specific_recommendation>"
    },
    ...
  ]
}
`;
  }

  /**
   * Parse AI response into standardized format
   */
  private parseAIResponse(responseText: string): {
    score: number;
    breakdown: {
      format: number;
      skills: number;
      context: number;
    };
    recommendations: { category: string; suggestion: string }[];
  } {
    try {
      const parsed = JSON.parse(responseText);
      
      return {
        score: Math.round(parsed.score || 50),
        breakdown: {
          format: Math.round(parsed.breakdown?.format || 50),
          skills: Math.round(parsed.breakdown?.skills || 50),
          context: Math.round(parsed.breakdown?.context || 50)
        },
        recommendations: Array.isArray(parsed.recommendations) 
          ? parsed.recommendations.slice(0, 5) 
          : [{ category: 'General', suggestion: 'Tailor your CV to match job descriptions' }]
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Return default values if parsing fails
      return {
        score: 50,
        breakdown: {
          format: 50,
          skills: 50,
          context: 50
        },
        recommendations: [
          { category: 'General', suggestion: 'Tailor your CV to match job descriptions' },
          { category: 'Format', suggestion: 'Improve organization with clear section headers' },
          { category: 'Skills', suggestion: 'Highlight technical skills relevant to your industry' }
        ]
      };
    }
  }
}

// Export singleton instance
export const xaiService = new XAIService();

// Test connection to xAI API
export async function testXaiConnection() {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "user", content: "Test connection" }
      ],
      max_tokens: 5
    });
    return { success: true, message: "xAI API connection successful" };
  } catch (error: any) {
    console.error("xAI API connection test failed:", error);
    return { 
      success: false, 
      message: "xAI API connection failed", 
      error: error.message 
    };
  }
}

// Export the analyzeCV function directly for compatibility with existing code
export async function analyzeCV(text: string, jobDescription?: string) {
  try {
    const result = await xaiService.analyzeCV(text);
    return {
      success: true,
      result: {
        overall_score: result.score,
        rating: result.score >= 80 ? "Excellent" : result.score >= 70 ? "Good" : result.score >= 60 ? "Average" : "Needs Improvement",
        strengths: result.recommendations.filter(r => r.category === "Strengths").map(r => r.suggestion),
        improvements: result.recommendations.filter(r => r.category !== "Strengths").map(r => r.suggestion),
        skills_identified: [], // Would be populated in a more comprehensive implementation
        skill_score: result.breakdown.skills,
        format_score: result.breakdown.format,
        sa_score: result.breakdown.context,
        south_african_context: {
          b_bbee_mentions: [],
          nqf_levels: [],
          locations: [],
          regulations: [],
          languages: []
        }
      }
    };
  } catch (error: any) {
    console.error("Error in xAI CV analysis:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze CV with xAI"
    };
  }
}