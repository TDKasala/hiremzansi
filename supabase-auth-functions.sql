-- Supabase Authentication and Helper Functions
-- Run this after applying the main RLS policies

-- =========================================
-- AUTHENTICATION HELPER FUNCTIONS
-- =========================================

-- Function to get current user ID from JWT
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (auth.uid())::INTEGER;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM users 
  WHERE id = auth.current_user_id();
  
  RETURN COALESCE(user_role = 'admin', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is employer
CREATE OR REPLACE FUNCTION auth.is_employer()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM users 
  WHERE id = auth.current_user_id();
  
  RETURN COALESCE(user_role = 'employer', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check subscription status
CREATE OR REPLACE FUNCTION auth.has_premium_access()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_subscriptions us
    JOIN plans p ON us.plan_id = p.id
    WHERE us.user_id = auth.current_user_id()
    AND us.status = 'active'
    AND (us.expires_at IS NULL OR us.expires_at > NOW())
    AND p.name IN ('Monthly Premium', 'Yearly Premium')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- CV ANALYSIS CREDIT MANAGEMENT
-- =========================================

-- Function to check available CV credits
CREATE OR REPLACE FUNCTION get_available_cv_credits(user_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  total_credits INTEGER := 0;
BEGIN
  SELECT COALESCE(SUM(cv_credits_remaining), 0) INTO total_credits
  FROM user_subscriptions us
  WHERE us.user_id = user_id_param
  AND us.status = 'active'
  AND (us.expires_at IS NULL OR us.expires_at > NOW());
  
  RETURN total_credits;
END;
$$ LANGUAGE plpgsql;

-- Function to consume CV credit
CREATE OR REPLACE FUNCTION consume_cv_credit(user_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_id INTEGER;
BEGIN
  -- Find subscription with available credits
  SELECT id INTO subscription_id
  FROM user_subscriptions
  WHERE user_id = user_id_param
  AND status = 'active'
  AND cv_credits_remaining > 0
  AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY expires_at ASC NULLS LAST
  LIMIT 1;
  
  IF subscription_id IS NOT NULL THEN
    UPDATE user_subscriptions
    SET cv_credits_remaining = cv_credits_remaining - 1,
        updated_at = NOW()
    WHERE id = subscription_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- JOB MATCHING FUNCTIONS
-- =========================================

-- Function to calculate job match score
CREATE OR REPLACE FUNCTION calculate_match_score(
  cv_skills TEXT[],
  cv_experience INTEGER,
  job_skills TEXT[],
  job_experience_min INTEGER,
  job_location TEXT,
  user_locations TEXT[]
)
RETURNS INTEGER AS $$
DECLARE
  skills_match DECIMAL := 0;
  experience_match DECIMAL := 0;
  location_match DECIMAL := 0;
  total_score INTEGER;
BEGIN
  -- Skills matching (50% weight)
  IF array_length(job_skills, 1) > 0 AND array_length(cv_skills, 1) > 0 THEN
    SELECT COUNT(*) * 1.0 / array_length(job_skills, 1) INTO skills_match
    FROM unnest(job_skills) skill
    WHERE skill = ANY(cv_skills);
  END IF;
  
  -- Experience matching (30% weight)
  IF cv_experience >= job_experience_min THEN
    experience_match := 1.0;
  ELSIF cv_experience >= (job_experience_min * 0.8) THEN
    experience_match := 0.8;
  ELSIF cv_experience >= (job_experience_min * 0.6) THEN
    experience_match := 0.6;
  END IF;
  
  -- Location matching (20% weight)
  IF job_location = ANY(user_locations) THEN
    location_match := 1.0;
  END IF;
  
  -- Calculate total score
  total_score := ROUND(
    (skills_match * 50) + 
    (experience_match * 30) + 
    (location_match * 20)
  );
  
  RETURN GREATEST(0, LEAST(100, total_score));
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- NOTIFICATION FUNCTIONS
-- =========================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  user_id_param INTEGER,
  title_param TEXT,
  message_param TEXT,
  type_param TEXT DEFAULT 'info',
  data_param JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  notification_id INTEGER;
BEGIN
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    data,
    created_at
  ) VALUES (
    user_id_param,
    title_param,
    message_param,
    type_param,
    data_param,
    NOW()
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- PAYMENT TRACKING FUNCTIONS
-- =========================================

-- Function to record payment transaction
CREATE OR REPLACE FUNCTION record_payment(
  user_id_param INTEGER,
  amount_param DECIMAL,
  currency_param TEXT,
  payment_method_param TEXT,
  stripe_payment_id_param TEXT,
  plan_id_param INTEGER DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  transaction_id INTEGER;
BEGIN
  INSERT INTO payment_transactions (
    user_id,
    amount,
    currency,
    payment_method,
    stripe_payment_intent_id,
    plan_id,
    status,
    created_at
  ) VALUES (
    user_id_param,
    amount_param,
    currency_param,
    payment_method_param,
    stripe_payment_id_param,
    plan_id_param,
    'completed',
    NOW()
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- DATA CLEANUP FUNCTIONS
-- =========================================

-- Function to cleanup expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS VOID AS $$
BEGIN
  -- Mark expired subscriptions as inactive
  UPDATE user_subscriptions
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'active'
  AND expires_at < NOW();
  
  -- Delete old audit logs (keep 90 days)
  DELETE FROM audit_logs
  WHERE timestamp < (NOW() - INTERVAL '90 days');
  
  -- Delete old notifications (keep 30 days for read notifications)
  DELETE FROM notifications
  WHERE created_at < (NOW() - INTERVAL '30 days')
  AND is_read = true;
  
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =========================================

-- Trigger to update user updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER sa_profiles_updated_at_trigger
  BEFORE UPDATE ON sa_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER cvs_updated_at_trigger
  BEFORE UPDATE ON cvs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_subscriptions_updated_at_trigger
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER job_postings_updated_at_trigger
  BEFORE UPDATE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- PERFORMANCE OPTIMIZATION
-- =========================================

-- Create materialized view for active job matches
CREATE MATERIALIZED VIEW IF NOT EXISTS active_job_matches AS
SELECT 
  jm.*,
  jp.title as job_title,
  jp.location as job_location,
  jp.salary_min,
  jp.salary_max,
  u.username as job_seeker_username,
  u.email as job_seeker_email
FROM job_matches jm
JOIN job_postings jp ON jm.job_posting_id = jp.id
JOIN users u ON jm.job_seeker_id = u.id
WHERE jp.is_active = true
AND jm.match_score >= 70;

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_active_job_matches()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW active_job_matches;
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic refresh (requires pg_cron extension)
-- SELECT cron.schedule('refresh-job-matches', '0 */6 * * *', 'SELECT refresh_active_job_matches();');

-- =========================================
-- GRANT PERMISSIONS
-- =========================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO authenticated;
GRANT SELECT ON active_job_matches TO authenticated;