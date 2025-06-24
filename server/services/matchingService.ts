import { db } from "../db";
import { 
  cvs, 
  users, 
  jobPostings, 
  employers,
  premiumJobMatches,
  type InsertPremiumJobMatch 
} from "@shared/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { aiMatchingService } from "./aiMatchingService";

interface MatchingCriteria {
  minimumMatchScore?: number;
  locationWeight?: number;
  skillsWeight?: number;
  experienceWeight?: number;
  saContextWeight?: number;
}

export class MatchingService {
  private readonly DEFAULT_CRITERIA: MatchingCriteria = {
    minimumMatchScore: 70,
    locationWeight: 0.2,
    skillsWeight: 0.4,
    experienceWeight: 0.2,
    saContextWeight: 0.2
  };

  /**
   * Run AI matching for all active job postings
   * This is the core business logic for generating R200 revenue
   */
  async runPremiumMatching(): Promise<void> {
    console.log("Starting premium matching service...");

    // Get all active job postings
    const activeJobs = await db
      .select({
        id: jobPostings.id,
        employerId: jobPostings.employerId,
        title: jobPostings.title,
        description: jobPostings.description,
        requiredSkills: jobPostings.requiredSkills,
        preferredSkills: jobPostings.preferredSkills,
        experienceLevel: jobPostings.experienceLevel,
        location: jobPostings.location,
        province: jobPostings.province,
        salaryRange: jobPostings.salaryRange,
        bbbeePreference: jobPostings.bbbeePreference,
        nqfRequirement: jobPostings.nqfRequirement,
        employerUserId: employers.userId,
      })
      .from(jobPostings)
      .leftJoin(employers, eq(jobPostings.employerId, employers.id))
      .where(eq(jobPostings.status, 'active'));

    console.log(`Found ${activeJobs.length} active job postings`);

    // Get all CVs with high ATS scores (candidates worth matching)
    const qualityCVs = await db
      .select({
        id: cvs.id,
        userId: cvs.userId,
        fileName: cvs.fileName,
        atsScore: cvs.atsScore,
        extractedText: cvs.extractedText,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userLocation: users.location,
        userProvince: users.province,
        userPhone: users.phone,
      })
      .from(cvs)
      .leftJoin(users, eq(cvs.userId, users.id))
      .where(gte(cvs.atsScore, 75)); // Only high-quality CVs

    console.log(`Found ${qualityCVs.length} quality CVs for matching`);

    let matchesCreated = 0;

    // Match each job with suitable candidates
    for (const job of activeJobs) {
      console.log(`Processing job: ${job.title} (ID: ${job.id})`);

      for (const cv of qualityCVs) {
        try {
          // Skip if match already exists
          const existingMatch = await db
            .select()
            .from(premiumJobMatches)
            .where(and(
              eq(premiumJobMatches.jobPostingId, job.id),
              eq(premiumJobMatches.cvId, cv.id)
            ))
            .limit(1);

          if (existingMatch.length > 0) {
            continue; // Skip existing match
          }

          // Run AI analysis for job-CV compatibility
          const matchAnalysis = await this.analyzeJobCVMatch(job, cv);

          // Only create matches above threshold
          if (matchAnalysis.overallScore >= this.DEFAULT_CRITERIA.minimumMatchScore!) {
            
            const matchData: InsertPremiumJobMatch = {
              jobSeekerId: cv.userId,
              recruiterId: job.employerUserId,
              jobPostingId: job.id,
              cvId: cv.id,
              matchScore: Math.round(matchAnalysis.overallScore),
              jobSeekerPaid: false,
              recruiterPaid: false,
              isActive: true,
              status: 'pending',
              matchData: {
                skillsMatch: matchAnalysis.skillsScore,
                experienceMatch: matchAnalysis.experienceScore,
                locationMatch: matchAnalysis.locationScore,
                saContextMatch: matchAnalysis.culturalFitScore,
                matchedSkills: matchAnalysis.skillsMatched,
                missingSkills: matchAnalysis.skillsGap,
                candidateName: `${cv.userFirstName} ${cv.userLastName}`.trim(),
                candidateEmail: cv.userEmail,
                experienceLevel: this.extractExperienceLevel(cv.extractedText || ''),
                industry: this.extractIndustry(cv.extractedText || ''),
                skills: matchAnalysis.skillsMatched,
                bbbeeLevel: this.extractBBBEELevel(cv.extractedText || ''),
              }
            };

            await db.insert(premiumJobMatches).values(matchData);
            matchesCreated++;

            console.log(`Created match: Job ${job.id} <-> CV ${cv.id} (${Math.round(matchAnalysis.overallScore)}% match)`);
          }

        } catch (error) {
          console.error(`Error matching job ${job.id} with CV ${cv.id}:`, error);
          continue; // Continue with next match
        }
      }
    }

    console.log(`Premium matching complete. Created ${matchesCreated} new matches.`);
  }

  /**
   * Analyze job-CV compatibility using AI
   */
  private async analyzeJobCVMatch(job: any, cv: any): Promise<{
    overallScore: number;
    skillsScore: number;
    experienceScore: number;
    locationScore: number;
    culturalFitScore: number;
    skillsMatched: string[];
    skillsGap: string[];
  }> {
    try {
      // Use the existing AI matching service
      const analysis = await aiMatchingService.analyzeJobMatch(
        {
          skills: this.extractSkills(cv.extractedText || ''),
          experience: this.extractExperienceLevel(cv.extractedText || ''),
          location: cv.userLocation || 'South Africa',
          industry: this.extractIndustry(cv.extractedText || ''),
          education: this.extractEducation(cv.extractedText || ''),
          certifications: [],
          bbbeeLevel: this.extractBBBEELevel(cv.extractedText || ''),
          languages: ['English'], // Default
        },
        {
          title: job.title,
          description: job.description,
          requiredSkills: job.requiredSkills || [],
          preferredSkills: job.preferredSkills || [],
          experienceLevel: job.experienceLevel || 'Mid-level',
          location: job.location || 'South Africa',
          salaryRange: job.salaryRange,
          industry: this.extractJobIndustry(job.description),
          bbbeePreference: job.bbbeePreference,
          nqfRequirement: job.nqfRequirement,
        }
      );

      return analysis;

    } catch (error) {
      console.error('AI matching failed, using fallback algorithm:', error);
      
      // Fallback to simple matching algorithm
      return this.simpleFallbackMatching(job, cv);
    }
  }

  /**
   * Simple fallback matching when AI fails
   */
  private simpleFallbackMatching(job: any, cv: any): any {
    const cvSkills = this.extractSkills(cv.extractedText || '');
    const jobSkills = [...(job.requiredSkills || []), ...(job.preferredSkills || [])];
    
    // Skills matching
    const matchedSkills = cvSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
    
    const skillsScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 100 : 70;
    
    // Location matching
    const locationScore = this.compareLocations(cv.userLocation, job.location);
    
    // Experience matching (simple)
    const experienceScore = 75; // Default
    
    // Cultural fit (B-BBEE consideration)
    const culturalFitScore = job.bbbeePreference && this.extractBBBEELevel(cv.extractedText || '') ? 90 : 70;
    
    // Overall score
    const overallScore = (skillsScore * 0.4) + (locationScore * 0.2) + (experienceScore * 0.2) + (culturalFitScore * 0.2);
    
    return {
      overallScore,
      skillsScore,
      experienceScore,
      locationScore,
      culturalFitScore,
      skillsMatched: matchedSkills,
      skillsGap: jobSkills.filter(skill => !matchedSkills.includes(skill))
    };
  }

  /**
   * Extract skills from CV text
   */
  private extractSkills(text: string): string[] {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
      'Project Management', 'Agile', 'Scrum', 'Leadership', 'Communication',
      'Microsoft Office', 'Excel', 'PowerPoint', 'SAP', 'Salesforce',
      'Marketing', 'Sales', 'Customer Service', 'Analysis', 'Research'
    ];
    
    return commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
  }

  /**
   * Extract experience level from CV
   */
  private extractExperienceLevel(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('senior') || lowerText.includes('lead') || lowerText.includes('manager')) {
      return 'Senior (5+ years)';
    }
    if (lowerText.includes('junior') || lowerText.includes('entry') || lowerText.includes('graduate')) {
      return 'Junior (0-2 years)';
    }
    return 'Mid-level (2-5 years)';
  }

  /**
   * Extract industry from CV
   */
  private extractIndustry(text: string): string {
    const industries = [
      'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
      'Retail', 'Construction', 'Mining', 'Government', 'Consulting'
    ];
    
    for (const industry of industries) {
      if (text.toLowerCase().includes(industry.toLowerCase())) {
        return industry;
      }
    }
    
    return 'General';
  }

  /**
   * Extract education level
   */
  private extractEducation(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('phd') || lowerText.includes('doctorate')) return 'PhD';
    if (lowerText.includes('master') || lowerText.includes('mba')) return 'Masters';
    if (lowerText.includes('bachelor') || lowerText.includes('degree')) return 'Bachelors';
    if (lowerText.includes('diploma')) return 'Diploma';
    if (lowerText.includes('certificate')) return 'Certificate';
    
    return 'High School';
  }

  /**
   * Extract B-BBEE level from CV
   */
  private extractBBBEELevel(text: string): number | undefined {
    const bbbeeMatch = text.match(/b-?bbee\s+level\s+(\d+)/i);
    if (bbbeeMatch) {
      return parseInt(bbbeeMatch[1]);
    }
    return undefined;
  }

  /**
   * Extract industry from job description
   */
  private extractJobIndustry(description: string): string {
    return this.extractIndustry(description);
  }

  /**
   * Compare location compatibility
   */
  private compareLocations(cvLocation: string | null, jobLocation: string | null): number {
    if (!cvLocation || !jobLocation) return 70;
    
    const cvLower = cvLocation.toLowerCase();
    const jobLower = jobLocation.toLowerCase();
    
    // Exact match
    if (cvLower === jobLower) return 100;
    
    // Province match
    const provinces = ['gauteng', 'western cape', 'kwazulu-natal', 'eastern cape', 'free state', 'limpopo', 'mpumalanga', 'northern cape', 'north west'];
    
    for (const province of provinces) {
      if (cvLower.includes(province) && jobLower.includes(province)) {
        return 85;
      }
    }
    
    // City match
    const cities = ['johannesburg', 'cape town', 'durban', 'pretoria', 'port elizabeth', 'bloemfontein'];
    
    for (const city of cities) {
      if (cvLower.includes(city) && jobLower.includes(city)) {
        return 90;
      }
    }
    
    return 60; // Different locations
  }
}

export const matchingService = new MatchingService();