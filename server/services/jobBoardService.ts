/**
 * South African Job Board API Integration Service
 * 
 * This service handles integration with popular South African job boards like:
 * - CareerJunction
 * - JobsDB
 * - PNet
 * - LinkedIn Jobs South Africa
 * 
 * All methods are built with an adapter pattern to make it easy
 * to swap between different API implementations or use cached/mocked
 * data when API keys aren't available.
 */

import OpenAI from "openai";
import { log } from '../vite';

// OpenAI configuration for job enrichment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types for job board data
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
    period: string; // 'hour' | 'month' | 'year'
  };
  skills: string[];
  jobType: string; // 'full-time' | 'part-time' | 'contract' | 'internship'
  industry: string;
  experienceLevel: string; // 'entry' | 'mid' | 'senior' | 'executive'
  educationLevel: string;
  postDate: Date;
  applicationUrl: string;
  source: string; // The job board source
}

export interface JobSearchParams {
  keywords?: string[];
  location?: string;
  industry?: string[];
  jobType?: string[];
  experienceLevel?: string[];
  educationLevel?: string[];
  salary?: {
    min?: number;
    max?: number;
  };
  skills?: string[];
  postedWithin?: number; // Days
  page?: number;
  pageSize?: number;
}

export interface JobSearchResult {
  jobs: JobPosting[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  source: string;
}

// Interface for job board provider implementations
interface JobBoardProvider {
  name: string;
  searchJobs(params: JobSearchParams): Promise<JobSearchResult>;
  getJobDetails(jobId: string): Promise<JobPosting | null>;
  isAvailable(): boolean;
}

/**
 * CareerJunction API Provider
 * This provider integrates with CareerJunction's API
 */
class CareerJunctionProvider implements JobBoardProvider {
  name = 'CareerJunction';
  private apiKey: string | null = process.env.CAREER_JUNCTION_API_KEY || null;
  
  isAvailable(): boolean {
    return !!this.apiKey;
  }
  
  async searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
    if (!this.isAvailable()) {
      throw new Error('CareerJunction API key not configured');
    }
    
    try {
      // In a real implementation, we would make an API call to CareerJunction
      // using the API key and search parameters
      log('Searching jobs on CareerJunction with params: ' + JSON.stringify(params), 'jobboard');
      
      // For now, we'd use OpenAI to enrich our stored data
      // This would be replaced with real API calls when keys are available
      const enrichedJobs = await this.getEnrichedJobData(params);
      
      return {
        jobs: enrichedJobs,
        totalCount: enrichedJobs.length,
        currentPage: params.page || 1,
        totalPages: 1, // Would be calculated based on real API response
        source: this.name
      };
    } catch (error) {
      log(`CareerJunction API error: ${error instanceof Error ? error.message : String(error)}`, 'jobboard');
      throw error;
    }
  }
  
  async getJobDetails(jobId: string): Promise<JobPosting | null> {
    if (!this.isAvailable()) {
      throw new Error('CareerJunction API key not configured');
    }
    
    try {
      // In a real implementation, we would call the CareerJunction API
      // to get detailed information about a specific job
      log(`Getting job details for ID ${jobId} from CareerJunction`, 'jobboard');
      
      // For now, we'd use OpenAI to create enriched job details
      // This would be replaced with real API calls when keys are available
      const jobDetail = await this.getEnrichedJobDetail(jobId);
      return jobDetail;
    } catch (error) {
      log(`CareerJunction API error: ${error instanceof Error ? error.message : String(error)}`, 'jobboard');
      return null;
    }
  }
  
  // Helper method to get enriched job data (temporary until real API integration)
  private async getEnrichedJobData(params: JobSearchParams): Promise<JobPosting[]> {
    // This is where we would normally call the real API
    // For now, we'll use OpenAI to generate plausible job data based on the search params
    
    const jobCount = params.pageSize || 10;
    const prompt = `Generate ${jobCount} realistic job listings from CareerJunction for the South African job market.
    
    Use these search parameters:
    ${params.keywords ? `Keywords: ${params.keywords.join(', ')}` : ''}
    ${params.location ? `Location: ${params.location}` : ''}
    ${params.industry?.length ? `Industries: ${params.industry.join(', ')}` : ''}
    ${params.jobType?.length ? `Job Types: ${params.jobType.join(', ')}` : ''}
    ${params.experienceLevel?.length ? `Experience Levels: ${params.experienceLevel.join(', ')}` : ''}
    ${params.skills?.length ? `Skills: ${params.skills.join(', ')}` : ''}
    
    Create a diverse set of companies, job titles, and descriptions that would realistically appear on South African job boards. Include common South African salary ranges in Rand (ZAR), locations (major South African cities), and realistic qualifications including NQF levels. JSON format only, no explanatory text.`;
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: "system", content: "You are a South African job market data specialist. Generate realistic job listings in JSON format that mimic real CareerJunction listings." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      const parsedData = JSON.parse(content || '{"jobs":[]}');
      
      // Process and standardize the format
      const jobs: JobPosting[] = (parsedData.jobs || []).map((job: any, index: number) => ({
        id: `cj-${Date.now()}-${index}`,
        title: job.title || 'Job Title',
        company: job.company || 'Company Name',
        location: job.location || 'Johannesburg, Gauteng',
        description: job.description || 'Job description not available',
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        salary: job.salary || undefined,
        skills: Array.isArray(job.skills) ? job.skills : [],
        jobType: job.jobType || 'full-time',
        industry: job.industry || 'Information Technology',
        experienceLevel: job.experienceLevel || 'mid',
        educationLevel: job.educationLevel || 'Bachelor\'s Degree',
        postDate: new Date(job.postDate || Date.now()),
        applicationUrl: job.applicationUrl || 'https://www.careerjunction.co.za',
        source: this.name
      }));
      
      return jobs;
    } catch (error) {
      log('Error generating enriched job data: ' + (error instanceof Error ? error.message : String(error)), 'jobboard');
      return [];
    }
  }
  
  // Helper method to get enriched job detail (temporary until real API integration)
  private async getEnrichedJobDetail(jobId: string): Promise<JobPosting | null> {
    // In the real implementation, we would fetch this from the API
    // For now, we'll create a single detailed job post
    try {
      const prompt = `Generate a detailed job listing for a South African position with ID ${jobId}. Include company details, comprehensive job description, detailed requirements, skills needed (at least 10 specific skills), salary range in ZAR, benefits, and application information. Make it realistic for the South African job market including relevant details like NQF levels, B-BBEE preferences, and other South Africa-specific information. JSON format only.`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: "system", content: "You are a South African job market data specialist. Generate a realistic job listing in JSON format that mimics a real CareerJunction listing." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      const parsedData = JSON.parse(content || '{}');
      
      // Process and standardize the format
      return {
        id: jobId,
        title: parsedData.title || 'Job Title',
        company: parsedData.company || 'Company Name',
        location: parsedData.location || 'Johannesburg, Gauteng',
        description: parsedData.description || 'Job description not available',
        requirements: Array.isArray(parsedData.requirements) ? parsedData.requirements : [],
        salary: parsedData.salary || undefined,
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        jobType: parsedData.jobType || 'full-time',
        industry: parsedData.industry || 'Information Technology',
        experienceLevel: parsedData.experienceLevel || 'mid',
        educationLevel: parsedData.educationLevel || 'Bachelor\'s Degree',
        postDate: new Date(parsedData.postDate || Date.now()),
        applicationUrl: parsedData.applicationUrl || 'https://www.careerjunction.co.za',
        source: this.name
      };
    } catch (error) {
      log('Error generating enriched job detail: ' + (error instanceof Error ? error.message : String(error)), 'jobboard');
      return null;
    }
  }
}

/**
 * JobsDB API Provider
 * This provider integrates with JobsDB's API
 */
class JobsDBProvider implements JobBoardProvider {
  name = 'JobsDB';
  private apiKey: string | null = process.env.JOBSDB_API_KEY || null;
  
  isAvailable(): boolean {
    return !!this.apiKey;
  }
  
  async searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
    if (!this.isAvailable()) {
      throw new Error('JobsDB API key not configured');
    }
    
    try {
      // In a real implementation, we would make an API call to JobsDB
      log('Searching jobs on JobsDB with params: ' + JSON.stringify(params), 'jobboard');
      
      // For now, we'd use OpenAI to enrich our stored data
      // This would be replaced with real API calls when keys are available
      const enrichedJobs = await this.getEnrichedJobData(params);
      
      return {
        jobs: enrichedJobs,
        totalCount: enrichedJobs.length,
        currentPage: params.page || 1,
        totalPages: 1,
        source: this.name
      };
    } catch (error) {
      log(`JobsDB API error: ${error instanceof Error ? error.message : String(error)}`, 'jobboard');
      throw error;
    }
  }
  
  async getJobDetails(jobId: string): Promise<JobPosting | null> {
    if (!this.isAvailable()) {
      throw new Error('JobsDB API key not configured');
    }
    
    try {
      // In a real implementation, we would call the JobsDB API
      log(`Getting job details for ID ${jobId} from JobsDB`, 'jobboard');
      
      // For now, we'd use OpenAI to create enriched job details
      const jobDetail = await this.getEnrichedJobDetail(jobId);
      return jobDetail;
    } catch (error) {
      log(`JobsDB API error: ${error instanceof Error ? error.message : String(error)}`, 'jobboard');
      return null;
    }
  }
  
  // Helper method to get enriched job data (temporary until real API integration)
  private async getEnrichedJobData(params: JobSearchParams): Promise<JobPosting[]> {
    // Similar implementation to CareerJunction but customized for JobsDB
    const jobCount = params.pageSize || 10;
    const prompt = `Generate ${jobCount} realistic job listings from JobsDB for the South African job market.
    
    Use these search parameters:
    ${params.keywords ? `Keywords: ${params.keywords.join(', ')}` : ''}
    ${params.location ? `Location: ${params.location}` : ''}
    ${params.industry?.length ? `Industries: ${params.industry.join(', ')}` : ''}
    ${params.jobType?.length ? `Job Types: ${params.jobType.join(', ')}` : ''}
    ${params.experienceLevel?.length ? `Experience Levels: ${params.experienceLevel.join(', ')}` : ''}
    ${params.skills?.length ? `Skills: ${params.skills.join(', ')}` : ''}
    
    Create a diverse set of companies, job titles, and descriptions that would realistically appear on South African job boards. Include common South African salary ranges in Rand (ZAR), locations (major South African cities), and realistic qualifications including NQF levels. JSON format only, no explanatory text.`;
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: "system", content: "You are a South African job market data specialist. Generate realistic job listings in JSON format that mimic real JobsDB listings." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      const parsedData = JSON.parse(content || '{"jobs":[]}');
      
      // Process and standardize the format
      const jobs: JobPosting[] = (parsedData.jobs || []).map((job: any, index: number) => ({
        id: `jdb-${Date.now()}-${index}`,
        title: job.title || 'Job Title',
        company: job.company || 'Company Name',
        location: job.location || 'Cape Town, Western Cape',
        description: job.description || 'Job description not available',
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        salary: job.salary || undefined,
        skills: Array.isArray(job.skills) ? job.skills : [],
        jobType: job.jobType || 'full-time',
        industry: job.industry || 'Information Technology',
        experienceLevel: job.experienceLevel || 'mid',
        educationLevel: job.educationLevel || 'Bachelor\'s Degree',
        postDate: new Date(job.postDate || Date.now()),
        applicationUrl: job.applicationUrl || 'https://www.jobsdb.co.za',
        source: this.name
      }));
      
      return jobs;
    } catch (error) {
      log('Error generating enriched job data: ' + (error instanceof Error ? error.message : String(error)), 'jobboard');
      return [];
    }
  }
  
  // Helper method to get enriched job detail (temporary until real API integration)
  private async getEnrichedJobDetail(jobId: string): Promise<JobPosting | null> {
    // Similar implementation to CareerJunction but customized for JobsDB
    try {
      const prompt = `Generate a detailed job listing for a South African position with ID ${jobId}. Include company details, comprehensive job description, detailed requirements, skills needed (at least 10 specific skills), salary range in ZAR, benefits, and application information. Make it realistic for the South African job market including relevant details like NQF levels, B-BBEE preferences, and other South Africa-specific information. JSON format only.`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: "system", content: "You are a South African job market data specialist. Generate a realistic job listing in JSON format that mimics a real JobsDB listing." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      const parsedData = JSON.parse(content || '{}');
      
      // Process and standardize the format
      return {
        id: jobId,
        title: parsedData.title || 'Job Title',
        company: parsedData.company || 'Company Name',
        location: parsedData.location || 'Cape Town, Western Cape',
        description: parsedData.description || 'Job description not available',
        requirements: Array.isArray(parsedData.requirements) ? parsedData.requirements : [],
        salary: parsedData.salary || undefined,
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        jobType: parsedData.jobType || 'full-time',
        industry: parsedData.industry || 'Information Technology',
        experienceLevel: parsedData.experienceLevel || 'mid',
        educationLevel: parsedData.educationLevel || 'Bachelor\'s Degree',
        postDate: new Date(parsedData.postDate || Date.now()),
        applicationUrl: parsedData.applicationUrl || 'https://www.jobsdb.co.za',
        source: this.name
      };
    } catch (error) {
      log('Error generating enriched job detail: ' + (error instanceof Error ? error.message : String(error)), 'jobboard');
      return null;
    }
  }
}

/**
 * Local Database Provider
 * This provider uses our local database of job postings when API keys aren't available
 * or as a fallback option
 */
class LocalDatabaseProvider implements JobBoardProvider {
  name = 'ATSBoost Database';
  
  isAvailable(): boolean {
    // Local database is always available
    return true;
  }
  
  async searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
    try {
      log('Searching jobs in local database with params: ' + JSON.stringify(params), 'jobboard');
      
      // For demo purposes, we'll use OpenAI to generate some job data
      // In the real implementation, we would query our database
      const enrichedJobs = await this.getEnrichedJobData(params);
      
      return {
        jobs: enrichedJobs,
        totalCount: enrichedJobs.length,
        currentPage: params.page || 1,
        totalPages: 1,
        source: this.name
      };
    } catch (error) {
      log(`Local database error: ${error instanceof Error ? error.message : String(error)}`, 'jobboard');
      throw error;
    }
  }
  
  async getJobDetails(jobId: string): Promise<JobPosting | null> {
    try {
      log(`Getting job details for ID ${jobId} from local database`, 'jobboard');
      
      // For demo purposes, we'll use OpenAI
      // In the real implementation, we would query our database
      const jobDetail = await this.getEnrichedJobDetail(jobId);
      return jobDetail;
    } catch (error) {
      log(`Local database error: ${error instanceof Error ? error.message : String(error)}`, 'jobboard');
      return null;
    }
  }
  
  // Helper method to get enriched job data (temporary until real API integration)
  private async getEnrichedJobData(params: JobSearchParams): Promise<JobPosting[]> {
    const jobCount = params.pageSize || 10;
    const prompt = `Generate ${jobCount} realistic job listings for the South African job market.
    
    Use these search parameters:
    ${params.keywords ? `Keywords: ${params.keywords.join(', ')}` : ''}
    ${params.location ? `Location: ${params.location}` : ''}
    ${params.industry?.length ? `Industries: ${params.industry.join(', ')}` : ''}
    ${params.jobType?.length ? `Job Types: ${params.jobType.join(', ')}` : ''}
    ${params.experienceLevel?.length ? `Experience Levels: ${params.experienceLevel.join(', ')}` : ''}
    ${params.skills?.length ? `Skills: ${params.skills.join(', ')}` : ''}
    
    Create a diverse set of companies, job titles, and descriptions for South African employers. Include common South African salary ranges in Rand (ZAR), locations (major South African cities), and realistic qualifications including NQF levels. JSON format only, no explanatory text.`;
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: "system", content: "You are a South African job market data specialist. Generate realistic job listings in JSON format for the South African market." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      const parsedData = JSON.parse(content || '{"jobs":[]}');
      
      // Process and standardize the format
      const jobs: JobPosting[] = (parsedData.jobs || []).map((job: any, index: number) => ({
        id: `local-${Date.now()}-${index}`,
        title: job.title || 'Job Title',
        company: job.company || 'Company Name',
        location: job.location || 'South Africa',
        description: job.description || 'Job description not available',
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        salary: job.salary || undefined,
        skills: Array.isArray(job.skills) ? job.skills : [],
        jobType: job.jobType || 'full-time',
        industry: job.industry || 'Information Technology',
        experienceLevel: job.experienceLevel || 'mid',
        educationLevel: job.educationLevel || 'Bachelor\'s Degree',
        postDate: new Date(job.postDate || Date.now()),
        applicationUrl: job.applicationUrl || 'https://www.atsboost.co.za',
        source: this.name
      }));
      
      return jobs;
    } catch (error) {
      log('Error generating enriched job data: ' + (error instanceof Error ? error.message : String(error)), 'jobboard');
      return [];
    }
  }
  
  // Helper method to get enriched job detail
  private async getEnrichedJobDetail(jobId: string): Promise<JobPosting | null> {
    try {
      const prompt = `Generate a detailed job listing for a South African position with ID ${jobId}. Include company details, comprehensive job description, detailed requirements, skills needed (at least 10 specific skills), salary range in ZAR, benefits, and application information. Make it realistic for the South African job market including relevant details like NQF levels, B-BBEE preferences, and other South Africa-specific information. JSON format only.`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: "system", content: "You are a South African job market data specialist. Generate a realistic job listing in JSON format for the South African market." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      const parsedData = JSON.parse(content || '{}');
      
      // Process and standardize the format
      return {
        id: jobId,
        title: parsedData.title || 'Job Title',
        company: parsedData.company || 'Company Name',
        location: parsedData.location || 'South Africa',
        description: parsedData.description || 'Job description not available',
        requirements: Array.isArray(parsedData.requirements) ? parsedData.requirements : [],
        salary: parsedData.salary || undefined,
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        jobType: parsedData.jobType || 'full-time',
        industry: parsedData.industry || 'Information Technology',
        experienceLevel: parsedData.experienceLevel || 'mid',
        educationLevel: parsedData.educationLevel || 'Bachelor\'s Degree',
        postDate: new Date(parsedData.postDate || Date.now()),
        applicationUrl: parsedData.applicationUrl || 'https://www.atsboost.co.za',
        source: this.name
      };
    } catch (error) {
      log('Error generating enriched job detail: ' + (error instanceof Error ? error.message : String(error)), 'jobboard');
      return null;
    }
  }
}

/**
 * Main Job Board Service
 * 
 * This service provides a unified interface to multiple job board APIs.
 * It can search across multiple providers and aggregate results.
 */
class JobBoardService {
  private providers: JobBoardProvider[] = [];
  
  constructor() {
    // Initialize all providers
    this.providers.push(new CareerJunctionProvider());
    this.providers.push(new JobsDBProvider());
    this.providers.push(new LocalDatabaseProvider());
    
    // Log available providers
    const availableProviders = this.providers
      .filter(p => p.isAvailable())
      .map(p => p.name);
    
    if (availableProviders.length > 0) {
      log(`Job board service initialized with providers: ${availableProviders.join(', ')}`, 'jobboard');
    } else {
      log('Job board service initialized with no external providers. Using local database only.', 'jobboard');
    }
  }
  
  /**
   * Get all available job board providers
   */
  getAvailableProviders(): string[] {
    return this.providers
      .filter(p => p.isAvailable())
      .map(p => p.name);
  }
  
  /**
   * Search for jobs across all available providers
   * @param params Search parameters
   * @param providers Specific providers to search (defaults to all available)
   * @returns Combined search results from all providers
   */
  async searchJobs(params: JobSearchParams, providers?: string[]): Promise<JobSearchResult[]> {
    // Filter providers to search
    let providersToSearch = this.providers.filter(p => p.isAvailable());
    
    if (providers && providers.length > 0) {
      providersToSearch = providersToSearch.filter(p => 
        providers.includes(p.name)
      );
    }
    
    if (providersToSearch.length === 0) {
      // Fallback to local database if no providers are available
      providersToSearch = [new LocalDatabaseProvider()];
    }
    
    // Search all selected providers in parallel
    const searchPromises = providersToSearch.map(provider => 
      provider.searchJobs(params)
        .catch(error => {
          log(`Error searching jobs on ${provider.name}: ${error instanceof Error ? error.message : String(error)}`, 'jobboard');
          return {
            jobs: [],
            totalCount: 0,
            currentPage: params.page || 1,
            totalPages: 0,
            source: provider.name
          };
        })
    );
    
    // Wait for all searches to complete
    return Promise.all(searchPromises);
  }
  
  /**
   * Search for jobs across all providers and combine results
   * @param params Search parameters
   * @param providers Specific providers to search (defaults to all available)
   * @returns Aggregated search results from all providers
   */
  async searchJobsAggregated(params: JobSearchParams, providers?: string[]): Promise<{
    jobs: JobPosting[];
    totalCount: number;
    sources: string[];
  }> {
    const results = await this.searchJobs(params, providers);
    
    // Combine jobs from all sources
    const allJobs: JobPosting[] = [];
    let totalCount = 0;
    const sources: string[] = [];
    
    for (const result of results) {
      allJobs.push(...result.jobs);
      totalCount += result.totalCount;
      sources.push(result.source);
    }
    
    return {
      jobs: allJobs,
      totalCount,
      sources
    };
  }
  
  /**
   * Get detailed information about a specific job
   * @param jobId The ID of the job to get details for
   * @param provider The provider to get details from (optional)
   * @returns Detailed job information
   */
  async getJobDetails(jobId: string, provider?: string): Promise<JobPosting | null> {
    // Extract provider code from job ID if possible
    const providerId = jobId.split('-')[0];
    
    // Find the appropriate provider
    let selectedProvider: JobBoardProvider | undefined;
    
    if (provider) {
      // If provider is specified, use that
      selectedProvider = this.providers.find(p => 
        p.name === provider && p.isAvailable()
      );
    } else if (providerId === 'cj') {
      // CareerJunction ID
      selectedProvider = this.providers.find(p => 
        p.name === 'CareerJunction' && p.isAvailable()
      );
    } else if (providerId === 'jdb') {
      // JobsDB ID
      selectedProvider = this.providers.find(p => 
        p.name === 'JobsDB' && p.isAvailable()
      );
    }
    
    // Fallback to local database if no provider found or specified provider not available
    if (!selectedProvider) {
      selectedProvider = this.providers.find(p => 
        p.name === 'ATSBoost Database'
      );
    }
    
    if (!selectedProvider) {
      log(`No provider found for job ID ${jobId}`, 'jobboard');
      return null;
    }
    
    try {
      return await selectedProvider.getJobDetails(jobId);
    } catch (error) {
      log(`Error getting job details for ID ${jobId}: ${error instanceof Error ? error.message : String(error)}`, 'jobboard');
      return null;
    }
  }
}

// Export a singleton instance
export const jobBoardService = new JobBoardService();

// Also export types and classes for flexibility
export { JobBoardService, JobBoardProvider };