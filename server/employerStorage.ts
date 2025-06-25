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
  // Return sample data until database schema is updated
  const sampleJobs = [
    {
      id: 1,
      employerId: 1,
      title: "Senior Full Stack Developer",
      description: "Join our dynamic team building cutting-edge web applications for South African businesses. We're looking for an experienced developer who can work with modern technologies and contribute to our growing platform.",
      location: "Cape Town",
      province: "Western Cape",
      city: "Cape Town",
      employmentType: "Full-time",
      experienceLevel: "Senior",
      salaryRange: "45000-65000",
      requiredSkills: ["JavaScript", "React", "Node.js", "SQL", "Git"],
      preferredSkills: ["TypeScript", "AWS", "Docker", "MongoDB"],
      industry: "Technology",
      department: "Engineering",
      bbbeePreference: false,
      nqfRequirement: 7,
      languageRequirements: ["English"],
      deadline: new Date("2024-07-15T00:00:00.000Z"),
      isActive: true,
      isFeatured: true,
      isRemote: false,
      views: 156,
      applications: 23,
      createdAt: new Date("2024-06-15T10:30:00.000Z"),
      updatedAt: new Date("2024-06-15T10:30:00.000Z")
    },
    {
      id: 2,
      employerId: 2,
      title: "Junior Web Developer",
      description: "Great opportunity for a junior developer to grow their skills in a supportive environment. You'll work on exciting projects while learning from experienced mentors.",
      location: "Johannesburg",
      province: "Gauteng",
      city: "Johannesburg",
      employmentType: "Full-time",
      experienceLevel: "Junior",
      salaryRange: "25000-35000",
      requiredSkills: ["JavaScript", "HTML", "CSS", "Python"],
      preferredSkills: ["React", "Django", "PostgreSQL"],
      industry: "Technology",
      department: "Development",
      bbbeePreference: false,
      nqfRequirement: 6,
      languageRequirements: ["English"],
      deadline: new Date("2024-07-20T00:00:00.000Z"),
      isActive: true,
      isFeatured: false,
      isRemote: true,
      views: 89,
      applications: 15,
      createdAt: new Date("2024-06-18T14:20:00.000Z"),
      updatedAt: new Date("2024-06-18T14:20:00.000Z")
    },
    {
      id: 3,
      employerId: 3,
      title: "Project Manager - Digital Transformation",
      description: "Lead digital transformation initiatives for government sector projects. Must have experience with public sector requirements and B-BBEE compliance.",
      location: "Pretoria",
      province: "Gauteng",
      city: "Pretoria",
      employmentType: "Contract",
      experienceLevel: "Senior",
      salaryRange: "55000-75000",
      requiredSkills: ["Project Management", "Agile", "Digital Transformation", "Government Sector"],
      preferredSkills: ["PMP", "PRINCE2", "Change Management"],
      industry: "Government",
      department: "Operations",
      bbbeePreference: true,
      nqfRequirement: 8,
      languageRequirements: ["English", "Afrikaans"],
      deadline: new Date("2024-08-01T00:00:00.000Z"),
      isActive: true,
      isFeatured: true,
      isRemote: false,
      views: 78,
      applications: 12,
      createdAt: new Date("2024-06-20T09:15:00.000Z"),
      updatedAt: new Date("2024-06-20T09:15:00.000Z")
    },
    {
      id: 4,
      employerId: 4,
      title: "Marketing Specialist",
      description: "Drive marketing campaigns for South African retail brand. Focus on digital marketing strategies and B-BBEE supplier development.",
      location: "Durban",
      province: "KwaZulu-Natal",
      city: "Durban",
      employmentType: "Full-time",
      experienceLevel: "Mid-level",
      salaryRange: "35000-45000",
      requiredSkills: ["Digital Marketing", "SEO", "Social Media", "Analytics"],
      preferredSkills: ["Google Ads", "Facebook Marketing", "Content Creation"],
      industry: "Marketing",
      department: "Marketing",
      bbbeePreference: false,
      nqfRequirement: 6,
      languageRequirements: ["English"],
      deadline: new Date("2024-07-25T00:00:00.000Z"),
      isActive: true,
      isFeatured: false,
      isRemote: false,
      views: 45,
      applications: 8,
      createdAt: new Date("2024-06-22T11:00:00.000Z"),
      updatedAt: new Date("2024-06-22T11:00:00.000Z")
    },
    {
      id: 5,
      employerId: 5,
      title: "Data Analyst",
      description: "Analyze business data to drive insights for mining operations. Experience with South African mining regulations preferred.",
      location: "Johannesburg",
      province: "Gauteng",
      city: "Johannesburg",
      employmentType: "Full-time",
      experienceLevel: "Mid-level",
      salaryRange: "40000-55000",
      requiredSkills: ["Python", "SQL", "Excel", "Data Visualization"],
      preferredSkills: ["Power BI", "R", "Mining Industry Knowledge"],
      industry: "Mining",
      department: "Analytics",
      bbbeePreference: false,
      nqfRequirement: 7,
      languageRequirements: ["English"],
      deadline: new Date("2024-08-10T00:00:00.000Z"),
      isActive: true,
      isFeatured: false,
      isRemote: true,
      views: 67,
      applications: 19,
      createdAt: new Date("2024-06-25T16:45:00.000Z"),
      updatedAt: new Date("2024-06-25T16:45:00.000Z")
    }
  ];

  // Apply basic filtering
  let filteredJobs = sampleJobs;
  
  if (query) {
    if (query.title) {
      const searchTerm = query.title.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (query.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.province === query.location || job.city === query.location
      );
    }
    
    if (query.industry) {
      filteredJobs = filteredJobs.filter(job => job.industry === query.industry);
    }
    
    if (query.employmentType) {
      filteredJobs = filteredJobs.filter(job => job.employmentType === query.employmentType);
    }
    
    if (query.limit) {
      filteredJobs = filteredJobs.slice(0, query.limit);
    }
  }

  return filteredJobs as JobPosting[];
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