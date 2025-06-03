-- ATSBoost Supabase Database Setup with RLS Policies
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create admin user Denis Kasala
INSERT INTO users (username, email, password, name, role, is_active, email_verified) 
VALUES (
  'deniskasala', 
  'deniskasala17@gmail.com', 
  '$2b$10$8K1p4w5a3cS9gH7qN2mR1uXvYzW6tE8sA4fG9hJ0kL3nM5pQ7rT2v', -- password: AdminPass123!
  'Denis Kasala', 
  'admin', 
  true, 
  true
) ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text OR role = 'admin');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text OR role = 'admin');

CREATE POLICY "Admins can view all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- SA Profiles policies
CREATE POLICY "Users can manage own SA profile" ON sa_profiles
  FOR ALL USING (
    user_id::text = auth.uid()::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- CVs policies
CREATE POLICY "Users can manage own CVs" ON cvs
  FOR ALL USING (
    user_id::text = auth.uid()::text OR 
    is_guest = true OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

CREATE POLICY "Public can view guest CVs" ON cvs
  FOR SELECT USING (is_guest = true);

-- Employers policies
CREATE POLICY "Employers can manage own profile" ON employers
  FOR ALL USING (
    user_id::text = auth.uid()::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Job postings policies
CREATE POLICY "Anyone can view active job postings" ON job_postings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Employers can manage own job postings" ON job_postings
  FOR ALL USING (
    employer_id IN (
      SELECT id FROM employers WHERE user_id::text = auth.uid()::text
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Job matches policies
CREATE POLICY "Users can view own job matches" ON job_matches
  FOR SELECT USING (
    user_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

CREATE POLICY "Users can create job matches" ON job_matches
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own job matches" ON job_matches
  FOR UPDATE USING (
    user_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Skills policies (public read, admin write)
CREATE POLICY "Anyone can view skills" ON skills
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage skills" ON skills
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- User skills policies
CREATE POLICY "Users can manage own skills" ON user_skills
  FOR ALL USING (
    user_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- ATS scores policies
CREATE POLICY "Users can view own ATS scores" ON ats_scores
  FOR SELECT USING (
    cv_id IN (
      SELECT id FROM cvs WHERE user_id::text = auth.uid()::text OR is_guest = true
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

CREATE POLICY "System can create ATS scores" ON ats_scores
  FOR INSERT WITH CHECK (true);

-- Plans policies (public read)
CREATE POLICY "Anyone can view plans" ON plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (
    user_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

CREATE POLICY "Users can create own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (
    user_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    user_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (
    user_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Create default plans
INSERT INTO plans (name, description, price, features, is_active, is_popular, scan_limit) VALUES
('Free', 'Basic CV analysis and job matching', 0, ARRAY['3 CV scans per month', 'Basic job matching', 'South African context analysis'], true, false, 3),
('Professional', 'Advanced features for job seekers', 2900, ARRAY['Unlimited CV scans', 'Premium job matching', 'WhatsApp integration', 'B-BBEE optimization', 'Cover letter generation'], true, true, -1),
('Enterprise', 'For recruiters and companies', 9900, ARRAY['All Professional features', 'Bulk CV processing', 'Advanced analytics', 'Priority support', 'API access'], true, false, -1)
ON CONFLICT DO NOTHING;

-- Create some default skills relevant to South Africa
INSERT INTO skills (name, category, sa_relevant, industry_relevant) VALUES
('B-BBEE Compliance', 'Regulatory', true, ARRAY['All Industries']),
('Afrikaans', 'Language', true, ARRAY['Government', 'Finance', 'Mining']),
('Zulu', 'Language', true, ARRAY['Tourism', 'Retail', 'Healthcare']),
('Xhosa', 'Language', true, ARRAY['Government', 'Education', 'Media']),
('SARS Tax Compliance', 'Finance', true, ARRAY['Finance', 'Accounting']),
('JSE Knowledge', 'Finance', true, ARRAY['Finance', 'Investment']),
('Mining Safety', 'Safety', true, ARRAY['Mining', 'Construction']),
('CIPC Compliance', 'Legal', true, ARRAY['Legal', 'Corporate']),
('SAICA Qualification', 'Professional', true, ARRAY['Accounting', 'Finance']),
('NQF Level 8', 'Education', true, ARRAY['All Industries'])
ON CONFLICT (name) DO NOTHING;

-- Create admin functions for dashboard
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'total_cvs', (SELECT COUNT(*) FROM cvs),
    'total_job_postings', (SELECT COUNT(*) FROM job_postings WHERE is_active = true),
    'total_job_matches', (SELECT COUNT(*) FROM job_matches),
    'active_subscriptions', (SELECT COUNT(*) FROM subscriptions WHERE status = 'active'),
    'revenue_this_month', (SELECT COALESCE(SUM(price), 0) FROM plans p JOIN subscriptions s ON p.id = s.plan_id WHERE s.status = 'active' AND s.created_at >= date_trunc('month', CURRENT_DATE))
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to admin users
GRANT EXECUTE ON FUNCTION get_platform_stats() TO authenticated;