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
    
    // If no APIs are configured or no results, provide information about missing API keys
    if (allJobs.length === 0) {
      console.log("No job board APIs configured or no results found.");
      
      const failedAPIs = [];
      if (!this.careerJunction.isConfigured()) failedAPIs.push("CareerJunction");
      if (!this.jobsDB.isConfigured()) failedAPIs.push("JobsDB");
      
      if (failedAPIs.length > 0) {
        console.log("Missing API keys for:", failedAPIs.join(", "));
      }
      
      // For testing purposes only, let's return some sample job listings
      // that match South African context
      const samplejobs = [
        {
          id: "sample-1",
          title: "Senior Software Developer",
          company: "Tech Innovations SA",
          location: "Cape Town, Western Cape",
          description: "We are looking for a Senior Software Developer with expertise in React, Node.js, and PostgreSQL to join our growing team. The ideal candidate will have experience building scalable web applications and leading development teams.",
          requirements: [
            "5+ years of experience in software development",
            "Proficient in React, Node.js, and TypeScript",
            "Experience with PostgreSQL and REST API design",
            "Familiarity with cloud services (AWS, Azure, or GCP)",
            "Bachelor's degree in Computer Science or related field",
            "Strong problem-solving skills and attention to detail"
          ],
          salary: {
            min: 50000,
            max: 75000,
            currency: "ZAR",
            period: "month"
          },
          skills: [
            "React",
            "Node.js",
            "TypeScript",
            "PostgreSQL",
            "RESTful APIs",
            "Cloud Services",
            "Team Leadership"
          ],
          jobType: "Full-time",
          industry: "Information Technology",
          experienceLevel: "Senior",
          educationLevel: "Bachelor's Degree",
          postDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          applicationUrl: "https://example.com/apply",
          source: "Sample"
        },
        {
          id: "sample-2",
          title: "Marketing Manager",
          company: "Brand Masters",
          location: "Johannesburg, Gauteng",
          description: "Brand Masters is seeking a creative and data-driven Marketing Manager to oversee our digital marketing strategies. You will be responsible for planning and executing marketing campaigns, analyzing market trends, and optimizing our online presence.",
          requirements: [
            "3-5 years of marketing experience",
            "Proven track record in digital marketing and campaign management",
            "Experience with SEO, SEM, and social media marketing",
            "Strong analytical skills with the ability to interpret data",
            "Excellent communication and leadership abilities",
            "Marketing degree or relevant qualification"
          ],
          salary: {
            min: 35000,
            max: 45000,
            currency: "ZAR",
            period: "month"
          },
          skills: [
            "Digital Marketing",
            "Campaign Management",
            "SEO/SEM",
            "Social Media Marketing",
            "Data Analysis",
            "Content Strategy",
            "Team Management"
          ],
          jobType: "Full-time",
          industry: "Marketing and Advertising",
          experienceLevel: "Mid-Level",
          educationLevel: "Bachelor's Degree",
          postDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          applicationUrl: "https://example.com/apply",
          source: "Sample"
        },
        {
          id: "sample-3",
          title: "Financial Accountant",
          company: "Momentum Financial Services",
          location: "Pretoria, Gauteng",
          description: "Join our financial team as a Financial Accountant. You will be responsible for preparing financial statements, managing budgets, and ensuring compliance with South African tax regulations. Must have good knowledge of IFRS and tax laws.",
          requirements: [
            "Minimum 4 years of accounting experience",
            "CA(SA) qualification",
            "Knowledge of IFRS and South African tax laws",
            "Experience with financial reporting software",
            "Detail-oriented with strong analytical skills",
            "Excellent communication abilities"
          ],
          salary: {
            min: 40000,
            max: 55000,
            currency: "ZAR",
            period: "month"
          },
          skills: [
            "Financial Accounting",
            "IFRS",
            "Tax Compliance",
            "Financial Reporting",
            "Budgeting",
            "Auditing",
            "Analytical Thinking"
          ],
          jobType: "Full-time",
          industry: "Financial Services",
          experienceLevel: "Mid-Level",
          educationLevel: "CA(SA) Qualification",
          postDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          applicationUrl: "https://example.com/apply",
          source: "Sample"
        },
        {
          id: "sample-4",
          title: "Junior Data Scientist",
          company: "DataSense Analytics",
          location: "Remote, South Africa",
          description: "DataSense is looking for a Junior Data Scientist to join our growing team. You will assist in developing machine learning models, analyzing large datasets, and generating insights to support business decisions.",
          requirements: [
            "Bachelor's degree in Statistics, Mathematics, Computer Science, or related field",
            "Knowledge of Python and data analysis libraries (Pandas, NumPy, etc.)",
            "Experience with machine learning algorithms",
            "Understanding of statistical analysis",
            "Good communication skills",
            "Problem-solving mindset"
          ],
          salary: {
            min: 25000,
            max: 35000,
            currency: "ZAR",
            period: "month"
          },
          skills: [
            "Python",
            "Machine Learning",
            "Data Analysis",
            "Statistical Modeling",
            "SQL",
            "Data Visualization",
            "Problem Solving"
          ],
          jobType: "Full-time",
          industry: "Data Analytics",
          experienceLevel: "Entry Level",
          educationLevel: "Bachelor's Degree",
          postDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          applicationUrl: "https://example.com/apply",
          source: "Sample"
        },
        {
          id: "sample-5",
          title: "HR Manager",
          company: "Talent Solutions SA",
          location: "Durban, KwaZulu-Natal",
          description: "We are seeking an experienced HR Manager to oversee all human resources functions including recruitment, employee relations, performance management, and B-BBEE compliance. The ideal candidate will have experience in South African labor law and HR best practices.",
          requirements: [
            "5+ years of experience in Human Resources",
            "Knowledge of South African labor laws and regulations",
            "Experience with B-BBEE compliance and reporting",
            "Strong interpersonal and conflict resolution skills",
            "Bachelor's degree in Human Resources or related field",
            "Experience with HRIS systems"
          ],
          salary: {
            min: 35000,
            max: 50000,
            currency: "ZAR",
            period: "month"
          },
          skills: [
            "Human Resources Management",
            "South African Labor Law",
            "B-BBEE Compliance",
            "Performance Management",
            "Recruitment",
            "Employee Relations",
            "Conflict Resolution"
          ],
          jobType: "Full-time",
          industry: "Human Resources",
          experienceLevel: "Senior",
          educationLevel: "Bachelor's Degree",
          postDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          applicationUrl: "https://example.com/apply",
          source: "Sample"
        }
      ];
      
      // Filter based on search params if provided
      let filteredJobs = samplejobs;
      
      if (params.keywords) {
        const searchTerms = params.keywords.toLowerCase().split(' ');
        filteredJobs = filteredJobs.filter(job => {
          return searchTerms.some(term => 
            job.title.toLowerCase().includes(term) || 
            job.company.toLowerCase().includes(term) ||
            job.description.toLowerCase().includes(term) ||
            job.skills.some(skill => skill.toLowerCase().includes(term))
          );
        });
      }
      
      if (params.location) {
        const locationTerm = params.location.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes(locationTerm)
        );
      }
      
      if (params.industry) {
        const industryTerm = params.industry.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.industry.toLowerCase().includes(industryTerm)
        );
      }
      
      if (params.jobType) {
        filteredJobs = filteredJobs.filter(job => 
          job.jobType.toLowerCase() === params.jobType?.toLowerCase()
        );
      }
      
      if (params.experienceLevel) {
        filteredJobs = filteredJobs.filter(job => 
          job.experienceLevel.toLowerCase().includes(params.experienceLevel?.toLowerCase() || '')
        );
      }
      
      // Sort results - default to newest first
      filteredJobs.sort((a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime());
      
      // Calculate pagination
      const start = (params.page || 1 - 1) * (params.pageSize || 10);
      const end = start + (params.pageSize || 10);
      const paginatedJobs = filteredJobs.slice(start, end);
      
      return {
        jobs: paginatedJobs,
        totalCount: filteredJobs.length,
        sources: ["Sample"]
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
      // If this is a sample job ID, return the corresponding sample job
      if (id.startsWith('sample-')) {
        const sampleIndex = parseInt(id.split('-')[1]);
        
        // Return one of our sample jobs based on the ID
        // This is just for testing when we don't have real API keys
        const sampleJobs = [
          {
            id: "sample-1",
            title: "Senior Software Developer",
            company: "Tech Innovations SA",
            location: "Cape Town, Western Cape",
            description: "We are looking for a Senior Software Developer with expertise in React, Node.js, and PostgreSQL to join our growing team. The ideal candidate will have experience building scalable web applications and leading development teams.\n\nResponsibilities:\n- Design and implement new features for our flagship product\n- Lead a team of junior developers\n- Review code and mentor team members\n- Collaborate with product managers to define requirements\n- Ensure high-quality, well-tested code\n- Stay up-to-date with emerging trends and technologies\n\nWe offer a competitive salary, flexible working arrangements, and opportunities for career growth in a dynamic tech company.",
            requirements: [
              "5+ years of experience in software development",
              "Proficient in React, Node.js, and TypeScript",
              "Experience with PostgreSQL and REST API design",
              "Familiarity with cloud services (AWS, Azure, or GCP)",
              "Bachelor's degree in Computer Science or related field",
              "Strong problem-solving skills and attention to detail",
              "Experience leading development teams is a plus",
              "Knowledge of agile development methodologies"
            ],
            salary: {
              min: 50000,
              max: 75000,
              currency: "ZAR",
              period: "month"
            },
            skills: [
              "React",
              "Node.js",
              "TypeScript",
              "PostgreSQL",
              "RESTful APIs",
              "Cloud Services",
              "Team Leadership",
              "Agile Development",
              "Code Review",
              "Front-end Development",
              "Back-end Development"
            ],
            jobType: "Full-time",
            industry: "Information Technology",
            experienceLevel: "Senior",
            educationLevel: "Bachelor's Degree",
            postDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            applicationUrl: "https://example.com/apply",
            source: "Sample"
          },
          {
            id: "sample-2",
            title: "Marketing Manager",
            company: "Brand Masters",
            location: "Johannesburg, Gauteng",
            description: "Brand Masters is seeking a creative and data-driven Marketing Manager to oversee our digital marketing strategies. You will be responsible for planning and executing marketing campaigns, analyzing market trends, and optimizing our online presence.\n\nResponsibilities:\n- Develop and implement comprehensive marketing strategies\n- Manage digital marketing campaigns across multiple channels\n- Analyze marketing data to inform decision making\n- Oversee social media presence and engagement\n- Collaborate with content creators and designers\n- Manage marketing budget and resources\n- Stay current on marketing trends and best practices\n\nWe offer a dynamic work environment with opportunities for career advancement, competitive compensation, and a results-oriented culture.",
            requirements: [
              "3-5 years of marketing experience",
              "Proven track record in digital marketing and campaign management",
              "Experience with SEO, SEM, and social media marketing",
              "Strong analytical skills with the ability to interpret data",
              "Excellent communication and leadership abilities",
              "Marketing degree or relevant qualification",
              "Experience with marketing automation tools",
              "Knowledge of South African market trends"
            ],
            salary: {
              min: 35000,
              max: 45000,
              currency: "ZAR",
              period: "month"
            },
            skills: [
              "Digital Marketing",
              "Campaign Management",
              "SEO/SEM",
              "Social Media Marketing",
              "Data Analysis",
              "Content Strategy",
              "Team Management",
              "Budget Management",
              "Marketing Automation",
              "Google Analytics"
            ],
            jobType: "Full-time",
            industry: "Marketing and Advertising",
            experienceLevel: "Mid-Level",
            educationLevel: "Bachelor's Degree",
            postDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            applicationUrl: "https://example.com/apply",
            source: "Sample"
          },
          {
            id: "sample-3",
            title: "Financial Accountant",
            company: "Momentum Financial Services",
            location: "Pretoria, Gauteng",
            description: "Join our financial team as a Financial Accountant. You will be responsible for preparing financial statements, managing budgets, and ensuring compliance with South African tax regulations. Must have good knowledge of IFRS and tax laws.\n\nResponsibilities:\n- Prepare monthly and annual financial statements\n- Ensure compliance with IFRS and local tax regulations\n- Manage month-end and year-end closing processes\n- Prepare and analyze budget variances\n- Assist with external and internal audits\n- Develop and maintain financial controls\n- Support financial planning and analysis\n\nWe offer excellent benefits including medical aid, retirement plan, and professional development opportunities.",
            requirements: [
              "Minimum 4 years of accounting experience",
              "CA(SA) qualification",
              "Knowledge of IFRS and South African tax laws",
              "Experience with financial reporting software",
              "Detail-oriented with strong analytical skills",
              "Excellent communication abilities",
              "Experience with ERP systems, preferably SAP",
              "Ability to work under pressure and meet deadlines"
            ],
            salary: {
              min: 40000,
              max: 55000,
              currency: "ZAR",
              period: "month"
            },
            skills: [
              "Financial Accounting",
              "IFRS",
              "Tax Compliance",
              "Financial Reporting",
              "Budgeting",
              "Auditing",
              "Analytical Thinking",
              "SAP",
              "Financial Controls",
              "Financial Analysis"
            ],
            jobType: "Full-time",
            industry: "Financial Services",
            experienceLevel: "Mid-Level",
            educationLevel: "CA(SA) Qualification",
            postDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            applicationUrl: "https://example.com/apply",
            source: "Sample"
          },
          {
            id: "sample-4",
            title: "Junior Data Scientist",
            company: "DataSense Analytics",
            location: "Remote, South Africa",
            description: "DataSense is looking for a Junior Data Scientist to join our growing team. You will assist in developing machine learning models, analyzing large datasets, and generating insights to support business decisions.\n\nResponsibilities:\n- Collect and preprocess large datasets\n- Develop and implement machine learning models\n- Collaborate with the data engineering team\n- Create data visualizations and reports\n- Support client projects and deliver insights\n- Keep up-to-date with the latest developments in data science\n- Participate in knowledge sharing and team development\n\nWe offer a flexible remote work environment, ongoing learning opportunities, and a chance to work with cutting-edge technologies.",
            requirements: [
              "Bachelor's degree in Statistics, Mathematics, Computer Science, or related field",
              "Knowledge of Python and data analysis libraries (Pandas, NumPy, etc.)",
              "Experience with machine learning algorithms",
              "Understanding of statistical analysis",
              "Good communication skills",
              "Problem-solving mindset",
              "Knowledge of SQL and database concepts",
              "Portfolio demonstrating data science projects is a plus"
            ],
            salary: {
              min: 25000,
              max: 35000,
              currency: "ZAR",
              period: "month"
            },
            skills: [
              "Python",
              "Machine Learning",
              "Data Analysis",
              "Statistical Modeling",
              "SQL",
              "Data Visualization",
              "Problem Solving",
              "Pandas",
              "NumPy",
              "Scikit-learn",
              "Jupyter Notebooks"
            ],
            jobType: "Full-time",
            industry: "Data Analytics",
            experienceLevel: "Entry Level",
            educationLevel: "Bachelor's Degree",
            postDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            applicationUrl: "https://example.com/apply",
            source: "Sample"
          },
          {
            id: "sample-5",
            title: "HR Manager",
            company: "Talent Solutions SA",
            location: "Durban, KwaZulu-Natal",
            description: "We are seeking an experienced HR Manager to oversee all human resources functions including recruitment, employee relations, performance management, and B-BBEE compliance. The ideal candidate will have experience in South African labor law and HR best practices.\n\nResponsibilities:\n- Develop and implement HR policies and procedures\n- Manage the full recruitment lifecycle\n- Oversee employee performance management processes\n- Ensure B-BBEE compliance and reporting\n- Handle employee relations and conflict resolution\n- Manage payroll and benefits administration\n- Coordinate training and development initiatives\n\nWe offer a competitive salary package, career advancement opportunities, and a positive work culture.",
            requirements: [
              "5+ years of experience in Human Resources",
              "Knowledge of South African labor laws and regulations",
              "Experience with B-BBEE compliance and reporting",
              "Strong interpersonal and conflict resolution skills",
              "Bachelor's degree in Human Resources or related field",
              "Experience with HRIS systems",
              "Employee relations expertise",
              "Strategic thinking and problem-solving abilities"
            ],
            salary: {
              min: 35000,
              max: 50000,
              currency: "ZAR",
              period: "month"
            },
            skills: [
              "Human Resources Management",
              "South African Labor Law",
              "B-BBEE Compliance",
              "Performance Management",
              "Recruitment",
              "Employee Relations",
              "Conflict Resolution",
              "HRIS Systems",
              "Payroll Management",
              "Training & Development"
            ],
            jobType: "Full-time",
            industry: "Human Resources",
            experienceLevel: "Senior",
            educationLevel: "Bachelor's Degree",
            postDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            applicationUrl: "https://example.com/apply",
            source: "Sample"
          }
        ];
        
        // Return the corresponding sample job
        if (sampleIndex >= 1 && sampleIndex <= sampleJobs.length) {
          return sampleJobs[sampleIndex - 1];
        }
      }
      
      // If not a sample job, try to get from the real job boards
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