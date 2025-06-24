import { db } from './db';
import { 
  users, 
  cvs, 
  atsScores, 
  saProfiles, 
  deepAnalysisReports, 
  subscriptions, 
  employers, 
  jobPostings, 
  jobMatches, 
  skills, 
  userSkills, 
  notifications
} from '@shared/schema';
import { eq, desc, and, or, like, gte, lte, count, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// Type definitions for database operations
type AuthUser = typeof users.$inferSelect;
type CV = typeof cvs.$inferSelect;
type ATSScore = typeof atsScores.$inferSelect;
type SAProfile = typeof saProfiles.$inferSelect;
type DeepAnalysis = typeof deepAnalysisReports.$inferSelect;
type Subscription = typeof subscriptions.$inferSelect;
type Employer = typeof employers.$inferSelect;
type JobPosting = typeof jobPostings.$inferSelect;
type JobMatch = typeof jobMatches.$inferSelect;
type Skill = typeof skills.$inferSelect;
type UserSkill = typeof userSkills.$inferSelect;
type Notification = typeof notifications.$inferSelect;

export interface IStorage {
  // User operations
  createUser(userData: Partial<AuthUser>): Promise<AuthUser>;
  getUserById(id: number): Promise<AuthUser | null>;
  getUserByEmail(email: string): Promise<AuthUser | null>;
  updateUser(id: number, updates: Partial<AuthUser>): Promise<void>;
  getAllUsers(): Promise<AuthUser[]>;
  
  // CV operations
  saveCV(cvData: Partial<CV>): Promise<CV>;
  getCVById(id: number): Promise<CV | null>;
  getCVsByUserId(userId: number): Promise<CV[]>;
  getLatestCVByUserId(userId: number): Promise<CV | null>;
  updateCV(id: number, updates: Partial<CV>): Promise<void>;
  deleteCV(id: number): Promise<void>;
  getAllCVs(): Promise<CV[]>;
  
  // ATS Score operations
  saveATSScore(scoreData: Partial<ATSScore>): Promise<ATSScore>;
  getATSScoresByCVId(cvId: number): Promise<ATSScore[]>;
  updateATSScore(id: number, updates: Partial<ATSScore>): Promise<void>;
  
  // SA Profile operations
  createSAProfile(profileData: Partial<SAProfile>): Promise<SAProfile>;
  getSAProfileByUserId(userId: number): Promise<SAProfile | null>;
  updateSAProfile(id: number, updates: Partial<SAProfile>): Promise<void>;
  
  // CV Analysis operations
  saveCVAnalysis(analysisData: Partial<CVAnalysis>): Promise<CVAnalysis>;
  getCVAnalysisByUserId(userId: number): Promise<CVAnalysis | null>;
  
  // Subscription operations
  getSubscription(userId: number): Promise<Subscription | null>;
  createSubscription(subscriptionData: Partial<Subscription>): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<void>;
  
  // Employer operations
  createEmployer(employerData: Partial<Employer>): Promise<Employer>;
  getEmployerByUserId(userId: number): Promise<Employer | null>;
  updateEmployer(id: number, updates: Partial<Employer>): Promise<void>;
  
  // Job Posting operations
  createJobPosting(jobData: Partial<JobPosting>): Promise<JobPosting>;
  getJobPostingById(id: number): Promise<JobPosting | null>;
  getJobPostingsByEmployerId(employerId: number): Promise<JobPosting[]>;
  getAllJobPostings(filters?: any): Promise<JobPosting[]>;
  updateJobPosting(id: number, updates: Partial<JobPosting>): Promise<void>;
  deleteJobPosting(id: number): Promise<void>;
  
  // Job Match operations
  createJobMatch(matchData: Partial<JobMatch>): Promise<JobMatch>;
  getJobMatchesByUserId(userId: number): Promise<JobMatch[]>;
  getJobMatchesByCVId(cvId: number): Promise<JobMatch[]>;
  
  // Skills operations
  getAllSkills(): Promise<Skill[]>;
  getSkillById(id: number): Promise<Skill | null>;
  getUserSkills(userId: number): Promise<UserSkill[]>;
  addUserSkill(skillData: Partial<UserSkill>): Promise<UserSkill>;
  removeUserSkill(userId: number, skillId: number): Promise<void>;
  
  // Notifications operations
  createNotification(notificationData: Partial<Notification>): Promise<Notification>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Premium matching operations
  getPremiumJobMatches(employerId: number): Promise<any[]>;
  createPremiumJobMatch(matchData: any): Promise<any>;
  unlockCandidateContact(matchId: number, recruiterId: number): Promise<any>;
  getJobSeekerMatches(userId: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async createUser(userData: Partial<AuthUser>): Promise<AuthUser> {
    const hashedPassword = userData.password 
      ? await bcrypt.hash(userData.password, 12)
      : undefined;
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();
    
    return user as AuthUser;
  }
  
  async getUserById(id: number): Promise<AuthUser | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    
    return user as AuthUser || null;
  }
  
  async getUserByEmail(email: string): Promise<AuthUser | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    return user as AuthUser || null;
  }
  
  async updateUser(id: number, updates: Partial<AuthUser>): Promise<void> {
    await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }
  
  async getAllUsers(): Promise<AuthUser[]> {
    const allUsers = await db.select().from(users);
    return allUsers as AuthUser[];
  }
  
  // CV operations
  async saveCV(cvData: Partial<CV>): Promise<CV> {
    const [cv] = await db
      .insert(cvs)
      .values({
        ...cvData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();
    
    return cv;
  }
  
  async getCVById(id: number): Promise<CV | null> {
    const [cv] = await db
      .select()
      .from(cvs)
      .where(eq(cvs.id, id));
    
    return cv || null;
  }
  
  async getCVsByUserId(userId: number): Promise<CV[]> {
    return await db
      .select()
      .from(cvs)
      .where(eq(cvs.userId, userId))
      .orderBy(desc(cvs.createdAt));
  }
  
  async getLatestCVByUserId(userId: number): Promise<CV | null> {
    const [cv] = await db
      .select()
      .from(cvs)
      .where(eq(cvs.userId, userId))
      .orderBy(desc(cvs.createdAt))
      .limit(1);
    
    return cv || null;
  }
  
  async updateCV(id: number, updates: Partial<CV>): Promise<void> {
    await db
      .update(cvs)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(cvs.id, id));
  }
  
  async deleteCV(id: number): Promise<void> {
    await db.delete(cvs).where(eq(cvs.id, id));
  }
  
  async getAllCVs(): Promise<CV[]> {
    return await db.select().from(cvs).orderBy(desc(cvs.createdAt));
  }
  
  // ATS Score operations
  async saveATSScore(scoreData: Partial<ATSScore>): Promise<ATSScore> {
    const [score] = await db
      .insert(atsScores)
      .values({
        ...scoreData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();
    
    return score;
  }
  
  async getATSScoresByCVId(cvId: number): Promise<ATSScore[]> {
    return await db
      .select()
      .from(atsScores)
      .where(eq(atsScores.cvId, cvId))
      .orderBy(desc(atsScores.createdAt));
  }
  
  async updateATSScore(id: number, updates: Partial<ATSScore>): Promise<void> {
    await db
      .update(atsScores)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(atsScores.id, id));
  }
  
  // SA Profile operations
  async createSAProfile(profileData: Partial<SAProfile>): Promise<SAProfile> {
    const [profile] = await db
      .insert(saProfiles)
      .values({
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();
    
    return profile;
  }
  
  async getSAProfileByUserId(userId: number): Promise<SAProfile | null> {
    const [profile] = await db
      .select()
      .from(saProfiles)
      .where(eq(saProfiles.userId, userId));
    
    return profile || null;
  }
  
  async updateSAProfile(id: number, updates: Partial<SAProfile>): Promise<void> {
    await db
      .update(saProfiles)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(saProfiles.id, id));
  }
  
  // CV Analysis operations
  async saveCVAnalysis(analysisData: Partial<CVAnalysis>): Promise<CVAnalysis> {
    const [analysis] = await db
      .insert(cvAnalyses)
      .values({
        ...analysisData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();
    
    return analysis;
  }
  
  async getCVAnalysisByUserId(userId: number): Promise<CVAnalysis | null> {
    const [analysis] = await db
      .select()
      .from(cvAnalyses)
      .where(eq(cvAnalyses.userId, userId));
    
    return analysis || null;
  }
  
  // Subscription operations
  async getSubscription(userId: number): Promise<Subscription | null> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    
    return subscription || null;
  }
  
  async createSubscription(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        ...subscriptionData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();
    
    return subscription;
  }
  
  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<void> {
    await db
      .update(subscriptions)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, id));
  }
  
  // Employer operations
  async createEmployer(employerData: Partial<Employer>): Promise<Employer> {
    const [employer] = await db
      .insert(employers)
      .values({
        ...employerData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();
    
    return employer;
  }
  
  async getEmployerByUserId(userId: number): Promise<Employer | null> {
    const [employer] = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, userId));
    
    return employer || null;
  }
  
  async updateEmployer(id: number, updates: Partial<Employer>): Promise<void> {
    await db
      .update(employers)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(employers.id, id));
  }
  
  // Job Posting operations
  async createJobPosting(jobData: Partial<JobPosting>): Promise<JobPosting> {
    const [job] = await db
      .insert(jobPostings)
      .values({
        ...jobData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();
    
    return job;
  }
  
  async getJobPostingById(id: number): Promise<JobPosting | null> {
    const [job] = await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.id, id));
    
    return job || null;
  }
  
  async getJobPostingsByEmployerId(employerId: number): Promise<JobPosting[]> {
    return await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.employerId, employerId))
      .orderBy(desc(jobPostings.createdAt));
  }
  
  async getAllJobPostings(filters?: any): Promise<JobPosting[]> {
    let query = db.select().from(jobPostings);
    
    if (filters?.province) {
      query = query.where(eq(jobPostings.province, filters.province));
    }
    
    if (filters?.industry) {
      query = query.where(eq(jobPostings.industry, filters.industry));
    }
    
    return await query.orderBy(desc(jobPostings.createdAt));
  }
  
  async updateJobPosting(id: number, updates: Partial<JobPosting>): Promise<void> {
    await db
      .update(jobPostings)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(jobPostings.id, id));
  }
  
  async deleteJobPosting(id: number): Promise<void> {
    await db.delete(jobPostings).where(eq(jobPostings.id, id));
  }
  
  // Job Match operations
  async createJobMatch(matchData: Partial<JobMatch>): Promise<JobMatch> {
    const [match] = await db
      .insert(jobMatches)
      .values({
        ...matchData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();
    
    return match;
  }
  
  async getJobMatchesByUserId(userId: number): Promise<JobMatch[]> {
    return await db
      .select()
      .from(jobMatches)
      .where(eq(jobMatches.userId, userId))
      .orderBy(desc(jobMatches.createdAt));
  }
  
  async getJobMatchesByCVId(cvId: number): Promise<JobMatch[]> {
    return await db
      .select()
      .from(jobMatches)
      .where(eq(jobMatches.cvId, cvId))
      .orderBy(desc(jobMatches.createdAt));
  }
  
  // Skills operations
  async getAllSkills(): Promise<Skill[]> {
    return await db.select().from(skills);
  }
  
  async getSkillById(id: number): Promise<Skill | null> {
    const [skill] = await db
      .select()
      .from(skills)
      .where(eq(skills.id, id));
    
    return skill || null;
  }
  
  async getUserSkills(userId: number): Promise<UserSkill[]> {
    return await db
      .select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId));
  }
  
  async addUserSkill(skillData: Partial<UserSkill>): Promise<UserSkill> {
    const [userSkill] = await db
      .insert(userSkills)
      .values(skillData as any)
      .returning();
    
    return userSkill;
  }
  
  async removeUserSkill(userId: number, skillId: number): Promise<void> {
    await db
      .delete(userSkills)
      .where(and(
        eq(userSkills.userId, userId),
        eq(userSkills.skillId, skillId)
      ));
  }
  
  // Notifications operations
  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        ...notificationData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();
    
    return notification;
  }
  
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }
  
  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Premium job matching operations
  async getPremiumJobMatches(employerId: number): Promise<any[]> {
    const matches = await db
      .select({
        id: premiumJobMatches.id,
        jobSeekerId: premiumJobMatches.jobSeekerId,
        recruiterId: premiumJobMatches.recruiterId,
        cvId: premiumJobMatches.cvId,
        matchScore: premiumJobMatches.matchScore,
        jobSeekerPaid: premiumJobMatches.jobSeekerPaid,
        recruiterPaid: premiumJobMatches.recruiterPaid,
        matchData: premiumJobMatches.matchData,
        status: premiumJobMatches.status,
        createdAt: premiumJobMatches.createdAt,
        cvTitle: cvs.fileName,
        cvScore: cvs.atsScore,
        userLocation: users.location,
        userProvince: users.province,
      })
      .from(premiumJobMatches)
      .leftJoin(cvs, eq(premiumJobMatches.cvId, cvs.id))
      .leftJoin(users, eq(premiumJobMatches.jobSeekerId, users.id))
      .leftJoin(jobPostings, eq(premiumJobMatches.jobPostingId, jobPostings.id))
      .where(eq(jobPostings.employerId, employerId))
      .orderBy(desc(premiumJobMatches.matchScore));

    return matches.map(match => ({
      id: match.id,
      jobId: match.jobSeekerId,
      candidateId: match.jobSeekerId,
      matchScore: match.matchScore,
      skillsMatch: match.matchData?.skillsMatch || 85,
      experienceMatch: match.matchData?.experienceMatch || 80,
      locationMatch: match.matchData?.locationMatch || 90,
      saContextMatch: match.matchData?.saContextMatch || 85,
      isRecruiterNotified: true,
      isPaid: match.recruiterPaid,
      isContactRevealed: match.recruiterPaid,
      matchedSkills: match.matchData?.matchedSkills || [],
      missingSkills: match.matchData?.missingSkills || [],
      candidate: {
        id: match.jobSeekerId,
        name: match.recruiterPaid ? match.matchData?.candidateName : undefined,
        email: match.recruiterPaid ? match.matchData?.candidateEmail : undefined,
        location: match.userLocation || 'South Africa',
        experienceLevel: match.matchData?.experienceLevel || 'Mid-level',
        skills: match.matchData?.skills || [],
        bbbeeLevel: match.matchData?.bbbeeLevel,
        industry: match.matchData?.industry || 'Technology',
        cvScore: match.cvScore || 85,
        lastActive: match.createdAt?.toISOString() || new Date().toISOString(),
      },
      price: match.recruiterPaid ? 0 : 200,
    }));
  }

  async createPremiumJobMatch(matchData: any): Promise<any> {
    const [match] = await db
      .insert(premiumJobMatches)
      .values(matchData)
      .returning();
    return match;
  }

  async getJobSeekerMatches(userId: number): Promise<any[]> {
    // Get premium matches for job seeker
    const matches = await db
      .select({
        id: premiumJobMatches.id,
        jobSeekerId: premiumJobMatches.jobSeekerId,
        recruiterId: premiumJobMatches.recruiterId,
        matchScore: premiumJobMatches.matchScore,
        jobSeekerPaid: premiumJobMatches.jobSeekerPaid,
        recruiterPaid: premiumJobMatches.recruiterPaid,
        matchData: premiumJobMatches.matchData,
        status: premiumJobMatches.status,
        createdAt: premiumJobMatches.createdAt,
        jobTitle: jobPostings.title,
        jobCompany: employers.companyName,
        jobLocation: jobPostings.location,
        jobIndustry: jobPostings.industry,
      })
      .from(premiumJobMatches)
      .leftJoin(jobPostings, eq(premiumJobMatches.jobPostingId, jobPostings.id))
      .leftJoin(employers, eq(jobPostings.employerId, employers.id))
      .where(eq(premiumJobMatches.jobSeekerId, userId))
      .orderBy(desc(premiumJobMatches.matchScore));

    return matches.map(match => ({
      id: match.id,
      jobTitle: match.jobTitle || 'Confidential Position',
      company: match.recruiterPaid ? match.jobCompany : 'Confidential Company',
      location: match.jobLocation || 'South Africa',
      industry: match.jobIndustry || 'Various',
      matchScore: match.matchScore,
      salaryMatch: match.matchData?.salaryMatch || false,
      experienceMatch: match.matchData?.experienceMatch || false,
      skillsMatch: match.matchData?.skillsMatch || 0,
      isRecruiterInterested: match.recruiterPaid,
      recruiterPaid: match.recruiterPaid,
      canViewCompany: match.recruiterPaid,
      notificationDate: match.createdAt?.toISOString(),
      matchReasons: match.matchData?.matchReasons || []
    }));
  }

  async unlockCandidateContact(matchId: number, recruiterId: number): Promise<any> {
    // Verify match exists and recruiter owns it
    const [match] = await db
      .select()
      .from(premiumJobMatches)
      .where(and(
        eq(premiumJobMatches.id, matchId),
        eq(premiumJobMatches.recruiterId, recruiterId)
      ));

    if (!match) {
      throw new Error('Match not found or access denied');
    }

    if (match.recruiterPaid) {
      throw new Error('Contact already unlocked');
    }

    const [candidate] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        location: users.location,
        province: users.province,
      })
      .from(users)
      .where(eq(users.id, match.jobSeekerId));

    await db
      .update(premiumJobMatches)
      .set({ 
        recruiterPaid: true,
        recruiterViewed: true,
        recruiterLastViewedAt: new Date(),
        status: 'contact_revealed'
      })
      .where(eq(premiumJobMatches.id, matchId));

    return {
      match,
      candidate: {
        id: candidate.id,
        name: `${candidate.firstName} ${candidate.lastName}`.trim(),
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        province: candidate.province,
      }
    };
  }
}

// Create database storage instance
export const storage = new DatabaseStorage();