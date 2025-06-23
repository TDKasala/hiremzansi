-- Initial schema migration for Hire Mzansi platform
-- Creates all essential tables for the CV optimization and job matching platform

-- Create users table with South African specific fields
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  province VARCHAR(100),
  city VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(20),
  race VARCHAR(50),
  disability_status VARCHAR(100),
  bbbee_status VARCHAR(100),
  nqf_level INTEGER,
  years_experience INTEGER DEFAULT 0,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  whatsapp_verified BOOLEAN DEFAULT false,
  whatsapp_number VARCHAR(20),
  newsletter_subscribed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  interval VARCHAR(50) DEFAULT 'month',
  features TEXT[],
  scan_limit INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES plans(id),
  status VARCHAR(50) DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ends_at TIMESTAMP,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create CVs table
CREATE TABLE IF NOT EXISTS cvs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  original_filename VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ATS scores table
CREATE TABLE IF NOT EXISTS ats_scores (
  id SERIAL PRIMARY KEY,
  cv_id INTEGER REFERENCES cvs(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  feedback JSONB,
  recommendations TEXT[],
  keywords_found TEXT[],
  keywords_missing TEXT[],
  format_score INTEGER,
  content_score INTEGER,
  skills_score INTEGER,
  experience_score INTEGER,
  education_score INTEGER,
  south_african_context JSONB,
  bbbee_analysis JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create employers table
CREATE TABLE IF NOT EXISTS employers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  company_size VARCHAR(100),
  location VARCHAR(255),
  website VARCHAR(255),
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create job postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER REFERENCES employers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  required_skills TEXT[],
  preferred_skills TEXT[],
  location VARCHAR(255),
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  employment_type VARCHAR(100),
  experience_level VARCHAR(100),
  education_level VARCHAR(100),
  industry VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create job matches table
CREATE TABLE IF NOT EXISTS job_matches (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES job_postings(id) ON DELETE CASCADE,
  cv_id INTEGER REFERENCES cvs(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  match_score DECIMAL(5,2) NOT NULL,
  skills_match JSONB,
  experience_match JSONB,
  salary_compatibility JSONB,
  location_match JSONB,
  overall_analysis TEXT,
  is_viewed BOOLEAN DEFAULT false,
  is_contacted BOOLEAN DEFAULT false,
  contacted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user skills junction table
CREATE TABLE IF NOT EXISTS user_skills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(50),
  years_of_experience INTEGER DEFAULT 0,
  is_endorsed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, skill_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  referee_email VARCHAR(255) NOT NULL,
  referee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create referral rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  referral_id INTEGER REFERENCES referrals(id) ON DELETE CASCADE,
  reward_type VARCHAR(100) NOT NULL,
  reward_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_redeemed BOOLEAN DEFAULT false,
  redeemed_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  free_analysis_credits INTEGER DEFAULT 0,
  scan_credits INTEGER DEFAULT 0,
  professional_month_credits INTEGER DEFAULT 0,
  discount_credits DECIMAL(10,2) DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_created_at ON cvs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ats_scores_cv_id ON ats_scores(cv_id);
CREATE INDEX IF NOT EXISTS idx_ats_scores_score ON ats_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_job_postings_employer_id ON job_postings(employer_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_score ON job_matches(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);

-- Add session table primary key
ALTER TABLE sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;