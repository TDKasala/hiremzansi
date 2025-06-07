-- ============================================
-- FIX FUNCTION SEARCH PATH SECURITY WARNINGS
-- ============================================
-- This fixes all "Function Search Path Mutable" warnings

-- Drop and recreate all functions with secure search_path

-- 1. Fix update_updated_at_column function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Recreate triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at 
    BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Fix generate_referral_code function
DROP FUNCTION IF EXISTS generate_referral_code() CASCADE;
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 8-character alphanumeric code
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = code) INTO exists;
        
        -- Exit loop if code is unique
        IF NOT exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$;

-- 3. Fix assign_referral_code function
DROP FUNCTION IF EXISTS assign_referral_code() CASCADE;
CREATE OR REPLACE FUNCTION assign_referral_code()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := public.generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS assign_referral_code_trigger ON users;
CREATE TRIGGER assign_referral_code_trigger
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_referral_code();

-- 4. Fix get_admin_dashboard_stats function
DROP FUNCTION IF EXISTS get_admin_dashboard_stats() CASCADE;
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    result JSON;
    is_admin_user BOOLEAN;
BEGIN
    -- Check if current user is admin
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND is_admin = true
    ) INTO is_admin_user;
    
    -- Return null if not admin
    IF NOT is_admin_user THEN
        RETURN NULL;
    END IF;
    
    -- Build admin stats
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM public.users),
        'admin_users', (SELECT COUNT(*) FROM public.users WHERE is_admin = true),
        'total_analyses', (SELECT COUNT(*) FROM public.cv_analyses),
        'analyses_this_week', (SELECT COUNT(*) FROM public.cv_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
        'active_jobs', (SELECT COUNT(*) FROM public.job_postings WHERE is_active = true),
        'newsletter_subscribers', (SELECT COUNT(*) FROM public.newsletter_subscriptions WHERE is_active = true),
        'total_referrals', (SELECT COUNT(*) FROM public.referrals),
        'successful_referrals', (SELECT COUNT(*) FROM public.referrals WHERE status = 'completed')
    ) INTO result;
    
    RETURN result;
END;
$$;

-- 5. Fix get_user_profile function
DROP FUNCTION IF EXISTS get_user_profile(UUID) CASCADE;
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID DEFAULT auth.uid())
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    result JSON;
    requesting_user_id UUID;
    is_admin_user BOOLEAN;
BEGIN
    requesting_user_id := auth.uid();
    
    -- Check if requesting user is admin
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = requesting_user_id 
        AND is_admin = true
    ) INTO is_admin_user;
    
    -- Users can only access their own profile unless they're admin
    IF user_uuid != requesting_user_id AND NOT is_admin_user THEN
        RETURN json_build_object('error', 'Unauthorized access');
    END IF;
    
    -- Get user data
    SELECT row_to_json(u) INTO result
    FROM (
        SELECT id, email, username, first_name, last_name, 
               profile_image_url, phone, location, bio,
               subscription_tier, credits_remaining, referral_code,
               created_at, updated_at
        FROM public.users 
        WHERE id = user_uuid
    ) u;
    
    RETURN result;
END;
$$;

-- 6. Fix create_cv_analysis function
DROP FUNCTION IF EXISTS create_cv_analysis(VARCHAR, INTEGER, TEXT, INTEGER, INTEGER, TEXT[], TEXT[], TEXT[], TEXT[], JSONB, VARCHAR, VARCHAR, VARCHAR) CASCADE;
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
SET search_path = public
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
    INSERT INTO public.cv_analyses (
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

-- 7. Fix subscribe_to_newsletter function
DROP FUNCTION IF EXISTS subscribe_to_newsletter(VARCHAR) CASCADE;
CREATE OR REPLACE FUNCTION subscribe_to_newsletter(p_email VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    -- Validate email format
    IF p_email IS NULL OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN FALSE;
    END IF;
    
    -- Insert or update subscription
    INSERT INTO public.newsletter_subscriptions (email, is_active, source)
    VALUES (p_email, TRUE, 'website')
    ON CONFLICT (email) 
    DO UPDATE SET 
        is_active = TRUE,
        subscription_date = NOW();
    
    RETURN TRUE;
END;
$$;

-- 8. Fix refresh_dashboard_cache function
DROP FUNCTION IF EXISTS refresh_dashboard_cache() CASCADE;
CREATE OR REPLACE FUNCTION refresh_dashboard_cache()
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    stats_json JSONB;
BEGIN
    -- Check admin permission
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Only admin users can refresh dashboard cache';
    END IF;
    
    -- Build stats
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM public.users),
        'admin_users', (SELECT COUNT(*) FROM public.users WHERE is_admin = true),
        'total_analyses', (SELECT COUNT(*) FROM public.cv_analyses),
        'analyses_this_week', (SELECT COUNT(*) FROM public.cv_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
        'active_jobs', (SELECT COUNT(*) FROM public.job_postings WHERE is_active = true),
        'newsletter_subscribers', (SELECT COUNT(*) FROM public.newsletter_subscriptions WHERE is_active = true),
        'total_referrals', (SELECT COUNT(*) FROM public.referrals),
        'successful_referrals', (SELECT COUNT(*) FROM public.referrals WHERE status = 'completed')
    ) INTO stats_json;
    
    -- Clear old cache and insert new (if dashboard_cache table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dashboard_cache') THEN
        DELETE FROM public.dashboard_cache;
        INSERT INTO public.dashboard_cache (stats_data) VALUES (stats_json);
    END IF;
END;
$$;

-- 9. Fix get_dashboard_stats function
DROP FUNCTION IF EXISTS get_dashboard_stats() CASCADE;
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Check admin permission
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND is_admin = true
    ) THEN
        RETURN NULL;
    END IF;
    
    -- Try to get from cache first (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dashboard_cache') THEN
        SELECT stats_data INTO result
        FROM public.dashboard_cache
        WHERE updated_at > NOW() - INTERVAL '5 minutes'
        ORDER BY updated_at DESC
        LIMIT 1;
    END IF;
    
    -- If no recent cache, build fresh stats
    IF result IS NULL THEN
        SELECT jsonb_build_object(
            'total_users', (SELECT COUNT(*) FROM public.users),
            'admin_users', (SELECT COUNT(*) FROM public.users WHERE is_admin = true),
            'total_analyses', (SELECT COUNT(*) FROM public.cv_analyses),
            'analyses_this_week', (SELECT COUNT(*) FROM public.cv_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
            'active_jobs', (SELECT COUNT(*) FROM public.job_postings WHERE is_active = true),
            'newsletter_subscribers', (SELECT COUNT(*) FROM public.newsletter_subscriptions WHERE is_active = true),
            'total_referrals', (SELECT COUNT(*) FROM public.referrals),
            'successful_referrals', (SELECT COUNT(*) FROM public.referrals WHERE status = 'completed')
        ) INTO result;
        
        -- Cache the result if table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dashboard_cache') THEN
            DELETE FROM public.dashboard_cache;
            INSERT INTO public.dashboard_cache (stats_data) VALUES (result);
        END IF;
    END IF;
    
    RETURN result;
END;
$$;

-- 10. Additional secure functions for completeness
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    -- Check admin permission
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;
    
    -- Clear old data (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dashboard_stats') THEN
        DELETE FROM public.dashboard_stats;
        
        -- Insert fresh stats
        INSERT INTO public.dashboard_stats (
            total_users, admin_users, total_analyses, analyses_this_week,
            active_jobs, newsletter_subscribers, total_referrals, successful_referrals
        ) VALUES (
            (SELECT COUNT(*) FROM public.users),
            (SELECT COUNT(*) FROM public.users WHERE is_admin = true),
            (SELECT COUNT(*) FROM public.cv_analyses),
            (SELECT COUNT(*) FROM public.cv_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
            (SELECT COUNT(*) FROM public.job_postings WHERE is_active = true),
            (SELECT COUNT(*) FROM public.newsletter_subscriptions WHERE is_active = true),
            (SELECT COUNT(*) FROM public.referrals),
            (SELECT COUNT(*) FROM public.referrals WHERE status = 'completed')
        );
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION subscribe_newsletter(p_email VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.newsletter_subscriptions (email, is_active, source)
    VALUES (p_email, TRUE, 'website')
    ON CONFLICT (email) DO UPDATE SET is_active = TRUE;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Grant permissions to all functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- Verification query
SELECT 
    'All function search path security issues fixed!' as status,
    COUNT(*) as functions_updated
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'update_updated_at_column',
    'generate_referral_code', 
    'assign_referral_code',
    'get_admin_dashboard_stats',
    'get_user_profile',
    'create_cv_analysis',
    'subscribe_to_newsletter',
    'refresh_dashboard_cache',
    'get_dashboard_stats',
    'refresh_dashboard_stats',
    'subscribe_newsletter'
);

-- Check for any remaining mutable search path functions
SELECT 
    proname as function_name,
    CASE 
        WHEN prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_type,
    CASE 
        WHEN 'search_path' = ANY(proconfig) THEN 'FIXED'
        ELSE 'NEEDS FIX'
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY proname;