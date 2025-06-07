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
  notifications: many(notifications),
  paymentTransactions: many(paymentTransactions),
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
  userId: integer("user_id").references(() => users.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  content: text("content").notNull(),
  filePath: text("file_path"),
  title: text("title").default("My CV"),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  targetPosition: text("target_position"),
  targetIndustry: text("target_industry"),
  jobDescription: text("job_description"),
  isGuest: boolean("is_guest").default(false),
  uploadMethod: text("upload_method").default("web"),
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

// Notifications system
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  isArchived: boolean("is_archived").default(false),
  priority: text("priority").default("normal").notNull(),
  actionUrl: text("action_url"),
  actionText: text("action_text"),
  relatedEntityId: integer("related_entity_id"),
  relatedEntityType: text("related_entity_type"),
  metadata: json("metadata"),
  expiresAt: timestamp("expires_at"),
  deliveryMethod: text("delivery_method").array().default(['in_app']),
  isDelivered: boolean("is_delivered").default(false),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  title: true,
  message: true,
  priority: true,
  actionUrl: true,
  actionText: true,
  relatedEntityId: true,
  relatedEntityType: true,
  metadata: true,
  expiresAt: true,
  deliveryMethod: true,
});

// Payment transactions
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("ZAR").notNull(),
  paymentType: text("payment_type").notNull(),
  userType: text("user_type").notNull(),
  status: text("status").default("pending").notNull(),
  paymentProvider: text("payment_provider").default("payfast").notNull(),
  transactionId: text("transaction_id").unique(),
  providerTransactionId: text("provider_transaction_id"),
  relatedEntityId: integer("related_entity_id"),
  relatedEntityType: text("related_entity_type"),
  paymentUrl: text("payment_url"),
  returnUrl: text("return_url"),
  cancelUrl: text("cancel_url"),
  notifyUrl: text("notify_url"),
  description: text("description"),
  metadata: json("metadata"),
  failureReason: text("failure_reason"),
  refundReason: text("refund_reason"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  paidAt: timestamp("paid_at"),
  refundedAt: timestamp("refunded_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  user: one(users, {
    fields: [paymentTransactions.userId],
    references: [users.id],
  }),
}));

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).pick({
  userId: true,
  amount: true,
  currency: true,
  paymentType: true,
  userType: true,
  paymentProvider: true,
  relatedEntityId: true,
  relatedEntityType: true,
  description: true,
  metadata: true,
  expiresAt: true,
});

// Premium job matches
export const premiumJobMatches = pgTable("premium_job_matches", {
  id: serial("id").primaryKey(),
  jobSeekerId: integer("job_seeker_id").references(() => users.id).notNull(),
  recruiterId: integer("recruiter_id").references(() => users.id).notNull(),
  jobPostingId: integer("job_posting_id"),
  cvId: integer("cv_id").notNull(),
  matchScore: integer("match_score").notNull(),
  jobSeekerPaymentId: integer("job_seeker_payment_id").references(() => paymentTransactions.id),
  recruiterPaymentId: integer("recruiter_payment_id").references(() => paymentTransactions.id),
  jobSeekerPaid: boolean("job_seeker_paid").default(false),
  recruiterPaid: boolean("recruiter_paid").default(false),
  isActive: boolean("is_active").default(true),
  jobSeekerViewed: boolean("job_seeker_viewed").default(false),
  recruiterViewed: boolean("recruiter_viewed").default(false),
  jobSeekerLastViewedAt: timestamp("job_seeker_last_viewed_at"),
  recruiterLastViewedAt: timestamp("recruiter_last_viewed_at"),
  matchData: json("match_data"),
  communicationEnabled: boolean("communication_enabled").default(false),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const premiumJobMatchesRelations = relations(premiumJobMatches, ({ one }) => ({
  jobSeeker: one(users, {
    fields: [premiumJobMatches.jobSeekerId],
    references: [users.id],
  }),
  recruiter: one(users, {
    fields: [premiumJobMatches.recruiterId],
    references: [users.id],
  }),
  jobSeekerPayment: one(paymentTransactions, {
    fields: [premiumJobMatches.jobSeekerPaymentId],
    references: [paymentTransactions.id],
  }),
  recruiterPayment: one(paymentTransactions, {
    fields: [premiumJobMatches.recruiterPaymentId],
    references: [paymentTransactions.id],
  }),
}));

export const insertPremiumJobMatchSchema = createInsertSchema(premiumJobMatches).pick({
  jobSeekerId: true,
  recruiterId: true,
  jobPostingId: true,
  cvId: true,
  matchScore: true,
  matchData: true,
  expiresAt: true,
});

// Employers schema
export const employers = pgTable("employers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  companySize: text("company_size"),
  website: text("website"),
  description: text("description"),
  location: text("location"),
  province: text("province"),
  city: text("city"),
  logo: text("logo"),
  bbbeeLevel: integer("bbbee_level"),
  bbbeeScore: real("bbbee_score"),
  isVerified: boolean("is_verified").default(false),
  verificationDocuments: text("verification_documents").array(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const employersRelations = relations(employers, ({ one, many }) => ({
  user: one(users, {
    fields: [employers.userId],
    references: [users.id],
  }),
  jobPostings: many(jobPostings),
}));

export const insertEmployerSchema = createInsertSchema(employers).pick({
  userId: true,
  companyName: true,
  industry: true,
  companySize: true,
  website: true,
  description: true,
  location: true,
  province: true,
  city: true,
  logo: true,
  bbbeeLevel: true,
  bbbeeScore: true,
  contactEmail: true,
  contactPhone: true,
});

// Job postings schema
export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").references(() => employers.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  province: text("province"),
  city: text("city"),
  employmentType: text("employment_type"), // Full-time, Part-time, Contract, etc.
  experienceLevel: text("experience_level"),
  salaryRange: text("salary_range"),
  requiredSkills: text("required_skills").array(),
  preferredSkills: text("preferred_skills").array(),
  industry: text("industry"),
  department: text("department"),
  bbbeePreference: boolean("bbbee_preference").default(false),
  nqfRequirement: integer("nqf_requirement"),
  languageRequirements: text("language_requirements").array(),
  deadline: timestamp("deadline"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  isRemote: boolean("is_remote").default(false),
  views: integer("views").default(0),
  applications: integer("applications").default(0),
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

export const insertJobPostingSchema = createInsertSchema(jobPostings).pick({
  employerId: true,
  title: true,
  description: true,
  location: true,
  province: true,
  city: true,
  employmentType: true,
  experienceLevel: true,
  salaryRange: true,
  requiredSkills: true,
  preferredSkills: true,
  industry: true,
  department: true,
  bbbeePreference: true,
  nqfRequirement: true,
  languageRequirements: true,
  deadline: true,
  isRemote: true,
});

// Job matches schema
export const jobMatches = pgTable("job_matches", {
  id: serial("id").primaryKey(),
  cvId: integer("cv_id").references(() => cvs.id).notNull(),
  jobPostingId: integer("job_posting_id").references(() => jobPostings.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  matchScore: integer("match_score").notNull(),
  skillsMatchScore: integer("skills_match_score"),
  experienceMatchScore: integer("experience_match_score"),
  locationMatchScore: integer("location_match_score"),
  saContextScore: integer("sa_context_score"),
  matchedSkills: text("matched_skills").array(),
  missingSkills: text("missing_skills").array(),
  matchReasons: text("match_reasons").array(),
  improvementSuggestions: text("improvement_suggestions").array(),
  isViewed: boolean("is_viewed").default(false),
  isApplied: boolean("is_applied").default(false),
  applicationDate: timestamp("application_date"),
  status: text("status").default("matched"), // matched, applied, rejected, interview, hired
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobMatchesRelations = relations(jobMatches, ({ one }) => ({
  cv: one(cvs, {
    fields: [jobMatches.cvId],
    references: [cvs.id],
  }),
  jobPosting: one(jobPostings, {
    fields: [jobMatches.jobPostingId],
    references: [jobPostings.id],
  }),
  user: one(users, {
    fields: [jobMatches.userId],
    references: [users.id],
  }),
}));

export const insertJobMatchSchema = createInsertSchema(jobMatches).pick({
  cvId: true,
  jobPostingId: true,
  userId: true,
  matchScore: true,
  skillsMatchScore: true,
  experienceMatchScore: true,
  locationMatchScore: true,
  saContextScore: true,
  matchedSkills: true,
  missingSkills: true,
  matchReasons: true,
  improvementSuggestions: true,
  status: true,
  notes: true,
});

// Skills schema
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category"),
  saRelevant: boolean("sa_relevant").default(false),
  industryRelevant: text("industry_relevant").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
}));

export const insertSkillSchema = createInsertSchema(skills).pick({
  name: true,
  category: true,
  saRelevant: true,
  industryRelevant: true,
});

// User skills schema
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  skillId: integer("skill_id").references(() => skills.id).notNull(),
  proficiencyLevel: text("proficiency_level"), // Beginner, Intermediate, Advanced, Expert
  yearsOfExperience: integer("years_of_experience"),
  isEndorsed: boolean("is_endorsed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertUserSkillSchema = createInsertSchema(userSkills).pick({
  userId: true,
  skillId: true,
  proficiencyLevel: true,
  yearsOfExperience: true,
  isEndorsed: true,
});

// ATS Score schema
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
  price: integer("price").notNull(),
  interval: varchar("interval", { length: 20 }).default("month").notNull(),
  features: text("features").array(),
  isActive: boolean("is_active").default(true).notNull(),
  isPopular: boolean("is_popular").default(false),
  scanLimit: integer("scan_limit").default(0),
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
  scansUsed: integer("scans_used").default(0),
  templatesUsed: integer("templates_used").default(0),
  lastScanReset: timestamp("last_scan_reset"),
  lastTemplateReset: timestamp("last_template_reset"),
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

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;

export type PremiumJobMatch = typeof premiumJobMatches.$inferSelect;
export type InsertPremiumJobMatch = z.infer<typeof insertPremiumJobMatchSchema>;

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

// Referral system tables
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  refereeId: integer("referee_id").references(() => users.id),
  referralCode: text("referral_code").notNull().unique(),
  refereeEmail: text("referee_email"),
  status: text("status").default("pending").notNull(), // pending, registered, premium, completed
  registeredAt: timestamp("registered_at"),
  premiumUpgradeAt: timestamp("premium_upgrade_at"),
  rewardEarned: boolean("reward_earned").default(false),
  rewardType: text("reward_type"), // free_analysis, premium_month, template_access
  rewardValue: integer("reward_value"), // monetary value in cents
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
  }),
  referee: one(users, {
    fields: [referrals.refereeId],
    references: [users.id],
  }),
}));

export const insertReferralSchema = createInsertSchema(referrals).pick({
  referrerId: true,
  refereeId: true,
  referralCode: true,
  refereeEmail: true,
  status: true,
  rewardType: true,
  rewardValue: true,
  notes: true,
});

// Referral rewards tracking
export const referralRewards = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  referralId: integer("referral_id").notNull().references(() => referrals.id),
  rewardType: text("reward_type").notNull(), // free_analysis, premium_month, scan_credits
  rewardValue: integer("reward_value"), // number of credits or months
  rewardAmount: integer("reward_amount"), // monetary value in cents
  isRedeemed: boolean("is_redeemed").default(false),
  redeemedAt: timestamp("redeemed_at"),
  expiresAt: timestamp("expires_at"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const referralRewardsRelations = relations(referralRewards, ({ one }) => ({
  user: one(users, {
    fields: [referralRewards.userId],
    references: [users.id],
  }),
  referral: one(referrals, {
    fields: [referralRewards.referralId],
    references: [referrals.id],
  }),
}));

export const insertReferralRewardSchema = createInsertSchema(referralRewards).pick({
  userId: true,
  referralId: true,
  rewardType: true,
  rewardValue: true,
  rewardAmount: true,
  expiresAt: true,
  description: true,
});

// User credits for tracking free analyses, etc.
export const userCredits = pgTable("user_credits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  freeAnalysisCredits: integer("free_analysis_credits").default(0),
  scanCredits: integer("scan_credits").default(0),
  premiumMonths: integer("premium_months").default(0),
  discountCredits: integer("discount_credits").default(0),
  totalEarned: integer("total_earned").default(0),
  totalSpent: integer("total_spent").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userCreditsRelations = relations(userCredits, ({ one }) => ({
  user: one(users, {
    fields: [userCredits.userId],
    references: [users.id],
  }),
}));

export const insertUserCreditsSchema = createInsertSchema(userCredits).pick({
  userId: true,
  freeAnalysisCredits: true,
  scanCredits: true,
  premiumMonths: true,
  discountCredits: true,
  totalEarned: true,
  totalSpent: true,
});

export type AnalysisReport = {
  score: number;
  skillsScore?: number;
  contextScore?: number;
  formatScore?: number;
  jobMatchScore?: number;
  jobDescKeywords?: string[];
  jobDescMatches?: number;
  strengths: string[];
  improvements: string[];
  issues: string[];
  saKeywordsFound?: string[];
  saContextScore?: number;
  bbbeeDetected?: boolean;
  nqfDetected?: boolean;
  keywordRecommendations?: string[][];
};

// Referral system types
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;

export type UserCredits = typeof userCredits.$inferSelect;
export type InsertUserCredits = z.infer<typeof insertUserCreditsSchema>;