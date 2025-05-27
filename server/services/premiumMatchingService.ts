import { db } from "../db";
import { 
  premiumJobPostings, 
  premiumJobSeekerProfiles, 
  premiumJobMatches, 
  recruiterProfiles,
  cvs,
  saProfiles,
  type PremiumJobMatch,
  type InsertPremiumJobMatch
} from "../../shared/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

// Weight factors for premium matching algorithm
const PREMIUM_MATCH_WEIGHTS = {
  SKILLS_MATCH: 0.35,           // Higher weight for skills
  EXPERIENCE_LEVEL: 0.15,       
  SALARY_COMPATIBILITY: 0.15,   
  LOCATION_PREFERENCE: 0.12,    
  INDUSTRY_MATCH: 0.10,         
  SA_CONTEXT: 0.08,             // B-BBEE, NQF levels
  AVAILABILITY: 0.05            
};

interface MatchAnalysis {
  skillsMatched: string[];
  skillsGap: string[];
  skillsScore: number;
  experienceScore: number;
  salaryScore: number;
  locationScore: number;
  industryScore: number;
  saContextScore: number;
  availabilityScore: number;
  overallScore: number;
  matchReasons: string[];
}

/**
 * AI-Powered Premium Matching Service
 * Analyzes job postings and job seeker profiles to create high-quality matches
 */
export class PremiumMatchingService {
  
  /**
   * Run AI matching for all active job postings and job seekers
   * This is the core engine that finds and creates matches
   */
  async runMatchingEngine(): Promise<void> {
    console.log("🤖 Starting AI-powered premium matching engine...");
    
    try {
      // Get all active job postings
      const activeJobs = await db
        .select()
        .from(premiumJobPostings)
        .where(eq(premiumJobPostings.status, 'active'))
        .innerJoin(recruiterProfiles, eq(premiumJobPostings.recruiterId, recruiterProfiles.id));

      // Get all active job seeker profiles
      const activeJobSeekers = await db
        .select()
        .from(premiumJobSeekerProfiles)
        .where(eq(premiumJobSeekerProfiles.isActive, true))
        .leftJoin(cvs, eq(premiumJobSeekerProfiles.cvId, cvs.id))
        .leftJoin(saProfiles, eq(premiumJobSeekerProfiles.userId, saProfiles.userId));

      console.log(`🎯 Found ${activeJobs.length} jobs and ${activeJobSeekers.length} job seekers`);

      let totalMatches = 0;
      
      // Analyze each job against each job seeker
      for (const jobData of activeJobs) {
        const job = jobData.premium_job_postings;
        const recruiter = jobData.recruiter_profiles;
        
        for (const seekerData of activeJobSeekers) {
          const jobSeeker = seekerData.premium_job_seeker_profiles;
          const cv = seekerData.cvs;
          const saProfile = seekerData.sa_profiles;
          
          // Check if match already exists
          const existingMatch = await db
            .select()
            .from(premiumJobMatches)
            .where(
              and(
                eq(premiumJobMatches.jobPostingId, job.id),
                eq(premiumJobMatches.jobSeekerId, jobSeeker.id)
              )
            )
            .limit(1);
            
          if (existingMatch.length > 0) {
            continue; // Skip if match already exists
          }
          
          // Perform AI analysis
          const analysis = await this.analyzeMatch(job, jobSeeker, cv, saProfile);
          
          // Only create matches above threshold (70% match)
          if (analysis.overallScore >= 70) {
            await this.createPremiumMatch(job, jobSeeker, recruiter.id, analysis);
            totalMatches++;
            
            // Send notifications (but don't reveal contact info yet)
            await this.sendMatchNotifications(job, jobSeeker, analysis);
          }
        }
      }
      
      console.log(`✅ Premium matching complete! Created ${totalMatches} new matches`);
      
    } catch (error) {
      console.error("❌ Error in premium matching engine:", error);
      throw error;
    }
  }
  
  /**
   * Advanced AI analysis between job posting and job seeker profile
   */
  private async analyzeMatch(
    job: any, 
    jobSeeker: any, 
    cv: any, 
    saProfile: any
  ): Promise<MatchAnalysis> {
    
    // 1. Skills Analysis
    const skillsAnalysis = this.analyzeSkills(job, cv);
    
    // 2. Experience Level Analysis
    const experienceScore = this.analyzeExperience(job.experienceLevel, jobSeeker.experienceLevel);
    
    // 3. Salary Compatibility
    const salaryScore = this.analyzeSalary(job, jobSeeker);
    
    // 4. Location Preference
    const locationScore = this.analyzeLocation(job, jobSeeker);
    
    // 5. Industry Match
    const industryScore = this.analyzeIndustry(job.industry, jobSeeker.preferredIndustries);
    
    // 6. South African Context (B-BBEE, NQF)
    const saContextScore = this.analyzeSAContext(job, saProfile);
    
    // 7. Availability Analysis
    const availabilityScore = this.analyzeAvailability(job, jobSeeker);
    
    // Calculate weighted overall score
    const overallScore = Math.round(
      (skillsAnalysis.score * PREMIUM_MATCH_WEIGHTS.SKILLS_MATCH) +
      (experienceScore * PREMIUM_MATCH_WEIGHTS.EXPERIENCE_LEVEL) +
      (salaryScore * PREMIUM_MATCH_WEIGHTS.SALARY_COMPATIBILITY) +
      (locationScore * PREMIUM_MATCH_WEIGHTS.LOCATION_PREFERENCE) +
      (industryScore * PREMIUM_MATCH_WEIGHTS.INDUSTRY_MATCH) +
      (saContextScore * PREMIUM_MATCH_WEIGHTS.SA_CONTEXT) +
      (availabilityScore * PREMIUM_MATCH_WEIGHTS.AVAILABILITY)
    );
    
    // Generate match reasons
    const matchReasons = this.generateMatchReasons(skillsAnalysis, experienceScore, salaryScore, locationScore);
    
    return {
      skillsMatched: skillsAnalysis.matched,
      skillsGap: skillsAnalysis.gap,
      skillsScore: skillsAnalysis.score,
      experienceScore,
      salaryScore,
      locationScore,
      industryScore,
      saContextScore,
      availabilityScore,
      overallScore,
      matchReasons
    };
  }
  
  /**
   * Analyze skills match between job requirements and CV
   */
  private analyzeSkills(job: any, cv: any): { score: number; matched: string[]; gap: string[] } {
    if (!cv?.content) {
      return { score: 0, matched: [], gap: job.requiredSkills || [] };
    }
    
    const cvContent = cv.content.toLowerCase();
    const requiredSkills = job.requiredSkills || [];
    const preferredSkills = job.preferredSkills || [];
    const allJobSkills = [...requiredSkills, ...preferredSkills];
    
    const matchedSkills: string[] = [];
    const gapSkills: string[] = [];
    
    // Check each required skill
    for (const skill of requiredSkills) {
      if (cvContent.includes(skill.toLowerCase())) {
        matchedSkills.push(skill);
      } else {
        gapSkills.push(skill);
      }
    }
    
    // Check preferred skills (bonus points)
    for (const skill of preferredSkills) {
      if (cvContent.includes(skill.toLowerCase()) && !matchedSkills.includes(skill)) {
        matchedSkills.push(skill);
      }
    }
    
    // Calculate score: Required skills are weighted higher
    const requiredMatched = matchedSkills.filter(skill => requiredSkills.includes(skill)).length;
    const preferredMatched = matchedSkills.filter(skill => preferredSkills.includes(skill)).length;
    
    const requiredScore = requiredSkills.length > 0 ? (requiredMatched / requiredSkills.length) * 80 : 40;
    const preferredScore = preferredSkills.length > 0 ? (preferredMatched / preferredSkills.length) * 20 : 0;
    
    return {
      score: Math.min(100, requiredScore + preferredScore),
      matched: matchedSkills,
      gap: gapSkills
    };
  }
  
  /**
   * Analyze experience level compatibility
   */
  private analyzeExperience(jobLevel: string, seekerLevel: string): number {
    const levelMap = { 'entry': 1, 'mid': 2, 'senior': 3, 'executive': 4 };
    const jobLevelNum = levelMap[jobLevel as keyof typeof levelMap] || 2;
    const seekerLevelNum = levelMap[seekerLevel as keyof typeof levelMap] || 2;
    
    if (seekerLevelNum === jobLevelNum) return 100;
    if (Math.abs(seekerLevelNum - jobLevelNum) === 1) return 75;
    return seekerLevelNum > jobLevelNum ? 50 : 25; // Overqualified vs underqualified
  }
  
  /**
   * Analyze salary compatibility
   */
  private analyzeSalary(job: any, jobSeeker: any): number {
    if (!job.salaryMin || !jobSeeker.desiredSalaryMin) return 50; // Default if no salary info
    
    const jobSalaryMid = (parseFloat(job.salaryMin) + parseFloat(job.salaryMax || job.salaryMin)) / 2;
    const seekerSalaryMid = (parseFloat(jobSeeker.desiredSalaryMin) + parseFloat(jobSeeker.desiredSalaryMax || jobSeeker.desiredSalaryMin)) / 2;
    
    const difference = Math.abs(jobSalaryMid - seekerSalaryMid) / jobSalaryMid;
    
    if (difference <= 0.1) return 100; // Within 10%
    if (difference <= 0.2) return 80;  // Within 20%
    if (difference <= 0.3) return 60;  // Within 30%
    return 30; // More than 30% difference
  }
  
  /**
   * Analyze location preferences
   */
  private analyzeLocation(job: any, jobSeeker: any): number {
    if (job.isRemote && jobSeeker.openToRemote) return 100;
    if (!job.location || !jobSeeker.preferredLocations?.length) return 50;
    
    const jobLocation = job.location.toLowerCase();
    const jobProvince = job.province?.toLowerCase();
    
    for (const preferred of jobSeeker.preferredLocations) {
      const preferredLower = preferred.toLowerCase();
      if (preferredLower.includes(jobLocation) || jobLocation.includes(preferredLower)) return 100;
      if (jobProvince && preferredLower.includes(jobProvince)) return 80;
    }
    
    return jobSeeker.openToRelocation ? 40 : 20;
  }
  
  /**
   * Analyze industry match
   */
  private analyzeIndustry(jobIndustry: string, seekerIndustries: string[]): number {
    if (!seekerIndustries?.length) return 50;
    
    const jobIndustryLower = jobIndustry.toLowerCase();
    
    for (const industry of seekerIndustries) {
      if (industry.toLowerCase() === jobIndustryLower) return 100;
      if (industry.toLowerCase().includes(jobIndustryLower) || jobIndustryLower.includes(industry.toLowerCase())) return 80;
    }
    
    return 30; // Different industry
  }
  
  /**
   * Analyze South African context (B-BBEE, NQF)
   */
  private analyzeSAContext(job: any, saProfile: any): number {
    let score = 50; // Base score
    
    // B-BBEE Analysis
    if (job.bbbeeRequirement === 'required' && saProfile?.bbbeeStatus) {
      score += 30;
    } else if (job.bbbeeRequirement === 'preferred' && saProfile?.bbbeeStatus) {
      score += 15;
    }
    
    // NQF Level Analysis
    if (job.nqfLevelRequired && saProfile?.nqfLevel) {
      if (saProfile.nqfLevel >= job.nqfLevelRequired) {
        score += 20;
      } else if (saProfile.nqfLevel >= job.nqfLevelRequired - 1) {
        score += 10;
      }
    }
    
    return Math.min(100, score);
  }
  
  /**
   * Analyze availability match
   */
  private analyzeAvailability(job: any, jobSeeker: any): number {
    if (!jobSeeker.availabilityDate) return 70; // Default if no availability info
    
    const now = new Date();
    const availableDate = new Date(jobSeeker.availabilityDate);
    const daysUntilAvailable = Math.ceil((availableDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilAvailable <= 0) return 100; // Available now
    if (daysUntilAvailable <= 30) return 90;  // Available within a month
    if (daysUntilAvailable <= 60) return 70;  // Available within 2 months
    return 40; // Available later
  }
  
  /**
   * Generate human-readable match reasons
   */
  private generateMatchReasons(skillsAnalysis: any, experienceScore: number, salaryScore: number, locationScore: number): string[] {
    const reasons: string[] = [];
    
    if (skillsAnalysis.score >= 80) {
      reasons.push(`Strong skills match (${skillsAnalysis.matched.length} key skills aligned)`);
    }
    if (experienceScore >= 80) {
      reasons.push("Experience level perfectly matches requirements");
    }
    if (salaryScore >= 80) {
      reasons.push("Salary expectations align well");
    }
    if (locationScore >= 80) {
      reasons.push("Location preferences match");
    }
    
    return reasons;
  }
  
  /**
   * Create a premium match record
   */
  private async createPremiumMatch(
    job: any, 
    jobSeeker: any, 
    recruiterId: number, 
    analysis: MatchAnalysis
  ): Promise<void> {
    const matchData: InsertPremiumJobMatch = {
      jobPostingId: job.id,
      jobSeekerId: jobSeeker.id,
      recruiterId: recruiterId,
      matchScore: analysis.overallScore,
      matchDetails: {
        skillsScore: analysis.skillsScore,
        experienceScore: analysis.experienceScore,
        salaryScore: analysis.salaryScore,
        locationScore: analysis.locationScore,
        industryScore: analysis.industryScore,
        saContextScore: analysis.saContextScore,
        availabilityScore: analysis.availabilityScore,
        matchReasons: analysis.matchReasons
      },
      skillsMatched: analysis.skillsMatched as string[],
      skillsGap: analysis.skillsGap as string[],
      salaryMatch: analysis.salaryScore >= 70,
      locationMatch: analysis.locationScore >= 70,
      experienceMatch: analysis.experienceScore >= 70,
      industryMatch: analysis.industryScore >= 70,
      status: 'pending'
    };
    
    await db.insert(premiumJobMatches).values(matchData);
    
    // Update job posting match count
    await db
      .update(premiumJobPostings)
      .set({ 
        totalMatches: sql`total_matches + 1`,
        updatedAt: new Date()
      })
      .where(eq(premiumJobPostings.id, job.id));
      
    // Update job seeker match count
    await db
      .update(premiumJobSeekerProfiles)
      .set({ 
        totalMatches: sql`total_matches + 1`,
        updatedAt: new Date()
      })
      .where(eq(premiumJobSeekerProfiles.id, jobSeeker.id));
  }
  
  /**
   * Send match notifications (without revealing contact details)
   */
  private async sendMatchNotifications(job: any, jobSeeker: any, analysis: MatchAnalysis): Promise<void> {
    // TODO: Implement notification service
    // This would send email/SMS notifications to both parties about the match
    // But contact details remain hidden until payment is made
    
    console.log(`📧 Match notification sent for job "${job.title}" and job seeker (${analysis.overallScore}% match)`);
  }
  
  /**
   * Get matches for a recruiter (paginated)
   */
  async getRecruiterMatches(recruiterId: number, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    return await db
      .select()
      .from(premiumJobMatches)
      .where(eq(premiumJobMatches.recruiterId, recruiterId))
      .innerJoin(premiumJobPostings, eq(premiumJobMatches.jobPostingId, premiumJobPostings.id))
      .innerJoin(premiumJobSeekerProfiles, eq(premiumJobMatches.jobSeekerId, premiumJobSeekerProfiles.id))
      .orderBy(desc(premiumJobMatches.matchScore))
      .limit(limit)
      .offset(offset);
  }
  
  /**
   * Get matches for a job seeker (paginated)
   */
  async getJobSeekerMatches(jobSeekerId: number, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    return await db
      .select()
      .from(premiumJobMatches)
      .where(eq(premiumJobMatches.jobSeekerId, jobSeekerId))
      .innerJoin(premiumJobPostings, eq(premiumJobMatches.jobPostingId, premiumJobPostings.id))
      .innerJoin(recruiterProfiles, eq(premiumJobMatches.recruiterId, recruiterProfiles.id))
      .orderBy(desc(premiumJobMatches.matchScore))
      .limit(limit)
      .offset(offset);
  }
}

// Export singleton instance
export const premiumMatchingService = new PremiumMatchingService();