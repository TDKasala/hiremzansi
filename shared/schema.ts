import { pgTable, text, serial, integer, boolean, timestamp, varchar, json, real, doublePrecision, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  profilePicture: text("profile_picture"),
  role: text("role").default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  lastLogin: timestamp("last_login"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  receiveEmailDigest: boolean("receive_email_digest").default(true),
  lastEmailDigestSent: timestamp("last_email_digest_sent"),
  phoneNumber: text("phone_number"),
  phoneVerified: boolean("phone_verified").default(false),
  isTemporary: boolean("is_temporary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }: { many: any }) => ({
  cvs: many(cvs),
  subscriptions: many(subscriptions),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  profilePicture: true,
});

// South African profile details
export const saProfiles = pgTable("sa_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  province: text("province"),
  city: text("city"),
  bbbeeStatus: text("bbbee_status"),
  bbbeeLevel: integer("bbbee_level"),
  nqfLevel: integer("nqf_level"),
  preferredLanguages: text("preferred_languages").array(),
  industries: text("industries").array(),
  jobTypes: text("job_types").array(),
  whatsappEnabled: boolean("whatsapp_enabled").default(false),
  whatsappNumber: text("whatsapp_number"),
  whatsappVerified: boolean("whatsapp_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const saProfilesRelations = relations(saProfiles, ({ one }: { one: any }) => ({
  user: one(users, {
    fields: [saProfiles.userId],
    references: [users.id],
  }),
}));

export const insertSaProfileSchema = createInsertSchema(saProfiles).pick({
  userId: true,
  province: true,
  city: true,
  bbbeeStatus: true,
  bbbeeLevel: true,
  nqfLevel: true,
  preferredLanguages: true,
  industries: true,
  jobTypes: true,
  whatsappEnabled: true,
  whatsappNumber: true,
  whatsappVerified: true,
});

// CV schema
export const cvs = pgTable("cvs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Made nullable for guest uploads
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  content: text("content").notNull(),
  filePath: text("file_path"), // Path to the file on disk
  title: text("title").default("My CV"),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  targetPosition: text("target_position"),
  targetIndustry: text("target_industry"),
  jobDescription: text("job_description"),
  isGuest: boolean("is_guest").default(false), // Flag for guest uploads
  uploadMethod: text("upload_method").default("web"), // web, whatsapp, email
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cvsRelations = relations(cvs, ({ one, many }: { one: any, many: any }) => ({
  user: one(users, {
    fields: [cvs.userId],
    references: [users.id],
  }),
  atsScores: many(atsScores),
}));

export const insertCvSchema = createInsertSchema(cvs).pick({
  userId: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  content: true,
  filePath: true,
  title: true,
  description: true,
  isDefault: true,
  targetPosition: true,
  targetIndustry: true,
  jobDescription: true,
  isGuest: true,
  uploadMethod: true,
});

// ATS Score schema with enhanced South African context
export const atsScores = pgTable("ats_scores", {
  id: serial("id").primaryKey(),
  cvId: integer("cv_id").notNull().references(() => cvs.id),
  score: integer("score").notNull(),
  skillsScore: integer("skills_score").notNull(),
  contextScore: integer("context_score").notNull(),
  formatScore: integer("format_score").notNull(),
  strengths: text("strengths").array(),
  improvements: text("improvements").array(),
  issues: text("issues").array(),
  saKeywordsFound: text("sa_keywords_found").array(),
  saContextScore: integer("sa_context_score"),
  bbbeeDetected: boolean("bbbee_detected").default(false),
  nqfDetected: boolean("nqf_detected").default(false),
  keywordRecommendations: json("keyword_recommendations").$type<string[][]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const atsScoresRelations = relations(atsScores, ({ one }: { one: any }) => ({
  cv: one(cvs, {
    fields: [atsScores.cvId],
    references: [cvs.id],
  }),
}));

export const insertAtsScoreSchema = createInsertSchema(atsScores).pick({
  cvId: true,
  score: true,
  skillsScore: true,
  contextScore: true,
  formatScore: true,
  strengths: true,
  improvements: true,
  issues: true,
  saKeywordsFound: true,
  saContextScore: true,
  bbbeeDetected: true,
  nqfDetected: true,
  keywordRecommendations: true,
});

// Deep Analysis Reports
export const deepAnalysisReports = pgTable("deep_analysis_reports", {
  id: serial("id").primaryKey(),
  cvId: integer("cv_id").notNull().references(() => cvs.id),
  userId: integer("user_id").notNull().references(() => users.id),
  reportUrl: text("report_url"),
  status: text("status").default("pending").notNull(),
  detailedAnalysis: json("detailed_analysis"),
  industryComparison: json("industry_comparison"),
  regionalRecommendations: json("regional_recommendations"),
  paidAmount: integer("paid_amount"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deepAnalysisReportsRelations = relations(deepAnalysisReports, ({ one }: { one: any }) => ({
  cv: one(cvs, {
    fields: [deepAnalysisReports.cvId],
    references: [cvs.id],
  }),
  user: one(users, {
    fields: [deepAnalysisReports.userId],
    references: [users.id],
  }),
}));

export const insertDeepAnalysisReportSchema = createInsertSchema(deepAnalysisReports).pick({
  cvId: true,
  userId: true,
  reportUrl: true,
  status: true,
  detailedAnalysis: true,
  industryComparison: true,
  regionalRecommendations: true,
  paidAmount: true,
});

// Subscription plans
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(), // stored in cents (ZAR)
  interval: varchar("interval", { length: 20 }).default("month").notNull(), // month, year
  features: text("features").array(),
  isActive: boolean("is_active").default(true).notNull(),
  isPopular: boolean("is_popular").default(false), // Flag for most popular plan
  scanLimit: integer("scan_limit").default(0), // Monthly scan limit (0 = unlimited)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const plansRelations = relations(plans, ({ many }: { many: any }) => ({
  subscriptions: many(subscriptions),
}));

// User subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => plans.id),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  paymentMethod: text("payment_method"),
  scansUsed: integer("scans_used").default(0), // Track how many scans have been used in current period
  templatesUsed: integer("templates_used").default(0), // Track how many template generations have been used
  lastScanReset: timestamp("last_scan_reset"), // Date when the scan count was last reset
  lastTemplateReset: timestamp("last_template_reset"), // Date when the template generation count was last reset
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }: { one: any }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SaProfile = typeof saProfiles.$inferSelect;
export type InsertSaProfile = z.infer<typeof insertSaProfileSchema>;

export type CV = typeof cvs.$inferSelect;
export type InsertCV = z.infer<typeof insertCvSchema>;

export type ATSScore = typeof atsScores.$inferSelect;
export type InsertATSScore = z.infer<typeof insertAtsScoreSchema>;

export type DeepAnalysisReport = typeof deepAnalysisReports.$inferSelect;
export type InsertDeepAnalysisReport = z.infer<typeof insertDeepAnalysisReportSchema>;

export type Plan = typeof plans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;



// Analysis Report - used for responses
export const employers = pgTable("employers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  size: text("size"), // Company size (e.g., "1-10", "11-50")
  location: text("location"), // Primary location (e.g., "gauteng", "western_cape")
  websiteUrl: text("website_url"),
  bbbeeLevel: text("bbbee_level"), // B-BBEE status level
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  logo: text("logo"),
  description: text("description"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const employersRelations = relations(employers, ({ one }) => ({
  user: one(users, {
    fields: [employers.userId],
    references: [users.id],
  }),
}));

export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").references(() => employers.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  employmentType: text("employment_type"), // Full-time, Part-time, Contract, etc.
  experienceLevel: text("experience_level"),
  salaryRange: text("salary_range"),
  requiredSkills: text("required_skills").array(),
  preferredSkills: text("preferred_skills").array(),
  industry: text("industry"),
  deadline: timestamp("deadline"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  employer: one(employers, {
    fields: [jobPostings.employerId],
    references: [employers.id],
  }),
  matches: many(jobMatches),
}));

export const jobMatches = pgTable("job_matches", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobPostings.id).notNull(),
  cvId: integer("cv_id").references(() => cvs.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  matchScore: integer("match_score").notNull(),
  skillsMatched: text("skills_matched").array(),
  isPaid: boolean("is_paid_by_jobseeker").default(false),
  isViewedByEmployer: boolean("is_viewed_by_employer").default(false),
  isEmployerPaid: boolean("is_paid_by_employer").default(false),
  isShortlisted: boolean("is_shortlisted").default(false),
  isRejected: boolean("is_rejected").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobMatchesRelations = relations(jobMatches, ({ one }) => ({
  jobPosting: one(jobPostings, {
    fields: [jobMatches.jobId],
    references: [jobPostings.id],
  }),
  cv: one(cvs, {
    fields: [jobMatches.cvId],
    references: [cvs.id],
  }),
  user: one(users, {
    fields: [jobMatches.userId],
    references: [users.id],
  }),
}));

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  skillId: integer("skill_id").references(() => skills.id).notNull(),
  proficiency: integer("proficiency").notNull(), // 1-10 scale
  yearsExperience: integer("years_experience"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").default("ZAR").notNull(),
  paymentType: text("payment_type").notNull(), // subscription, job-match, feature-post
  status: text("status").notNull(), // pending, completed, failed, refunded
  paymentProvider: text("payment_provider").notNull(), // PayFast, etc.
  transactionId: text("transaction_id"),
  relatedEntityId: integer("related_entity_id"), // ID of job, match, etc.
  relatedEntityType: text("related_entity_type"), // job, match, etc.
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Generated Templates tracking
export const generatedTemplates = pgTable("generated_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'cv', 'cover-letter'
  title: text("title").notNull(),
  content: text("content").notNull(),
  watermarkId: text("watermark_id").notNull(), // Unique watermark identifier
  generatedFor: text("generated_for").notNull(), // The purpose/recipient of the template
  deviceInfo: text("device_info"), // Client device information
  ipAddress: text("ip_address"), // Client IP address for security tracking
  metaData: json("meta_data"), // Additional data about the generated template
  isRevoked: boolean("is_revoked").default(false), // Flag to revoke/invalidate the template
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // job-match, payment, system, etc.
  isRead: boolean("is_read").default(false),
  relatedEntityId: integer("related_entity_id"), 
  relatedEntityType: text("related_entity_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export type AnalysisReport = {
  score: number;
  skillsScore?: number;
  contextScore?: number;
  formatScore?: number;
  jobMatchScore?: number; // Score for job description match
  jobDescKeywords?: string[]; // Keywords extracted from job description
  jobDescMatches?: number; // Number of job keywords found in resume
  strengths: string[];
  improvements: string[];
  issues: string[];
  saKeywordsFound?: string[];
  saContextScore?: number;
  bbbeeDetected?: boolean;
  nqfDetected?: boolean;
  keywordRecommendations?: string[][];
};

export const insertEmployerSchema = createInsertSchema(employers).pick({
  userId: true,
  companyName: true,
  industry: true,
  size: true,
  location: true,
  websiteUrl: true,
  bbbeeLevel: true,
  contactEmail: true,
  contactPhone: true,
  logo: true,
  description: true,
});

export const insertJobPostingSchema = createInsertSchema(jobPostings).pick({
  employerId: true,
  title: true,
  description: true,
  location: true,
  employmentType: true,
  experienceLevel: true,
  salaryRange: true,
  requiredSkills: true,
  preferredSkills: true,
  industry: true,
  deadline: true,
  isFeatured: true,
});

export const insertJobMatchSchema = createInsertSchema(jobMatches).pick({
  jobId: true,
  cvId: true,
  userId: true,
  matchScore: true,
  skillsMatched: true,
});

export const insertSkillSchema = createInsertSchema(skills).pick({
  name: true,
  category: true,
});

export const insertUserSkillSchema = createInsertSchema(userSkills).pick({
  userId: true,
  skillId: true,
  proficiency: true,
  yearsExperience: true,
});

export const insertPaymentSchema = createInsertSchema(payments, {
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  paymentType: z.enum(['subscription', 'job-match', 'feature-post']),
}).pick({
  userId: true,
  amount: true,
  currency: true,
  paymentType: true,
  status: true,
  paymentProvider: true,
  transactionId: true,
  relatedEntityId: true,
  relatedEntityType: true,
  metadata: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  relatedEntityId: true,
  relatedEntityType: true,
});

export type Employer = typeof employers.$inferSelect;
export type InsertEmployer = z.infer<typeof insertEmployerSchema>;

export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;

export type JobMatch = typeof jobMatches.$inferSelect;
export type InsertJobMatch = z.infer<typeof insertJobMatchSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type UserSkill = typeof userSkills.$inferSelect;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// ====================================
// MATCHING SERVICE SCHEMA (Separate Service)
// ====================================

// Recruiter profiles for the matching service
export const recruiterProfiles = pgTable("recruiter_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  companyName: text("company_name").notNull(),
  companySize: text("company_size"), // "1-10", "11-50", "51-200", "201-500", "500+"
  industry: text("industry").notNull(),
  companyDescription: text("company_description"),
  companyWebsite: text("company_website"),
  companyLogo: text("company_logo"),
  location: text("location"),
  province: text("province"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  isVerified: boolean("is_verified").default(false),
  verificationDocuments: json("verification_documents"),
  subscriptionTier: text("subscription_tier").default("basic"), // "basic", "premium", "enterprise"
  creditsRemaining: integer("credits_remaining").default(0),
  totalJobsPosted: integer("total_jobs_posted").default(0),
  successfulHires: integer("successful_hires").default(0),
  averageTimeToHire: integer("average_time_to_hire"), // in days
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Premium job postings for the matching service
export const premiumJobPostings = pgTable("premium_job_postings", {
  id: serial("id").primaryKey(),
  recruiterId: integer("recruiter_id").notNull().references(() => recruiterProfiles.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requiredSkills: json("required_skills").$type<string[]>().default([]),
  preferredSkills: json("preferred_skills").$type<string[]>().default([]),
  industry: text("industry").notNull(),
  employmentType: text("employment_type").notNull(), // "full-time", "part-time", "contract", "internship"
  experienceLevel: text("experience_level").notNull(), // "entry", "mid", "senior", "executive"
  salaryMin: decimal("salary_min"),
  salaryMax: decimal("salary_max"),
  salaryCurrency: text("salary_currency").default("ZAR"),
  location: text("location"),
  province: text("province"),
  isRemote: boolean("is_remote").default(false),
  nqfLevelRequired: integer("nqf_level_required"),
  bbbeeRequirement: text("bbbee_requirement"), // "required", "preferred", "not_specified"
  applicationDeadline: timestamp("application_deadline"),
  maxCandidates: integer("max_candidates").default(100),
  priority: text("priority").default("standard"), // "standard", "urgent", "featured"
  budget: decimal("budget"), // Cost recruiter paid for this posting
  status: text("status").default("active"), // "draft", "active", "paused", "closed", "expired"
  totalViews: integer("total_views").default(0),
  totalMatches: integer("total_matches").default(0),
  totalApplications: integer("total_applications").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job seeker premium profiles for enhanced matching
export const premiumJobSeekerProfiles = pgTable("premium_job_seeker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  cvId: integer("cv_id").references(() => cvs.id),
  profileTitle: text("profile_title"), // Professional headline
  profileSummary: text("profile_summary"),
  desiredSalaryMin: decimal("desired_salary_min"),
  desiredSalaryMax: decimal("desired_salary_max"),
  salaryCurrency: text("salary_currency").default("ZAR"),
  preferredLocations: json("preferred_locations").$type<string[]>().default([]),
  preferredIndustries: json("preferred_industries").$type<string[]>().default([]),
  preferredEmploymentTypes: json("preferred_employment_types").$type<string[]>().default([]),
  experienceLevel: text("experience_level"), // "entry", "mid", "senior", "executive"
  openToRemote: boolean("open_to_remote").default(false),
  openToRelocation: boolean("open_to_relocation").default(false),
  availabilityDate: timestamp("availability_date"),
  noticePeriod: text("notice_period"), // "immediate", "1_week", "2_weeks", "1_month", "2_months", "3_months"
  subscriptionTier: text("subscription_tier").default("basic"), // "basic", "premium", "pro"
  creditsRemaining: integer("credits_remaining").default(0),
  profileVisibility: text("profile_visibility").default("visible"), // "visible", "hidden", "recruiter_only"
  totalProfileViews: integer("total_profile_views").default(0),
  totalMatches: integer("total_matches").default(0),
  totalApplications: integer("total_applications").default(0),
  responseRate: decimal("response_rate"), // Percentage of recruiter messages responded to
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI-powered job matches between recruiters and job seekers
export const premiumJobMatches = pgTable("premium_job_matches", {
  id: serial("id").primaryKey(),
  jobPostingId: integer("job_posting_id").notNull().references(() => premiumJobPostings.id),
  jobSeekerId: integer("job_seeker_id").notNull().references(() => premiumJobSeekerProfiles.id),
  recruiterId: integer("recruiter_id").notNull().references(() => recruiterProfiles.id),
  matchScore: integer("match_score").notNull(), // 0-100 percentage
  matchDetails: json("match_details"), // Detailed breakdown of match factors
  skillsMatched: json("skills_matched").$type<string[]>().default([]),
  skillsGap: json("skills_gap").$type<string[]>().default([]),
  salaryMatch: boolean("salary_match").default(false),
  locationMatch: boolean("location_match").default(false),
  experienceMatch: boolean("experience_match").default(false),
  industryMatch: boolean("industry_match").default(false),
  // Notification and contact status
  recruiterNotified: boolean("recruiter_notified").default(false),
  jobSeekerNotified: boolean("job_seeker_notified").default(false),
  recruiterViewed: boolean("recruiter_viewed").default(false),
  jobSeekerViewed: boolean("job_seeker_viewed").default(false),
  recruiterInterested: boolean("recruiter_interested").default(false),
  jobSeekerInterested: boolean("job_seeker_interested").default(false),
  // Payment and contact unlock status
  recruiterPaidToContact: boolean("recruiter_paid_to_contact").default(false),
  jobSeekerPaidToContact: boolean("job_seeker_paid_to_contact").default(false),
  contactUnlocked: boolean("contact_unlocked").default(false),
  contactUnlockedAt: timestamp("contact_unlocked_at"),
  status: text("status").default("pending"), // "pending", "mutual_interest", "contacted", "applied", "rejected", "hired"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment transactions for the matching service
export const matchingServicePayments = pgTable("matching_service_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  userType: text("user_type").notNull(), // "recruiter", "job_seeker"
  paymentType: text("payment_type").notNull(), // "subscription", "credits", "job_posting", "contact_unlock"
  amount: decimal("amount").notNull(),
  currency: text("currency").default("ZAR"),
  description: text("description").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCustomerId: text("stripe_customer_id"),
  status: text("status").default("pending"), // "pending", "completed", "failed", "refunded"
  creditsGranted: integer("credits_granted").default(0),
  relatedEntityId: integer("related_entity_id"), // Job posting ID, match ID, etc.
  relatedEntityType: text("related_entity_type"), // "job_posting", "match", "subscription"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscription plans for the matching service
export const matchingServicePlans = pgTable("matching_service_plans", {
  id: serial("id").primaryKey(),
  planType: text("plan_type").notNull(), // "recruiter", "job_seeker"
  planName: text("plan_name").notNull(),
  planTier: text("plan_tier").notNull(), // "basic", "premium", "pro", "enterprise"
  monthlyPrice: decimal("monthly_price").notNull(),
  yearlyPrice: decimal("yearly_price"),
  creditsPerMonth: integer("credits_per_month").default(0),
  maxJobPostings: integer("max_job_postings").default(0), // For recruiters
  maxContactsPerMonth: integer("max_contacts_per_month").default(0),
  featuredListings: boolean("featured_listings").default(false),
  prioritySupport: boolean("priority_support").default(false),
  advancedFilters: boolean("advanced_filters").default(false),
  analyticsAccess: boolean("analytics_access").default(false),
  features: json("features").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User subscriptions to matching service plans
export const matchingServiceSubscriptions = pgTable("matching_service_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => matchingServicePlans.id),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  status: text("status").default("active"), // "active", "cancelled", "expired", "past_due"
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  creditsUsed: integer("credits_used").default(0),
  lastBillingDate: timestamp("last_billing_date"),
  nextBillingDate: timestamp("next_billing_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for matching service
export const recruiterProfilesRelations = relations(recruiterProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [recruiterProfiles.userId],
    references: [users.id],
  }),
  jobPostings: many(premiumJobPostings),
  matches: many(premiumJobMatches),
}));

export const premiumJobPostingsRelations = relations(premiumJobPostings, ({ one, many }) => ({
  recruiter: one(recruiterProfiles, {
    fields: [premiumJobPostings.recruiterId],
    references: [recruiterProfiles.id],
  }),
  matches: many(premiumJobMatches),
}));

export const premiumJobSeekerProfilesRelations = relations(premiumJobSeekerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [premiumJobSeekerProfiles.userId],
    references: [users.id],
  }),
  cv: one(cvs, {
    fields: [premiumJobSeekerProfiles.cvId],
    references: [cvs.id],
  }),
  matches: many(premiumJobMatches),
}));

export const premiumJobMatchesRelations = relations(premiumJobMatches, ({ one }) => ({
  jobPosting: one(premiumJobPostings, {
    fields: [premiumJobMatches.jobPostingId],
    references: [premiumJobPostings.id],
  }),
  jobSeeker: one(premiumJobSeekerProfiles, {
    fields: [premiumJobMatches.jobSeekerId],
    references: [premiumJobSeekerProfiles.id],
  }),
  recruiter: one(recruiterProfiles, {
    fields: [premiumJobMatches.recruiterId],
    references: [recruiterProfiles.id],
  }),
}));

// Insert schemas for matching service
export const insertRecruiterProfileSchema = createInsertSchema(recruiterProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPremiumJobPostingSchema = createInsertSchema(premiumJobPostings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPremiumJobSeekerProfileSchema = createInsertSchema(premiumJobSeekerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPremiumJobMatchSchema = createInsertSchema(premiumJobMatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMatchingServicePaymentSchema = createInsertSchema(matchingServicePayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMatchingServicePlanSchema = createInsertSchema(matchingServicePlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMatchingServiceSubscriptionSchema = createInsertSchema(matchingServiceSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for matching service
export type RecruiterProfile = typeof recruiterProfiles.$inferSelect;
export type InsertRecruiterProfile = z.infer<typeof insertRecruiterProfileSchema>;

export type PremiumJobPosting = typeof premiumJobPostings.$inferSelect;
export type InsertPremiumJobPosting = z.infer<typeof insertPremiumJobPostingSchema>;

export type PremiumJobSeekerProfile = typeof premiumJobSeekerProfiles.$inferSelect;
export type InsertPremiumJobSeekerProfile = z.infer<typeof insertPremiumJobSeekerProfileSchema>;

export type PremiumJobMatch = typeof premiumJobMatches.$inferSelect;
export type InsertPremiumJobMatch = z.infer<typeof insertPremiumJobMatchSchema>;

export type MatchingServicePayment = typeof matchingServicePayments.$inferSelect;
export type InsertMatchingServicePayment = z.infer<typeof insertMatchingServicePaymentSchema>;

export type MatchingServicePlan = typeof matchingServicePlans.$inferSelect;
export type InsertMatchingServicePlan = z.infer<typeof insertMatchingServicePlanSchema>;

export type MatchingServiceSubscription = typeof matchingServiceSubscriptions.$inferSelect;
export type InsertMatchingServiceSubscription = z.infer<typeof insertMatchingServiceSubscriptionSchema>;
