-- Fixed RLS Policies for Hire Mzansi
-- Handles UUID to Integer conversion for authentication

-- Create auth mapping table for UUID to integer conversion
CREATE TABLE IF NOT EXISTS auth_users (
    id SERIAL PRIMARY KEY,
    supabase_user_id UUID UNIQUE NOT NULL,
    app_user_id INTEGER UNIQUE REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on auth mapping table
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;

-- Policy for auth mapping
CREATE POLICY "auth_users_own" ON auth_users
FOR ALL USING (auth.uid() = supabase_user_id);

-- Helper function to get app user ID from Supabase auth
CREATE OR REPLACE FUNCTION get_app_user_id()
RETURNS INTEGER AS $$
DECLARE
    app_id INTEGER;
BEGIN
    SELECT app_user_id INTO app_id
    FROM auth_users
    WHERE supabase_user_id = auth.uid();
    
    RETURN app_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM users
    WHERE id = get_app_user_id();
    
    RETURN COALESCE(user_role = 'admin', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_registration" ON users;
DROP POLICY IF EXISTS "sa_profiles_own" ON sa_profiles;
DROP POLICY IF EXISTS "sa_profiles_admin_view" ON sa_profiles;
DROP POLICY IF EXISTS "cvs_own" ON cvs;
DROP POLICY IF EXISTS "cvs_employer_matched" ON cvs;
DROP POLICY IF EXISTS "ats_scores_own" ON ats_scores;
DROP POLICY IF EXISTS "subscriptions_own" ON subscriptions;
DROP POLICY IF EXISTS "notifications_own" ON notifications;
DROP POLICY IF EXISTS "notifications_system_insert" ON notifications;
DROP POLICY IF EXISTS "payments_own_view" ON payment_transactions;
DROP POLICY IF EXISTS "payments_system_insert" ON payment_transactions;
DROP POLICY IF EXISTS "job_postings_public_read" ON job_postings;
DROP POLICY IF EXISTS "job_postings_employer_own" ON job_postings;
DROP POLICY IF EXISTS "employers_own" ON employers;
DROP POLICY IF EXISTS "employers_public_basic" ON employers;
DROP POLICY IF EXISTS "job_matches_seeker_view" ON job_matches;
DROP POLICY IF EXISTS "job_matches_employer_view" ON job_matches;
DROP POLICY IF EXISTS "job_matches_system_insert" ON job_matches;
DROP POLICY IF EXISTS "job_matches_update_status" ON job_matches;
DROP POLICY IF EXISTS "premium_job_matches_seeker_view" ON premium_job_matches;
DROP POLICY IF EXISTS "premium_job_matches_employer_view" ON premium_job_matches;
DROP POLICY IF EXISTS "premium_job_matches_system_insert" ON premium_job_matches;
DROP POLICY IF EXISTS "premium_job_matches_update_status" ON premium_job_matches;
DROP POLICY IF EXISTS "skills_public_read" ON skills;
DROP POLICY IF EXISTS "skills_admin_manage" ON skills;
DROP POLICY IF EXISTS "user_skills_own" ON user_skills;
DROP POLICY IF EXISTS "user_skills_employer_view" ON user_skills;
DROP POLICY IF EXISTS "whatsapp_settings_own" ON whatsapp_settings;
DROP POLICY IF EXISTS "plans_public_read" ON plans;
DROP POLICY IF EXISTS "plans_admin_manage" ON plans;

-- =========================================
-- USERS TABLE POLICIES
-- =========================================

CREATE POLICY "users_select_own" ON users
FOR SELECT USING (
  get_app_user_id() = id OR is_admin()
);

CREATE POLICY "users_update_own" ON users
FOR UPDATE USING (get_app_user_id() = id);

CREATE POLICY "users_insert_public" ON users
FOR INSERT WITH CHECK (true);

-- =========================================
-- SA PROFILES POLICIES
-- =========================================

CREATE POLICY "sa_profiles_own" ON sa_profiles
FOR ALL USING (get_app_user_id() = user_id);

CREATE POLICY "sa_profiles_admin_view" ON sa_profiles
FOR SELECT USING (is_admin());

-- =========================================
-- CVS POLICIES
-- =========================================

CREATE POLICY "cvs_own" ON cvs
FOR ALL USING (
  get_app_user_id() = user_id OR is_admin()
);

CREATE POLICY "cvs_employer_matched" ON cvs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM job_matches jm
    JOIN job_postings jp ON jp.id = jm.job_posting_id
    WHERE jm.cv_id = cvs.id
    AND jp.employer_id = get_app_user_id()
  )
);

-- =========================================
-- ATS SCORES POLICIES
-- =========================================

CREATE POLICY "ats_scores_own" ON ats_scores
FOR ALL USING (
  get_app_user_id() = user_id OR is_admin()
);

-- =========================================
-- SUBSCRIPTIONS POLICIES
-- =========================================

CREATE POLICY "subscriptions_own" ON subscriptions
FOR ALL USING (
  get_app_user_id() = user_id OR is_admin()
);

-- =========================================
-- NOTIFICATIONS POLICIES
-- =========================================

CREATE POLICY "notifications_own" ON notifications
FOR ALL USING (get_app_user_id() = user_id);

CREATE POLICY "notifications_system_insert" ON notifications
FOR INSERT WITH CHECK (true);

-- =========================================
-- PAYMENT TRANSACTIONS POLICIES
-- =========================================

CREATE POLICY "payments_own_view" ON payment_transactions
FOR SELECT USING (
  get_app_user_id() = user_id OR is_admin()
);

CREATE POLICY "payments_system_insert" ON payment_transactions
FOR INSERT WITH CHECK (true);

-- =========================================
-- JOB POSTINGS POLICIES
-- =========================================

CREATE POLICY "job_postings_public_read" ON job_postings
FOR SELECT USING (is_active = true);

CREATE POLICY "job_postings_employer_own" ON job_postings
FOR ALL USING (
  get_app_user_id() = employer_id OR is_admin()
);

-- =========================================
-- EMPLOYERS POLICIES
-- =========================================

CREATE POLICY "employers_own" ON employers
FOR ALL USING (
  get_app_user_id() = user_id OR is_admin()
);

CREATE POLICY "employers_public_basic" ON employers
FOR SELECT USING (
  is_verified = true AND
  EXISTS (
    SELECT 1 FROM job_postings jp
    WHERE jp.employer_id = employers.user_id
    AND jp.is_active = true
  )
);

-- =========================================
-- JOB MATCHES POLICIES (FREE FOR JOB SEEKERS)
-- =========================================

CREATE POLICY "job_matches_seeker_view" ON job_matches
FOR SELECT USING (get_app_user_id() = job_seeker_id);

CREATE POLICY "job_matches_employer_view" ON job_matches
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM job_postings jp
    WHERE jp.id = job_matches.job_posting_id
    AND jp.employer_id = get_app_user_id()
  )
);

CREATE POLICY "job_matches_system_insert" ON job_matches
FOR INSERT WITH CHECK (true);

CREATE POLICY "job_matches_update_status" ON job_matches
FOR UPDATE USING (
  get_app_user_id() = job_seeker_id OR
  EXISTS (
    SELECT 1 FROM job_postings jp
    WHERE jp.id = job_matches.job_posting_id
    AND jp.employer_id = get_app_user_id()
  )
);

-- =========================================
-- PREMIUM JOB MATCHES POLICIES
-- =========================================

CREATE POLICY "premium_job_matches_seeker_view" ON premium_job_matches
FOR SELECT USING (get_app_user_id() = job_seeker_id);

CREATE POLICY "premium_job_matches_employer_view" ON premium_job_matches
FOR SELECT USING (get_app_user_id() = recruiter_id);

CREATE POLICY "premium_job_matches_system_insert" ON premium_job_matches
FOR INSERT WITH CHECK (true);

CREATE POLICY "premium_job_matches_update_status" ON premium_job_matches
FOR UPDATE USING (
  get_app_user_id() = job_seeker_id OR 
  get_app_user_id() = recruiter_id
);

-- =========================================
-- SKILLS POLICIES (PUBLIC READ)
-- =========================================

CREATE POLICY "skills_public_read" ON skills
FOR SELECT USING (is_active = true);

CREATE POLICY "skills_admin_manage" ON skills
FOR ALL USING (is_admin());

-- =========================================
-- USER SKILLS POLICIES
-- =========================================

CREATE POLICY "user_skills_own" ON user_skills
FOR ALL USING (get_app_user_id() = user_id);

CREATE POLICY "user_skills_employer_view" ON user_skills
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM job_matches jm
    JOIN job_postings jp ON jp.id = jm.job_posting_id
    WHERE jm.job_seeker_id = user_skills.user_id
    AND jp.employer_id = get_app_user_id()
  )
);

-- =========================================
-- WHATSAPP SETTINGS POLICIES
-- =========================================

CREATE POLICY "whatsapp_settings_own" ON whatsapp_settings
FOR ALL USING (get_app_user_id() = user_id);

-- =========================================
-- PLANS POLICIES (PUBLIC READ)
-- =========================================

CREATE POLICY "plans_public_read" ON plans
FOR SELECT USING (is_active = true);

CREATE POLICY "plans_admin_manage" ON plans
FOR ALL USING (is_admin());

-- =========================================
-- SIMPLIFIED AUTHENTICATION APPROACH
-- For applications that handle auth externally
-- =========================================

-- Alternative: Disable RLS for development/testing
-- Uncomment these lines if you want to disable RLS temporarily for testing

-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sa_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE cvs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE ats_scores DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE payment_transactions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE job_postings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE employers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE job_matches DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE premium_job_matches DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE skills DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_skills DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE whatsapp_settings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE plans DISABLE ROW LEVEL SECURITY;

-- =========================================
-- GRANT PERMISSIONS
-- =========================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =========================================
-- NOTES FOR PRODUCTION
-- =========================================

/*
For production deployment with external authentication:

1. If using Supabase Auth:
   - Map Supabase user IDs to application user IDs in auth_users table
   - Use get_app_user_id() function in all policies

2. If using external auth (recommended for this app):
   - Consider using service role key for database operations
   - Implement application-level authorization
   - You can disable RLS and handle security in your application layer

3. Current setup with job matching:
   - Job matching is free for all users
   - CV analysis has credit-based restrictions
   - Employers pay to contact matched candidates
*/