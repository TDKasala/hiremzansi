-- Hire Mzansi Database Setup
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User profiles for South African context
CREATE TABLE IF NOT EXISTS sa_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    id_number VARCHAR(13),
    race VARCHAR(50),
    gender VARCHAR(20),
    disability_status BOOLEAN DEFAULT false,
    citizenship VARCHAR(50),
    languages TEXT[],
    education_level VARCHAR(100),
    nqf_level INTEGER,
    work_experience_years INTEGER,
    current_employment_status VARCHAR(100),
    salary_expectation_min INTEGER,
    salary_expectation_max INTEGER,
    preferred_locations TEXT[],
    preferred_industries TEXT[],
    bbbee_status VARCHAR(50),
    bbbee_certificate_url TEXT,
    verified_bbbee BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CV storage and analysis
CREATE TABLE IF NOT EXISTS cvs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    original_text TEXT,
    file_size INTEGER,
    mime_type VARCHAR(100),
    ats_score INTEGER,
    analysis_data JSONB,
    keywords TEXT[],
    skills TEXT[],
    experience_years INTEGER,
    education_level VARCHAR(100),
    is_analyzed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    features JSONB,
    cv_analysis_credits INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES plans(id),
    status VARCHAR(50) DEFAULT 'active',
    cv_credits_remaining INTEGER DEFAULT 0,
    starts_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Job postings
CREATE TABLE IF NOT EXISTS job_postings (
    id SERIAL PRIMARY KEY,
    employer_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location VARCHAR(255),
    salary_min INTEGER,
    salary_max INTEGER,
    employment_type VARCHAR(50),
    industry VARCHAR(100),
    experience_level VARCHAR(50),
    skills_required TEXT[],
    bbbee_requirements TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Job matches
CREATE TABLE IF NOT EXISTS job_matches (
    id SERIAL PRIMARY KEY,
    job_seeker_id INTEGER REFERENCES users(id),
    job_posting_id INTEGER REFERENCES job_postings(id),
    cv_id INTEGER REFERENCES cvs(id),
    match_score INTEGER NOT NULL,
    match_data JSONB,
    is_viewed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default plans
INSERT INTO plans (name, description, price, billing_cycle, features, cv_analysis_credits) VALUES
('Free Trial', '3 free CV analyses valid for 3 days', 0.00, 'trial', '{"job_matching": true, "basic_ats": true, "duration_days": 3}', 3),
('Deep Analysis', 'One-time comprehensive CV analysis', 25.00, 'one_time', '{"job_matching": true, "detailed_report": true, "bbbee_optimization": true, "lifetime_access": true}', 1),
('Monthly Premium', '50 CV analyses per month', 100.00, 'monthly', '{"job_matching": true, "detailed_report": true, "real_time_editor": true, "priority_support": true}', 50),
('Yearly Premium', '50 analyses per month with 10% discount', 1080.00, 'yearly', '{"job_matching": true, "detailed_report": true, "real_time_editor": true, "priority_support": true, "discount": "10%"}', 50);

-- Create admin user (update email and username as needed)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'deniskasala17@gmail.com', '$2b$10$placeholder_hash', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view/edit their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- SA Profiles
CREATE POLICY "Users can view own sa_profile" ON sa_profiles FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own sa_profile" ON sa_profiles FOR ALL USING (auth.uid()::text = user_id::text);

-- CVs
CREATE POLICY "Users can view own cvs" ON cvs FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own cvs" ON cvs FOR ALL USING (auth.uid()::text = user_id::text);

-- Job postings are public for viewing
CREATE POLICY "Job postings are viewable by everyone" ON job_postings FOR SELECT USING (is_active = true);
CREATE POLICY "Employers can manage own job postings" ON job_postings FOR ALL USING (auth.uid()::text = employer_id::text);

-- Subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid()::text = user_id::text);

-- Job matches
CREATE POLICY "Users can view own job matches" ON job_matches FOR SELECT USING (auth.uid()::text = job_seeker_id::text);