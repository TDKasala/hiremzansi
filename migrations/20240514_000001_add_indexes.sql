-- Migration: Add performance indexes
-- Created at: 2024-05-14T06:47:00.000Z

-- Add indexes to improve query performance

-- Index for CV lookups by user
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs (user_id);

-- Index for ATS scores by CV
CREATE INDEX IF NOT EXISTS idx_ats_scores_cv_id ON ats_scores (cv_id);

-- Index for deep analysis reports by CV
CREATE INDEX IF NOT EXISTS idx_deep_analysis_reports_cv_id ON deep_analysis_reports (cv_id);

-- Index for subscription lookups by user
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);

-- Index for South Africa profile lookups by user
CREATE INDEX IF NOT EXISTS idx_sa_profiles_user_id ON sa_profiles (user_id);

-- Index for user lookups by email (for login/authentication)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Index for user lookups by reset token (for password reset)
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_token) WHERE reset_token IS NOT NULL;