import { pgTable, text, serial, integer, boolean, timestamp, varchar, json } from "drizzle-orm/pg-core";
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
  lastLogin: timestamp("last_login"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
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
  userId: integer("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  content: text("content").notNull(),
  title: text("title").default("My CV"),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  targetPosition: text("target_position"),
  targetIndustry: text("target_industry"),
  jobDescription: text("job_description"),
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
  title: true,
  description: true,
  isDefault: true,
  targetPosition: true,
  targetIndustry: true,
  jobDescription: true,
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
  lastScanReset: timestamp("last_scan_reset"), // Date when the scan count was last reset
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
