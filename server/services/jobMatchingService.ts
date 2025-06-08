import { db } from '../db';
import { cvs, jobPostings, users, jobMatches, skills, userSkills } from '@shared/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { xaiService } from './xaiService';

export interface JobMatch {
  jobId: number;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  matchReasons: string[];
  requiredSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  salaryRange?: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  workType?: string;
  experienceLevel?: string;
  saContextScore: number;
  skillsMatchScore: number;
  locationScore: number;
}

export interface CVJobMatchRequest {
  cvId: number;
  userId: number;
  location?: string;
  preferredSalaryRange?: string;
  workType?: 'remote' | 'hybrid' | 'onsite';
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
}

class JobMatchingService {
  /**
   * Find job matches for a user's CV
   */
  async findJobMatches(request: CVJobMatchRequest): Promise<JobMatch[]> {
    try {
      // Get CV content
      const cv = await db.select().from(cvs).where(eq(cvs.id, request.cvId)).limit(1);
      if (!cv.length) {
        throw new Error('CV not found');
      }

      // Get user skills
      const userSkillsData = await db
        .select({
          skillName: skills.name,
          proficiency: userSkills.proficiencyLevel,
          yearsExperience: userSkills.yearsOfExperience
        })
        .from(userSkills)
        .innerJoin(skills, eq(userSkills.skillId, skills.id))
        .where(eq(userSkills.userId, request.userId));

      // Get available job postings
      const jobs = await db
        .select()
        .from(jobPostings)
        .where(eq(jobPostings.status, 'active'))
        .orderBy(desc(jobPostings.createdAt))
        .limit(50);

      const matches: JobMatch[] = [];

      for (const job of jobs) {
        const match = await this.calculateJobMatch(cv[0], job, userSkillsData, request);
        if (match.matchScore >= 30) { // Only include matches above 30%
          matches.push(match);
        }
      }

      // Sort by match score
      return matches.sort((a, b) => b.matchScore - a.matchScore);

    } catch (error) {
      console.error('Error finding job matches:', error);
      throw error;
    }
  }

  /**
   * Calculate match score between CV and job posting
   */
  private async calculateJobMatch(
    cv: any,
    job: any,
    userSkills: any[],
    request: CVJobMatchRequest
  ): Promise<JobMatch> {
    try {
      // Parse job requirements and skills
      const jobRequiredSkills = this.extractSkillsFromText(job.requirements || '');
      const jobDescription = job.description || '';
      
      // Calculate skills match
      const skillsMatch = this.calculateSkillsMatch(userSkills, jobRequiredSkills);
      
      // Calculate location match
      const locationScore = this.calculateLocationMatch(
        request.location || '', 
        job.location || ''
      );
      
      // Calculate South African context score
      const saContextScore = this.calculateSAContextScore(cv.content, job);
      
      // Calculate experience level match
      const experienceScore = this.calculateExperienceMatch(
        request.experienceLevel || '',
        job.experienceLevel || ''
      );

      // Use AI for semantic matching if available
      let aiMatchScore = 50; // Default fallback
      try {
        const aiResult = await xaiService.matchJobToCV(cv.content, jobDescription);
        aiMatchScore = aiResult.matchScore;
      } catch (error) {
        console.log('AI matching unavailable, using rule-based matching');
      }

      // Calculate overall match score (weighted average)
      const matchScore = Math.round(
        (skillsMatch.score * 0.4) +
        (locationScore * 0.15) +
        (saContextScore * 0.15) +
        (experienceScore * 0.15) +
        (aiMatchScore * 0.15)
      );

      return {
        jobId: job.id,
        title: job.title,
        company: job.companyName || 'Company',
        location: job.location || '',
        matchScore,
        matchReasons: this.generateMatchReasons(skillsMatch, locationScore, saContextScore),
        requiredSkills: jobRequiredSkills,
        matchingSkills: skillsMatch.matching,
        missingSkills: skillsMatch.missing,
        salaryRange: job.salaryRange,
        description: job.description || '',
        requirements: this.parseRequirements(job.requirements || ''),
        benefits: this.parseBenefits(job.benefits || ''),
        workType: job.workType,
        experienceLevel: job.experienceLevel,
        saContextScore,
        skillsMatchScore: skillsMatch.score,
        locationScore
      };

    } catch (error) {
      console.error('Error calculating job match:', error);
      throw error;
    }
  }

  /**
   * Calculate skills matching score
   */
  private calculateSkillsMatch(userSkills: any[], jobRequiredSkills: string[]): {
    score: number;
    matching: string[];
    missing: string[];
  } {
    const userSkillNames = userSkills.map(s => s.skillName.toLowerCase());
    const requiredSkillsLower = jobRequiredSkills.map(s => s.toLowerCase());
    
    const matching = requiredSkillsLower.filter(skill => 
      userSkillNames.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );
    
    const missing = requiredSkillsLower.filter(skill => 
      !userSkillNames.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );

    const score = requiredSkillsLower.length > 0 
      ? Math.round((matching.length / requiredSkillsLower.length) * 100)
      : 50;

    return {
      score,
      matching: matching.map(s => this.capitalizeFirst(s)),
      missing: missing.map(s => this.capitalizeFirst(s))
    };
  }

  /**
   * Calculate location match score
   */
  private calculateLocationMatch(userLocation: string, jobLocation: string): number {
    if (!userLocation || !jobLocation) return 50;
    
    const userLoc = userLocation.toLowerCase();
    const jobLoc = jobLocation.toLowerCase();
    
    // Exact match
    if (userLoc === jobLoc) return 100;
    
    // Same city/province
    if (userLoc.includes(jobLoc) || jobLoc.includes(userLoc)) return 80;
    
    // Remote work
    if (jobLoc.includes('remote') || jobLoc.includes('anywhere')) return 90;
    
    // Same country (South Africa)
    const saCities = ['johannesburg', 'cape town', 'durban', 'pretoria', 'port elizabeth', 'bloemfontein'];
    const userInSA = saCities.some(city => userLoc.includes(city));
    const jobInSA = saCities.some(city => jobLoc.includes(city));
    
    if (userInSA && jobInSA) return 60;
    
    return 30;
  }

  /**
   * Calculate South African context relevance
   */
  private calculateSAContextScore(cvContent: string, job: any): number {
    const cvLower = cvContent.toLowerCase();
    const jobText = `${job.description} ${job.requirements}`.toLowerCase();
    
    let score = 50; // Base score
    
    // SA qualifications
    const saQualifications = ['matric', 'grade 12', 'university of cape town', 'wits', 'stellenbosch', 'ukzn'];
    if (saQualifications.some(qual => cvLower.includes(qual))) score += 10;
    
    // SA experience
    const saCompanies = ['absa', 'fnb', 'standard bank', 'nedbank', 'mtn', 'vodacom', 'sasol', 'anglo american'];
    if (saCompanies.some(company => cvLower.includes(company))) score += 15;
    
    // Local languages
    const saLanguages = ['afrikaans', 'zulu', 'xhosa', 'sotho', 'tswana'];
    if (saLanguages.some(lang => cvLower.includes(lang))) score += 10;
    
    // BEE compliance (if mentioned in job)
    if (jobText.includes('bee') || jobText.includes('equity') || jobText.includes('transformation')) {
      score += 15;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Calculate experience level match
   */
  private calculateExperienceMatch(userLevel: string, jobLevel: string): number {
    if (!userLevel || !jobLevel) return 50;
    
    const levelMap: { [key: string]: number } = {
      'entry': 1,
      'junior': 1,
      'mid': 2,
      'senior': 3,
      'lead': 4,
      'executive': 5
    };
    
    const userScore = levelMap[userLevel.toLowerCase()] || 2;
    const jobScore = levelMap[jobLevel.toLowerCase()] || 2;
    
    const difference = Math.abs(userScore - jobScore);
    
    if (difference === 0) return 100;
    if (difference === 1) return 80;
    if (difference === 2) return 60;
    return 30;
  }

  /**
   * Extract skills from job text
   */
  private extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'sql',
      'accounting', 'finance', 'marketing', 'sales', 'project management',
      'excel', 'powerpoint', 'word', 'communication', 'leadership', 'teamwork'
    ];
    
    const foundSkills: string[] = [];
    const textLower = text.toLowerCase();
    
    commonSkills.forEach(skill => {
      if (textLower.includes(skill)) {
        foundSkills.push(skill);
      }
    });
    
    return foundSkills;
  }

  /**
   * Generate match reasons
   */
  private generateMatchReasons(
    skillsMatch: any,
    locationScore: number,
    saContextScore: number
  ): string[] {
    const reasons: string[] = [];
    
    if (skillsMatch.score >= 70) {
      reasons.push(`Strong skills match (${skillsMatch.score}%)`);
    } else if (skillsMatch.score >= 50) {
      reasons.push(`Good skills match (${skillsMatch.score}%)`);
    }
    
    if (locationScore >= 80) {
      reasons.push('Excellent location match');
    } else if (locationScore >= 60) {
      reasons.push('Good location match');
    }
    
    if (saContextScore >= 70) {
      reasons.push('Strong South African market fit');
    }
    
    if (skillsMatch.matching.length > 0) {
      reasons.push(`Matching skills: ${skillsMatch.matching.slice(0, 3).join(', ')}`);
    }
    
    return reasons;
  }

  /**
   * Parse requirements into array
   */
  private parseRequirements(requirements: string): string[] {
    return requirements
      .split(/[•\-\n]/)
      .map(req => req.trim())
      .filter(req => req.length > 0)
      .slice(0, 10);
  }

  /**
   * Parse benefits into array
   */
  private parseBenefits(benefits: string): string[] {
    return benefits
      .split(/[•\-\n]/)
      .map(benefit => benefit.trim())
      .filter(benefit => benefit.length > 0)
      .slice(0, 8);
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Save job match to database
   */
  async saveJobMatch(match: {
    userId: number;
    cvId: number;
    jobPostingId: number;
    matchScore: number;
    matchReasons?: string[];
    skillsMatchScore?: number;
    saContextScore?: number;
    locationScore?: number;
  }) {
    try {
      const existingMatch = await db
        .select()
        .from(jobMatches)
        .where(
          and(
            eq(jobMatches.userId, match.userId),
            eq(jobMatches.cvId, match.cvId),
            eq(jobMatches.jobPostingId, match.jobPostingId)
          )
        )
        .limit(1);

      if (existingMatch.length > 0) {
        // Update existing match
        await db
          .update(jobMatches)
          .set({
            matchScore: match.matchScore,
            matchReasons: match.matchReasons,
            skillsMatchScore: match.skillsMatchScore,
            saContextScore: match.saContextScore,
            locationScore: match.locationScore,
            updatedAt: new Date()
          })
          .where(eq(jobMatches.id, existingMatch[0].id));
      } else {
        // Create new match
        await db.insert(jobMatches).values({
          userId: match.userId,
          cvId: match.cvId,
          jobPostingId: match.jobPostingId,
          matchScore: match.matchScore,
          matchReasons: match.matchReasons,
          skillsMatchScore: match.skillsMatchScore,
          saContextScore: match.saContextScore,
          locationScore: match.locationScore,
          status: 'pending'
        });
      }
    } catch (error) {
      console.error('Error saving job match:', error);
      throw error;
    }
  }

  /**
   * Get saved job matches for a user
   */
  async getUserJobMatches(userId: number, limit: number = 20): Promise<any[]> {
    try {
      const matches = await db
        .select({
          id: jobMatches.id,
          matchScore: jobMatches.matchScore,
          matchReasons: jobMatches.matchReasons,
          status: jobMatches.status,
          createdAt: jobMatches.createdAt,
          job: {
            id: jobPostings.id,
            title: jobPostings.title,
            companyName: jobPostings.companyName,
            location: jobPostings.location,
            salaryRange: jobPostings.salaryRange,
            workType: jobPostings.workType,
            description: jobPostings.description
          }
        })
        .from(jobMatches)
        .innerJoin(jobPostings, eq(jobMatches.jobPostingId, jobPostings.id))
        .where(eq(jobMatches.userId, userId))
        .orderBy(desc(jobMatches.matchScore))
        .limit(limit);

      return matches;
    } catch (error) {
      console.error('Error getting user job matches:', error);
      throw error;
    }
  }
}

export const jobMatchingService = new JobMatchingService();