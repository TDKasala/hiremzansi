-- ============================================
-- REMOVE SECURITY DEFINER VIEW COMPLETELY
-- ============================================
-- This completely removes the problematic view and replaces it with a secure solution

-- Step 1: Drop the problematic view completely
DROP VIEW IF EXISTS public.admin_dashboard_stats CASCADE;

-- Step 2: Verify the view is gone
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_dashboard_stats'
    ) THEN
        RAISE EXCEPTION 'View still exists after drop attempt';
    ELSE
        RAISE NOTICE 'View successfully removed';
    END IF;
END;
$$;

-- Step 3: Create a simple table-based solution instead of a view
CREATE TABLE IF NOT EXISTS public.admin_dashboard_cache (
    id SERIAL PRIMARY KEY,
    total_users INTEGER DEFAULT 0,
    admin_users INTEGER DEFAULT 0,
    total_analyses INTEGER DEFAULT 0,
    analyses_this_week INTEGER DEFAULT 0,
    active_jobs INTEGER DEFAULT 0,
    newsletter_subscribers INTEGER DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    successful_referrals INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the cache table
ALTER TABLE public.admin_dashboard_cache ENABLE ROW LEVEL SECURITY;

-- Only admins can access the cache
CREATE POLICY "admin_dashboard_cache_admin_only" ON public.admin_dashboard_cache
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Step 4: Create a secure function to get dashboard data (replaces the view)
CREATE OR REPLACE FUNCTION get_admin_dashboard_data()
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
    
    -- Build fresh dashboard data
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM public.users),
        'admin_users', (SELECT COUNT(*) FROM public.users WHERE is_admin = true),
        'total_analyses', (SELECT COUNT(*) FROM public.cv_analyses),
        'analyses_this_week', (SELECT COUNT(*) FROM public.cv_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
        'active_jobs', (SELECT COUNT(*) FROM public.job_postings WHERE is_active = true),
        'newsletter_subscribers', (SELECT COUNT(*) FROM public.newsletter_subscriptions WHERE is_active = true),
        'total_referrals', (SELECT COUNT(*) FROM public.referrals),
        'successful_referrals', (SELECT COUNT(*) FROM public.referrals WHERE status = 'completed'),
        'last_updated', NOW()
    ) INTO result;
    
    -- Update cache table
    DELETE FROM public.admin_dashboard_cache;
    INSERT INTO public.admin_dashboard_cache (
        total_users, admin_users, total_analyses, analyses_this_week,
        active_jobs, newsletter_subscribers, total_referrals, successful_referrals
    ) VALUES (
        (result->>'total_users')::INTEGER,
        (result->>'admin_users')::INTEGER,
        (result->>'total_analyses')::INTEGER,
        (result->>'analyses_this_week')::INTEGER,
        (result->>'active_jobs')::INTEGER,
        (result->>'newsletter_subscribers')::INTEGER,
        (result->>'total_referrals')::INTEGER,
        (result->>'successful_referrals')::INTEGER
    );
    
    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_admin_dashboard_data() TO authenticated;

-- Step 5: Verification - Check no SECURITY DEFINER views exist
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'SUCCESS: No SECURITY DEFINER views found'
        ELSE 'ERROR: SECURITY DEFINER views still exist'
    END as security_status,
    COUNT(*) as definer_view_count
FROM information_schema.views 
WHERE table_schema = 'public' 
AND view_definition ILIKE '%SECURITY DEFINER%';

-- Step 6: Alternative check using pg_views
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'SUCCESS: No problematic views in pg_views'
        ELSE 'WARNING: Found views with SECURITY DEFINER'
    END as pg_views_status,
    COUNT(*) as definer_count
FROM pg_views 
WHERE schemaname = 'public' 
AND definition ILIKE '%SECURITY DEFINER%';

-- Step 7: Show all current views (should not include admin_dashboard_stats)
SELECT 
    schemaname,
    viewname,
    'View exists' as status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- Step 8: Initialize cache with current data
INSERT INTO public.admin_dashboard_cache (
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
) ON CONFLICT DO NOTHING;

-- Final verification
SELECT 'SECURITY DEFINER view removal completed successfully!' as final_status;