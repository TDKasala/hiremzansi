import OpenAI from "openai";

// Initialize OpenAI client (fallback)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to get current xAI client with fresh API key
function getXAIClient() {
  return new OpenAI({
    baseURL: "https://api.x.ai/v1",
    apiKey: "xai-rspUY3X7CS55MH0ClJT0nxCT2D9bmXUln8YB0dcriOULNlHi30teZCH7WQha1vOgIWnE9OavQzERsteq",
  });
}

export interface CVAnalysisResult {
  atsScore: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  southAfricanContext: {
    beeCompliance: string;
    localMarketFit: string;
    industryRelevance: string;
    languageAppropriate: boolean;
  };
  industry: string;
  experienceLevel: string;
}

export interface JobMatchResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  salaryEstimate: string;
  recommendations: string[];
}

export interface CareerGuidanceResult {
  nextSteps: string[];
  skillGaps: string[];
  trainingRecommendations: string[];
  careerPath: string;
}

class XAIService {
  private async makeRequest(prompt: string, maxTokens: number = 4000): Promise<string> {
    // Try xAI first, fallback to OpenAI
    try {
      const xaiClient = getXAIClient();
      console.log("Using xAI API key:", "xai-rspUY3X7CS55MH0ClJT0nxCT2D9bmXUln8YB0dcriOULNlHi30teZCH7WQha1vOgIWnE9OavQzERsteq".substring(0, 15) + "...");
      const response = await xaiClient.chat.completions.create({
        model: "grok-3-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      });

      console.log("Successfully used xAI for CV analysis");
      return response.choices[0].message.content || "";
    } catch (xaiError: any) {
      console.log("xAI failed, falling back to OpenAI:", xaiError.message);
      
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.7,
        });

        return response.choices[0].message.content || "";
      } catch (openaiError) {
        console.error("Both xAI and OpenAI failed:", openaiError);
        throw new Error("Failed to process with AI services");
      }
    }
  }

  async analyzeCV(cvText: string, jobDescription?: string): Promise<{ success: boolean; data?: CVAnalysisResult; error?: string }> {
    try {
      const result = await this.analyzeCVForATS(cvText, jobDescription);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async analyzeCVForATS(cvText: string, jobDescription?: string): Promise<CVAnalysisResult> {
    const prompt = this.buildCVAnalysisPrompt(cvText, jobDescription);
    const response = await this.makeRequest(prompt);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse xAI response:", error);
      throw new Error("Invalid response format from AI");
    }
  }

  async matchJobToCV(cvText: string, jobDescription: string): Promise<JobMatchResult> {
    const prompt = this.buildJobMatchingPrompt(cvText, jobDescription);
    const response = await this.makeRequest(prompt);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse job matching response:", error);
      throw new Error("Invalid job matching response");
    }
  }

  async generateCareerGuidance(cvText: string, targetRole?: string): Promise<CareerGuidanceResult> {
    const prompt = this.buildCareerGuidancePrompt(cvText, targetRole);
    const response = await this.makeRequest(prompt);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse career guidance response:", error);
      throw new Error("Invalid career guidance response");
    }
  }

  async generateCoverLetter(cvText: string, jobDescription: string, companyName: string): Promise<string> {
    const prompt = this.buildCoverLetterPrompt(cvText, jobDescription, companyName);
    return await this.makeRequest(prompt, 1500);
  }

  async optimizeLinkedInProfile(cvText: string): Promise<{
    headline: string;
    summary: string;
    skillsRecommendations: string[];
  }> {
    const prompt = this.buildLinkedInOptimizationPrompt(cvText);
    const response = await this.makeRequest(prompt);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse LinkedIn optimization response:", error);
      throw new Error("Invalid LinkedIn optimization response");
    }
  }

  private buildCVAnalysisPrompt(cvText: string, jobDescription?: string): string {
    return `
You are an expert CV optimization specialist for the South African job market. Analyze this CV and provide comprehensive feedback.

CV CONTENT:
${cvText}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n` : ''}

ANALYSIS REQUIREMENTS:
1. ATS (Applicant Tracking System) compatibility score (0-100)
2. Overall CV quality score (0-100) 
3. Specific strengths and areas for improvement
4. Missing keywords for South African market
5. Formatting and structure issues
6. South African context analysis including B-BBEE considerations

SOUTH AFRICAN MARKET FOCUS:
- B-BBEE (Broad-Based Black Economic Empowerment) compliance indicators
- Local industry standards and expectations
- South African English language conventions
- Regional salary and experience expectations
- Skills relevant to SA economy (mining, finance, tech, agriculture)

RESPOND IN VALID JSON FORMAT:
{
  "atsScore": number (0-100),
  "overallScore": number (0-100),
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "formattingIssues": ["issue1", "issue2"],
  "southAfricanContext": {
    "beeCompliance": "assessment of B-BBEE indicators",
    "localMarketFit": "how well CV fits SA market",
    "industryRelevance": "relevance to SA industries",
    "languageAppropriate": boolean
  },
  "industry": "detected primary industry",
  "experienceLevel": "entry-level/mid-level/senior/executive"
}

Provide actionable, specific feedback tailored to South African employers and ATS systems.
`;
  }

  private buildJobMatchingPrompt(cvText: string, jobDescription: string): string {
    return `
You are a South African recruitment specialist. Match this CV against the job description and provide detailed analysis.

CV CONTENT:
${cvText}

JOB DESCRIPTION:
${jobDescription}

ANALYSIS REQUIREMENTS:
1. Calculate match percentage (0-100)
2. Identify matching skills and experience
3. Highlight missing skills/requirements
4. Estimate appropriate salary range for South Africa
5. Provide specific recommendations for improvement

SOUTH AFRICAN CONSIDERATIONS:
- Local salary benchmarks (in ZAR)
- B-BBEE and employment equity factors
- Skills shortage areas in SA
- Industry-specific requirements
- Regional variations (Cape Town, Johannesburg, Durban)

RESPOND IN VALID JSON FORMAT:
{
  "matchScore": number (0-100),
  "matchingSkills": ["skill1", "skill2", "skill3"],
  "missingSkills": ["missing1", "missing2"],
  "salaryEstimate": "R25,000 - R45,000 per month",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

Focus on practical, actionable advice for the South African job market.
`;
  }

  private buildCareerGuidancePrompt(cvText: string, targetRole?: string): string {
    return `
You are a South African career counselor. Analyze this CV and provide career development guidance.

CV CONTENT:
${cvText}

${targetRole ? `TARGET ROLE: ${targetRole}` : ''}

GUIDANCE REQUIREMENTS:
1. Suggest logical next career steps
2. Identify skill gaps for advancement
3. Recommend training/certification programs available in South Africa
4. Outline potential career progression path

SOUTH AFRICAN CONTEXT:
- Local education institutions (Universities, TVET colleges)
- Professional bodies and certifications (SAICA, SAIPA, etc.)
- Skills development initiatives and SETA programs
- Economic growth sectors in South Africa
- Remote work opportunities vs local positions

RESPOND IN VALID JSON FORMAT:
{
  "nextSteps": ["step1", "step2", "step3"],
  "skillGaps": ["gap1", "gap2"],
  "trainingRecommendations": ["training1", "training2"],
  "careerPath": "detailed career progression description"
}

Provide practical advice considering South African economic realities and opportunities.
`;
  }

  private buildCoverLetterPrompt(cvText: string, jobDescription: string, companyName: string): string {
    return `
Write a professional cover letter for a South African job application.

CV SUMMARY:
${cvText.substring(0, 1000)}...

JOB DESCRIPTION:
${jobDescription}

COMPANY: ${companyName}

REQUIREMENTS:
1. Professional South African business tone
2. Highlight relevant experience and skills
3. Show understanding of local market
4. Address any B-BBEE or diversity considerations appropriately
5. Maximum 3 paragraphs
6. Enthusiastic but professional closing

STRUCTURE:
- Opening: Interest in position and brief introduction
- Body: Relevant experience and value proposition
- Closing: Enthusiasm and call to action

Write a compelling cover letter that stands out to South African employers while maintaining professional standards.
`;
  }

  private buildLinkedInOptimizationPrompt(cvText: string): string {
    return `
Optimize this professional profile for LinkedIn targeting the South African market.

CV CONTENT:
${cvText}

OPTIMIZATION REQUIREMENTS:
1. Compelling professional headline (120 characters max)
2. Engaging summary section (2000 characters max)
3. Strategic skills recommendations for SA market

SOUTH AFRICAN FOCUS:
- Keywords relevant to local recruiters
- Skills in demand in SA economy
- Professional tone appropriate for local market
- Industry-specific terminology
- Growth sectors emphasis

RESPOND IN VALID JSON FORMAT:
{
  "headline": "optimized professional headline",
  "summary": "compelling professional summary",
  "skillsRecommendations": ["skill1", "skill2", "skill3", "skill4", "skill5"]
}

Create content that attracts South African recruiters and highlights market-relevant expertise.
`;
  }

  async generateInterviewQuestions(jobDescription: string, experienceLevel: string): Promise<string[]> {
    const prompt = `
Generate interview questions for this South African job position.

JOB DESCRIPTION:
${jobDescription}

EXPERIENCE LEVEL: ${experienceLevel}

REQUIREMENTS:
1. 8-10 relevant interview questions
2. Mix of technical and behavioral questions
3. South African workplace context
4. Consider diversity and inclusion aspects
5. Industry-specific questions

SOUTH AFRICAN CONSIDERATIONS:
- Local business culture and values
- Workplace equity and transformation
- Skills development and mentorship
- Ubuntu philosophy in workplace
- Local market challenges and opportunities

Provide questions that South African hiring managers would typically ask.
`;

    const response = await this.makeRequest(prompt);
    return response.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('-')).map(q => q.replace(/^\d+\.?\s*-?\s*/, ''));
  }

  async analyzeSalaryBenchmark(position: string, location: string, experience: string): Promise<{
    salaryRange: string;
    marketAnalysis: string;
    factors: string[];
  }> {
    const prompt = `
Provide salary benchmark analysis for South African job market.

POSITION: ${position}
LOCATION: ${location}
EXPERIENCE: ${experience}

ANALYSIS REQUIREMENTS:
1. Current salary range in ZAR (monthly)
2. Market analysis and trends
3. Factors affecting compensation

SOUTH AFRICAN FACTORS:
- Cost of living variations by city
- Industry growth and demand
- Skills shortage premiums
- B-BBEE and employment equity impacts
- Economic conditions and inflation

RESPOND IN VALID JSON FORMAT:
{
  "salaryRange": "R35,000 - R55,000 per month",
  "marketAnalysis": "detailed market analysis",
  "factors": ["factor1", "factor2", "factor3"]
}

Provide accurate, current market information for South African job seekers.
`;

    const response = await this.makeRequest(prompt);
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error("Invalid salary analysis response");
    }
  }
}

export const xaiService = new XAIService();