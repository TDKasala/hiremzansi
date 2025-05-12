import { 
  users, 
  cvs, 
  atsScores, 
  type User, 
  type InsertUser, 
  type CV,
  type InsertCV,
  type ATSScore,
  type InsertATSScore,
  type AnalysisReport
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // CV operations
  getCV(id: number): Promise<CV | undefined>;
  getCVsByUser(userId: number): Promise<CV[]>;
  createCV(cv: InsertCV): Promise<CV>;
  
  // ATS Score operations
  getATSScore(id: number): Promise<ATSScore | undefined>;
  getATSScoreByCV(cvId: number): Promise<ATSScore | undefined>;
  createATSScore(atsScore: InsertATSScore): Promise<ATSScore>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cvs: Map<number, CV>;
  private atsScores: Map<number, ATSScore>;
  private userId: number;
  private cvId: number;
  private atsScoreId: number;

  constructor() {
    this.users = new Map();
    this.cvs = new Map();
    this.atsScores = new Map();
    this.userId = 1;
    this.cvId = 1;
    this.atsScoreId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // CV operations
  async getCV(id: number): Promise<CV | undefined> {
    return this.cvs.get(id);
  }

  async getCVsByUser(userId: number): Promise<CV[]> {
    return Array.from(this.cvs.values()).filter(cv => cv.userId === userId);
  }

  async createCV(insertCV: InsertCV): Promise<CV> {
    const id = this.cvId++;
    const cv: CV = {
      ...insertCV,
      id,
      createdAt: new Date()
    };
    this.cvs.set(id, cv);
    return cv;
  }

  // ATS Score operations
  async getATSScore(id: number): Promise<ATSScore | undefined> {
    return this.atsScores.get(id);
  }

  async getATSScoreByCV(cvId: number): Promise<ATSScore | undefined> {
    return Array.from(this.atsScores.values()).find(score => score.cvId === cvId);
  }

  async createATSScore(insertATSScore: InsertATSScore): Promise<ATSScore> {
    const id = this.atsScoreId++;
    const atsScore: ATSScore = {
      ...insertATSScore,
      id,
      createdAt: new Date()
    };
    this.atsScores.set(id, atsScore);
    return atsScore;
  }
}

export const storage = new MemStorage();
