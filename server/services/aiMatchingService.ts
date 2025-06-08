import OpenAI from "openai";

// Initialize xAI client (primary) and OpenAI client (fallback)
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface JobMatchAnalysis {
  skillsScore: number;
  experienceScore: number;
  culturalFitScore: number;
  salaryCompatibility: number;
  locationScore: number;
  overallMatchScore: number;
  matchReasons: string[];
  skillsMatched: string[];
  skillsGap: string[];
  recommendations: string[];
}

interface CVProfile {
  skills: string[];
  experience: string;
  location: string;
  salaryExpectation?: string;
  industry: string;
  education: string;
  languages?: string[];
  bbbeeStatus?: string;
  nqfLevel?: string;
}

interface JobRequirements {
  title: string;
  description: string;
  requiredSkills: string[];
  experience: string;
  location: string;
  salaryRange?: string;
  industry: string;
  companySize?: string;
  companyDescription?: string;
  benefits?: string[];
  workArrangement?: string;
}

/**
 * AI-Powered Job Matching Service using xAI/Grok
 * Provides intelligent analysis of CV-Job compatibility
 */
export class AIMatchingService {
  
  /**
   * Analyze job-CV compatibility using Grok AI
   */
  async analyzeJobMatch(
    cvProfile: CVProfile, 
    jobRequirements: JobRequirements
  ): Promise<JobMatchAnalysis> {
    
    const prompt = this.buildMatchingPrompt(cvProfile, jobRequirements);
    const systemContent = `You are an expert South African recruitment AI specializing in job matching. 
            Analyze CV-job compatibility considering SA market factors like B-BBEE, NQF levels, 
            local industry dynamics, and cultural fit. Respond with detailed JSON analysis.`;
    
    // Try xAI first, fallback to OpenAI
    let response;
    try {
      response = await xai.chat.completions.create({
        model: "grok-2-1212", // Using the 131K context model for comprehensive analysis
        messages: [
          {
            role: "system",
            content: systemContent
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3 // Lower temperature for consistent analysis
      });
      console.log("Successfully used xAI for job matching analysis");
    } catch (xaiError: any) {
      console.log("xAI failed, falling back to OpenAI:", xaiError.message);
      response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemContent
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });
    }

    try {
      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        skillsScore: this.normalizeScore(analysis.skillsScore),
        experienceScore: this.normalizeScore(analysis.experienceScore),
        culturalFitScore: this.normalizeScore(analysis.culturalFitScore),
        salaryCompatibility: this.normalizeScore(analysis.salaryCompatibility),
        locationScore: this.normalizeScore(analysis.locationScore),
        overallMatchScore: this.normalizeScore(analysis.overallMatchScore),
        matchReasons: analysis.matchReasons || [],
        skillsMatched: analysis.skillsMatched || [],
        skillsGap: analysis.skillsGap || [],
        recommendations: analysis.recommendations || []
      };
      
    } catch (error) {
      console.error('AI matching analysis failed:', error);
      // Fallback to traditional matching algorithm
      return this.fallbackMatching(cvProfile, jobRequirements);
    }
  }

  /**
   * Build comprehensive matching prompt for Grok analysis
   */
  private buildMatchingPrompt(cv: CVProfile, job: JobRequirements): string {
    return `
    Analyze this CV-Job match for the South African market:

    **CANDIDATE PROFILE:**
    - Skills: ${cv.skills.join(', ')}
    - Experience: ${cv.experience}
    - Location: ${cv.location}
    - Industry: ${cv.industry}
    - Education: ${cv.education}
    - Languages: ${cv.languages?.join(', ') || 'Not specified'}
    - B-BBEE Status: ${cv.bbbeeStatus || 'Not specified'}
    - NQF Level: ${cv.nqfLevel || 'Not specified'}
    - Salary Expectation: ${cv.salaryExpectation || 'Not specified'}

    **JOB REQUIREMENTS:**
    - Position: ${job.title}
    - Description: ${job.description}
    - Required Skills: ${job.requiredSkills.join(', ')}
    - Experience Required: ${job.experience}
    - Location: ${job.location}
    - Industry: ${job.industry}
    - Salary Range: ${job.salaryRange || 'Not specified'}
    - Company Size: ${job.companySize || 'Not specified'}
    - Work Arrangement: ${job.workArrangement || 'Not specified'}

    Provide analysis as JSON with these exact fields:
    {
      "skillsScore": 0-100,
      "experienceScore": 0-100,
      "culturalFitScore": 0-100,
      "salaryCompatibility": 0-100,
      "locationScore": 0-100,
      "overallMatchScore": 0-100,
      "matchReasons": ["reason1", "reason2"],
      "skillsMatched": ["skill1", "skill2"],
      "skillsGap": ["missing_skill1", "missing_skill2"],
      "recommendations": ["recommendation1", "recommendation2"]
    }

    Consider SA context:
    - B-BBEE requirements and opportunities
    - NQF education levels and recognition
    - Local market salary expectations
    - Transport and location logistics in SA cities
    - Language requirements (English, Afrikaans, local languages)
    - Industry-specific SA regulations and standards
    `;
  }

  /**
   * Enhanced skills extraction using Grok vision for CV parsing
   */
  async extractSkillsFromCV(cvText: string, cvImageBase64?: string): Promise<{
    extractedSkills: string[];
    experience: string;
    education: string;
    bbbeeStatus?: string;
    nqfLevel?: string;
    languages: string[];
  }> {
    
    const model = cvImageBase64 ? "grok-2-vision-1212" : "grok-2-1212";
    
    const messages: any[] = [
      {
        role: "system",
        content: `You are a South African CV parsing expert. Extract structured information 
        from CVs, paying attention to SA-specific qualifications, B-BBEE status, and NQF levels.`
      }
    ];

    if (cvImageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract structured data from this CV. Return JSON with: extractedSkills, experience, education, bbbeeStatus, nqfLevel, languages.
            
            CV Text: ${cvText}`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${cvImageBase64}`
            }
          }
        ]
      });
    } else {
      messages.push({
        role: "user",
        content: `Extract structured data from this CV text. Return JSON with: extractedSkills, experience, education, bbbeeStatus, nqfLevel, languages.
        
        CV Text: ${cvText}`
      });
    }

    try {
      const response = await xai.chat.completions.create({
        model,
        messages,
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('CV parsing failed:', error);
      return {
        extractedSkills: [],
        experience: "Not specified",
        education: "Not specified",
        languages: ["English"]
      };
    }
  }

  /**
   * Generate job matching explanation using Grok
   */
  async generateMatchExplanation(
    analysis: JobMatchAnalysis,
    candidateName: string,
    jobTitle: string
  ): Promise<string> {
    
    const prompt = `Generate a professional, encouraging explanation for why ${candidateName} 
    is a ${analysis.overallMatchScore}% match for the ${jobTitle} position.
    
    Match Analysis:
    - Skills Score: ${analysis.skillsScore}%
    - Experience Score: ${analysis.experienceScore}%
    - Cultural Fit: ${analysis.culturalFitScore}%
    - Matched Skills: ${analysis.skillsMatched.join(', ')}
    - Areas for Growth: ${analysis.skillsGap.join(', ')}
    
    Write a concise, positive explanation (2-3 sentences) that highlights strengths and potential.`;

    try {
      const response = await xai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: "You are a professional recruitment consultant providing positive, constructive feedback."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      return response.choices[0].message.content || 'Match analysis completed successfully.';
    } catch (error) {
      console.error('Match explanation generation failed:', error);
      return `${candidateName} shows strong potential for this ${jobTitle} role with ${analysis.overallMatchScore}% compatibility based on skills and experience alignment.`;
    }
  }

  /**
   * Normalize scores to 0-100 range
   */
  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Fallback matching when AI fails
   */
  private fallbackMatching(cv: CVProfile, job: JobRequirements): JobMatchAnalysis {
    // Simple keyword-based matching as fallback
    const skillsMatched = cv.skills.filter(skill => 
      job.requiredSkills.some(reqSkill => 
        skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    const skillsScore = (skillsMatched.length / job.requiredSkills.length) * 100;
    const locationScore = cv.location.toLowerCase().includes(job.location.toLowerCase()) ? 100 : 50;
    const overallScore = (skillsScore * 0.6) + (locationScore * 0.4);

    return {
      skillsScore,
      experienceScore: 70, // Default assumption
      culturalFitScore: 60,
      salaryCompatibility: 75,
      locationScore,
      overallMatchScore: overallScore,
      matchReasons: ['Skills alignment', 'Location compatibility'],
      skillsMatched,
      skillsGap: job.requiredSkills.filter(skill => !skillsMatched.includes(skill)),
      recommendations: ['Consider developing missing skills', 'Highlight transferable experience']
    };
  }
}

export const aiMatchingService = new AIMatchingService();