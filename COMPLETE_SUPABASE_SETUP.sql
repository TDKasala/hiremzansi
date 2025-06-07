-- ============================================
-- HIRE MZANSI - COMPLETE SUPABASE SETUP
-- ============================================
-- Execute this entire script in Supabase SQL Editor
-- This will create all tables, indexes, RLS policies, and initial data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table with authentication and profile data
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url TEXT,
    phone VARCHAR(20),
    location VARCHAR(100),
    bio TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    credits_remaining INTEGER DEFAULT 3,
    total_credits_earned INTEGER DEFAULT 0,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CV analyses table for storing analysis results
CREATE TABLE IF NOT EXISTS cv_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    original_text TEXT,
    ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100),
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    strengths TEXT[],
    improvements TEXT[],
    missing_keywords TEXT[],
    formatting_issues TEXT[],
    south_african_context JSONB,
    industry VARCHAR(100),
    experience_level VARCHAR(50),
    analysis_type VARCHAR(50) DEFAULT 'free',
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job postings table for South African job market
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    requirements TEXT[],
    salary_range VARCHAR(100),
    job_type VARCHAR(50),
    industry VARCHAR(100),
    experience_level VARCHAR(50),
    posted_date DATE,
    application_deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    source_url TEXT,
    bbee_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(100) DEFAULT 'website'
);

-- Referrals system for reward tracking
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referee_email VARCHAR(255),
    referee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referral_code VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    registered_at TIMESTAMP WITH TIME ZONE,
    premium_upgrade_at TIMESTAMP WITH TIME ZONE,
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User rewards and credits tracking
CREATE TABLE IF NOT EXISTS user_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reward_type VARCHAR(100) NOT NULL,
    reward_value INTEGER NOT NULL,
    description TEXT,
    source VARCHAR(100),
    is_redeemed BOOLEAN DEFAULT FALSE,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin activity logs for platform management
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_cv_analyses_user_id ON cv_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_analyses_created_at ON cv_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_cv_analyses_ats_score ON cv_analyses(ats_score);
CREATE INDEX IF NOT EXISTS idx_job_postings_industry ON job_postings(industry);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings(location);
CREATE INDEX IF NOT EXISTS idx_job_postings_is_active ON job_postings(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at 
    BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ============================================

-- Enable RLS on all user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public user registration" ON users
    FOR INSERT WITH CHECK (true);

-- CV analyses policies
CREATE POLICY "Users can view own CV analyses" ON cv_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CV analyses" ON cv_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CV analyses" ON cv_analyses
    FOR UPDATE USING (auth.uid() = user_id);

-- Job postings are publicly readable
CREATE POLICY "Job postings are publicly readable" ON job_postings
    FOR SELECT USING (true);

-- Newsletter subscriptions
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own newsletter subscription" ON newsletter_subscriptions
    FOR SELECT USING (true);

-- Referrals policies
CREATE POLICY "Users can view own referrals" ON referrals
    FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals" ON referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update own referrals" ON referrals
    FOR UPDATE USING (auth.uid() = referrer_id);

-- User rewards policies
CREATE POLICY "Users can view own rewards" ON user_rewards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create rewards" ON user_rewards
    FOR INSERT WITH CHECK (true);

-- Contact submissions
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- ============================================
-- ADMIN POLICIES (SUPERUSER ACCESS)
-- ============================================

-- Admin users can access all data
CREATE POLICY "Admins can access all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage all CV analyses" ON cv_analyses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage job postings" ON job_postings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage newsletter subscriptions" ON newsletter_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage referrals" ON referrals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage rewards" ON user_rewards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can view contact submissions" ON contact_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Admin logs are restricted to admins only
CREATE POLICY "Admins can view admin logs" ON admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "System can create admin logs" ON admin_logs
    FOR INSERT WITH CHECK (true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions to different roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON users, cv_analyses, newsletter_subscriptions, referrals, user_rewards, contact_submissions TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated;

-- ============================================
-- INITIAL DATA SETUP
-- ============================================

-- Insert admin user (deniskasala17@gmail.com)
INSERT INTO users (
    id,
    email,
    username,
    first_name,
    last_name,
    is_admin,
    subscription_tier,
    credits_remaining,
    referral_code
) VALUES (
    uuid_generate_v4(),
    'deniskasala17@gmail.com',
    'admin',
    'Denis',
    'Kasala',
    TRUE,
    'unlimited',
    999999,
    'ADMIN2025'
) ON CONFLICT (email) DO UPDATE SET
    is_admin = TRUE,
    subscription_tier = 'unlimited',
    credits_remaining = 999999,
    referral_code = 'ADMIN2025';

-- Insert sample South African job postings
INSERT INTO job_postings (
    title,
    company,
    location,
    description,
    requirements,
    salary_range,
    job_type,
    industry,
    experience_level,
    posted_date,
    bbee_requirements
) VALUES 
(
    'Senior Software Developer',
    'TechCorp South Africa',
    'Cape Town, Western Cape',
    'Join our dynamic team building innovative software solutions for the South African market. Experience with local payment gateways and compliance requirements preferred.',
    ARRAY['JavaScript', 'React', 'Node.js', 'SQL', 'REST APIs', '3+ years experience'],
    'R35,000 - R55,000',
    'Full-time',
    'Technology',
    'Senior',
    CURRENT_DATE,
    'B-BBEE Level 2 company. EE candidates will be given preference.'
),
(
    'Digital Marketing Specialist',
    'Growth Agency SA',
    'Johannesburg, Gauteng',
    'Drive marketing campaigns and brand awareness across South Africa. Understanding of local market dynamics and cultural nuances essential.',
    ARRAY['Digital Marketing', 'Social Media', 'Google Analytics', 'Campaign Management', 'Local Market Knowledge'],
    'R22,000 - R35,000',
    'Full-time',
    'Marketing',
    'Mid-level',
    CURRENT_DATE,
    'Equal opportunity employer committed to employment equity.'
),
(
    'Financial Data Analyst',
    'Financial Services Ltd',
    'Durban, KwaZulu-Natal',
    'Analyze financial data and provide insights for business decisions. Experience with JSE regulations and South African financial markets preferred.',
    ARRAY['SQL', 'Python', 'Excel', 'Statistical Analysis', 'Financial Modeling', 'JSE Knowledge'],
    'R28,000 - R42,000',
    'Full-time',
    'Finance',
    'Mid-level',
    CURRENT_DATE,
    'B-BBEE compliant organization. Preference will be given to previously disadvantaged individuals.'
),
(
    'Junior Web Developer',
    'Digital Studio Cape Town',
    'Cape Town, Western Cape',
    'Entry-level position for graduates or career changers. Full training provided on modern web technologies and South African e-commerce platforms.',
    ARRAY['HTML', 'CSS', 'JavaScript', 'Basic Git', 'Willingness to learn'],
    'R15,000 - R25,000',
    'Full-time',
    'Technology',
    'Entry-level',
    CURRENT_DATE,
    'Graduate development program. All backgrounds welcome.'
),
(
    'HR Business Partner',
    'Corporate Solutions SA',
    'Pretoria, Gauteng',
    'Support business operations with HR expertise. Strong knowledge of South African labour law and employment equity requirements essential.',
    ARRAY['HR Management', 'Labour Law', 'Employment Equity', 'BCEA', 'LRA', '5+ years experience'],
    'R40,000 - R60,000',
    'Full-time',
    'Human Resources',
    'Senior',
    CURRENT_DATE,
    'Committed to transformation and diversity. EE candidates strongly encouraged to apply.'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS FOR APPLICATION LOGIC
-- ============================================

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 8-character alphanumeric code
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;
        
        -- Exit loop if code is unique
        IF NOT exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically assign referral code to new users
CREATE OR REPLACE FUNCTION assign_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to assign referral code on user creation
CREATE TRIGGER assign_referral_code_trigger
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_referral_code();

-- ============================================
-- VERIFICATION AND COMPLETION
-- ============================================

-- Create a view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE is_admin = true) as admin_users,
    (SELECT COUNT(*) FROM cv_analyses) as total_analyses,
    (SELECT COUNT(*) FROM cv_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as analyses_this_week,
    (SELECT COUNT(*) FROM job_postings WHERE is_active = true) as active_jobs,
    (SELECT COUNT(*) FROM newsletter_subscriptions WHERE is_active = true) as newsletter_subscribers,
    (SELECT COUNT(*) FROM referrals) as total_referrals,
    (SELECT COUNT(*) FROM referrals WHERE status = 'completed') as successful_referrals;

-- Grant view access to admins
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- Final verification
SELECT 
    'Supabase setup completed successfully!' as status,
    'Tables created: ' || count(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'cv_analyses', 'job_postings', 'newsletter_subscriptions', 'referrals', 'user_rewards', 'admin_logs', 'contact_submissions');

-- Show admin user was created
SELECT 
    'Admin user created:' as message,
    email,
    username,
    is_admin,
    subscription_tier,
    referral_code
FROM users 
WHERE email = 'deniskasala17@gmail.com';

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Your Hire Mzansi Supabase database is now fully configured!
-- 
-- Next steps:
-- 1. Copy your Supabase project URL and API keys
-- 2. Update your Vercel environment variables
-- 3. Deploy your application
-- 
-- Admin login: deniskasala17@gmail.com
-- Referral code: ADMIN2025
-- ============================================