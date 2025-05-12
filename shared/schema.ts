import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});

// CV schema
export const cvs = pgTable("cvs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCvSchema = createInsertSchema(cvs).pick({
  userId: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  content: true,
});

// ATS Score schema
export const atsScores = pgTable("ats_scores", {
  id: serial("id").primaryKey(),
  cvId: integer("cv_id").notNull().references(() => cvs.id),
  score: integer("score").notNull(),
  strengths: text("strengths").array(),
  improvements: text("improvements").array(),
  issues: text("issues").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAtsScoreSchema = createInsertSchema(atsScores).pick({
  cvId: true,
  score: true,
  strengths: true,
  improvements: true,
  issues: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CV = typeof cvs.$inferSelect;
export type InsertCV = z.infer<typeof insertCvSchema>;

export type ATSScore = typeof atsScores.$inferSelect;
export type InsertATSScore = z.infer<typeof insertAtsScoreSchema>;

// Analysis Report - used for responses
export type AnalysisReport = {
  score: number;
  strengths: string[];
  improvements: string[];
  issues: string[];
};
