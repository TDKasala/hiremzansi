-- ============================================
-- SUPABASE RLS POLICIES FOR HIRE MZANSI
-- ============================================
-- Execute this script after creating your tables to set up security

-- Enable RLS on all tables that need user-level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users
    FOR SELECT 
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
    FOR UPDATE 
    USING (auth.uid() = id);

-- Allow user registration (public insert)
CREATE POLICY "users_insert_public" ON users
    FOR INSERT 
    WITH CHECK (true);

-- ============================================
-- CV ANALYSES POLICIES
-- ============================================

-- Users can view their own CV analyses
CREATE POLICY "cv_analyses_select_own" ON cv_analyses
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can create their own CV analyses
CREATE POLICY "cv_analyses_insert_own" ON cv_analyses
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own CV analyses
CREATE POLICY "cv_analyses_update_own" ON cv_analyses
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Users can delete their own CV analyses
CREATE POLICY "cv_analyses_delete_own" ON cv_analyses
    FOR DELETE 
    USING (auth.uid() = user_id);

-- ============================================
-- JOB POSTINGS POLICIES (PUBLIC READ)
-- ============================================

-- Job postings are publicly readable (no auth required)
CREATE POLICY "job_postings_select_public" ON job_postings
    FOR SELECT 
    USING (true);

-- ============================================
-- NEWSLETTER SUBSCRIPTIONS POLICIES
-- ============================================

-- Anyone can subscribe to newsletter
CREATE POLICY "newsletter_insert_public" ON newsletter_subscriptions
    FOR INSERT 
    WITH CHECK (true);

-- Users can view all newsletter subscriptions (for unsubscribe links)
CREATE POLICY "newsletter_select_public" ON newsletter_subscriptions
    FOR SELECT 
    USING (true);

-- Users can update newsletter subscriptions (for unsubscribe)
CREATE POLICY "newsletter_update_public" ON newsletter_subscriptions
    FOR UPDATE 
    USING (true);

-- ============================================
-- REFERRALS POLICIES
-- ============================================

-- Users can view referrals they created
CREATE POLICY "referrals_select_own" ON referrals
    FOR SELECT 
    USING (auth.uid() = referrer_id);

-- Users can create referrals
CREATE POLICY "referrals_insert_own" ON referrals
    FOR INSERT 
    WITH CHECK (auth.uid() = referrer_id);

-- Users can update their own referrals
CREATE POLICY "referrals_update_own" ON referrals
    FOR UPDATE 
    USING (auth.uid() = referrer_id);

-- System can update referrals (for status changes)
CREATE POLICY "referrals_system_update" ON referrals
    FOR UPDATE 
    USING (true);

-- ============================================
-- USER REWARDS POLICIES
-- ============================================

-- Users can view their own rewards
CREATE POLICY "user_rewards_select_own" ON user_rewards
    FOR SELECT 
    USING (auth.uid() = user_id);

-- System can create rewards for users
CREATE POLICY "user_rewards_insert_system" ON user_rewards
    FOR INSERT 
    WITH CHECK (true);

-- Users can update their own rewards (for redemption)
CREATE POLICY "user_rewards_update_own" ON user_rewards
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- ============================================
-- CONTACT SUBMISSIONS POLICIES
-- ============================================

-- Anyone can submit contact forms
CREATE POLICY "contact_submissions_insert_public" ON contact_submissions
    FOR INSERT 
    WITH CHECK (true);

-- ============================================
-- ADMIN POLICIES (SUPERUSER ACCESS)
-- ============================================

-- Admins can access all user data
CREATE POLICY "admin_users_all" ON users
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Admins can manage all CV analyses
CREATE POLICY "admin_cv_analyses_all" ON cv_analyses
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Admins can manage job postings
CREATE POLICY "admin_job_postings_all" ON job_postings
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Admins can view all newsletter subscriptions
CREATE POLICY "admin_newsletter_all" ON newsletter_subscriptions
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Admins can manage all referrals
CREATE POLICY "admin_referrals_all" ON referrals
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Admins can manage all user rewards
CREATE POLICY "admin_user_rewards_all" ON user_rewards
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Admins can view all contact submissions
CREATE POLICY "admin_contact_submissions_all" ON contact_submissions
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- ============================================
-- ADMIN LOGS POLICIES (RESTRICTED)
-- ============================================

-- Only admins can view admin logs
CREATE POLICY "admin_logs_select_admin" ON admin_logs
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- System can create admin logs
CREATE POLICY "admin_logs_insert_system" ON admin_logs
    FOR INSERT 
    WITH CHECK (true);

-- ============================================
-- SERVICE ROLE POLICIES (BYPASS RLS)
-- ============================================

-- Allow service_role to bypass RLS for system operations
-- This is automatically handled by Supabase for service_role

-- ============================================
-- POLICY VERIFICATION
-- ============================================

-- Verify all policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verify RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND rowsecurity = true;

-- ============================================
-- POLICY TESTING QUERIES
-- ============================================

-- Test user can only see their own data
-- SELECT * FROM users WHERE auth.uid() = id;

-- Test admin can see all data  
-- SELECT * FROM users WHERE EXISTS (
--     SELECT 1 FROM users 
--     WHERE id = auth.uid() 
--     AND is_admin = true
-- );

-- Test public job postings access
-- SELECT * FROM job_postings;

-- ============================================
-- RLS POLICIES SETUP COMPLETE
-- ============================================

SELECT 'RLS policies configured successfully!' as status;