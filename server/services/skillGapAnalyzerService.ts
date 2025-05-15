/**
 * Personalized Career Skill Gap Analyzer Service
 * 
 * This service analyzes a user's CV and compares it to job market requirements
 * to identify skill gaps and provide personalized learning recommendations.
 * 
 * Features:
 * - Identify missing skills for target job roles
 * - Analyze skill proficiency levels
 * - Provide learning resource recommendations
 * - Track skill development over time
 * - South African job market specific analysis
 */

import OpenAI from "openai";
import { log } from "../vite";
import { JobPosting, jobBoardService } from "./jobBoardService";

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Service configuration
const ANALYZER_CONFIG = {
  MODEL: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
  MAX_TOKENS: 3000,
  TEMPERATURE: 0.3, // Fairly low for consistency in analysis
  MARKET_UPDATE_INTERVAL_DAYS: 14, // How often to refresh market data cache
};

// Types for skill gap analysis
export interface SkillProficiency {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  experience?: number; // Experience in months
  lastUsed?: Date; // When the skill was last used
  verified?: boolean; // Whether the skill has been verified
  category?: string; // Skill category (e.g., "Technical", "Soft Skills")
  relevance?: number; // Relevance score from 0-100
}

export interface LearningResource {
  title: string;
  type: "course" | "certification" | "book" | "website" | "video" | "workshop" | "academic"; 
  provider?: string;
  url?: string;
  cost?: {
    amount: number;
    currency: string;
  };
  duration?: {
    value: number;
    unit: "hours" | "days" | "weeks" | "months";
  };
  level: "beginner" | "intermediate" | "advanced";
  rating?: number; // 0-5 rating
  saRelevant: boolean; // Whether specifically relevant to South African market
  description?: string;
}

export interface SkillGap {
  skill: string;
  importance: number; // 0-100
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
    level: "beginner" | "intermediate" | "advanced" | "expert";
    importance: number; // 0-100
  }[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  growthPotential: "low" | "medium" | "high";
  timeToAchieve?: {
    value: number;
    unit: "months" | "years";
  };
  industries: string[];
  saJobMarketDemand: "low" | "medium" | "high";
}

export interface SkillGapAnalysis {
  id: string;
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
  createdAt: Date;
}

// Cache for market data to avoid redundant API calls
interface MarketDataCache {
  lastUpdated: Date;
  inDemandSkills: {
    skill: string;
    demand: number; // 0-100
    industries: string[];
  }[];
  emergingTechnologies: {
    name: string;
    maturity: "emerging" | "growing" | "established";
    industries: string[];
  }[];
  industryTrends: {
    industry: string;
    trends: string[];
  }[];
  salaryData: {
    role: string;
    median: number;
    range: {
      min: number;
      max: number;
    };
    currency: string;
  }[];
}

// In-memory cache
let marketDataCache: MarketDataCache | null = null;

/**
 * Extract skills from CV content using AI analysis
 * 
 * @param cvContent The user's CV content
 * @returns List of identified skills with proficiency levels
 */
export async function extractSkillsFromCV(cvContent: string): Promise<SkillProficiency[]> {
  const prompt = `Extract and analyze the professional skills from this CV:

${cvContent}

For each skill:
1. Identify the skill name
2. Estimate proficiency level (beginner, intermediate, advanced, expert) based on context
3. Estimate experience in months if mentioned
4. Determine when the skill was last used (if indicated)
5. Categorize the skill (e.g., Technical, Soft Skill, Language, etc.)
6. Estimate relevance to current job market (0-100)

Focus on both technical and soft skills. Include languages, tools, methodologies, and interpersonal skills.

For skills related to South African context, note any:
- B-BBEE knowledge
- South African regulations/compliance knowledge
- Local industry-specific skills
- South African languages

Return ONLY a JSON array of skill objects. Each object should have:
- name: the skill name (string)
- level: proficiency level (string: "beginner", "intermediate", "advanced", or "expert")
- experience: estimated experience in months (number, optional)
- lastUsed: when the skill was last used (ISO date string, optional)
- category: skill category (string, optional)
- relevance: market relevance score 0-100 (number, optional)`;

  try {
    const response = await openai.chat.completions.create({
      model: ANALYZER_CONFIG.MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an expert skills analyst for the South African job market, specializing in extracting and evaluating professional skills from CVs."
        },
        { role: "user", content: prompt }
      ],
      temperature: ANALYZER_CONFIG.TEMPERATURE,
      max_tokens: ANALYZER_CONFIG.MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to extract skills: Empty response");
    }

    // Parse and validate skills
    const parsedData = JSON.parse(content);
    const skills = Array.isArray(parsedData.skills) ? parsedData.skills : 
                  (Array.isArray(parsedData) ? parsedData : []);

    // Process and standardize the format
    return skills.map((skill: any) => ({
      name: skill.name || "Unnamed Skill",
      level: skill.level || "beginner",
      experience: typeof skill.experience === 'number' ? skill.experience : undefined,
      lastUsed: skill.lastUsed ? new Date(skill.lastUsed) : undefined,
      category: skill.category || undefined,
      relevance: typeof skill.relevance === 'number' ? 
        Math.min(100, Math.max(0, skill.relevance)) : undefined,
      verified: false // Default to unverified
    }));
  } catch (error) {
    log(`Error extracting skills: ${error instanceof Error ? error.message : String(error)}`, 'skillgap');
    // Return minimal skills array as fallback
    return [
      {
        name: "Communication",
        level: "intermediate",
        category: "Soft Skills",
        relevance: 90,
        verified: false
      },
      {
        name: "Problem Solving",
        level: "intermediate",
        category: "Soft Skills",
        relevance: 85,
        verified: false
      }
    ];
  }
}

/**
 * Analyze skill gaps for a target role
 * 
 * @param currentSkills The user's current skills
 * @param targetRole The target job role
 * @param targetIndustry Optional target industry
 * @param additionalContext Optional additional context
 * @returns Comprehensive skill gap analysis
 */
export async function analyzeSkillGaps(
  currentSkills: SkillProficiency[],
  targetRole: string,
  targetIndustry?: string,
  additionalContext?: string
): Promise<SkillGapAnalysis> {
  // Ensure we have market data
  await updateMarketDataIfNeeded();
  
  // Try to get job postings for the target role to enhance analysis
  let jobPostings: JobPosting[] = [];
  try {
    const searchResults = await jobBoardService.searchJobsAggregated({
      keywords: [targetRole],
      industry: targetIndustry ? [targetIndustry] : undefined,
      pageSize: 5
    });
    jobPostings = searchResults.jobs;
  } catch (error) {
    log(`Could not fetch job postings: ${error instanceof Error ? error.message : String(error)}`, 'skillgap');
    // Continue without job postings
  }

  // Prepare job posting information
  const jobPostingInfo = jobPostings.length > 0 
    ? jobPostings.map(jp => `
Job Title: ${jp.title}
Company: ${jp.company}
Required Skills: ${jp.skills.join(', ')}
Requirements: ${jp.requirements.join('\n- ')}
    `).join('\n---\n')
    : '';

  // Prepare the skill gap analysis prompt
  const skillsContext = currentSkills.map(skill => 
    `${skill.name} (${skill.level}${skill.experience ? `, ${skill.experience} months experience` : ''}${skill.category ? `, ${skill.category}` : ''})`
  ).join(', ');

  const prompt = `Perform a comprehensive skill gap analysis for a South African professional transitioning to a ${targetRole} role${targetIndustry ? ` in the ${targetIndustry} industry` : ''}.

Current Skills:
${skillsContext}

${jobPostingInfo ? `Recent Job Postings for this role:
${jobPostingInfo}` : ''}

${marketDataCache ? `Current Market Insights:
In-demand skills: ${marketDataCache.inDemandSkills.slice(0, 10).map(s => s.skill).join(', ')}
Emerging technologies: ${marketDataCache.emergingTechnologies.slice(0, 5).map(t => t.name).join(', ')}` : ''}

${additionalContext ? `Additional Context:
${additionalContext}` : ''}

Analyze:
1. Current skill proficiency vs. required for target role
2. Critical missing skills (must-haves)
3. Recommended learning resources for each gap (specific to South Africa where possible)
4. Alternative career paths leveraging existing skills
5. South African market insights (demand, salary ranges, growth areas)
6. B-BBEE, compliance, and South Africa-specific requirements
7. Actionable development plan (short, medium, long term)

Please provide detailed, actionable insights tailored to the South African job market.

Return a comprehensive JSON object with:
- id: unique identifier string
- currentSkills: array of the assessed skills with proficiency
- identifiedGaps: array of skill gaps with importance and resources
- careerPathOptions: array of alternative career paths
- marketInsights: object with market data
- summary: string with overall analysis
- actionPlan: object with short/medium/long term actions`;

  try {
    const response = await openai.chat.completions.create({
      model: ANALYZER_CONFIG.MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an expert career coach and skills analyst for the South African job market, specializing in identifying skill gaps and providing actionable development plans."
        },
        { role: "user", content: prompt }
      ],
      temperature: ANALYZER_CONFIG.TEMPERATURE,
      max_tokens: ANALYZER_CONFIG.MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to analyze skill gaps: Empty response");
    }

    // Parse and process the analysis
    const analysis = JSON.parse(content);
    
    // Add creation date and ensure all required fields
    return {
      id: analysis.id || `analysis-${Date.now()}`,
      currentSkills: Array.isArray(analysis.currentSkills) ? analysis.currentSkills : currentSkills,
      targetRole,
      targetIndustry,
      identifiedGaps: Array.isArray(analysis.identifiedGaps) ? analysis.identifiedGaps : [],
      careerPathOptions: Array.isArray(analysis.careerPathOptions) ? analysis.careerPathOptions : [],
      marketInsights: analysis.marketInsights || {
        inDemandSkills: [],
        emergingTechnologies: [],
        industryTrends: [],
        salaryInsights: []
      },
      summary: analysis.summary || "Skill gap analysis completed.",
      actionPlan: analysis.actionPlan || {
        shortTerm: [],
        mediumTerm: [],
        longTerm: []
      },
      createdAt: new Date()
    };
  } catch (error) {
    log(`Error analyzing skill gaps: ${error instanceof Error ? error.message : String(error)}`, 'skillgap');
    // Return basic analysis as fallback
    return {
      id: `analysis-${Date.now()}`,
      currentSkills,
      targetRole,
      targetIndustry,
      identifiedGaps: [],
      careerPathOptions: [],
      marketInsights: {
        inDemandSkills: [],
        emergingTechnologies: [],
        industryTrends: [],
        salaryInsights: []
      },
      summary: "An error occurred during skill gap analysis. Please try again.",
      actionPlan: {
        shortTerm: [],
        mediumTerm: [],
        longTerm: []
      },
      createdAt: new Date()
    };
  }
}

/**
 * Update market data cache if it's older than the configured interval
 */
async function updateMarketDataIfNeeded(): Promise<void> {
  const now = new Date();
  
  // Check if cache needs refreshing
  if (
    !marketDataCache || 
    (now.getTime() - marketDataCache.lastUpdated.getTime()) > 
    (ANALYZER_CONFIG.MARKET_UPDATE_INTERVAL_DAYS * 24 * 60 * 60 * 1000)
  ) {
    try {
      marketDataCache = await fetchMarketData();
    } catch (error) {
      log(`Error updating market data: ${error instanceof Error ? error.message : String(error)}`, 'skillgap');
      // If we have no cache at all, create an empty one
      if (!marketDataCache) {
        marketDataCache = {
          lastUpdated: now,
          inDemandSkills: [],
          emergingTechnologies: [],
          industryTrends: [],
          salaryData: []
        };
      }
      // otherwise keep using the stale cache
    }
  }
}

/**
 * Fetch current market data using AI and job board data
 */
async function fetchMarketData(): Promise<MarketDataCache> {
  // Gather job postings to inform the analysis
  let recentJobPostings: JobPosting[] = [];
  try {
    // Get a variety of job postings across different industries
    const searches = [
      jobBoardService.searchJobsAggregated({ industry: ["Information Technology"], pageSize: 10 }),
      jobBoardService.searchJobsAggregated({ industry: ["Finance"], pageSize: 5 }),
      jobBoardService.searchJobsAggregated({ industry: ["Healthcare"], pageSize: 5 }),
      jobBoardService.searchJobsAggregated({ industry: ["Manufacturing"], pageSize: 5 }),
      jobBoardService.searchJobsAggregated({ industry: ["Retail"], pageSize: 5 })
    ];
    
    const results = await Promise.all(searches);
    
    // Combine all job postings
    for (const result of results) {
      recentJobPostings = [...recentJobPostings, ...result.jobs];
    }
  } catch (error) {
    log(`Error fetching job postings for market data: ${error instanceof Error ? error.message : String(error)}`, 'skillgap');
    // Continue with partial or no job data
  }

  // Prepare job posting summary for the AI
  const jobSummary = recentJobPostings.map(job => `
Title: ${job.title}
Industry: ${job.industry}
Required Skills: ${job.skills.join(', ')}
Location: ${job.location}
  `).join('\n---\n');

  const prompt = `Analyze the current South African job market based on the following data and your knowledge of recent trends:

${recentJobPostings.length > 0 ? `Recent Job Postings:
${jobSummary}` : 'No recent job posting data available.'}

Current Date: ${new Date().toISOString().split('T')[0]}

Please provide:
1. Top in-demand skills across industries in South Africa
2. Emerging technologies and their maturity level
3. Major trends by industry
4. Salary insights for common roles (in ZAR)

Focus on South Africa-specific insights, including:
- B-BBEE impacts on hiring
- Skills relevant to South African economic conditions
- Industry growth areas specific to South Africa
- Impact of local regulations and compliance requirements

Return a structured JSON object with the following:
- inDemandSkills: array of objects with skill name, demand level (0-100), and relevant industries
- emergingTechnologies: array of objects with technology name, maturity level, and relevant industries
- industryTrends: array of objects with industry name and array of trend descriptions
- salaryData: array of objects with role name, median salary, salary range, and currency`;

  try {
    const response = await openai.chat.completions.create({
      model: ANALYZER_CONFIG.MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an expert South African labor market analyst specializing in skills demand, industry trends, and salary data analysis."
        },
        { role: "user", content: prompt }
      ],
      temperature: ANALYZER_CONFIG.TEMPERATURE,
      max_tokens: ANALYZER_CONFIG.MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to fetch market data: Empty response");
    }

    // Parse and validate the market data
    const marketData = JSON.parse(content);
    
    return {
      lastUpdated: new Date(),
      inDemandSkills: Array.isArray(marketData.inDemandSkills) ? marketData.inDemandSkills : [],
      emergingTechnologies: Array.isArray(marketData.emergingTechnologies) ? marketData.emergingTechnologies : [],
      industryTrends: Array.isArray(marketData.industryTrends) ? marketData.industryTrends : [],
      salaryData: Array.isArray(marketData.salaryData) ? marketData.salaryData : []
    };
  } catch (error) {
    log(`Error generating market data: ${error instanceof Error ? error.message : String(error)}`, 'skillgap');
    // Return empty cache with current timestamp
    return {
      lastUpdated: new Date(),
      inDemandSkills: [],
      emergingTechnologies: [],
      industryTrends: [],
      salaryData: []
    };
  }
}

/**
 * Get learning resources for a specific skill
 * 
 * @param skillName The skill to find resources for
 * @param currentLevel Current skill level
 * @param targetLevel Target skill level
 * @returns List of recommended learning resources
 */
export async function getLearningResources(
  skillName: string,
  currentLevel: "none" | "beginner" | "intermediate" | "advanced" | "expert",
  targetLevel: "beginner" | "intermediate" | "advanced" | "expert"
): Promise<LearningResource[]> {
  const prompt = `Recommend learning resources for developing the "${skillName}" skill, specifically for a South African professional.

Current skill level: ${currentLevel}
Target skill level: ${targetLevel}

Provide a diverse range of resources including:
- Courses (online and in-person)
- Certifications
- Books
- Websites
- Videos/tutorials
- Workshops
- Academic programs

For each resource, include:
1. Title
2. Type (course, certification, book, etc.)
3. Provider
4. URL (if applicable)
5. Cost (in ZAR where possible)
6. Estimated duration
7. Difficulty level
8. Brief description

IMPORTANT: 
- Prioritize resources available in South Africa
- Include some free or low-cost options
- Include resources from South African educational institutions where relevant
- Include South Africa-specific certifications if applicable
- Note resources that address South African context if applicable

Return ONLY a JSON array of resource objects. Each object should include:
- title: resource title (string)
- type: resource type (string)
- provider: provider name (string, optional)
- url: resource URL (string, optional)
- cost: object with amount and currency (optional)
- duration: object with value and unit (optional)
- level: difficulty level (string)
- saRelevant: whether specifically relevant to South African market (boolean)
- description: brief description (string, optional)`;

  try {
    const response = await openai.chat.completions.create({
      model: ANALYZER_CONFIG.MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an expert South African career development specialist with deep knowledge of learning resources available to South African professionals."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.5, // Slightly higher temperature for more diverse resource suggestions
      max_tokens: ANALYZER_CONFIG.MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to get learning resources: Empty response");
    }

    // Parse and validate the resources
    const parsedData = JSON.parse(content);
    const resources = Array.isArray(parsedData.resources) ? parsedData.resources : 
                     (Array.isArray(parsedData) ? parsedData : []);

    // Process and standardize the format
    return resources.map((resource: any) => ({
      title: resource.title || "Unnamed Resource",
      type: resource.type || "course",
      provider: resource.provider,
      url: resource.url,
      cost: resource.cost,
      duration: resource.duration,
      level: resource.level || "beginner",
      saRelevant: resource.saRelevant === true,
      description: resource.description
    }));
  } catch (error) {
    log(`Error getting learning resources: ${error instanceof Error ? error.message : String(error)}`, 'skillgap');
    // Return minimal resources as fallback
    return [
      {
        title: `Online Course on ${skillName}`,
        type: "course",
        provider: "Coursera",
        level: "beginner",
        saRelevant: false,
        description: "A comprehensive introduction to the subject."
      },
      {
        title: `${skillName} for South African Professionals`,
        type: "book",
        level: "intermediate",
        saRelevant: true,
        description: "Tailored content for the South African context."
      }
    ];
  }
}

/**
 * Complete end-to-end analysis from CV to skill gap report
 * 
 * @param cvContent The user's CV content
 * @param targetRole The target job role
 * @param targetIndustry Optional target industry
 * @returns Complete skill gap analysis
 */
export async function analyzeCareerFromCV(
  cvContent: string,
  targetRole: string,
  targetIndustry?: string
): Promise<SkillGapAnalysis> {
  // Step 1: Extract skills from CV
  const extractedSkills = await extractSkillsFromCV(cvContent);
  
  // Step 2: Analyze skill gaps for target role
  const analysis = await analyzeSkillGaps(
    extractedSkills,
    targetRole,
    targetIndustry,
    `CV Analysis: The user's CV indicates they have experience in ${extractedSkills.slice(0, 5).map(s => s.name).join(', ')} among other skills.`
  );
  
  return analysis;
}

/**
 * Compare a user's CV against a specific job posting
 * 
 * @param cvContent The user's CV content
 * @param jobPosting The job posting to compare against
 * @returns Skill gap analysis specific to the job posting
 */
export async function compareToJobPosting(
  cvContent: string,
  jobPosting: JobPosting
): Promise<SkillGapAnalysis> {
  // Extract skills from CV
  const extractedSkills = await extractSkillsFromCV(cvContent);
  
  // Prepare additional context from job posting
  const additionalContext = `
Job Title: ${jobPosting.title}
Company: ${jobPosting.company}
Industry: ${jobPosting.industry}
Required Skills: ${jobPosting.skills.join(', ')}
Requirements:
${jobPosting.requirements.map(r => `- ${r}`).join('\n')}
Job Description:
${jobPosting.description}
  `;
  
  // Analyze skill gaps for the specific job
  const analysis = await analyzeSkillGaps(
    extractedSkills,
    jobPosting.title,
    jobPosting.industry,
    additionalContext
  );
  
  return analysis;
}