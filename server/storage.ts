import { 
  users, 
  cvs, 
  atsScores, 
  saProfiles,
  deepAnalysisReports,
  plans,
  subscriptions,
  employers,
  jobPostings,
  jobMatches,
  skills,
  userSkills,
  notifications,
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
  type AnalysisReport,
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
import { db, supabase } from "./db";
import { eq, and, desc, sql, count } from "drizzle-orm";
import session from "express-session";
import MemoryStore from "memorystore";

// Create memory session store for development
const MemStore = MemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  
  // SA Profile operations
  getSaProfile(userId: number): Promise<SaProfile | undefined>;
  createSaProfile(profile: InsertSaProfile): Promise<SaProfile>;
  updateSaProfile(userId: number, updates: Partial<InsertSaProfile>): Promise<SaProfile>;
  
  // CV operations
  getCV(id: number): Promise<CV | undefined>;
  getCVsByUser(userId: number): Promise<CV[]>;
  getLatestCVByUser(userId: number): Promise<CV | undefined>;
  getCVsCount(userId: number): Promise<number>;
  createCV(cv: InsertCV): Promise<CV>;
  updateCV(id: number, updates: Partial<InsertCV>): Promise<CV>;
  deleteCV(id: number): Promise<void>;
  
  // ATS Score operations
  getATSScore(id: number): Promise<ATSScore | undefined>;
  getATSScoreByCV(cvId: number): Promise<ATSScore | undefined>;
  createATSScore(atsScore: InsertATSScore): Promise<ATSScore>;
  
  // Deep analysis operations
  getDeepAnalysisReport(id: number): Promise<DeepAnalysisReport | undefined>;
  getDeepAnalysisByCV(cvId: number): Promise<DeepAnalysisReport | undefined>;
  createDeepAnalysisReport(report: InsertDeepAnalysisReport): Promise<DeepAnalysisReport>;
  updateDeepAnalysisReport(id: number, updates: Partial<InsertDeepAnalysisReport>): Promise<DeepAnalysisReport>;
  
  // Subscription operations
  getSubscription(userId: number): Promise<Subscription | undefined>;
  getActiveSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: any): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription>;
  recordScanUsage(userId: number): Promise<{ scansUsed: number, scanLimit: number }>;
  resetScanUsage(userId: number): Promise<boolean>;
  
  // Plan operations
  getPlan(id: number): Promise<Plan | undefined>;
  getActivePlans(): Promise<Plan[]>;
  getSubscriptionPlans(): Promise<Plan[]>;
  
  // Database health check
  checkDatabaseConnection(): Promise<boolean>;
  
  // SA Profile operations extended
  getSaProfileByUserId(userId: number): Promise<SaProfile | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemStore({
      checkPeriod: 86400000, // prune expired entries every 24h
      ttl: 86400000, // 24 hour TTL
      stale: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user;
  }
  
  async getUserByResetToken(token: string): Promise<User | undefined> {
    try {
      // Now that resetToken is part of our schema, we can use it directly
      const [user] = await db.select()
        .from(users)
        .where(eq(users.resetToken, token));
      
      return user;
    } catch (error) {
      console.error("Error getting user by reset token:", error);
      return undefined;
    }
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    try {
      // Use raw SQL to query the verification token since it's not in the TypeScript schema
      const result = await db.execute(sql`
        SELECT * FROM users 
        WHERE verification_token = ${token}
        AND verification_token_expiry > NOW()
      `);
      
      if (result.rows.length > 0) {
        return result.rows[0] as User;
      }
      
      return undefined;
    } catch (error) {
      console.error("Error getting user by verification token:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // For now, create a simple in-memory user for testing
    // In production, this would use the actual database
    const now = new Date();
    const newUser: User = {
      id: Math.floor(Math.random() * 10000),
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      name: insertUser.name || null,
      profilePicture: insertUser.profilePicture || null,
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
      createdAt: now,
      updatedAt: now
    };
    
    // Store in memory for development (replace with actual DB in production)
    this.memUsers.set(newUser.email, newUser);
    
    return newUser;
  }

  async updateUser(id: number, updates: any): Promise<User> {
    // Use a type cast to handle fields that aren't in the InsertUser type
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date()
    };
    
    // Use SQL for maximum flexibility with schema changes
    try {
      // First check if we have verification or reset fields that need special handling
      const hasEmailVerification = 'emailVerified' in updates 
        || 'verificationToken' in updates 
        || 'verificationTokenExpiry' in updates;
        
      const hasResetToken = 'resetToken' in updates || 'resetTokenExpiry' in updates;
      
      if (hasEmailVerification || hasResetToken) {
        // Replace all undefined parameters with appropriate values
        const result = await db.execute(sql`
          UPDATE users 
          SET 
            ${updates.emailVerified !== undefined ? sql`email_verified = ${updates.emailVerified},` : sql``}
            ${updates.verificationToken !== undefined ? sql`verification_token = ${updates.verificationToken},` : sql``}
            ${updates.verificationTokenExpiry !== undefined ? sql`verification_token_expiry = ${updates.verificationTokenExpiry},` : sql``}
            ${updates.resetToken !== undefined ? sql`reset_token = ${updates.resetToken},` : sql``}
            ${updates.resetTokenExpiry !== undefined ? sql`reset_token_expiry = ${updates.resetTokenExpiry},` : sql``}
            ${updates.username !== undefined ? sql`username = ${updates.username},` : sql``}
            ${updates.password !== undefined ? sql`password = ${updates.password},` : sql``}
            ${updates.email !== undefined ? sql`email = ${updates.email},` : sql``}
            ${updates.name !== undefined ? sql`name = ${updates.name},` : sql``}
            ${updates.profilePicture !== undefined ? sql`profile_picture = ${updates.profilePicture},` : sql``}
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `);
        
        if (result.rows.length > 0) {
          return result.rows[0] as User;
        }
      }
    } catch (error) {
      console.error("Error updating user with special fields:", error);
    }
    
    // Fall back to the standard update if no special fields or if the special update failed
    const [user] = await db
      .update(users)
      .set(updatesWithTimestamp)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // SA Profile operations
  async getSaProfile(userId: number): Promise<SaProfile | undefined> {
    const [profile] = await db.select().from(saProfiles).where(eq(saProfiles.userId, userId));
    return profile;
  }

  async createSaProfile(profile: InsertSaProfile): Promise<SaProfile> {
    const now = new Date();
    const [saProfile] = await db.insert(saProfiles).values({
      ...profile,
      createdAt: now,
      updatedAt: now
    }).returning();
    return saProfile;
  }

  async updateSaProfile(userId: number, updates: Partial<InsertSaProfile>): Promise<SaProfile> {
    const [profile] = await db
      .update(saProfiles)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(saProfiles.userId, userId))
      .returning();
    return profile;
  }

  // CV operations
  async getCV(id: number): Promise<CV | undefined> {
    const [cv] = await db.select().from(cvs).where(eq(cvs.id, id));
    return cv;
  }

  async getCVsByUser(userId: number): Promise<CV[]> {
    return await db
      .select()
      .from(cvs)
      .where(eq(cvs.userId, userId))
      .orderBy(desc(cvs.createdAt));
  }

  async getLatestCVByUser(userId: number): Promise<CV | undefined> {
    const [cv] = await db
      .select()
      .from(cvs)
      .where(eq(cvs.userId, userId))
      .orderBy(desc(cvs.createdAt))
      .limit(1);
    return cv;
  }

  async getCVsCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(cvs)
      .where(eq(cvs.userId, userId));
    return Number(result[0].count);
  }

  async createCV(insertCV: InsertCV): Promise<CV> {
    try {
      // Generate a guaranteed valid filename with timestamp for uniqueness if not provided
      const timestamp = Date.now();
      const safeFileName = `cv_${timestamp}.pdf`;
      
      // Get safe values with fallbacks for all required fields
      const userId = insertCV.userId;  // This can be null for guests
      const fileName = insertCV.fileName || safeFileName;
      const fileType = insertCV.fileType || 'application/pdf';
      const fileSize = insertCV.fileSize || 0;
      const content = insertCV.content || ' ';
      const title = insertCV.title || 'CV';
      const isGuest = insertCV.isGuest || false;
      
      console.log("CV Upload Data:", {
        userId, fileName, fileType, fileSize, 
        contentLength: content ? content.length : 0,
        title, isGuest
      });
      
      // Use Drizzle ORM to insert the record
      const [cv] = await db.insert(cvs).values({
        userId,
        fileName,
        fileType,
        fileSize,
        content,
        title,
        isGuest
      }).returning();
      
      console.log("CV created successfully:", cv);
      
      return cv;
    } catch (error) {
      console.error("FATAL CV UPLOAD ERROR:", error);
      throw error;
    }
  }

  async updateCV(id: number, updates: Partial<InsertCV>): Promise<CV> {
    const [cv] = await db
      .update(cvs)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(cvs.id, id))
      .returning();
    return cv;
  }

  async deleteCV(id: number): Promise<void> {
    await db.delete(cvs).where(eq(cvs.id, id));
  }

  // ATS Score operations
  async getATSScore(id: number): Promise<ATSScore | undefined> {
    const [score] = await db.select().from(atsScores).where(eq(atsScores.id, id));
    return score;
  }

  async getATSScoreByCV(cvId: number): Promise<ATSScore | undefined> {
    const [score] = await db.select().from(atsScores).where(eq(atsScores.cvId, cvId));
    return score;
  }

  async createATSScore(insertATSScore: InsertATSScore): Promise<ATSScore> {
    try {
      // Use SQL query directly to avoid typing issues
      const result = await db.execute(sql`
        INSERT INTO ats_scores (
          cv_id, score, skills_score, context_score, format_score, 
          strengths, improvements, issues, 
          sa_keywords_found, sa_context_score, 
          bbbee_detected, nqf_detected, 
          keyword_recommendations,
          created_at, updated_at
        ) VALUES (
          ${insertATSScore.cvId}, 
          ${insertATSScore.score}, 
          ${insertATSScore.skillsScore || 0}, 
          ${insertATSScore.contextScore || 0}, 
          ${insertATSScore.formatScore || 0},
          ${JSON.stringify(insertATSScore.strengths || [])}, 
          ${JSON.stringify(insertATSScore.improvements || [])}, 
          ${JSON.stringify(insertATSScore.issues || [])}, 
          ${JSON.stringify(insertATSScore.saKeywordsFound || [])}, 
          ${insertATSScore.saContextScore || null},
          ${insertATSScore.bbbeeDetected || false},
          ${insertATSScore.nqfDetected || false},
          ${insertATSScore.keywordRecommendations ? JSON.stringify(insertATSScore.keywordRecommendations) : 'null'},
          NOW(), NOW()
        ) RETURNING *
      `);
      
      return result.rows[0] as ATSScore;
    } catch (error) {
      console.error("Error creating ATS score:", error);
      
      // Try a more basic approach if there was an error
      try {
        // Create a proper ATS score object with minimal data
        const [atsScore] = await db.insert(atsScores).values({
          cvId: insertATSScore.cvId,
          score: insertATSScore.score,
          skillsScore: insertATSScore.skillsScore || 0,
          contextScore: insertATSScore.contextScore || 0,
          formatScore: insertATSScore.formatScore || 0,
          strengths: [],
          improvements: [],
          issues: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        console.log("Created minimal ATS score as fallback");
        return atsScore;
      } catch (fallbackError) {
        console.error("Even fallback ATS score creation failed:", fallbackError);
        throw new Error("Failed to create ATS score after multiple attempts");
      }
    }
  }

  // Deep analysis operations
  async getDeepAnalysisReport(id: number): Promise<DeepAnalysisReport | undefined> {
    const [report] = await db.select().from(deepAnalysisReports).where(eq(deepAnalysisReports.id, id));
    return report;
  }

  async getDeepAnalysisByCV(cvId: number): Promise<DeepAnalysisReport | undefined> {
    const [report] = await db.select().from(deepAnalysisReports).where(eq(deepAnalysisReports.cvId, cvId));
    return report;
  }

  async createDeepAnalysisReport(insertReport: InsertDeepAnalysisReport): Promise<DeepAnalysisReport> {
    const now = new Date();
    const [report] = await db.insert(deepAnalysisReports).values({
      ...insertReport,
      createdAt: now,
      updatedAt: now
    }).returning();
    return report;
  }

  async updateDeepAnalysisReport(id: number, updates: Partial<InsertDeepAnalysisReport>): Promise<DeepAnalysisReport> {
    const [report] = await db
      .update(deepAnalysisReports)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(deepAnalysisReports.id, id))
      .returning();
    return report;
  }

  // Subscription operations
  async getSubscription(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async getActiveSubscription(userId: number): Promise<Subscription | undefined> {
    const now = new Date();
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        )
      );
    return subscription;
  }

  async createSubscription(insertSubscription: any): Promise<Subscription> {
    const now = new Date();
    const [subscription] = await db.insert(subscriptions).values({
      ...insertSubscription,
      createdAt: now,
      updatedAt: now
    }).returning();
    return subscription;
  }

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  async recordScanUsage(userId: number): Promise<{ scansUsed: number, scanLimit: number }> {
    // Get the user's active subscription
    const subscription = await this.getActiveSubscription(userId);
    if (!subscription) {
      return { scansUsed: 0, scanLimit: 0 };
    }
    
    // Get the plan to check scan limit
    const plan = await this.getPlan(subscription.planId);
    if (!plan) {
      return { scansUsed: 0, scanLimit: 0 };
    }
    
    // Check if we need to reset scan usage (new month)
    const now = new Date();
    if (subscription.lastScanReset) {
      const lastReset = new Date(subscription.lastScanReset);
      const monthDiff = 
        (now.getFullYear() - lastReset.getFullYear()) * 12 + 
        (now.getMonth() - lastReset.getMonth());
      
      if (monthDiff >= 1) {
        // Reset scan count at the beginning of a new month
        await this.resetScanUsage(userId);
        return { scansUsed: 1, scanLimit: plan.scanLimit || 0 };
      }
    } else {
      // If lastScanReset is null, initialize it
      await db
        .update(subscriptions)
        .set({ 
          lastScanReset: now,
          updatedAt: now
        })
        .where(eq(subscriptions.id, subscription.id));
    }
    
    // Increment scan usage
    const scansUsed = (subscription.scansUsed || 0) + 1;
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({ 
        scansUsed,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, subscription.id))
      .returning();
    
    return { 
      scansUsed: updatedSubscription.scansUsed || 0,
      scanLimit: plan.scanLimit || 0
    };
  }
  
  async resetScanUsage(userId: number): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);
    if (!subscription) {
      return false;
    }
    
    await db
      .update(subscriptions)
      .set({ 
        scansUsed: 0,
        lastScanReset: new Date(),
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, subscription.id));
    
    return true;
  }

  // Plan operations
  async getPlan(id: number): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }

  async getActivePlans(): Promise<Plan[]> {
    return await db
      .select()
      .from(plans)
      .where(eq(plans.isActive, true));
  }

  async getSubscriptionPlans(): Promise<Plan[]> {
    return await this.getActivePlans();
  }

  async checkDatabaseConnection(): Promise<boolean> {
    try {
      await db.execute(sql`SELECT 1`);
      return true;
    } catch (error) {
      console.error("Database connection check failed:", error);
      return false;
    }
  }

  async getSaProfileByUserId(userId: number): Promise<SaProfile | undefined> {
    return await this.getSaProfile(userId);
  }
}

export const storage = new DatabaseStorage();
