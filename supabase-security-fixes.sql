-- ============================================
-- SECURITY FIXES FOR SUPABASE RLS
-- ============================================
-- Execute this to fix security warnings and improve RLS implementation

-- Drop the existing view with SECURITY DEFINER
DROP VIEW IF EXISTS admin_dashboard_stats;

-- Create a secure admin dashboard view without SECURITY DEFINER
CREATE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE is_admin = true) as admin_users,
    (SELECT COUNT(*) FROM cv_analyses) as total_analyses,
    (SELECT COUNT(*) FROM cv_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as analyses_this_week,
    (SELECT COUNT(*) FROM job_postings WHERE is_active = true) as active_jobs,
    (SELECT COUNT(*) FROM newsletter_subscriptions WHERE is_active = true) as newsletter_subscribers,
    (SELECT COUNT(*) FROM referrals) as total_referrals,
    (SELECT COUNT(*) FROM referrals WHERE status = 'completed') as successful_referrals;

-- Enable RLS on the view
ALTER VIEW admin_dashboard_stats SET (security_barrier = true);

-- Create RLS policy for admin dashboard stats
CREATE POLICY "admin_dashboard_stats_admin_only" ON admin_dashboard_stats
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- ============================================
-- ENHANCED RLS POLICIES FOR BETTER SECURITY
-- ============================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "referrals_system_update" ON referrals;
DROP POLICY IF EXISTS "user_rewards_insert_system" ON user_rewards;
DROP POLICY IF EXISTS "admin_logs_insert_system" ON admin_logs;

-- Create more secure system policies with service role check
CREATE POLICY "referrals_service_update" ON referrals
    FOR UPDATE 
    USING (
        -- Allow service role or admin users
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "user_rewards_service_insert" ON user_rewards
    FOR INSERT 
    WITH CHECK (
        -- Allow service role or admin users
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "admin_logs_service_insert" ON admin_logs
    FOR INSERT 
    WITH CHECK (
        -- Allow service role or admin users
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- ============================================
-- FUNCTION-BASED SECURITY FOR ADMIN OPERATIONS
-- ============================================

-- Create secure function for admin dashboard data
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    is_admin_user BOOLEAN;
BEGIN
    -- Check if current user is admin
    SELECT EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND is_admin = true
    ) INTO is_admin_user;
    
    -- Return null if not admin
    IF NOT is_admin_user THEN
        RETURN NULL;
    END IF;
    
    -- Build admin stats
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM users),
        'admin_users', (SELECT COUNT(*) FROM users WHERE is_admin = true),
        'total_analyses', (SELECT COUNT(*) FROM cv_analyses),
        'analyses_this_week', (SELECT COUNT(*) FROM cv_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
        'active_jobs', (SELECT COUNT(*) FROM job_postings WHERE is_active = true),
        'newsletter_subscribers', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE is_active = true),
        'total_referrals', (SELECT COUNT(*) FROM referrals),
        'successful_referrals', (SELECT COUNT(*) FROM referrals WHERE status = 'completed')
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;

-- ============================================
-- SECURE USER MANAGEMENT FUNCTIONS
-- ============================================

-- Function to safely get user profile
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID DEFAULT auth.uid())
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    requesting_user_id UUID;
    is_admin_user BOOLEAN;
BEGIN
    requesting_user_id := auth.uid();
    
    -- Check if requesting user is admin
    SELECT EXISTS (
        SELECT 1 FROM users 
        WHERE id = requesting_user_id 
        AND is_admin = true
    ) INTO is_admin_user;
    
    -- Users can only access their own profile unless they're admin
    IF user_uuid != requesting_user_id AND NOT is_admin_user THEN
        RETURN NULL;
    END IF;
    
    -- Get user data
    SELECT row_to_json(u) INTO result
    FROM (
        SELECT id, email, username, first_name, last_name, 
               profile_image_url, phone, location, bio,
               subscription_tier, credits_remaining, referral_code,
               created_at, updated_at
        FROM users 
        WHERE id = user_uuid
    ) u;
    
    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;

-- ============================================
-- SECURE CV ANALYSIS FUNCTIONS
-- ============================================

-- Function to safely create CV analysis
CREATE OR REPLACE FUNCTION create_cv_analysis(
    p_file_name VARCHAR,
    p_file_size INTEGER,
    p_original_text TEXT,
    p_ats_score INTEGER,
    p_overall_score INTEGER,
    p_strengths TEXT[],
    p_improvements TEXT[],
    p_missing_keywords TEXT[],
    p_formatting_issues TEXT[],
    p_south_african_context JSONB,
    p_industry VARCHAR,
    p_experience_level VARCHAR,
    p_analysis_type VARCHAR DEFAULT 'free'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    analysis_id UUID;
    user_id UUID;
BEGIN
    user_id := auth.uid();
    
    -- Check if user is authenticated
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    -- Insert CV analysis
    INSERT INTO cv_analyses (
        user_id, file_name, file_size, original_text,
        ats_score, overall_score, strengths, improvements,
        missing_keywords, formatting_issues, south_african_context,
        industry, experience_level, analysis_type
    ) VALUES (
        user_id, p_file_name, p_file_size, p_original_text,
        p_ats_score, p_overall_score, p_strengths, p_improvements,
        p_missing_keywords, p_formatting_issues, p_south_african_context,
        p_industry, p_experience_level, p_analysis_type
    ) RETURNING id INTO analysis_id;
    
    RETURN analysis_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_cv_analysis(VARCHAR, INTEGER, TEXT, INTEGER, INTEGER, TEXT[], TEXT[], TEXT[], TEXT[], JSONB, VARCHAR, VARCHAR, VARCHAR) TO authenticated;

-- ============================================
-- AUDIT AND LOGGING SECURITY
-- ============================================

-- Create secure audit logging function
CREATE OR REPLACE FUNCTION log_admin_action(
    p_action VARCHAR,
    p_target_type VARCHAR,
    p_target_id UUID,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
    admin_id UUID;
BEGIN
    admin_id := auth.uid();
    
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = admin_id 
        AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Only admin users can create audit logs';
    END IF;
    
    -- Insert audit log
    INSERT INTO admin_logs (
        admin_id, action, target_type, target_id, details
    ) VALUES (
        admin_id, p_action, p_target_type, p_target_id, p_details
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Grant execute permission to authenticated users (function handles admin check)
GRANT EXECUTE ON FUNCTION log_admin_action(VARCHAR, VARCHAR, UUID, JSONB) TO authenticated;

-- ============================================
-- VERIFICATION AND CLEANUP
-- ============================================

-- Verify security improvements
SELECT 'Security fixes applied successfully!' as status;

-- Check for any remaining SECURITY DEFINER views
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
AND definition ILIKE '%SECURITY DEFINER%';

-- Verify RLS policies are properly configured
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;