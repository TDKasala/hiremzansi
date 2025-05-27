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