-- Hire Mzansi Complete Database Schema
-- Based on actual application structure from shared/schema.ts

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    profile_picture TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    verification_token TEXT,
    verification_token_expiry TIMESTAMP,
    last_login TIMESTAMP,
    reset_token TEXT,
    reset_token_expiry TIMESTAMP,
    receive_email_digest BOOLEAN DEFAULT true,
    last_email_digest_sent TIMESTAMP,
    phone_number TEXT,
    phone_verified BOOLEAN DEFAULT false,
    is_temporary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- South African profiles
CREATE TABLE IF NOT EXISTS sa_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
    province TEXT,
    city TEXT,
    bbbee_status TEXT,
    bbbee_level INTEGER,
    nqf_level INTEGER,
    preferred_languages TEXT[],
    industries TEXT[],
    job_types TEXT[],
    whatsapp_enabled BOOLEAN DEFAULT false,
    whatsapp_number TEXT,
    whatsapp_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CVs table
CREATE TABLE IF NOT EXISTS cvs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    content TEXT NOT NULL,
    file_path TEXT,
    title TEXT DEFAULT 'My CV',
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    target_position TEXT,
    target_industry TEXT,
    job_description TEXT,
    is_guest BOOLEAN DEFAULT false,
    upload_method TEXT DEFAULT 'web',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ATS Scores
CREATE TABLE IF NOT EXISTS ats_scores (
    id SERIAL PRIMARY KEY,
    cv_id INTEGER REFERENCES cvs(id),
    user_id INTEGER REFERENCES users(id),
    overall_score INTEGER NOT NULL,
    keyword_score INTEGER,
    format_score INTEGER,
    experience_score INTEGER,
    education_score INTEGER,
    skills_score INTEGER,
    contact_score INTEGER,
    recommendations TEXT[],
    keywords_found TEXT[],
    keywords_missing TEXT[],
    analysis_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    plan_type TEXT NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'normal' NOT NULL,
    action_url TEXT,
    action_text TEXT,
    related_entity_id INTEGER,
    related_entity_type TEXT,
    metadata JSONB,
    expires_at TIMESTAMP,
    delivery_method TEXT[] DEFAULT ARRAY['in_app'],
    is_delivered BOOLEAN DEFAULT false,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'ZAR' NOT NULL,
    payment_type TEXT NOT NULL,
    user_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    payment_provider TEXT DEFAULT 'payfast' NOT NULL,
    transaction_id TEXT UNIQUE,
    provider_transaction_id TEXT,
    related_entity_id INTEGER,
    related_entity_type TEXT,
    payment_url TEXT,
    return_url TEXT,
    cancel_url TEXT,
    notify_url TEXT,
    description TEXT,
    metadata JSONB,
    failure_reason TEXT,
    refund_reason TEXT,
    refund_amount DECIMAL(10,2),
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Job Postings
CREATE TABLE IF NOT EXISTS job_postings (
    id SERIAL PRIMARY KEY,
    employer_id INTEGER REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    employment_type TEXT,
    industry TEXT,
    experience_level TEXT,
    skills_required TEXT[],
    bbbee_requirements TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Employers
CREATE TABLE IF NOT EXISTS employers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    industry TEXT,
    company_size TEXT,
    website TEXT,
    description TEXT,
    location TEXT,
    province TEXT,
    city TEXT,
    logo TEXT,
    bbbee_level INTEGER,
    bbbee_score REAL,
    is_verified BOOLEAN DEFAULT false,
    verification_documents TEXT[],
    contact_email TEXT,
    contact_phone TEXT,
    company_registration TEXT,
    tax_number TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Job Matches (Free for job seekers)
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

-- Premium Job Matches
CREATE TABLE IF NOT EXISTS premium_job_matches (
    id SERIAL PRIMARY KEY,
    job_seeker_id INTEGER REFERENCES users(id) NOT NULL,
    recruiter_id INTEGER REFERENCES users(id) NOT NULL,
    job_posting_id INTEGER,
    cv_id INTEGER NOT NULL,
    match_score INTEGER NOT NULL,
    job_seeker_payment_id INTEGER REFERENCES payment_transactions(id),
    recruiter_payment_id INTEGER REFERENCES payment_transactions(id),
    job_seeker_paid BOOLEAN DEFAULT false,
    recruiter_paid BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    job_seeker_viewed BOOLEAN DEFAULT false,
    recruiter_viewed BOOLEAN DEFAULT false,
    job_seeker_last_viewed_at TIMESTAMP,
    recruiter_last_viewed_at TIMESTAMP,
    match_data JSONB,
    communication_enabled BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Skills
CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    skill_id INTEGER REFERENCES skills(id) NOT NULL,
    proficiency_level TEXT DEFAULT 'intermediate',
    years_experience INTEGER,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- WhatsApp Settings
CREATE TABLE IF NOT EXISTS whatsapp_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL UNIQUE,
    phone_number TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_code TEXT,
    verification_expires_at TIMESTAMP,
    opt_in_job_alerts BOOLEAN DEFAULT true,
    opt_in_cv_analysis BOOLEAN DEFAULT true,
    opt_in_promotions BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Plans (CV optimization pricing)
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle TEXT NOT NULL,
    features JSONB,
    cv_analysis_credits INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default plans with job matching free for all
INSERT INTO plans (name, description, price, billing_cycle, features, cv_analysis_credits) VALUES
('Free Trial', '3 free CV analyses valid for 3 days', 0.00, 'trial', 
 '{"job_matching": "free", "basic_ats": true, "duration_days": 3, "detailed_report": false}', 3),
('Deep Analysis', 'One-time comprehensive CV analysis', 25.00, 'one_time', 
 '{"job_matching": "free", "detailed_report": true, "bbbee_optimization": true, "lifetime_access": true}', 1),
('Monthly Premium', '50 CV analyses per month', 100.00, 'monthly', 
 '{"job_matching": "free", "detailed_report": true, "real_time_editor": true, "priority_support": true}', 50),
('Yearly Premium', '50 analyses per month with 10% discount', 1080.00, 'yearly', 
 '{"job_matching": "free", "detailed_report": true, "real_time_editor": true, "priority_support": true, "discount": "10%"}', 50);

-- Insert common skills
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Programming'),
('Python', 'Programming'),
('SQL', 'Database'),
('Project Management', 'Management'),
('Marketing', 'Business'),
('Accounting', 'Finance'),
('Customer Service', 'Support'),
('Sales', 'Business'),
('Data Analysis', 'Analytics'),
('Communication', 'Soft Skills');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sa_profiles_user_id ON sa_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_ats_scores_cv_id ON ats_scores(cv_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_employer_active ON job_postings(employer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_job_matches_seeker ON job_matches(job_seeker_id);
CREATE INDEX IF NOT EXISTS idx_premium_job_matches_seeker ON premium_job_matches(job_seeker_id);
CREATE INDEX IF NOT EXISTS idx_premium_job_matches_recruiter ON premium_job_matches(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_employers_user_id ON employers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_settings_user_id ON whatsapp_settings(user_id);