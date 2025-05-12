import { 
  users, 
  cvs, 
  atsScores, 
  saProfiles,
  deepAnalysisReports,
  plans,
  subscriptions,
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
  type Subscription
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Create PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  
  // Plan operations
  getPlan(id: number): Promise<Plan | undefined>;
  getActivePlans(): Promise<Plan[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'sessions' 
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const [user] = await db.insert(users).values({
      ...insertUser,
      createdAt: now,
      updatedAt: now
    }).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date()
      })
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
      .select({ count: db.sql`count(*)` })
      .from(cvs)
      .where(eq(cvs.userId, userId));
    return Number(result[0].count);
  }

  async createCV(insertCV: InsertCV): Promise<CV> {
    const now = new Date();
    const [cv] = await db.insert(cvs).values({
      ...insertCV,
      createdAt: now,
      updatedAt: now
    }).returning();
    return cv;
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
    // Insert without explicitly setting timestamps since they have default values
    const [score] = await db.insert(atsScores).values({
      ...insertATSScore
    }).returning();
    return score;
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
}

// Create and export database storage instance
export const storage = new DatabaseStorage();
