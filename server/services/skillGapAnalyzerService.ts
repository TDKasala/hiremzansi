import { db } from "../db";
import { randomUUID } from "crypto";
import OpenAI from "openai";
import { jobBoardService } from "./jobBoardService";

// Initialize xAI (primary) and OpenAI (fallback)
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Types for skill analysis
export interface SkillProficiency {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  experience?: number;
  lastUsed?: string;
  verified?: boolean;
  category?: string;
  relevance?: number;
}

export interface LearningResource {
  title: string;
  type: string;
  provider?: string;
  url?: string;
  cost?: {
    amount: number;
    currency: string;
  };
  duration?: {
    value: number;
    unit: string;
  };
  level: string;
  saRelevant: boolean;
  description?: string;
}

export interface SkillGap {
  skill: string;
  importance: number;
  currentLevel?: "none" | "beginner" | "intermediate" | "advanced" | "expert";
  requiredLevel: "beginner" | "intermediate" | "advanced" | "expert";
  gap: "critical" | "major" | "minor" | "none";
  resources: LearningResource[];
  description: string;
}

export interface CareerPathOption {
  title: string;
  description: string;
  requiredSkills: {
    name: string;
    level: string;
    importance: number;
  }[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  growthPotential: string;
  timeToAchieve?: {
    value: number;
    unit: string;
  };
  industries: string[];
  saJobMarketDemand: string;
}

export interface SkillGapAnalysis {
  id: string;
  userId: number;
  currentSkills: SkillProficiency[];
  targetRole?: string;
  targetIndustry?: string;
  identifiedGaps: SkillGap[];
  careerPathOptions: CareerPathOption[];
  marketInsights: {
    inDemandSkills: string[];
    emergingTechnologies: string[];
    industryTrends: string[];
    salaryInsights: {
      role: string;
      median: number;
      range: {
        min: number;
        max: number;
      };
      currency: string;
    }[];
  };
  summary: string;
  actionPlan: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  createdAt: string;
}

interface AnalysisParams {
  currentSkills: SkillProficiency[];
  targetRole: string;
  targetIndustry?: string;
  cvContent?: string;
}

export class SkillGapAnalyzerService {
  // Extract skills from CV using GPT
  async extractSkillsFromCV(cvContent: string): Promise<SkillProficiency[]> {
    try {
      // Prepare the prompt
      const systemPrompt = `You are an expert skills analyzer. Extract skills from the provided CV, determine the candidate's proficiency level for each skill, and categorize them.

For each skill, provide:
1. The name of the skill (be specific, e.g., "JavaScript" not just "Programming")
2. The level of proficiency (beginner, intermediate, advanced, expert)
3. A category for the skill (technical, soft skill, domain knowledge, tool, etc.)
4. Relevance score (0-100) indicating how prominent/important this skill appears to be in their profile

Format your response as a JSON array with the following structure:
{
  "skills": [
    {
      "name": "Skill name",
      "level": "beginner|intermediate|advanced|expert",
      "category": "Category name",
      "relevance": 85
    }
  ]
}

Focus on extracting at least 15-20 distinct skills, including both technical and soft skills.`;

      // Try xAI first, fallback to OpenAI
      let response;
      try {
        response = await xai.chat.completions.create({
          model: "grok-2-1212",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: cvContent }
          ],
          response_format: { type: "json_object" },
          max_tokens: 2000
        });
        console.log("Successfully used xAI for skill extraction");
      } catch (xaiError: any) {
        console.log("xAI failed, falling back to OpenAI:", xaiError.message);
        response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: cvContent }
          ],
          response_format: { type: "json_object" },
          max_tokens: 2000
        });
      }

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to extract skills - empty response");
      }
      
      // Parse the response
      const parsed = JSON.parse(content);
      
      return parsed.skills || [];
    } catch (error) {
      console.error("Error extracting skills from CV:", error);
      return [];
    }
  }
  
  // Analyze skill gaps using GPT
  async analyzeSkillGaps(params: AnalysisParams): Promise<SkillGapAnalysis> {
    try {
      // Prepare the prompt for skill gap analysis
      const systemPrompt = `You are an expert career analyst specializing in South African job markets. Analyze the gap between the candidate's current skills and the requirements for their target role.

For your analysis:
1. Identify key skills missing or needing improvement for the target role
2. Suggest alternative career paths that match their current skill set
3. Provide South African market insights relevant to their career goals
4. Create a practical action plan for skill development

Format your response as a JSON object with the following structure:
{
  "identifiedGaps": [
    {
      "skill": "Skill name",
      "importance": 90,
      "currentLevel": "none|beginner|intermediate|advanced|expert",
      "requiredLevel": "beginner|intermediate|advanced|expert",
      "gap": "critical|major|minor|none",
      "description": "Brief explanation of why this skill is important"
    }
  ],
  "careerPathOptions": [
    {
      "title": "Alternative career title",
      "description": "Brief description of this career path",
      "requiredSkills": [
        { "name": "Skill name", "level": "Level", "importance": 85 }
      ],
      "salaryRange": {
        "min": 25000,
        "max": 35000,
        "currency": "ZAR"
      },
      "growthPotential": "High|Medium|Low",
      "timeToAchieve": {
        "value": 6,
        "unit": "months"
      },
      "industries": ["Industry 1", "Industry 2"],
      "saJobMarketDemand": "high|medium|low"
    }
  ],
  "marketInsights": {
    "inDemandSkills": ["Skill 1", "Skill 2"],
    "emergingTechnologies": ["Tech 1", "Tech 2"],
    "industryTrends": ["Trend 1", "Trend 2"],
    "salaryInsights": [
      {
        "role": "Role name",
        "median": 30000,
        "range": { "min": 25000, "max": 40000 },
        "currency": "ZAR"
      }
    ]
  },
  "summary": "Brief overall summary of the analysis",
  "actionPlan": {
    "shortTerm": ["Action 1", "Action 2"],
    "mediumTerm": ["Action 1", "Action 2"],
    "longTerm": ["Action 1", "Action 2"]
  }
}

Ensure all salary figures are in South African Rand (ZAR) and reflect current market rates. Focus on actionable, specific advice tailored to South African job market.`;

      const userPrompt = `Target Role: ${params.targetRole}
${params.targetIndustry ? `Target Industry: ${params.targetIndustry}` : ''}

Current Skills:
${JSON.stringify(params.currentSkills, null, 2)}

${params.cvContent ? `Additional CV Content: ${params.cvContent}` : ''}`;

      // Try xAI first, fallback to OpenAI
      let response;
      try {
        response = await xai.chat.completions.create({
          model: "grok-2-1212",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 4000
        });
        console.log("Successfully used xAI for skill gap analysis");
      } catch (xaiError: any) {
        console.log("xAI failed, falling back to OpenAI:", xaiError.message);
        response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 4000
        });
      }

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to analyze skill gaps - empty response");
      }
      
      // Parse the response
      const parsed = JSON.parse(content);
      
      // Create the full analysis object
      const analysis: SkillGapAnalysis = {
        id: randomUUID(),
        userId: 0, // This will be set later
        currentSkills: params.currentSkills,
        targetRole: params.targetRole,
        targetIndustry: params.targetIndustry,
        identifiedGaps: parsed.identifiedGaps || [],
        careerPathOptions: parsed.careerPathOptions || [],
        marketInsights: parsed.marketInsights || {
          inDemandSkills: [],
          emergingTechnologies: [],
          industryTrends: [],
          salaryInsights: []
        },
        summary: parsed.summary || "",
        actionPlan: parsed.actionPlan || {
          shortTerm: [],
          mediumTerm: [],
          longTerm: []
        },
        createdAt: new Date().toISOString()
      };
      
      return analysis;
    } catch (error) {
      console.error("Error analyzing skill gaps:", error);
      
      // Return a minimal analysis as fallback
      return {
        id: randomUUID(),
        userId: 0,
        currentSkills: params.currentSkills,
        targetRole: params.targetRole,
        targetIndustry: params.targetIndustry,
        identifiedGaps: [],
        careerPathOptions: [],
        marketInsights: {
          inDemandSkills: [],
          emergingTechnologies: [],
          industryTrends: [],
          salaryInsights: []
        },
        summary: "Unable to complete the full analysis. Please try again later.",
        actionPlan: {
          shortTerm: ["Review and update your CV with more detailed skill descriptions", 
                      "Research the requirements for your target role"],
          mediumTerm: ["Identify online courses to build missing skills",
                       "Connect with professionals in your target field"],
          longTerm: ["Consider formal education or certification programs",
                     "Build portfolio projects to demonstrate your skills"]
        },
        createdAt: new Date().toISOString()
      };
    }
  }
  
  // Find learning resources for a specific skill
  async findLearningResources(
    skillName: string,
    currentLevel: string,
    targetLevel: string
  ): Promise<LearningResource[]> {
    try {
      // Prepare the prompt
      const systemPrompt = `You are a career development specialist with expertise in South African education resources. Find specific learning resources to help someone improve their skill in a particular area.

Provide a list of real, accessible learning resources that:
1. Are appropriate for progressing from their current level to the target level
2. Include a mix of free and paid options
3. Range from quick tutorials to comprehensive courses
4. Include South African-specific resources when available

Format your response as a JSON array with the following structure:
{
  "resources": [
    {
      "title": "Resource name",
      "type": "course|tutorial|book|certification|workshop|etc",
      "provider": "Provider name",
      "url": "https://example.com/resource",
      "cost": {
        "amount": 1500,
        "currency": "ZAR"
      },
      "duration": {
        "value": 6,
        "unit": "weeks|hours|months"
      },
      "level": "beginner|intermediate|advanced",
      "saRelevant": true|false,
      "description": "Brief description of what the resource covers"
    }
  ]
}

Include at least 3-5 resources. Prioritize resources that are:
- Currently available (not outdated)
- Well-regarded in the industry
- Relevant to South African job markets`;

      const userPrompt = `Skill: ${skillName}
Current Level: ${currentLevel}
Target Level: ${targetLevel}

Find learning resources to help someone improve from their current level to the target level in this skill. Include both free and paid options, with a focus on resources available to South Africans.`;

      // Make the API request
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to find learning resources - empty response");
      }
      
      // Parse the response
      const parsed = JSON.parse(content);
      
      return parsed.resources || [];
    } catch (error) {
      console.error("Error finding learning resources:", error);
      return [];
    }
  }
  
  // Extract skills needed for a job
  async extractSkillsFromJob(job: JobPosting): Promise<SkillProficiency[]> {
    try {
      // Prepare the prompt
      const systemPrompt = `You are an expert skill requirements analyzer. Extract the skills required for the job based on the posting, determine the required proficiency level, and categorize them.

For each skill, provide:
1. The name of the skill (be specific)
2. The required level of proficiency (beginner, intermediate, advanced, expert)
3. A category for the skill (technical, soft skill, domain knowledge, tool, etc.)
4. Importance score (0-100) indicating how crucial this skill is for the role

Format your response as a JSON array with the following structure:
{
  "skills": [
    {
      "name": "Skill name",
      "level": "beginner|intermediate|advanced|expert",
      "category": "Category name",
      "importance": 85
    }
  ]
}

Focus on extracting at least 10-15 distinct skills, including both technical and soft skills.`;

      const jobDescription = `
Job Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Requirements: ${job.requirements.join('\n')}
Skills Listed: ${job.skills.join(', ')}
Industry: ${job.industry}
Experience Level: ${job.experienceLevel}
`;

      // Make the API request
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: jobDescription }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to extract skills from job - empty response");
      }
      
      // Parse the response
      const parsed = JSON.parse(content);
      
      return parsed.skills || [];
    } catch (error) {
      console.error("Error extracting skills from job:", error);
      return [];
    }
  }
  
  // Create an analysis for a user
  async createAnalysis(
    userId: number,
    params: AnalysisParams
  ): Promise<SkillGapAnalysis> {
    // Get job details if target role is a job ID
    if (params.targetRole.startsWith('job-')) {
      try {
        const jobId = params.targetRole.replace('job-', '');
        const job = await jobBoardService.getJobById(jobId);
        
        if (job) {
          params.targetRole = job.title;
          params.targetIndustry = job.industry;
          
          // Extract skills from job if not enough current skills
          if (params.currentSkills.length < 5) {
            const jobSkills = await this.extractSkillsFromJob(job);
            params.currentSkills = [...params.currentSkills, ...jobSkills];
          }
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        // Continue with what we have
      }
    }
    
    // Perform the analysis
    const analysis = await this.analyzeSkillGaps(params);
    
    // Set the user ID
    analysis.userId = userId;
    
    // TODO: Store analysis in database
    
    return analysis;
  }
  
  // Get an analysis by ID
  async getAnalysisById(analysisId: string): Promise<SkillGapAnalysis | null> {
    // TODO: Retrieve analysis from database
    // For now, return null
    return null;
  }
  
  // Get all analyses for a user
  async getAnalysesByUser(userId: number): Promise<SkillGapAnalysis[]> {
    // TODO: Retrieve analyses from database
    // For now, return empty array
    return [];
  }
}

// Export instance
export const skillGapAnalyzerService = new SkillGapAnalyzerService();