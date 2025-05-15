import { db } from "../db";
import OpenAI from "openai";

// Initialize OpenAI
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Job posting types
export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period: string;
  };
  skills: string[];
  jobType: string;
  industry: string;
  experienceLevel: string;
  educationLevel: string;
  postDate: string;
  applicationUrl: string;
  source: string;
}

export interface JobSearchParams {
  keywords?: string;
  location?: string;
  industry?: string;
  jobType?: string;
  experienceLevel?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface JobSearchResults {
  jobs: JobPosting[];
  totalCount: number;
  sources: string[];
}

// CareerJunction API service
class CareerJunctionService {
  private apiKey: string | undefined;
  
  constructor() {
    this.apiKey = process.env.CAREER_JUNCTION_API_KEY;
  }
  
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  async search(params: JobSearchParams): Promise<JobPosting[]> {
    if (!this.apiKey) {
      throw new Error("CareerJunction API key not configured");
    }
    
    // Implement the actual API call to CareerJunction
    // This is a placeholder for the real implementation
    try {
      // API endpoint for CareerJunction's job search
      const endpoint = "https://api.careerjunction.co.za/v1/jobs/search";
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        apiKey: this.apiKey,
        keyword: params.keywords || "",
        location: params.location || "",
        industry: params.industry || "",
        jobType: params.jobType || "",
        experienceLevel: params.experienceLevel || "",
        page: String(params.page || 1),
        pageSize: String(params.pageSize || 10)
      });
      
      // Make the API request
      const response = await fetch(`${endpoint}?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`CareerJunction API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the response into our JobPosting format
      return data.jobs.map((job: any) => ({
        id: `cj-${job.id}`,
        title: job.title,
        company: job.company.name,
        location: job.location.name,
        description: job.description,
        requirements: job.requirements || [],
        salary: job.salary ? {
          min: job.salary.min,
          max: job.salary.max,
          currency: job.salary.currency || "ZAR",
          period: job.salary.period || "month"
        } : undefined,
        skills: job.skills || [],
        jobType: job.type || "Full-time",
        industry: job.industry || "",
        experienceLevel: job.experienceLevel || "",
        educationLevel: job.educationLevel || "",
        postDate: job.postDate,
        applicationUrl: job.applicationUrl,
        source: "CareerJunction"
      }));
    } catch (error) {
      console.error("CareerJunction API error:", error);
      return [];
    }
  }
  
  async getJobById(id: string): Promise<JobPosting | null> {
    if (!this.apiKey) {
      throw new Error("CareerJunction API key not configured");
    }
    
    try {
      // Extract the actual ID (remove the "cj-" prefix)
      const jobId = id.replace("cj-", "");
      
      // API endpoint for CareerJunction's job details
      const endpoint = `https://api.careerjunction.co.za/v1/jobs/${jobId}`;
      
      // Make the API request
      const response = await fetch(`${endpoint}?apiKey=${this.apiKey}`);
      
      if (!response.ok) {
        throw new Error(`CareerJunction API returned ${response.status}: ${response.statusText}`);
      }
      
      const job = await response.json();
      
      // Transform the response into our JobPosting format
      return {
        id: `cj-${job.id}`,
        title: job.title,
        company: job.company.name,
        location: job.location.name,
        description: job.description,
        requirements: job.requirements || [],
        salary: job.salary ? {
          min: job.salary.min,
          max: job.salary.max,
          currency: job.salary.currency || "ZAR",
          period: job.salary.period || "month"
        } : undefined,
        skills: job.skills || [],
        jobType: job.type || "Full-time",
        industry: job.industry || "",
        experienceLevel: job.experienceLevel || "",
        educationLevel: job.educationLevel || "",
        postDate: job.postDate,
        applicationUrl: job.applicationUrl,
        source: "CareerJunction"
      };
    } catch (error) {
      console.error("CareerJunction API error:", error);
      return null;
    }
  }
}

// JobsDB API service
class JobsDBService {
  private apiKey: string | undefined;
  
  constructor() {
    this.apiKey = process.env.JOBSDB_API_KEY;
  }
  
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  async search(params: JobSearchParams): Promise<JobPosting[]> {
    if (!this.apiKey) {
      throw new Error("JobsDB API key not configured");
    }
    
    // Implement the actual API call to JobsDB
    // This is a placeholder for the real implementation
    try {
      // API endpoint for JobsDB's job search
      const endpoint = "https://api.jobsdb.co.za/v1/search";
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        apiKey: this.apiKey,
        q: params.keywords || "",
        location: params.location || "",
        industry: params.industry || "",
        jobType: params.jobType || "",
        experienceLevel: params.experienceLevel || "",
        page: String(params.page || 1),
        limit: String(params.pageSize || 10)
      });
      
      // Make the API request
      const response = await fetch(`${endpoint}?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`JobsDB API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the response into our JobPosting format
      return data.jobs.map((job: any) => ({
        id: `jdb-${job.id}`,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        requirements: job.requirements || [],
        salary: job.salary ? {
          min: job.salary.min,
          max: job.salary.max,
          currency: job.salary.currency || "ZAR",
          period: job.salary.period || "month"
        } : undefined,
        skills: job.skills || [],
        jobType: job.jobType || "Full-time",
        industry: job.industry || "",
        experienceLevel: job.experienceLevel || "",
        educationLevel: job.education || "",
        postDate: job.postedDate,
        applicationUrl: job.url,
        source: "JobsDB"
      }));
    } catch (error) {
      console.error("JobsDB API error:", error);
      return [];
    }
  }
  
  async getJobById(id: string): Promise<JobPosting | null> {
    if (!this.apiKey) {
      throw new Error("JobsDB API key not configured");
    }
    
    try {
      // Extract the actual ID (remove the "jdb-" prefix)
      const jobId = id.replace("jdb-", "");
      
      // API endpoint for JobsDB's job details
      const endpoint = `https://api.jobsdb.co.za/v1/jobs/${jobId}`;
      
      // Make the API request
      const response = await fetch(`${endpoint}?apiKey=${this.apiKey}`);
      
      if (!response.ok) {
        throw new Error(`JobsDB API returned ${response.status}: ${response.statusText}`);
      }
      
      const job = await response.json();
      
      // Transform the response into our JobPosting format
      return {
        id: `jdb-${job.id}`,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        requirements: job.requirements || [],
        salary: job.salary ? {
          min: job.salary.min,
          max: job.salary.max,
          currency: job.salary.currency || "ZAR",
          period: job.salary.period || "month"
        } : undefined,
        skills: job.skills || [],
        jobType: job.jobType || "Full-time",
        industry: job.industry || "",
        experienceLevel: job.experienceLevel || "",
        educationLevel: job.education || "",
        postDate: job.postedDate,
        applicationUrl: job.url,
        source: "JobsDB"
      };
    } catch (error) {
      console.error("JobsDB API error:", error);
      return null;
    }
  }
}

// Use GPT to format job descriptions from diverse sources into a consistent format
async function uniformJobDescription(description: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a job description expert. Please format the given job description into a clear, structured format. Keep the content the same but make it more readable."
        },
        {
          role: "user",
          content: description
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0].message.content || description;
  } catch (error) {
    console.error("Error formatting job description:", error);
    return description; // Return original if error
  }
}

// Use GPT to extract skills from job description
async function extractSkillsFromJob(jobTitle: string, jobDescription: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a skill extraction expert. Extract a list of relevant technical and soft skills from this job description. Focus on skills that are explicitly mentioned or strongly implied. Format as a JSON array of skill names only."
        },
        {
          role: "user",
          content: `Job Title: ${jobTitle}\n\nJob Description: ${jobDescription}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) return [];
    
    const parsed = JSON.parse(content);
    return parsed.skills || [];
  } catch (error) {
    console.error("Error extracting skills:", error);
    return []; // Return empty array if error
  }
}

// Use GPT to structure job requirements
async function extractRequirements(jobDescription: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a job requirements extraction expert. Extract a list of clear, specific requirements from this job description. Format as a JSON array of requirement statements."
        },
        {
          role: "user",
          content: jobDescription
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) return [];
    
    const parsed = JSON.parse(content);
    return parsed.requirements || [];
  } catch (error) {
    console.error("Error extracting requirements:", error);
    return []; // Return empty array if error
  }
}

// Main job search service that aggregates results from multiple sources
export class JobBoardService {
  private careerJunction: CareerJunctionService;
  private jobsDB: JobsDBService;
  
  constructor() {
    this.careerJunction = new CareerJunctionService();
    this.jobsDB = new JobsDBService();
  }
  
  // Detect which service an ID belongs to
  private getServiceForJobId(id: string): { service: 'careerJunction' | 'jobsDB', jobId: string } {
    if (id.startsWith('cj-')) {
      return { service: 'careerJunction', jobId: id };
    } else if (id.startsWith('jdb-')) {
      return { service: 'jobsDB', jobId: id };
    } else {
      throw new Error(`Unknown job ID format: ${id}`);
    }
  }
  
  async searchJobs(params: JobSearchParams): Promise<JobSearchResults> {
    let allJobs: JobPosting[] = [];
    const sources: string[] = [];
    let totalCount = 0;
    
    // Search CareerJunction if configured
    if (this.careerJunction.isConfigured()) {
      try {
        const cjJobs = await this.careerJunction.search(params);
        allJobs = [...allJobs, ...cjJobs];
        totalCount += cjJobs.length;
        sources.push("CareerJunction");
      } catch (error) {
        console.error("CareerJunction search error:", error);
      }
    }
    
    // Search JobsDB if configured
    if (this.jobsDB.isConfigured()) {
      try {
        const jdbJobs = await this.jobsDB.search(params);
        allJobs = [...allJobs, ...jdbJobs];
        totalCount += jdbJobs.length;
        sources.push("JobsDB");
      } catch (error) {
        console.error("JobsDB search error:", error);
      }
    }
    
    // If no APIs are configured or no results, use sample data for testing
    if (allJobs.length === 0) {
      console.log("No job board APIs configured or no results found. Using sample data.");
      
      const failedAPIs = [];
      if (!this.careerJunction.isConfigured()) failedAPIs.push("CareerJunction");
      if (!this.jobsDB.isConfigured()) failedAPIs.push("JobsDB");
      
      return {
        jobs: [],
        totalCount: 0,
        sources: []
      };
    }
    
    // Sort and paginate results
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    // Sort by date by default
    allJobs.sort((a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime());
    
    return {
      jobs: allJobs.slice(start, end),
      totalCount,
      sources
    };
  }
  
  async getJobById(id: string): Promise<JobPosting | null> {
    try {
      const { service, jobId } = this.getServiceForJobId(id);
      
      if (service === 'careerJunction') {
        return await this.careerJunction.getJobById(jobId);
      } else if (service === 'jobsDB') {
        return await this.jobsDB.getJobById(jobId);
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching job by ID:", error);
      return null;
    }
  }
  
  // Process and enhance a job posting with AI
  async enhanceJobPosting(job: JobPosting): Promise<JobPosting> {
    // Format the description
    job.description = await uniformJobDescription(job.description);
    
    // Extract skills if not present
    if (!job.skills || job.skills.length === 0) {
      job.skills = await extractSkillsFromJob(job.title, job.description);
    }
    
    // Extract requirements if not present
    if (!job.requirements || job.requirements.length === 0) {
      job.requirements = await extractRequirements(job.description);
    }
    
    return job;
  }
}

// Export instance
export const jobBoardService = new JobBoardService();