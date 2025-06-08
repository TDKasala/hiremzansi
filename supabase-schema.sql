-- Supabase Database Schema for Hire Mzansi CV Optimization Platform
-- This schema supports CV analysis, user management, and future job matching features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  profile_picture TEXT,
  role TEXT DEFAULT 'user' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verification_token_expiry TIMESTAMP,
  last_login TIMESTAMP,
  reset_token TEXT,
  reset_token_expiry TIMESTAMP,
  receive_email_digest BOOLEAN DEFAULT true,
  last_email_digest_sent TIMESTAMP,
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT false,
  is_temporary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- South African profile details
CREATE TABLE sa_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  province TEXT,
  city TEXT,
  bbbee_status TEXT,
  bbbee_level INTEGER,
  nqf_level INTEGER,
  preferred_languages TEXT[],
  industries TEXT[],
  job_types TEXT[],
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_number TEXT,
  whatsapp_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CV table
CREATE TABLE cvs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content TEXT NOT NULL,
  file_path TEXT,
  title TEXT DEFAULT 'My CV',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  target_position TEXT,
  target_industry TEXT,
  target_salary_range TEXT,
  experience_level TEXT,
  keywords TEXT[],
  upload_source TEXT DEFAULT 'web',
  analysis_version TEXT DEFAULT 'v1.0',
  is_analyzed BOOLEAN DEFAULT false,
  analysis_requested_at TIMESTAMP,
  analysis_completed_at TIMESTAMP,
  guest_session_id TEXT,
  whatsapp_number TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ATS Scores table
CREATE TABLE ats_scores (
  id SERIAL PRIMARY KEY,
  cv_id INTEGER NOT NULL REFERENCES cvs(id),
  score INTEGER NOT NULL,
  max_score INTEGER DEFAULT 100,
  ats_compatibility INTEGER,
  keyword_density INTEGER,
  format_score INTEGER,
  section_score INTEGER,
  south_african_context_score INTEGER,
  improvements_count INTEGER DEFAULT 0,
  analysis_date TIMESTAMP DEFAULT NOW(),
  analysis_version TEXT DEFAULT 'v1.0',
  ai_model_used TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CV Analysis Results table
CREATE TABLE cv_analysis_results (
  id SERIAL PRIMARY KEY,
  cv_id INTEGER NOT NULL REFERENCES cvs(id),
  overall_score INTEGER NOT NULL,
  ats_score INTEGER,
  strengths TEXT[],
  improvements TEXT[],
  missing_keywords TEXT[],
  formatting_issues TEXT[],
  south_african_context JSONB,
  industry TEXT,
  experience_level TEXT,
  detailed_analysis JSONB,
  analysis_metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Newsletter subscriptions
CREATE TABLE newsletter_subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active',
  source TEXT DEFAULT 'website',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contact messages
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Future job matching tables (for when job matching is implemented)

-- Employers table
CREATE TABLE employers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  description TEXT,
  location TEXT,
  province TEXT,
  city TEXT,
  logo TEXT,
  bbbee_level INTEGER,
  bbbee_score REAL,
  is_verified BOOLEAN DEFAULT false,
  verification_documents TEXT[],
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Job postings table
CREATE TABLE job_postings (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER REFERENCES employers(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  province TEXT,
  city TEXT,
  employment_type TEXT,
  experience_level TEXT,
  salary_range TEXT,
  required_skills TEXT[],
  preferred_skills TEXT[],
  industry TEXT,
  department TEXT,
  bbbee_preference BOOLEAN DEFAULT false,
  nqf_requirement INTEGER,
  language_requirements TEXT[],
  deadline TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_remote BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  applications INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Skills table
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  sa_relevant BOOLEAN DEFAULT false,
  industry_relevant TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- User skills table
CREATE TABLE user_skills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  skill_id INTEGER REFERENCES skills(id) NOT NULL,
  proficiency_level TEXT,
  years_of_experience INTEGER,
  is_endorsed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_cvs_user_id ON cvs(user_id);
CREATE INDEX idx_cvs_created_at ON cvs(created_at);
CREATE INDEX idx_ats_scores_cv_id ON ats_scores(cv_id);
CREATE INDEX idx_cv_analysis_results_cv_id ON cv_analysis_results(cv_id);
CREATE INDEX idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX idx_job_postings_active ON job_postings(is_active);
CREATE INDEX idx_job_postings_location ON job_postings(province, city);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_analysis_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for CVs table  
CREATE POLICY "Users can view own CVs" ON cvs FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);
CREATE POLICY "Users can insert own CVs" ON cvs FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);
CREATE POLICY "Users can update own CVs" ON cvs FOR UPDATE USING (auth.uid()::text = user_id::text OR user_id IS NULL);

-- RLS Policies for ATS scores
CREATE POLICY "Users can view own ATS scores" ON ats_scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM cvs WHERE cvs.id = ats_scores.cv_id AND (auth.uid()::text = cvs.user_id::text OR cvs.user_id IS NULL))
);

-- RLS Policies for CV analysis results
CREATE POLICY "Users can view own analysis results" ON cv_analysis_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM cvs WHERE cvs.id = cv_analysis_results.cv_id AND (auth.uid()::text = cvs.user_id::text OR cvs.user_id IS NULL))
);

-- Insert some initial data
INSERT INTO skills (name, category, sa_relevant, industry_relevant) VALUES
('JavaScript', 'Programming', true, ARRAY['Technology', 'Software Development']),
('Python', 'Programming', true, ARRAY['Technology', 'Data Science', 'Software Development']),
('Project Management', 'Management', true, ARRAY['Business', 'Construction', 'Technology']),
('B-BBEE Compliance', 'Compliance', true, ARRAY['Business', 'Legal', 'Government']),
('Afrikaans', 'Language', true, ARRAY['Education', 'Government', 'Media']),
('Zulu', 'Language', true, ARRAY['Education', 'Government', 'Media']),
('Xhosa', 'Language', true, ARRAY['Education', 'Government', 'Media']),
('Financial Modeling', 'Finance', true, ARRAY['Banking', 'Finance', 'Investment']),
('Mining Operations', 'Technical', true, ARRAY['Mining', 'Engineering']),
('Agricultural Science', 'Science', true, ARRAY['Agriculture', 'Research']);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sa_profiles_updated_at BEFORE UPDATE ON sa_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cvs_updated_at BEFORE UPDATE ON cvs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_newsletter_updated_at BEFORE UPDATE ON newsletter_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employers_updated_at BEFORE UPDATE ON employers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();