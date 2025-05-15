import { CV, JobPosting, cvs, jobPostings } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { openai } from "../services/openai";

// Extract skills from CV content
export async function extractSkillsFromCV(cvContent: string): Promise<string[]> {
  try {
    // Use AI to extract skills from CV content
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a specialized CV analyzer that extracts professional skills from resumes. Focus only on hard and soft skills, technologies, tools, and methodologies. Return a comprehensive list of all skills found in the CV." 
        },
        {
          role: "user",
          content: `Extract all professional skills from this CV. Only return the list of skills as a JSON array.\n\n${cvContent}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.skills || [];
  } catch (error) {
    console.error("Error extracting skills from CV:", error);
    // Fallback to basic keyword extraction if AI fails
    return extractSkillsBasic(cvContent);
  }
}

// Basic keyword-based skill extraction as fallback
function extractSkillsBasic(cvContent: string): string[] {
  // Common skills to look for
  const commonSkills = [
    "JavaScript", "Python", "Java", "C++", "SQL", "HTML", "CSS", "React", 
    "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring", 
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "CI/CD", 
    "Project Management", "Agile", "Scrum", "Communication", "Leadership",
    "Problem Solving", "Critical Thinking", "Time Management", "Teamwork",
    "Marketing", "Sales", "Customer Service", "Data Analysis", "SEO",
    "Content Writing", "Social Media", "Accounting", "Finance", "HR",
    "Microsoft Office", "Excel", "PowerPoint", "Photoshop", "Illustrator"
  ];
  
  // Find matches (case insensitive)
  const foundSkills = new Set<string>();
  
  commonSkills.forEach(skill => {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(cvContent)) {
      foundSkills.add(skill);
    }
  });
  
  return Array.from(foundSkills);
}

// Match CV to job posting
export async function matchCVToJob(
  cv: CV, 
  job: JobPosting
): Promise<{ score: number; matchedSkills: string[] }> {
  try {
    // Extract skills from CV
    const cvSkills = await extractSkillsFromCV(cv.content);
    
    // Get job skills (required and preferred)
    const jobRequiredSkills = job.requiredSkills || [];
    const jobPreferredSkills = job.preferredSkills || [];
    const allJobSkills = [...jobRequiredSkills, ...jobPreferredSkills];
    
    // Find matches (case insensitive)
    const matchedSkills: string[] = [];
    const matchedRequired: string[] = [];
    const matchedPreferred: string[] = [];
    
    // Check for required skills matches
    cvSkills.forEach(cvSkill => {
      // Check required skills
      jobRequiredSkills.forEach(jobSkill => {
        if (cvSkill.toLowerCase() === jobSkill.toLowerCase()) {
          matchedSkills.push(cvSkill);
          matchedRequired.push(cvSkill);
        }
      });
      
      // Check preferred skills
      jobPreferredSkills.forEach(jobSkill => {
        if (cvSkill.toLowerCase() === jobSkill.toLowerCase()) {
          matchedSkills.push(cvSkill);
          matchedPreferred.push(cvSkill);
        }
      });
    });
    
    // Calculate match score
    let score = 0;
    
    // Required skills are more important
    if (jobRequiredSkills.length > 0) {
      score += (matchedRequired.length / jobRequiredSkills.length) * 70; // 70% weight for required skills
    }
    
    // Preferred skills add bonus points
    if (jobPreferredSkills.length > 0) {
      score += (matchedPreferred.length / jobPreferredSkills.length) * 30; // 30% weight for preferred skills
    }
    
    // If no skills were specified for the job, use AI to determine a more general match
    if (allJobSkills.length === 0) {
      score = await calculateAIMatchScore(cv.content, job.description);
    }
    
    return {
      score: Math.round(score),
      matchedSkills: [...new Set(matchedSkills)] // Remove duplicates
    };
  } catch (error) {
    console.error("Error matching CV to job:", error);
    return { score: 0, matchedSkills: [] };
  }
}

// Calculate match score using AI when no specific skills are listed
async function calculateAIMatchScore(cvContent: string, jobDescription: string): Promise<number> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are an AI that specializes in matching job seekers to job positions. Your task is to evaluate how well a candidate's CV matches a job description."
        },
        {
          role: "user",
          content: `Rate how well this CV matches the job description. Consider relevant experience, skills, education, and overall fit. Return a score from 0-100 where 100 is a perfect match.
          
Job Description:
${jobDescription}

CV Content:
${cvContent}

Provide your answer as a JSON object with the following structure:
{
  "score": [0-100 number],
  "reasoning": [brief explanation]
}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.score || 0;
  } catch (error) {
    console.error("Error calculating AI match score:", error);
    return 0; // Default to no match if AI fails
  }
}

// Find the best matching jobs for a CV
export async function findMatchingJobs(
  cvId: number, 
  limit: number = 10
): Promise<Array<{ job: JobPosting; score: number; matchedSkills: string[] }>> {
  try {
    // Get the CV
    const [cv] = await db.select().from(cvs).where(eq(cvs.id, cvId)).limit(1);
    
    if (!cv) {
      throw new Error(`CV with ID ${cvId} not found`);
    }
    
    // Get active job postings
    const jobs = await db.select().from(jobPostings).where(eq(jobPostings.isActive, true));
    
    // Match CV to each job
    const matchesPromises = jobs.map(async (job) => {
      const { score, matchedSkills } = await matchCVToJob(cv, job);
      return { job, score, matchedSkills };
    });
    
    const matches = await Promise.all(matchesPromises);
    
    // Sort by score (highest first) and take the top matches
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error("Error finding matching jobs:", error);
    return [];
  }
}

// Find matching CVs for a job posting
export async function findMatchingCVs(
  jobId: number,
  limit: number = 10
): Promise<Array<{ cv: CV; score: number; matchedSkills: string[] }>> {
  try {
    // Get the job posting
    const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, jobId)).limit(1);
    
    if (!job) {
      throw new Error(`Job posting with ID ${jobId} not found`);
    }
    
    // Get all CVs
    const allCvs = await db.select().from(cvs);
    
    // Match each CV to the job
    const matchesPromises = allCvs.map(async (cv) => {
      const { score, matchedSkills } = await matchCVToJob(cv, job);
      return { cv, score, matchedSkills };
    });
    
    const matches = await Promise.all(matchesPromises);
    
    // Sort by score (highest first) and take the top matches
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error("Error finding matching CVs:", error);
    return [];
  }
}