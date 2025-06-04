-- Hire Mzansi Final Database Setup
-- Corrected version without problematic columns

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- CVs table
CREATE TABLE IF NOT EXISTS cvs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
    cv_id INTEGER REFERENCES cvs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    keyword_score INTEGER CHECK (keyword_score >= 0 AND keyword_score <= 100),
    format_score INTEGER CHECK (format_score >= 0 AND format_score <= 100),
    experience_score INTEGER CHECK (experience_score >= 0 AND experience_score <= 100),
    education_score INTEGER CHECK (education_score >= 0 AND education_score <= 100),
    skills_score INTEGER CHECK (skills_score >= 0 AND skills_score <= 100),
    contact_score INTEGER CHECK (contact_score >= 0 AND contact_score <= 100),
    recommendations TEXT[],
    keywords_found TEXT[],
    keywords_missing TEXT[],
    analysis_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Plans table (corrected)
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('trial', 'one_time', 'monthly', 'yearly')),
    features JSONB DEFAULT '{}',
    cv_analysis_credits INTEGER DEFAULT 0 CHECK (cv_analysis_credits >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES plans(id),
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    cv_credits_remaining INTEGER DEFAULT 0 CHECK (cv_credits_remaining >= 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Employers
CREATE TABLE IF NOT EXISTS employers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT,
    company_size TEXT,
    website TEXT,
    description TEXT,
    location TEXT,
    province TEXT,
    city TEXT,
    logo TEXT,
    bbbee_level INTEGER CHECK (bbbee_level >= 1 AND bbbee_level <= 8),
    bbbee_score REAL CHECK (bbbee_score >= 0 AND bbbee_score <= 100),
    is_verified BOOLEAN DEFAULT false,
    verification_documents TEXT[],
    contact_email TEXT,
    contact_phone TEXT,
    company_registration TEXT,
    tax_number TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Job postings
CREATE TABLE IF NOT EXISTS job_postings (
    id SERIAL PRIMARY KEY,
    employer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location TEXT,
    salary_min INTEGER CHECK (salary_min >= 0),
    salary_max INTEGER CHECK (salary_max >= salary_min),
    employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'temporary', 'internship')),
    industry TEXT,
    experience_level TEXT,
    skills_required TEXT[],
    bbbee_requirements TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Job matches (FREE for job seekers)
CREATE TABLE IF NOT EXISTS job_matches (
    id SERIAL PRIMARY KEY,
    job_seeker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_posting_id INTEGER REFERENCES job_postings(id) ON DELETE CASCADE,
    cv_id INTEGER REFERENCES cvs(id) ON DELETE CASCADE,
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    match_data JSONB DEFAULT '{}',
    is_viewed BOOLEAN DEFAULT false,
    job_seeker_interested BOOLEAN,
    employer_interested BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(job_seeker_id, job_posting_id, cv_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    action_url TEXT,
    action_text TEXT,
    related_entity_id INTEGER,
    related_entity_type TEXT,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP,
    delivery_method TEXT[] DEFAULT ARRAY['in_app'],
    is_delivered BOOLEAN DEFAULT false,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'ZAR' NOT NULL,
    payment_type TEXT NOT NULL,
    user_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    payment_provider TEXT DEFAULT 'stripe',
    transaction_id TEXT UNIQUE,
    provider_transaction_id TEXT,
    related_entity_id INTEGER,
    related_entity_type TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    failure_reason TEXT,
    refund_reason TEXT,
    refund_amount DECIMAL(10,2) CHECK (refund_amount >= 0),
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User skills
CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level TEXT DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER CHECK (years_experience >= 0),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- WhatsApp settings
CREATE TABLE IF NOT EXISTS whatsapp_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    phone_number TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_code TEXT,
    verification_expires_at TIMESTAMP,
    opt_in_job_alerts BOOLEAN DEFAULT true,
    opt_in_cv_analysis BOOLEAN DEFAULT true,
    opt_in_promotions BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Insert default plans (corrected INSERT)
INSERT INTO plans (name, description, price, billing_cycle, features, cv_analysis_credits) VALUES
('Free Trial', '3 free CV analyses valid for 3 days', 0.00, 'trial', 
 '{"job_matching": "free", "basic_ats": true, "duration_days": 3, "detailed_report": false}', 3),
('Deep Analysis', 'One-time comprehensive CV analysis', 25.00, 'one_time', 
 '{"job_matching": "free", "detailed_report": true, "bbbee_optimization": true, "lifetime_access": true}', 1),
('Monthly Premium', '50 CV analyses per month', 100.00, 'monthly', 
 '{"job_matching": "free", "detailed_report": true, "real_time_editor": true, "priority_support": true}', 50),
('Yearly Premium', '50 analyses per month with 10% discount', 1080.00, 'yearly', 
 '{"job_matching": "free", "detailed_report": true, "real_time_editor": true, "priority_support": true, "discount": "10%"}', 50)
ON CONFLICT (name) DO NOTHING;

-- Insert default skills
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Programming'),
('Python', 'Programming'),
('Java', 'Programming'),
('C#', 'Programming'),
('PHP', 'Programming'),
('SQL', 'Database'),
('MySQL', 'Database'),
('PostgreSQL', 'Database'),
('Project Management', 'Management'),
('Team Leadership', 'Management'),
('Marketing', 'Business'),
('Digital Marketing', 'Business'),
('Sales', 'Business'),
('Customer Service', 'Support'),
('Accounting', 'Finance'),
('Financial Analysis', 'Finance'),
('Data Analysis', 'Analytics'),
('Business Intelligence', 'Analytics'),
('Communication', 'Soft Skills'),
('Problem Solving', 'Soft Skills')
ON CONFLICT (name) DO NOTHING;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sa_profiles_user_id ON sa_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_active ON cvs(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_ats_scores_cv_id ON ats_scores(cv_id);
CREATE INDEX IF NOT EXISTS idx_ats_scores_user_score ON ats_scores(user_id, overall_score);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_job_postings_active ON job_postings(is_active, created_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_job_postings_employer ON job_postings(employer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings(location) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_job_matches_seeker ON job_matches(job_seeker_id, created_at);
CREATE INDEX IF NOT EXISTS idx_job_matches_posting ON job_matches(job_posting_id, match_score);
CREATE INDEX IF NOT EXISTS idx_job_matches_score ON job_matches(match_score) WHERE match_score >= 70;
CREATE INDEX IF NOT EXISTS idx_employers_user_id ON employers(user_id);
CREATE INDEX IF NOT EXISTS idx_employers_verified ON employers(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_settings_user_id ON whatsapp_settings(user_id);

-- Disable RLS for application-level security
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE sa_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cvs DISABLE ROW LEVEL SECURITY;
ALTER TABLE ats_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings DISABLE ROW LEVEL SECURITY;
ALTER TABLE employers DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;

-- Helper function to get user's available CV credits
CREATE OR REPLACE FUNCTION get_user_cv_credits(user_id_param INTEGER)
RETURNS TABLE(total_credits INTEGER, trial_used INTEGER, subscription_credits INTEGER) AS $$
DECLARE
    trial_count INTEGER := 0;
    sub_credits INTEGER := 0;
BEGIN
    -- Count trial usage (3 free for 3 days)
    SELECT COUNT(*) INTO trial_count
    FROM ats_scores
    WHERE user_id = user_id_param
    AND created_at > (NOW() - INTERVAL '3 days');
    
    -- Get subscription credits
    SELECT COALESCE(SUM(cv_credits_remaining), 0) INTO sub_credits
    FROM subscriptions
    WHERE user_id = user_id_param
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW());
    
    -- Calculate available trial credits
    trial_count := GREATEST(0, 3 - trial_count);
    
    RETURN QUERY SELECT 
        (trial_count + sub_credits) as total_credits,
        (3 - trial_count) as trial_used,
        sub_credits as subscription_credits;
END;
$$ LANGUAGE plpgsql;

-- Function to consume CV credit
CREATE OR REPLACE FUNCTION consume_cv_credit(user_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    trial_count INTEGER := 0;
    subscription_id INTEGER;
BEGIN
    -- Check trial credits first
    SELECT COUNT(*) INTO trial_count
    FROM ats_scores
    WHERE user_id = user_id_param
    AND created_at > (NOW() - INTERVAL '3 days');
    
    IF trial_count < 3 THEN
        RETURN TRUE; -- Trial credit available
    END IF;
    
    -- Use subscription credit
    SELECT id INTO subscription_id
    FROM subscriptions
    WHERE user_id = user_id_param
    AND status = 'active'
    AND cv_credits_remaining > 0
    AND (current_period_end IS NULL OR current_period_end > NOW())
    ORDER BY current_period_end ASC NULLS LAST
    LIMIT 1;
    
    IF subscription_id IS NOT NULL THEN
        UPDATE subscriptions
        SET cv_credits_remaining = cv_credits_remaining - 1,
            updated_at = NOW()
        WHERE id = subscription_id;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE; -- No credits available
END;
$$ LANGUAGE plpgsql;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER sa_profiles_updated_at_trigger
    BEFORE UPDATE ON sa_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER cvs_updated_at_trigger
    BEFORE UPDATE ON cvs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER subscriptions_updated_at_trigger
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER notifications_updated_at_trigger
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER payment_transactions_updated_at_trigger
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER job_postings_updated_at_trigger
    BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER employers_updated_at_trigger
    BEFORE UPDATE ON employers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER whatsapp_settings_updated_at_trigger
    BEFORE UPDATE ON whatsapp_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();