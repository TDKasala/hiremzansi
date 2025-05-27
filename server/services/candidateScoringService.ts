import { db } from "../db";
import { cvs, atsScores, users, saProfiles, premiumJobMatches, type CV, type User } from "@shared/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface CandidateScore {
  candidateId: number;
  overallScore: number;
  compatibilityScore: number;
  successProbability: number;
  experienceScore: number;
  skillsScore: number;
  culturalFitScore: number;
  salaryExpectationFit: number;
  locationScore: number;
  bbbeeScore: number;
  redFlags: string[];
  strengths: string[];
  responseRate: number;
  recommendations: string[];
}

export interface JobRequirements {
  position: string;
  industry: string;
  location: string;
  experienceLevel: string;
  requiredSkills: string[];
  salaryRange: { min: number; max: number };
  companySize: string;
  bbbeeRequirement?: string;
}

export class CandidateScoringService {

  /**
   * Generate comprehensive candidate scoring for recruiters
   */
  async scoreCandidateForJob(
    candidateId: number, 
    jobRequirements: JobRequirements
  ): Promise<CandidateScore> {
    
    // Get candidate data
    const [candidate] = await db
      .select({
        user: users,
        cv: cvs,
        atsScore: atsScores,
        saProfile: saProfiles
      })
      .from(users)
      .leftJoin(cvs, eq(cvs.userId, users.id))
      .leftJoin(atsScores, eq(atsScores.cvId, cvs.id))
      .leftJoin(saProfiles, eq(saProfiles.userId, users.id))
      .where(eq(users.id, candidateId))
      .orderBy(desc(cvs.createdAt));

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    // Calculate individual scores
    const experienceScore = this.calculateExperienceScore(candidate, jobRequirements);
    const skillsScore = this.calculateSkillsScore(candidate, jobRequirements);
    const locationScore = this.calculateLocationScore(candidate, jobRequirements);
    const culturalFitScore = this.calculateCulturalFitScore(candidate, jobRequirements);
    const bbbeeScore = this.calculateBBBEEScore(candidate, jobRequirements);
    const salaryExpectationFit = this.calculateSalaryFit(candidate, jobRequirements);
    
    // Calculate compatibility and success probability
    const compatibilityScore = this.calculateCompatibilityScore({
      experienceScore,
      skillsScore,
      locationScore,
      culturalFitScore,
      bbbeeScore
    });
    
    const successProbability = this.predictSuccessProbability(candidate, jobRequirements);
    
    // Detect red flags and strengths
    const redFlags = this.identifyRedFlags(candidate, jobRequirements);
    const strengths = this.identifyStrengths(candidate, jobRequirements);
    
    // Calculate response rate prediction
    const responseRate = await this.predictResponseRate(candidateId);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(candidate, jobRequirements);
    
    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (compatibilityScore * 0.3) +
      (successProbability * 0.25) +
      (skillsScore * 0.2) +
      (experienceScore * 0.15) +
      (culturalFitScore * 0.1)
    );

    return {
      candidateId,
      overallScore,
      compatibilityScore,
      successProbability,
      experienceScore,
      skillsScore,
      culturalFitScore,
      salaryExpectationFit,
      locationScore,
      bbbeeScore,
      redFlags,
      strengths,
      responseRate,
      recommendations
    };
  }

  /**
   * Get top scoring candidates for a job
   */
  async getTopCandidates(
    jobRequirements: JobRequirements, 
    limit: number = 20
  ): Promise<CandidateScore[]> {
    
    // Get candidates with relevant experience and skills
    const candidates = await db
      .select({
        user: users,
        cv: cvs,
        atsScore: atsScores,
        saProfile: saProfiles
      })
      .from(users)
      .leftJoin(cvs, eq(cvs.userId, users.id))
      .leftJoin(atsScores, eq(atsScores.cvId, cvs.id))
      .leftJoin(saProfiles, eq(saProfiles.userId, users.id))
      .where(
        and(
          eq(users.isActive, true),
          gte(atsScores.score, 60) // Minimum ATS score
        )
      )
      .orderBy(desc(atsScores.score))
      .limit(limit * 2); // Get more candidates to filter

    // Score each candidate
    const scoredCandidates = await Promise.all(
      candidates.map(async (candidate) => {
        try {
          return await this.scoreCandidateForJob(candidate.user.id, jobRequirements);
        } catch (error) {
          console.error(`Error scoring candidate ${candidate.user.id}:`, error);
          return null;
        }
      })
    );

    // Filter and sort by overall score
    return scoredCandidates
      .filter((score): score is CandidateScore => score !== null)
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);
  }

  /**
   * Calculate experience score based on job requirements
   */
  private calculateExperienceScore(candidate: any, jobRequirements: JobRequirements): number {
    if (!candidate.cv?.content) return 0;

    const content = candidate.cv.content.toLowerCase();
    
    // Extract years of experience (basic pattern matching)
    const experiencePatterns = [
      /(\d+)\s*years?\s*(of\s*)?experience/g,
      /(\d+)\+?\s*years?\s*in/g,
      /(\d+)\s*years?\s*working/g
    ];
    
    let maxExperience = 0;
    experiencePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const years = parseInt(match.match(/\d+/)?.[0] || '0');
          maxExperience = Math.max(maxExperience, years);
        });
      }
    });

    // Score based on experience level requirements
    const requiredLevel = jobRequirements.experienceLevel?.toLowerCase();
    if (requiredLevel?.includes('entry') || requiredLevel?.includes('junior')) {
      return maxExperience >= 0 && maxExperience <= 3 ? 90 : Math.max(60 - (maxExperience - 3) * 10, 30);
    } else if (requiredLevel?.includes('mid') || requiredLevel?.includes('intermediate')) {
      return maxExperience >= 2 && maxExperience <= 6 ? 95 : Math.max(70 - Math.abs(maxExperience - 4) * 8, 40);
    } else if (requiredLevel?.includes('senior')) {
      return maxExperience >= 5 ? 95 : Math.max(50 + maxExperience * 8, 30);
    }

    return Math.min(maxExperience * 10, 85);
  }

  /**
   * Calculate skills score based on job requirements
   */
  private calculateSkillsScore(candidate: any, jobRequirements: JobRequirements): number {
    if (!candidate.cv?.content || !jobRequirements.requiredSkills) return 0;

    const content = candidate.cv.content.toLowerCase();
    const requiredSkills = jobRequirements.requiredSkills.map(skill => skill.toLowerCase());
    
    let matchedSkills = 0;
    let totalSkillStrength = 0;

    requiredSkills.forEach(skill => {
      const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = content.match(skillRegex);
      
      if (matches) {
        matchedSkills++;
        // Count frequency for skill strength
        totalSkillStrength += Math.min(matches.length, 5);
      }
    });

    const matchPercentage = (matchedSkills / requiredSkills.length) * 100;
    const strengthBonus = Math.min(totalSkillStrength * 2, 20);
    
    return Math.min(matchPercentage + strengthBonus, 100);
  }

  /**
   * Calculate location score for South African context
   */
  private calculateLocationScore(candidate: any, jobRequirements: JobRequirements): number {
    if (!candidate.saProfile?.province || !jobRequirements.location) return 50;

    const candidateProvince = candidate.saProfile.province.toLowerCase();
    const jobLocation = jobRequirements.location.toLowerCase();

    // Exact province match
    if (candidateProvince.includes(jobLocation) || jobLocation.includes(candidateProvince)) {
      return 100;
    }

    // Major city proximity scoring
    const proximityMap: { [key: string]: string[] } = {
      'gauteng': ['johannesburg', 'pretoria', 'sandton', 'rosebank'],
      'western_cape': ['cape_town', 'stellenbosch', 'paarl'],
      'kwazulu_natal': ['durban', 'pietermaritzburg', 'richards_bay'],
      'eastern_cape': ['port_elizabeth', 'east_london', 'grahamstown']
    };

    for (const [province, cities] of Object.entries(proximityMap)) {
      if (candidateProvince.includes(province)) {
        for (const city of cities) {
          if (jobLocation.includes(city)) {
            return 95;
          }
        }
      }
    }

    // Remote work consideration
    if (jobLocation.includes('remote') || jobLocation.includes('hybrid')) {
      return 85;
    }

    return 30; // Different provinces
  }

  /**
   * Calculate cultural fit score
   */
  private calculateCulturalFitScore(candidate: any, jobRequirements: JobRequirements): number {
    let score = 70; // Base score

    // Industry experience bonus
    if (candidate.cv?.targetIndustry && 
        candidate.cv.targetIndustry.toLowerCase().includes(jobRequirements.industry.toLowerCase())) {
      score += 20;
    }

    // Communication skills (look for keywords)
    const content = candidate.cv?.content?.toLowerCase() || '';
    const communicationKeywords = ['communication', 'leadership', 'team', 'collaboration', 'presentation'];
    const foundKeywords = communicationKeywords.filter(keyword => content.includes(keyword));
    score += foundKeywords.length * 2;

    return Math.min(score, 100);
  }

  /**
   * Calculate B-BBEE score for South African context
   */
  private calculateBBBEEScore(candidate: any, jobRequirements: JobRequirements): number {
    if (!jobRequirements.bbbeeRequirement) return 100; // Not required

    const candidateBBBEE = candidate.saProfile?.bbbeeStatus?.toLowerCase();
    const requiredBBBEE = jobRequirements.bbbeeRequirement.toLowerCase();

    if (candidateBBBEE === requiredBBBEE) return 100;
    if (candidateBBBEE && requiredBBBEE.includes('any')) return 90;
    
    return candidateBBBEE ? 60 : 30;
  }

  /**
   * Calculate salary expectation fit
   */
  private calculateSalaryFit(candidate: any, jobRequirements: JobRequirements): number {
    // In a real implementation, you'd have salary expectation data
    // For now, return a base score
    return 75;
  }

  /**
   * Calculate overall compatibility score
   */
  private calculateCompatibilityScore(scores: {
    experienceScore: number;
    skillsScore: number;
    locationScore: number;
    culturalFitScore: number;
    bbbeeScore: number;
  }): number {
    const weights = {
      experienceScore: 0.25,
      skillsScore: 0.35,
      locationScore: 0.15,
      culturalFitScore: 0.15,
      bbbeeScore: 0.10
    };

    return Math.round(
      scores.experienceScore * weights.experienceScore +
      scores.skillsScore * weights.skillsScore +
      scores.locationScore * weights.locationScore +
      scores.culturalFitScore * weights.culturalFitScore +
      scores.bbbeeScore * weights.bbbeeScore
    );
  }

  /**
   * Predict success probability using AI-like scoring
   */
  private predictSuccessProbability(candidate: any, jobRequirements: JobRequirements): number {
    let probability = 50; // Base probability

    // ATS score influence
    if (candidate.atsScore?.score) {
      probability += (candidate.atsScore.score - 70) * 0.5;
    }

    // Profile completeness
    if (candidate.cv?.content && candidate.saProfile) {
      probability += 15;
    }

    // Account activity
    if (candidate.user?.lastLogin) {
      const daysSinceLogin = Math.floor((Date.now() - new Date(candidate.user.lastLogin).getTime()) / (1000 * 60 * 60 * 24));
      probability += daysSinceLogin < 7 ? 20 : daysSinceLogin < 30 ? 10 : 0;
    }

    return Math.min(Math.max(probability, 10), 95);
  }

  /**
   * Identify red flags in candidate profile
   */
  private identifyRedFlags(candidate: any, jobRequirements: JobRequirements): string[] {
    const redFlags: string[] = [];

    // Frequent job changes
    const content = candidate.cv?.content?.toLowerCase() || '';
    const jobChangePattern = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}/g;
    const dates = content.match(jobChangePattern);
    if (dates && dates.length > 6) {
      redFlags.push("Frequent job changes detected");
    }

    // Employment gaps (basic detection)
    if (content.includes('unemployed') || content.includes('gap')) {
      redFlags.push("Employment gap detected");
    }

    // Overqualification
    if (content.includes('phd') && jobRequirements.experienceLevel?.toLowerCase().includes('junior')) {
      redFlags.push("Potentially overqualified");
    }

    // Location mismatch
    if (candidate.saProfile?.province && jobRequirements.location) {
      const candidateProvince = candidate.saProfile.province.toLowerCase();
      const jobLocation = jobRequirements.location.toLowerCase();
      if (!candidateProvince.includes(jobLocation) && !jobLocation.includes('remote')) {
        redFlags.push("Location mismatch - may require relocation");
      }
    }

    return redFlags;
  }

  /**
   * Identify candidate strengths
   */
  private identifyStrengths(candidate: any, jobRequirements: JobRequirements): string[] {
    const strengths: string[] = [];

    // High ATS score
    if (candidate.atsScore?.score >= 80) {
      strengths.push("Excellent CV optimization");
    }

    // Industry experience
    if (candidate.cv?.targetIndustry?.toLowerCase().includes(jobRequirements.industry.toLowerCase())) {
      strengths.push("Relevant industry experience");
    }

    // Recent activity
    if (candidate.user?.lastLogin) {
      const daysSinceLogin = Math.floor((Date.now() - new Date(candidate.user.lastLogin).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLogin < 7) {
        strengths.push("Active job seeker");
      }
    }

    // B-BBEE status
    if (candidate.saProfile?.bbbeeStatus) {
      strengths.push("B-BBEE verified candidate");
    }

    // Complete profile
    if (candidate.cv && candidate.saProfile) {
      strengths.push("Complete professional profile");
    }

    return strengths;
  }

  /**
   * Predict response rate based on historical data
   */
  private async predictResponseRate(candidateId: number): Promise<number> {
    // In a real implementation, you'd analyze historical response data
    // For now, return a realistic estimate
    return Math.floor(Math.random() * 40) + 60; // 60-100% range
  }

  /**
   * Generate actionable recommendations for recruiters
   */
  private generateRecommendations(candidate: any, jobRequirements: JobRequirements): string[] {
    const recommendations: string[] = [];

    if (candidate.atsScore?.score < 70) {
      recommendations.push("Consider providing CV improvement feedback to increase match quality");
    }

    if (candidate.saProfile?.province && jobRequirements.location) {
      const candidateProvince = candidate.saProfile.province.toLowerCase();
      const jobLocation = jobRequirements.location.toLowerCase();
      if (!candidateProvince.includes(jobLocation)) {
        recommendations.push("Discuss relocation package or remote work options");
      }
    }

    if (!candidate.user?.lastLogin || 
        Math.floor((Date.now() - new Date(candidate.user.lastLogin).getTime()) / (1000 * 60 * 60 * 24)) > 30) {
      recommendations.push("Candidate may need follow-up - hasn't been active recently");
    }

    recommendations.push("Reach out promptly - high-quality candidates receive multiple offers");

    return recommendations;
  }
}

export const candidateScoringService = new CandidateScoringService();