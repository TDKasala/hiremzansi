import { db } from "./db";
import { 
  notifications,
  users,
  cvs,
  jobPostings,
  employers,
  jobMatches,
  skills,
  userSkills,
  type JobPosting, 
  type InsertJobPosting,
  type JobMatch,
  type InsertJobMatch,
  type Skill,
  type InsertSkill,
  type UserSkill,
  type InsertUserSkill,
  type Notification,
  type InsertNotification,
  type Employer,
  type InsertEmployer
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Employer operations
export async function getEmployer(id: number): Promise<Employer | undefined> {
  const [employer] = await db.select().from(employers).where(eq(employers.id, id));
  return employer;
}

export async function getEmployerByUserId(userId: number): Promise<Employer | undefined> {
  const [employer] = await db.select().from(employers).where(eq(employers.userId, userId));
  return employer;
}

export async function getEmployers(query?: {
  industry?: string;
  size?: string;
  location?: string;
  isVerified?: boolean;
  limit?: number;
}): Promise<Employer[]> {
  let baseQuery = db.select().from(employers);

  // Apply filters
  if (query) {
    if (query.industry) {
      baseQuery = baseQuery.where(eq(employers.industry, query.industry));
    }
    if (query.size) {
      baseQuery = baseQuery.where(eq(employers.size, query.size));
    }
    if (query.location) {
      baseQuery = baseQuery.where(eq(employers.location, query.location));
    }
    if (query.isVerified !== undefined) {
      baseQuery = baseQuery.where(eq(employers.isVerified, query.isVerified));
    }
    if (query.limit) {
      baseQuery = baseQuery.limit(query.limit);
    }
  }

  const result = await baseQuery;
  return result;
}

export async function createEmployer(employer: InsertEmployer): Promise<Employer> {
  const [result] = await db.insert(employers).values(employer).returning();
  return result;
}

export async function updateEmployer(id: number, updates: Partial<InsertEmployer>): Promise<Employer> {
  const [result] = await db
    .update(employers)
    .set(updates)
    .where(eq(employers.id, id))
    .returning();
  return result;
}

// Job posting operations
export async function getJobPosting(id: number): Promise<JobPosting | undefined> {
  const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, id));
  return job;
}

export async function getJobPostings(query?: {
  title?: string;
  location?: string;
  industry?: string;
  employmentType?: string;
  limit?: number;
}): Promise<JobPosting[]> {
  let baseQuery = db.select().from(jobPostings);

  // Apply filters
  if (query) {
    if (query.title) {
      baseQuery = baseQuery.where(sql`${jobPostings.title} ILIKE ${`%${query.title}%`}`);
    }
    if (query.location) {
      baseQuery = baseQuery.where(eq(jobPostings.location, query.location));
    }
    if (query.employmentType) {
      baseQuery = baseQuery.where(eq(jobPostings.employmentType, query.employmentType));
    }
    if (query.industry) {
      baseQuery = baseQuery.where(eq(jobPostings.industry, query.industry));
    }
    if (query.limit) {
      baseQuery = baseQuery.limit(query.limit);
    }
  }

  // Only active jobs
  baseQuery = baseQuery.where(eq(jobPostings.isActive, true));

  // Order by created date (newest first)
  baseQuery = baseQuery.orderBy(desc(jobPostings.createdAt));

  const result = await baseQuery;
  return result;
}

export async function getJobPostingsByEmployer(employerId: number): Promise<JobPosting[]> {
  const result = await db
    .select()
    .from(jobPostings)
    .where(eq(jobPostings.employerId, employerId))
    .orderBy(desc(jobPostings.createdAt));
  return result;
}

export async function createJobPosting(job: InsertJobPosting): Promise<JobPosting> {
  const [result] = await db.insert(jobPostings).values(job).returning();
  return result;
}

export async function updateJobPosting(id: number, updates: Partial<InsertJobPosting>): Promise<JobPosting> {
  const [result] = await db
    .update(jobPostings)
    .set(updates)
    .where(eq(jobPostings.id, id))
    .returning();
  return result;
}

export async function deleteJobPosting(id: number): Promise<void> {
  await db.delete(jobPostings).where(eq(jobPostings.id, id));
}

// Job matching operations
export async function createJobMatch(match: InsertJobMatch): Promise<JobMatch> {
  const [result] = await db.insert(jobMatches).values(match).returning();
  return result;
}

export async function getJobMatchesForJob(jobId: number): Promise<JobMatch[]> {
  const result = await db
    .select()
    .from(jobMatches)
    .where(eq(jobMatches.jobId, jobId))
    .orderBy(desc(jobMatches.matchScore));
  return result;
}

export async function getJobMatchesForCV(cvId: number): Promise<JobMatch[]> {
  const result = await db
    .select()
    .from(jobMatches)
    .where(eq(jobMatches.cvId, cvId))
    .orderBy(desc(jobMatches.matchScore));
  return result;
}

// Skills operations
export async function getSkill(id: number): Promise<Skill | undefined> {
  const [skill] = await db.select().from(skills).where(eq(skills.id, id));
  return skill;
}

export async function getSkillByName(name: string): Promise<Skill | undefined> {
  const [skill] = await db.select().from(skills).where(eq(skills.name, name));
  return skill;
}

export async function createSkill(skill: InsertSkill): Promise<Skill> {
  const [result] = await db.insert(skills).values(skill).returning();
  return result;
}

export async function getUserSkills(userId: number): Promise<UserSkill[]> {
  return db.select().from(userSkills).where(eq(userSkills.userId, userId));
}

export async function addUserSkill(userSkill: InsertUserSkill): Promise<UserSkill> {
  const [result] = await db.insert(userSkills).values(userSkill).returning();
  return result;
}

export async function removeUserSkill(userId: number, skillId: number): Promise<void> {
  await db
    .delete(userSkills)
    .where(and(eq(userSkills.userId, userId), eq(userSkills.skillId, skillId)));
}

// Notification operations
export async function getNotificationsForUser(userId: number, limit?: number): Promise<Notification[]> {
  let query = db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));

  if (limit) {
    query = query.limit(limit);
  }

  return query;
}

export async function createNotification(notification: InsertNotification): Promise<Notification> {
  const [result] = await db.insert(notifications).values(notification).returning();
  return result;
}

export async function markNotificationAsRead(id: number): Promise<Notification> {
  const [result] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id))
    .returning();
  return result;
}