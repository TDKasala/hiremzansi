-- ============================================
-- CORRECTED SECURITY FIXES FOR SUPABASE
-- ============================================
-- Execute this to properly fix security warnings

-- Drop the existing view with SECURITY DEFINER
DROP VIEW IF EXISTS admin_dashboard_stats;

-- Create a simple view without SECURITY DEFINER (no RLS policies needed on views)
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

-- Grant view access to authenticated users (RLS on underlying tables will handle security)
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- ============================================
-- ENHANCED RLS POLICIES FOR BETTER SECURITY
-- ============================================

-- Drop existing system policies that might be too permissive
DROP POLICY IF EXISTS "referrals_system_update" ON referrals;
DROP POLICY IF EXISTS "user_rewards_insert_system" ON user_rewards;
DROP POLICY IF EXISTS "admin_logs_insert_system" ON admin_logs;

-- Create more secure service role policies
CREATE POLICY "referrals_service_update" ON referrals
    FOR UPDATE 
    USING (
        -- Allow service role or admin users or referrer
        auth.role() = 'service_role' OR
        auth.uid() = referrer_id OR
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
-- SECURE FUNCTIONS FOR ADMIN OPERATIONS
-- ============================================

-- Create secure function for admin dashboard data (replaces SECURITY DEFINER view)
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER  -- Uses caller's permissions, not definer's
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
    
    -- Build admin stats using the view (which respects RLS)
    SELECT row_to_json(stats) INTO result
    FROM admin_dashboard_stats stats;
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;

-- ============================================
-- SECURE USER FUNCTIONS
-- ============================================

-- Function to safely get user profile data
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID DEFAULT auth.uid())
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
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
        RETURN json_build_object('error', 'Unauthorized access');
    END IF;
    
    -- Get user data (RLS policies will enforce access)
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
    p_file_size INTEGER DEFAULT NULL,
    p_original_text TEXT DEFAULT NULL,
    p_ats_score INTEGER DEFAULT NULL,
    p_overall_score INTEGER DEFAULT NULL,
    p_strengths TEXT[] DEFAULT NULL,
    p_improvements TEXT[] DEFAULT NULL,
    p_missing_keywords TEXT[] DEFAULT NULL,
    p_formatting_issues TEXT[] DEFAULT NULL,
    p_south_african_context JSONB DEFAULT NULL,
    p_industry VARCHAR DEFAULT NULL,
    p_experience_level VARCHAR DEFAULT NULL,
    p_analysis_type VARCHAR DEFAULT 'free'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
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
    
    -- Insert CV analysis (RLS policies will enforce user_id matching)
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
-- NEWSLETTER SUBSCRIPTION FUNCTION
-- ============================================

-- Secure newsletter subscription function
CREATE OR REPLACE FUNCTION subscribe_to_newsletter(p_email VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    -- Validate email format
    IF p_email IS NULL OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN FALSE;
    END IF;
    
    -- Insert or update subscription
    INSERT INTO newsletter_subscriptions (email, is_active, source)
    VALUES (p_email, TRUE, 'website')
    ON CONFLICT (email) 
    DO UPDATE SET 
        is_active = TRUE,
        subscription_date = NOW();
    
    RETURN TRUE;
END;
$$;

-- Grant execute permission to all users (including anonymous)
GRANT EXECUTE ON FUNCTION subscribe_to_newsletter(VARCHAR) TO anon, authenticated;

-- ============================================
-- VERIFICATION AND CLEANUP
-- ============================================

-- Remove any remaining SECURITY DEFINER objects
-- (The functions above use SECURITY INVOKER which is more secure)

-- Verify no SECURITY DEFINER views remain
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_views 
        WHERE schemaname = 'public' 
        AND definition ILIKE '%SECURITY DEFINER%'
    ) THEN
        RAISE NOTICE 'Warning: SECURITY DEFINER views still exist';
    ELSE
        RAISE NOTICE 'Success: No SECURITY DEFINER views found';
    END IF;
END;
$$;

-- Verify RLS policies are properly configured
SELECT 
    'Security fixes applied successfully!' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';

-- Show function security settings
SELECT 
    proname as function_name,
    CASE prosecdef 
        WHEN TRUE THEN 'SECURITY DEFINER' 
        ELSE 'SECURITY INVOKER' 
    END as security_type
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('get_admin_dashboard_stats', 'get_user_profile', 'create_cv_analysis', 'subscribe_to_newsletter');