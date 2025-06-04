-- Corrected RLS Policies for Hire Mzansi
-- Based on actual schema structure

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- =========================================
-- USERS TABLE POLICIES
-- =========================================

CREATE POLICY "users_select_own" ON users
FOR SELECT USING (
  auth.uid()::text = id::text OR 
  (SELECT role FROM users WHERE id = auth.uid()::integer) = 'admin'
);

CREATE POLICY "users_update_own" ON users
FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "users_insert_registration" ON users
FOR INSERT WITH CHECK (true);

-- =========================================
-- SA PROFILES POLICIES
-- =========================================

CREATE POLICY "sa_profiles_own" ON sa_profiles
FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "sa_profiles_admin_view" ON sa_profiles
FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()::integer) = 'admin'
);

-- =========================================
-- CVS POLICIES
-- =========================================

CREATE POLICY "cvs_own" ON cvs
FOR ALL USING (
  auth.uid()::text = user_id::text OR
  (SELECT role FROM users WHERE id = auth.uid()::integer) = 'admin'
);

CREATE POLICY "cvs_employer_matched" ON cvs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM job_matches jm
    WHERE jm.cv_id = id
    AND EXISTS (
      SELECT 1 FROM job_postings jp
      WHERE jp.id = jm.job_posting_id
      AND jp.employer_id = auth.uid()::integer
    )
  )
);

-- =========================================
-- ATS SCORES POLICIES
-- =========================================

CREATE POLICY "ats_scores_own" ON ats_scores
FOR ALL USING (
  auth.uid()::text = user_id::text OR
  (SELECT role FROM users WHERE id = auth.uid()::integer) = 'admin'
);

-- =========================================
-- SUBSCRIPTIONS POLICIES
-- =========================================

CREATE POLICY "subscriptions_own" ON subscriptions
FOR ALL USING (
  auth.uid()::text = user_id::text OR
  (SELECT role FROM users WHERE id = auth.uid()::integer) = 'admin'
);

-- =========================================
-- NOTIFICATIONS POLICIES
-- =========================================

CREATE POLICY "notifications_own" ON notifications
FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "notifications_system_insert" ON notifications
FOR INSERT WITH CHECK (true);

-- =========================================
-- PAYMENT TRANSACTIONS POLICIES
-- =========================================

CREATE POLICY "payments_own_view" ON payment_transactions
FOR SELECT USING (
  auth.uid()::text = user_id::text OR
  (SELECT role FROM users WHERE id = auth.uid()::integer) = 'admin'
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
  auth.uid()::text = employer_id::text OR
  (SELECT role FROM users WHERE id = auth.uid()::integer) = 'admin'
);

-- =========================================
-- EMPLOYERS POLICIES
-- =========================================

CREATE POLICY "employers_own" ON employers
FOR ALL USING (
  auth.uid()::text = user_id::text OR
  (SELECT role FROM users WHERE id = auth.uid()::integer) = 'admin'
);

CREATE POLICY "employers_public_basic" ON employers
FOR SELECT USING (
  is_verified = true AND
  EXISTS (
    SELECT 1 FROM job_postings jp
    WHERE jp.employer_id = user_id
    AND jp.is_active = true
  )
);

-- =========================================
-- JOB MATCHES POLICIES (FREE FOR JOB SEEKERS)
-- =========================================

CREATE POLICY "job_matches_seeker_view" ON job_matches
FOR SELECT USING (auth.uid()::text = job_seeker_id::text);

CREATE POLICY "job_matches_employer_view" ON job_matches
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM job_postings jp
    WHERE jp.id = job_posting_id
    AND jp.employer_id = auth.uid()::integer
  )
);

CREATE POLICY "job_matches_system_insert" ON job_matches
FOR INSERT WITH CHECK (true);

CREATE POLICY "job_matches_update_status" ON job_matches
FOR UPDATE USING (
  auth.uid()::text = job_seeker_id::text OR
  EXISTS (
    SELECT 1 FROM job_postings jp
    WHERE jp.id = job_posting_id
    AND jp.employer_id = auth.uid()::integer
  )
);

-- =========================================
-- PREMIUM JOB MATCHES POLICIES
-- =========================================

CREATE POLICY "premium_job_matches_seeker_view" ON premium_job_matches
FOR SELECT USING (auth.uid()::text = job_seeker_id::text);

CREATE POLICY "premium_job_matches_employer_view" ON premium_job_matches
FOR SELECT USING (auth.uid()::text = recruiter_id::text);

CREATE POLICY "premium_job_matches_system_insert" ON premium_job_matches
FOR INSERT WITH CHECK (true);

CREATE POLICY "premium_job_matches_update_status" ON premium_job_matches
FOR UPDATE USING (
  auth.uid()::text = job_seeker_id::text OR 
  auth.uid()::text = recruiter_id::text
);

-- =========================================
-- SKILLS POLICIES (PUBLIC READ)
-- =========================================

CREATE POLICY "skills_public_read" ON skills
FOR SELECT USING (is_active = true);

CREATE POLICY "skills_admin_manage" ON skills
FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()::integer) = 'admin'
);

-- =========================================
-- USER SKILLS POLICIES
-- =========================================

CREATE POLICY "user_skills_own" ON user_skills
FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "user_skills_employer_view" ON user_skills
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM job_matches jm
    WHERE jm.job_seeker_id = user_id
    AND EXISTS (
      SELECT 1 FROM job_postings jp
      WHERE jp.id = jm.job_posting_id
      AND jp.employer_id = auth.uid()::integer
    )
  )
);

-- =========================================
-- WHATSAPP SETTINGS POLICIES
-- =========================================

CREATE POLICY "whatsapp_settings_own" ON whatsapp_settings
FOR ALL USING (auth.uid()::text = user_id::text);

-- =========================================
-- PLANS POLICIES (PUBLIC READ)
-- =========================================

CREATE POLICY "plans_public_read" ON plans
FOR SELECT USING (is_active = true);

CREATE POLICY "plans_admin_manage" ON plans
FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()::integer) = 'admin'
);

-- =========================================
-- HELPER FUNCTIONS
-- =========================================

-- Function to check if user has CV analysis credits
CREATE OR REPLACE FUNCTION get_cv_credits(user_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  trial_credits INTEGER := 0;
  premium_credits INTEGER := 0;
BEGIN
  -- Check trial credits (3 free for 3 days)
  SELECT COUNT(*) INTO trial_credits
  FROM ats_scores
  WHERE user_id = user_id_param
  AND created_at > (NOW() - INTERVAL '3 days');
  
  IF trial_credits < 3 THEN
    RETURN (3 - trial_credits);
  END IF;
  
  -- Check premium subscription credits
  SELECT COALESCE(SUM(
    CASE 
      WHEN s.plan_type = 'monthly' THEN 50
      WHEN s.plan_type = 'yearly' THEN 50
      WHEN s.plan_type = 'deep_analysis' THEN 1
      ELSE 0
    END
  ), 0) INTO premium_credits
  FROM subscriptions s
  WHERE s.user_id = user_id_param
  AND s.status = 'active'
  AND (s.current_period_end IS NULL OR s.current_period_end > NOW());
  
  RETURN premium_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if job matching is available (always free)
CREATE OR REPLACE FUNCTION has_job_matching_access(user_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  -- Job matching is free for all users
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  user_id_param INTEGER,
  title_param TEXT,
  message_param TEXT,
  type_param TEXT DEFAULT 'info'
)
RETURNS INTEGER AS $$
DECLARE
  notification_id INTEGER;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    created_at
  ) VALUES (
    user_id_param,
    type_param,
    title_param,
    message_param,
    NOW()
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate basic job match score
CREATE OR REPLACE FUNCTION calculate_basic_match_score(
  cv_content TEXT,
  job_description TEXT,
  job_requirements TEXT
)
RETURNS INTEGER AS $$
DECLARE
  match_score INTEGER := 0;
  cv_words TEXT[];
  job_words TEXT[];
  common_words INTEGER := 0;
BEGIN
  -- Simple keyword matching algorithm
  cv_words := string_to_array(lower(cv_content), ' ');
  job_words := string_to_array(lower(job_description || ' ' || COALESCE(job_requirements, '')), ' ');
  
  -- Count common meaningful words (basic implementation)
  SELECT COUNT(DISTINCT word) INTO common_words
  FROM unnest(cv_words) AS word
  WHERE word = ANY(job_words)
  AND length(word) > 3;
  
  -- Basic scoring (can be enhanced with AI)
  match_score := LEAST(100, common_words * 5);
  
  RETURN GREATEST(0, match_score);
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- AUTOMATED TRIGGERS
-- =========================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at columns
CREATE TRIGGER users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER sa_profiles_updated_at_trigger
  BEFORE UPDATE ON sa_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER cvs_updated_at_trigger
  BEFORE UPDATE ON cvs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER subscriptions_updated_at_trigger
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER notifications_updated_at_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER payment_transactions_updated_at_trigger
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER job_postings_updated_at_trigger
  BEFORE UPDATE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER employers_updated_at_trigger
  BEFORE UPDATE ON employers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER premium_job_matches_updated_at_trigger
  BEFORE UPDATE ON premium_job_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER whatsapp_settings_updated_at_trigger
  BEFORE UPDATE ON whatsapp_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();