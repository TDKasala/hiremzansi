-- ============================================
-- FINAL SUPABASE SETUP - SECURITY COMPLIANT
-- ============================================
-- Complete database setup without SECURITY DEFINER issues

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table
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

-- CV analyses table
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

-- Job postings table
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

-- Referrals system
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

-- User rewards
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

-- Admin logs
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

-- Contact submissions
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

-- Dashboard cache table (replaces problematic view)
CREATE TABLE IF NOT EXISTS dashboard_stats (
    id SERIAL PRIMARY KEY,
    total_users INTEGER,
    admin_users INTEGER,
    total_analyses INTEGER,
    analyses_this_week INTEGER,
    active_jobs INTEGER,
    newsletter_subscribers INTEGER,
    total_referrals INTEGER,
    successful_referrals INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_cv_analyses_user_id ON cv_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_analyses_created_at ON cv_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_job_postings_industry ON job_postings(industry);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings(location);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Users policies
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_public" ON users FOR INSERT WITH CHECK (true);

-- CV analyses policies
CREATE POLICY "cv_analyses_select_own" ON cv_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cv_analyses_insert_own" ON cv_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cv_analyses_update_own" ON cv_analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cv_analyses_delete_own" ON cv_analyses FOR DELETE USING (auth.uid() = user_id);

-- Job postings (public read)
CREATE POLICY "job_postings_select_public" ON job_postings FOR SELECT USING (true);

-- Newsletter policies
CREATE POLICY "newsletter_insert_public" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "newsletter_select_public" ON newsletter_subscriptions FOR SELECT USING (true);
CREATE POLICY "newsletter_update_public" ON newsletter_subscriptions FOR UPDATE USING (true);

-- Referrals policies
CREATE POLICY "referrals_select_own" ON referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "referrals_insert_own" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "referrals_update_own" ON referrals FOR UPDATE USING (auth.uid() = referrer_id);

-- User rewards policies
CREATE POLICY "user_rewards_select_own" ON user_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_rewards_update_own" ON user_rewards FOR UPDATE USING (auth.uid() = user_id);

-- Contact submissions
CREATE POLICY "contact_submissions_insert_public" ON contact_submissions FOR INSERT WITH CHECK (true);

-- Dashboard stats (admin only)
CREATE POLICY "dashboard_stats_admin_only" ON dashboard_stats
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

-- Admin policies (full access)
CREATE POLICY "admin_users_all" ON users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "admin_cv_analyses_all" ON cv_analyses
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "admin_job_postings_all" ON job_postings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "admin_newsletter_all" ON newsletter_subscriptions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "admin_referrals_all" ON referrals
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "admin_user_rewards_all" ON user_rewards
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "admin_contact_submissions_all" ON contact_submissions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "admin_logs_select_admin" ON admin_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

-- Service role policies
CREATE POLICY "service_user_rewards_insert" ON user_rewards
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_admin_logs_insert" ON admin_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_referrals_update" ON referrals
    FOR UPDATE USING (auth.role() = 'service_role');

-- ============================================
-- SECURE FUNCTIONS (NO SECURITY DEFINER)
-- ============================================

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    -- Check admin permission
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;
    
    -- Clear old data
    DELETE FROM dashboard_stats;
    
    -- Insert fresh stats
    INSERT INTO dashboard_stats (
        total_users, admin_users, total_analyses, analyses_this_week,
        active_jobs, newsletter_subscribers, total_referrals, successful_referrals
    ) VALUES (
        (SELECT COUNT(*) FROM users),
        (SELECT COUNT(*) FROM users WHERE is_admin = true),
        (SELECT COUNT(*) FROM cv_analyses),
        (SELECT COUNT(*) FROM cv_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
        (SELECT COUNT(*) FROM job_postings WHERE is_active = true),
        (SELECT COUNT(*) FROM newsletter_subscriptions WHERE is_active = true),
        (SELECT COUNT(*) FROM referrals),
        (SELECT COUNT(*) FROM referrals WHERE status = 'completed')
    );
END;
$$;

-- Function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Check admin permission
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true) THEN
        RETURN NULL;
    END IF;
    
    -- Get stats from table
    SELECT row_to_json(d) INTO result
    FROM dashboard_stats d
    ORDER BY last_updated DESC
    LIMIT 1;
    
    -- If no cached data, refresh and return
    IF result IS NULL THEN
        PERFORM refresh_dashboard_stats();
        SELECT row_to_json(d) INTO result
        FROM dashboard_stats d
        ORDER BY last_updated DESC
        LIMIT 1;
    END IF;
    
    RETURN result;
END;
$$;

-- Newsletter subscription function
CREATE OR REPLACE FUNCTION subscribe_newsletter(p_email VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    INSERT INTO newsletter_subscriptions (email, is_active, source)
    VALUES (p_email, TRUE, 'website')
    ON CONFLICT (email) DO UPDATE SET is_active = TRUE;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON users, cv_analyses, newsletter_subscriptions, referrals, user_rewards, contact_submissions TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Admin user
INSERT INTO users (
    email, username, first_name, last_name, is_admin,
    subscription_tier, credits_remaining, referral_code
) VALUES (
    'deniskasala17@gmail.com', 'admin', 'Denis', 'Kasala', TRUE,
    'unlimited', 999999, 'ADMIN2025'
) ON CONFLICT (email) DO UPDATE SET
    is_admin = TRUE, subscription_tier = 'unlimited',
    credits_remaining = 999999, referral_code = 'ADMIN2025';

-- Sample jobs
INSERT INTO job_postings (
    title, company, location, description, requirements,
    salary_range, job_type, industry, experience_level, posted_date
) VALUES 
(
    'Software Developer', 'TechCorp SA', 'Cape Town, Western Cape',
    'Build innovative solutions for South African market',
    ARRAY['JavaScript', 'React', 'Node.js', 'SQL'],
    'R25,000 - R40,000', 'Full-time', 'Technology', 'Mid-level', CURRENT_DATE
),
(
    'Marketing Specialist', 'Growth Agency', 'Johannesburg, Gauteng',
    'Drive marketing campaigns across South Africa',
    ARRAY['Digital Marketing', 'Social Media', 'Analytics'],
    'R18,000 - R30,000', 'Full-time', 'Marketing', 'Entry-level', CURRENT_DATE
)
ON CONFLICT DO NOTHING;

-- Initial dashboard stats
INSERT INTO dashboard_stats (
    total_users, admin_users, total_analyses, analyses_this_week,
    active_jobs, newsletter_subscribers, total_referrals, successful_referrals
) VALUES (1, 1, 0, 0, 2, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Database setup completed successfully!' as status;
SELECT 'Admin user: deniskasala17@gmail.com' as admin_info;
SELECT 'Referral code: ADMIN2025' as referral_info;