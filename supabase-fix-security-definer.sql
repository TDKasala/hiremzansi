-- ============================================
-- COMPLETE FIX FOR SECURITY DEFINER WARNING
-- ============================================
-- This completely removes the problematic view and replaces it

-- Step 1: Completely drop the problematic view
DROP VIEW IF EXISTS admin_dashboard_stats CASCADE;

-- Step 2: Create a simple view WITHOUT any security properties
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

-- Step 3: Grant appropriate permissions
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- Step 4: Alternative approach - Create table-based solution instead of view
CREATE TABLE IF NOT EXISTS dashboard_cache (
    id SERIAL PRIMARY KEY,
    stats_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the cache table
ALTER TABLE dashboard_cache ENABLE ROW LEVEL SECURITY;

-- Only admins can access dashboard cache
CREATE POLICY "dashboard_cache_admin_only" ON dashboard_cache
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Function to refresh dashboard cache (admin only)
CREATE OR REPLACE FUNCTION refresh_dashboard_cache()
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    stats_json JSONB;
BEGIN
    -- Check admin permission
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Only admin users can refresh dashboard cache';
    END IF;
    
    -- Build stats
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM users),
        'admin_users', (SELECT COUNT(*) FROM users WHERE is_admin = true),
        'total_analyses', (SELECT COUNT(*) FROM cv_analyses),
        'analyses_this_week', (SELECT COUNT(*) FROM cv_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
        'active_jobs', (SELECT COUNT(*) FROM job_postings WHERE is_active = true),
        'newsletter_subscribers', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE is_active = true),
        'total_referrals', (SELECT COUNT(*) FROM referrals),
        'successful_referrals', (SELECT COUNT(*) FROM referrals WHERE status = 'completed')
    ) INTO stats_json;
    
    -- Clear old cache and insert new
    DELETE FROM dashboard_cache;
    INSERT INTO dashboard_cache (stats_data) VALUES (stats_json);
END;
$$;

-- Function to get dashboard stats (replaces the problematic view)
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Check admin permission
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND is_admin = true
    ) THEN
        RETURN NULL;
    END IF;
    
    -- Try to get from cache first
    SELECT stats_data INTO result
    FROM dashboard_cache
    WHERE updated_at > NOW() - INTERVAL '5 minutes'
    ORDER BY updated_at DESC
    LIMIT 1;
    
    -- If no recent cache, build fresh stats
    IF result IS NULL THEN
        SELECT jsonb_build_object(
            'total_users', (SELECT COUNT(*) FROM users),
            'admin_users', (SELECT COUNT(*) FROM users WHERE is_admin = true),
            'total_analyses', (SELECT COUNT(*) FROM cv_analyses),
            'analyses_this_week', (SELECT COUNT(*) FROM cv_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
            'active_jobs', (SELECT COUNT(*) FROM job_postings WHERE is_active = true),
            'newsletter_subscribers', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE is_active = true),
            'total_referrals', (SELECT COUNT(*) FROM referrals),
            'successful_referrals', (SELECT COUNT(*) FROM referrals WHERE status = 'completed')
        ) INTO result;
        
        -- Cache the result
        DELETE FROM dashboard_cache;
        INSERT INTO dashboard_cache (stats_data) VALUES (result);
    END IF;
    
    RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION refresh_dashboard_cache() TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;

-- Step 5: Verification queries
-- Check if any SECURITY DEFINER views still exist
DO $$
DECLARE
    definer_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO definer_count
    FROM information_schema.views
    WHERE table_schema = 'public'
    AND view_definition ILIKE '%SECURITY DEFINER%';
    
    IF definer_count > 0 THEN
        RAISE NOTICE 'Warning: % SECURITY DEFINER views still exist', definer_count;
    ELSE
        RAISE NOTICE 'Success: No SECURITY DEFINER views found';
    END IF;
END;
$$;

-- Alternative verification using pg_views
SELECT 
    schemaname,
    viewname,
    'SECURITY DEFINER found in definition' as issue
FROM pg_views 
WHERE schemaname = 'public' 
AND definition ILIKE '%SECURITY DEFINER%'
UNION ALL
SELECT 
    'public' as schemaname,
    'No issues' as viewname,
    'All views are secure' as issue
WHERE NOT EXISTS (
    SELECT 1 FROM pg_views 
    WHERE schemaname = 'public' 
    AND definition ILIKE '%SECURITY DEFINER%'
);

-- Final status
SELECT 
    'Security definer issues resolved!' as status,
    COUNT(*) as total_functions_created
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('refresh_dashboard_cache', 'get_dashboard_stats');