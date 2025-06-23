import { 
  type User, 
  type InsertUser, 
  type CV,
  type InsertCV,
  type ATSScore,
  type InsertATSScore,
  type SaProfile,
  type InsertSaProfile,
  type DeepAnalysisReport,
  type InsertDeepAnalysisReport,
  type Plan,
  type Subscription,
  type Employer,
  type InsertEmployer,
  type JobPosting,
  type InsertJobPosting,
  type JobMatch,
  type InsertJobMatch,
  type Skill,
  type InsertSkill,
  type UserSkill,
  type InsertUserSkill,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

// Create memory session store for development
const MemStore = MemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // CV operations
  getCV(id: number): Promise<CV | undefined>;
  getCVsByUserId(userId: number): Promise<CV[]>;
  getLatestCVByUserId(userId: number): Promise<CV | undefined>;
  createCV(cv: InsertCV): Promise<CV>;
  updateCV(id: number, updates: Partial<InsertCV>): Promise<CV>;
  deleteCV(id: number): Promise<void>;
  
  // ATS Score operations
  getATSScore(id: number): Promise<ATSScore | undefined>;
  getATSScoresByCVId(cvId: number): Promise<ATSScore[]>;
  getLatestATSScoreByCVId(cvId: number): Promise<ATSScore | undefined>;
  createATSScore(score: InsertATSScore): Promise<ATSScore>;
  updateATSScore(id: number, updates: Partial<InsertATSScore>): Promise<ATSScore>;
  
  // SA Profile operations
  getSaProfile(userId: number): Promise<SaProfile | undefined>;
  createSaProfile(profile: InsertSaProfile): Promise<SaProfile>;
  updateSaProfile(userId: number, updates: Partial<InsertSaProfile>): Promise<SaProfile>;
  
  // Deep Analysis operations
  getDeepAnalysisReport(id: number): Promise<DeepAnalysisReport | undefined>;
  getDeepAnalysisReportsByCVId(cvId: number): Promise<DeepAnalysisReport[]>;
  createDeepAnalysisReport(report: InsertDeepAnalysisReport): Promise<DeepAnalysisReport>;
  
  // Plan operations
  getPlans(): Promise<Plan[]>;
  getPlan(id: number): Promise<Plan | undefined>;
  
  // Subscription operations
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  
  // Employer operations
  getEmployer(id: number): Promise<Employer | undefined>;
  getEmployerByUserId(userId: number): Promise<Employer | undefined>;
  createEmployer(employer: InsertEmployer): Promise<Employer>;
  
  // Job operations
  getJobPosting(id: number): Promise<JobPosting | undefined>;
  getJobPostings(): Promise<JobPosting[]>;
  getJobPostingsByEmployer(employerId: number): Promise<JobPosting[]>;
  createJobPosting(job: InsertJobPosting): Promise<JobPosting>;
  
  // Job match operations
  getJobMatchesForUser(userId: number): Promise<JobMatch[]>;
  createJobMatch(match: InsertJobMatch): Promise<JobMatch>;
  
  // Skill operations
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  getUserSkills(userId: number): Promise<UserSkill[]>;
  
  // Notification operations
  getNotificationsForUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  
  // Session operations
  getSessionStore(): any;
  
  // Connection test
  testConnection(): Promise<boolean>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllCVs(): Promise<CV[]>;
}

export class MemoryStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private cvs: Map<number, CV> = new Map();
  private atsScores: Map<number, ATSScore> = new Map();
  private saProfiles: Map<number, SaProfile> = new Map();
  private deepAnalysisReports: Map<number, DeepAnalysisReport> = new Map();
  private plans: Map<number, Plan> = new Map();
  private subscriptions: Map<number, Subscription> = new Map();
  private employers: Map<number, Employer> = new Map();
  private jobPostings: Map<number, JobPosting> = new Map();
  private jobMatches: Map<number, JobMatch> = new Map();
  private skills: Map<number, Skill> = new Map();
  private userSkills: Map<number, UserSkill> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private sessionStore: any;
  
  private nextId = 1;
  private userIdCounter = 1;
  private cvIdCounter = 1;
  private atsScoreIdCounter = 1;
  private saProfileIdCounter = 1;
  private deepAnalysisIdCounter = 1;
  private planIdCounter = 1;
  private subscriptionIdCounter = 1;
  private employerIdCounter = 1;
  private jobPostingIdCounter = 1;
  private jobMatchIdCounter = 1;
  private skillIdCounter = 1;
  private userSkillIdCounter = 1;
  private notificationIdCounter = 1;

  constructor() {
    this.sessionStore = new MemStore({
      ttl: 86400000, // 1 day
      checkPeriod: 86400000, // Check every day
    });
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default admin user
    const adminUser: User = {
      id: this.userIdCounter++,
      username: 'admin',
      email: 'deniskasala17@gmail.com',
      password: '$scrypt$N=32768,r=8,p=1$8e4a2a8c3f2a1b5e$9a2b5c6d8e1f0a3b4c7d9e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
      name: 'Denis Kasala',
      profilePicture: null,
      role: 'admin',
      isActive: true,
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
      lastLogin: null,
      resetToken: null,
      resetTokenExpiry: null,
      receiveEmailDigest: true,
      lastEmailDigestSent: null,
      phoneNumber: null,
      phoneVerified: false,
      isTemporary: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(adminUser.id, adminUser);

    // Create default subscription plans
    const plans: Plan[] = [
      {
        id: this.planIdCounter++,
        name: 'Free',
        description: 'Basic ATS score and CV analysis',
        price: 0,
        interval: 'month',
        features: ['Basic ATS score', 'Limited CV analysis', '3 CV scans per month'],
        scanLimit: 3,
        isActive: true,
        isPopular: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.planIdCounter++,
        name: 'Basic',
        description: 'Enhanced CV analysis with job matching',
        price: 30,
        interval: 'month',
        features: ['ATS score with recommendations', 'CV optimization tips', 'Job description matching', '10 CV scans per month'],
        scanLimit: 10,
        isActive: true,
        isPopular: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.planIdCounter++,
        name: 'Premium',
        description: 'Full CV optimization with job matching and industry insights',
        price: 100,
        interval: 'month',
        features: ['Advanced ATS analysis', 'Industry-specific recommendations', 'B-BBEE and NQF optimization', 'Job description matching', '50 CV scans per month'],
        scanLimit: 50,
        isActive: true,
        isPopular: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.planIdCounter++,
        name: 'Enterprise',
        description: 'Maximum CV optimization with unlimited scans',
        price: 200,
        interval: 'month',
        features: ['All Premium features', 'Unlimited CV scans', 'Priority support', 'WhatsApp notifications'],
        scanLimit: 100,
        isActive: true,
        isPopular: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    plans.forEach(plan => this.plans.set(plan.id, plan));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.verificationToken === token);
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.resetToken === token);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      username: userData.username,
      password: userData.password,
      email: userData.email,
      name: userData.name || null,
      profilePicture: userData.profilePicture || null,
      role: 'user',
      isActive: true,
      emailVerified: false,
      verificationToken: null,
      verificationTokenExpiry: null,
      lastLogin: null,
      resetToken: null,
      resetTokenExpiry: null,
      receiveEmailDigest: true,
      lastEmailDigestSent: null,
      phoneNumber: null,
      phoneVerified: false,
      isTemporary: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) throw new Error('User not found');
    
    const updated: User = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  // CV operations
  async getCV(id: number): Promise<CV | undefined> {
    return this.cvs.get(id);
  }

  async getCVsByUserId(userId: number): Promise<CV[]> {
    return Array.from(this.cvs.values()).filter(cv => cv.userId === userId);
  }

  async getLatestCVByUserId(userId: number): Promise<CV | undefined> {
    const userCVs = await this.getCVsByUserId(userId);
    return userCVs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  async createCV(cvData: InsertCV): Promise<CV> {
    const cv: CV = {
      id: this.cvIdCounter++,
      ...cvData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cvs.set(cv.id, cv);
    return cv;
  }

  async updateCV(id: number, updates: Partial<InsertCV>): Promise<CV> {
    const existing = this.cvs.get(id);
    if (!existing) throw new Error('CV not found');
    
    const updated: CV = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.cvs.set(id, updated);
    return updated;
  }

  async deleteCV(id: number): Promise<void> {
    this.cvs.delete(id);
  }

  // ATS Score operations
  async getATSScore(id: number): Promise<ATSScore | undefined> {
    return this.atsScores.get(id);
  }

  async getATSScoresByCVId(cvId: number): Promise<ATSScore[]> {
    return Array.from(this.atsScores.values()).filter(score => score.cvId === cvId);
  }

  async getLatestATSScoreByCVId(cvId: number): Promise<ATSScore | undefined> {
    const scores = await this.getATSScoresByCVId(cvId);
    return scores.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  async createATSScore(scoreData: InsertATSScore): Promise<ATSScore> {
    const score: ATSScore = {
      id: this.atsScoreIdCounter++,
      ...scoreData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.atsScores.set(score.id, score);
    return score;
  }

  async updateATSScore(id: number, updates: Partial<InsertATSScore>): Promise<ATSScore> {
    const existing = this.atsScores.get(id);
    if (!existing) throw new Error('ATS Score not found');
    
    const updated: ATSScore = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.atsScores.set(id, updated);
    return updated;
  }

  // SA Profile operations
  async getSaProfile(userId: number): Promise<SaProfile | undefined> {
    return this.saProfiles.get(userId);
  }

  async createSaProfile(profileData: InsertSaProfile): Promise<SaProfile> {
    const profile: SaProfile = {
      id: this.saProfileIdCounter++,
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.saProfiles.set(profile.userId, profile);
    return profile;
  }

  async updateSaProfile(userId: number, updates: Partial<InsertSaProfile>): Promise<SaProfile> {
    const existing = this.saProfiles.get(userId);
    if (!existing) {
      // Create new profile if it doesn't exist
      return this.createSaProfile({ userId, ...updates });
    }
    
    const updated: SaProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.saProfiles.set(userId, updated);
    return updated;
  }

  // Deep Analysis operations
  async getDeepAnalysisReport(id: number): Promise<DeepAnalysisReport | undefined> {
    return this.deepAnalysisReports.get(id);
  }

  async getDeepAnalysisReportsByCVId(cvId: number): Promise<DeepAnalysisReport[]> {
    return Array.from(this.deepAnalysisReports.values()).filter(report => report.cvId === cvId);
  }

  async createDeepAnalysisReport(reportData: InsertDeepAnalysisReport): Promise<DeepAnalysisReport> {
    const report: DeepAnalysisReport = {
      id: this.deepAnalysisIdCounter++,
      ...reportData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.deepAnalysisReports.set(report.id, report);
    return report;
  }

  // Plan operations
  async getPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values()).filter(plan => plan.isActive);
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plans.get(id);
  }

  // Subscription operations
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(sub => sub.userId === userId && sub.isActive);
  }

  // Employer operations
  async getEmployer(id: number): Promise<Employer | undefined> {
    return this.employers.get(id);
  }

  async getEmployerByUserId(userId: number): Promise<Employer | undefined> {
    return Array.from(this.employers.values()).find(emp => emp.userId === userId);
  }

  async createEmployer(employerData: InsertEmployer): Promise<Employer> {
    const employer: Employer = {
      id: this.employerIdCounter++,
      ...employerData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.employers.set(employer.id, employer);
    return employer;
  }

  // Job operations
  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    return this.jobPostings.get(id);
  }

  async getJobPostings(): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values()).filter(job => job.status === 'active');
  }

  async getJobPostingsByEmployer(employerId: number): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values()).filter(job => job.employerId === employerId);
  }

  async createJobPosting(jobData: InsertJobPosting): Promise<JobPosting> {
    const job: JobPosting = {
      id: this.jobPostingIdCounter++,
      ...jobData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.jobPostings.set(job.id, job);
    return job;
  }

  // Job match operations
  async getJobMatchesForUser(userId: number): Promise<JobMatch[]> {
    return Array.from(this.jobMatches.values()).filter(match => match.userId === userId);
  }

  async createJobMatch(matchData: InsertJobMatch): Promise<JobMatch> {
    const match: JobMatch = {
      id: this.jobMatchIdCounter++,
      ...matchData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.jobMatches.set(match.id, match);
    return match;
  }

  // Skill operations
  async getSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(skill => skill.isActive);
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }

  async getUserSkills(userId: number): Promise<UserSkill[]> {
    return Array.from(this.userSkills.values()).filter(skill => skill.userId === userId);
  }

  // Notification operations
  async getNotificationsForUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.notificationIdCounter++,
      ...notificationData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  // Session operations
  getSessionStore(): any {
    return this.sessionStore;
  }

  // Connection test
  async testConnection(): Promise<boolean> {
    return true; // Always return true for memory storage
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllCVs(): Promise<CV[]> {
    return Array.from(this.cvs.values());
  }
}

export const storage = new MemoryStorage();