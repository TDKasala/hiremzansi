-- Hire Mzansi Row Level Security Policies
-- Apply these policies in your Supabase SQL editor after creating tables

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- =========================================
-- USERS TABLE POLICIES
-- =========================================

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users
FOR SELECT USING (
  auth.uid() = id::text OR 
  auth.jwt() ->> 'role' = 'admin'
);

-- Users can update their own profile (except role)
CREATE POLICY "users_update_own" ON users
FOR UPDATE USING (
  auth.uid() = id::text
) WITH CHECK (
  auth.uid() = id::text AND
  (OLD.role = NEW.role OR auth.jwt() ->> 'role' = 'admin')
);

-- Only authenticated users can insert (registration)
CREATE POLICY "users_insert_registration" ON users
FOR INSERT WITH CHECK (true);

-- Admins can manage all users
CREATE POLICY "users_admin_all" ON users
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- =========================================
-- SA PROFILES TABLE POLICIES
-- =========================================

-- Users can view and manage their own SA profile
CREATE POLICY "sa_profiles_own" ON sa_profiles
FOR ALL USING (auth.uid() = user_id::text);

-- Employers can view profiles for job matching (limited data)
CREATE POLICY "sa_profiles_employer_view" ON sa_profiles
FOR SELECT USING (
  auth.jwt() ->> 'role' = 'employer' AND
  EXISTS (
    SELECT 1 FROM job_matches jm
    WHERE jm.job_seeker_id = user_id
    AND jm.recruiter_id = auth.uid()::integer
  )
);

-- Admins can view all profiles
CREATE POLICY "sa_profiles_admin_view" ON sa_profiles
FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- =========================================
-- CVS TABLE POLICIES
-- =========================================

-- Users can manage their own CVs
CREATE POLICY "cvs_own" ON cvs
FOR ALL USING (auth.uid() = user_id::text);

-- Employers can view CVs through job matches only
CREATE POLICY "cvs_employer_matched" ON cvs
FOR SELECT USING (
  auth.jwt() ->> 'role' = 'employer' AND
  EXISTS (
    SELECT 1 FROM job_matches jm
    WHERE jm.cv_id = id
    AND jm.recruiter_id = auth.uid()::integer
    AND jm.recruiter_paid = true
  )
);

-- Admins can view all CVs
CREATE POLICY "cvs_admin_view" ON cvs
FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- =========================================
-- PLANS TABLE POLICIES (Public Read)
-- =========================================

-- Anyone can view plans
CREATE POLICY "plans_public_read" ON plans
FOR SELECT USING (is_active = true);

-- Only admins can manage plans
CREATE POLICY "plans_admin_manage" ON plans
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- =========================================
-- USER SUBSCRIPTIONS POLICIES
-- =========================================

-- Users can view their own subscriptions
CREATE POLICY "subscriptions_own_view" ON user_subscriptions
FOR SELECT USING (auth.uid() = user_id::text);

-- System can insert subscriptions (payment processing)
CREATE POLICY "subscriptions_system_insert" ON user_subscriptions
FOR INSERT WITH CHECK (true);

-- Users can update their own subscription status
CREATE POLICY "subscriptions_own_update" ON user_subscriptions
FOR UPDATE USING (auth.uid() = user_id::text);

-- Admins can manage all subscriptions
CREATE POLICY "subscriptions_admin_all" ON user_subscriptions
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- =========================================
-- JOB POSTINGS POLICIES
-- =========================================

-- Public can view active job postings
CREATE POLICY "job_postings_public_read" ON job_postings
FOR SELECT USING (is_active = true);

-- Employers can manage their own job postings
CREATE POLICY "job_postings_employer_own" ON job_postings
FOR ALL USING (auth.uid() = employer_id::text);

-- Admins can manage all job postings
CREATE POLICY "job_postings_admin_all" ON job_postings
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- =========================================
-- JOB MATCHES POLICIES
-- =========================================

-- Job seekers can view their own matches
CREATE POLICY "job_matches_seeker_view" ON job_matches
FOR SELECT USING (auth.uid() = job_seeker_id::text);

-- Employers can view matches for their jobs
CREATE POLICY "job_matches_employer_view" ON job_matches
FOR SELECT USING (
  auth.uid() = recruiter_id::text OR
  EXISTS (
    SELECT 1 FROM job_postings jp
    WHERE jp.id = job_posting_id
    AND jp.employer_id = auth.uid()::integer
  )
);

-- System can create matches
CREATE POLICY "job_matches_system_insert" ON job_matches
FOR INSERT WITH CHECK (true);

-- Users can update match viewing status
CREATE POLICY "job_matches_update_status" ON job_matches
FOR UPDATE USING (
  auth.uid() = job_seeker_id::text OR 
  auth.uid() = recruiter_id::text
);

-- Admins can manage all matches
CREATE POLICY "job_matches_admin_all" ON job_matches
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- =========================================
-- EMPLOYERS TABLE POLICIES
-- =========================================

-- Employers can manage their own profile
CREATE POLICY "employers_own" ON employers
FOR ALL USING (auth.uid() = user_id::text);

-- Public can view basic employer info for job postings
CREATE POLICY "employers_public_basic" ON employers
FOR SELECT USING (
  is_verified = true AND
  EXISTS (
    SELECT 1 FROM job_postings jp
    WHERE jp.employer_id = user_id
    AND jp.is_active = true
  )
);

-- Admins can manage all employers
CREATE POLICY "employers_admin_all" ON employers
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- =========================================
-- SKILLS TABLE POLICIES
-- =========================================

-- Anyone can view skills (public reference data)
CREATE POLICY "skills_public_read" ON skills
FOR SELECT USING (true);

-- Admins can manage skills
CREATE POLICY "skills_admin_manage" ON skills
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- =========================================
-- USER SKILLS POLICIES
-- =========================================

-- Users can manage their own skills
CREATE POLICY "user_skills_own" ON user_skills
FOR ALL USING (auth.uid() = user_id::text);

-- Employers can view user skills through job matches
CREATE POLICY "user_skills_employer_view" ON user_skills
FOR SELECT USING (
  auth.jwt() ->> 'role' = 'employer' AND
  EXISTS (
    SELECT 1 FROM job_matches jm
    WHERE jm.job_seeker_id = user_id
    AND jm.recruiter_id = auth.uid()::integer
  )
);

-- =========================================
-- NOTIFICATIONS POLICIES
-- =========================================

-- Users can view and manage their own notifications
CREATE POLICY "notifications_own" ON notifications
FOR ALL USING (auth.uid() = user_id::text);

-- System can send notifications
CREATE POLICY "notifications_system_insert" ON notifications
FOR INSERT WITH CHECK (true);

-- =========================================
-- WHATSAPP SETTINGS POLICIES
-- =========================================

-- Users can manage their own WhatsApp settings
CREATE POLICY "whatsapp_settings_own" ON whatsapp_settings
FOR ALL USING (auth.uid() = user_id::text);

-- =========================================
-- PAYMENT TRANSACTIONS POLICIES
-- =========================================

-- Users can view their own payment transactions
CREATE POLICY "payments_own_view" ON payment_transactions
FOR SELECT USING (auth.uid() = user_id::text);

-- System can create payment records
CREATE POLICY "payments_system_insert" ON payment_transactions
FOR INSERT WITH CHECK (true);

-- Admins can view all payment transactions
CREATE POLICY "payments_admin_view" ON payment_transactions
FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- =========================================
-- SECURITY FUNCTIONS
-- =========================================

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION auth.has_active_subscription(user_uuid text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_subscriptions us
    WHERE us.user_id = user_uuid::integer
    AND us.status = 'active'
    AND (us.expires_at IS NULL OR us.expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has CV analysis credits
CREATE OR REPLACE FUNCTION auth.has_cv_credits(user_uuid text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_subscriptions us
    WHERE us.user_id = user_uuid::integer
    AND us.status = 'active'
    AND us.cv_credits_remaining > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION auth.get_user_role(user_uuid text)
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM users WHERE id = user_uuid::integer;
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- AUDIT TRIGGERS (Optional but Recommended)
-- =========================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id INTEGER,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    COALESCE(NEW.user_id, OLD.user_id, auth.uid()::integer)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER users_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER cvs_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON cvs
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER payment_transactions_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sa_profiles_user_id ON sa_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_employer_active ON job_postings(employer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_job_matches_seeker ON job_matches(job_seeker_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_recruiter ON job_matches(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status ON user_subscriptions(user_id, status);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_job_postings_location_industry ON job_postings(location, industry) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cvs_analyzed_score ON cvs(is_analyzed, ats_score) WHERE is_analyzed = true;