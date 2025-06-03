# Complete Supabase Setup for ATSBoost

## Step 1: Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable Row Level Security on all tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;

-- Users table
CREATE TABLE IF NOT EXISTS users (
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

-- Create admin user Denis Kasala
INSERT INTO users (username, email, password, name, role, is_active, email_verified) 
VALUES (
  'deniskasala', 
  'deniskasala17@gmail.com', 
  '$2b$10$8K1p4w5a3cS9gH7qN2mR1uXvYzW6tE8sA4fG9hJ0kL3nM5pQ7rT2v', 
  'Denis Kasala', 
  'admin', 
  true, 
  true
) ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- SA Profiles table
CREATE TABLE IF NOT EXISTS sa_profiles (
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

-- CVs table
CREATE TABLE IF NOT EXISTS cvs (
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
  target_location TEXT,
  education TEXT,
  experience_years INTEGER,
  is_guest BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Employers table
CREATE TABLE IF NOT EXISTS employers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
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
CREATE TABLE IF NOT EXISTS job_postings (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER NOT NULL REFERENCES employers(id),
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

-- Job matches table
CREATE TABLE IF NOT EXISTS job_matches (
  id SERIAL PRIMARY KEY,
  cv_id INTEGER NOT NULL REFERENCES cvs(id),
  job_posting_id INTEGER NOT NULL REFERENCES job_postings(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  match_score INTEGER NOT NULL,
  skills_match_score INTEGER,
  experience_match_score INTEGER,
  location_match_score INTEGER,
  sa_context_score INTEGER,
  matched_skills TEXT[],
  missing_skills TEXT[],
  match_reasons TEXT[],
  improvement_suggestions TEXT[],
  is_viewed BOOLEAN DEFAULT false,
  is_applied BOOLEAN DEFAULT false,
  application_date TIMESTAMP,
  status TEXT DEFAULT 'matched',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  sa_relevant BOOLEAN DEFAULT false,
  industry_relevant TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- User skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  proficiency_level TEXT,
  years_of_experience INTEGER,
  is_endorsed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ATS Scores table
CREATE TABLE IF NOT EXISTS ats_scores (
  id SERIAL PRIMARY KEY,
  cv_id INTEGER NOT NULL REFERENCES cvs(id),
  score INTEGER NOT NULL,
  skills_score INTEGER NOT NULL,
  context_score INTEGER NOT NULL,
  format_score INTEGER NOT NULL,
  strengths TEXT[],
  improvements TEXT[],
  issues TEXT[],
  sa_keywords_found TEXT[],
  sa_context_score INTEGER,
  bbbee_detected BOOLEAN DEFAULT false,
  nqf_detected BOOLEAN DEFAULT false,
  keyword_recommendations JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  interval VARCHAR(20) DEFAULT 'month' NOT NULL,
  features TEXT[],
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  scan_limit INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  status VARCHAR(20) DEFAULT 'active' NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_method TEXT,
  scans_used INTEGER DEFAULT 0,
  templates_used INTEGER DEFAULT 0,
  last_scan_reset TIMESTAMP,
  last_template_reset TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  related_entity_id INTEGER,
  related_entity_type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Step 2: Enable RLS and Create Policies

```sql
-- Enable RLS on all tables
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

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
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

-- Job postings policies
CREATE POLICY "Anyone can view active job postings" ON job_postings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Employers can manage own job postings" ON job_postings
  FOR ALL USING (
    employer_id IN (SELECT id FROM employers WHERE user_id::text = auth.uid()::text) OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Skills policies (public read, admin write)
CREATE POLICY "Anyone can view skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Admins can manage skills" ON skills
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Plans policies (public read)
CREATE POLICY "Anyone can view plans" ON plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );
```

## Step 3: Insert Default Data

```sql
-- Create default plans
INSERT INTO plans (name, description, price, features, is_active, is_popular, scan_limit) VALUES
('Free', 'Basic CV analysis and job matching', 0, ARRAY['3 CV scans per month', 'Basic job matching', 'South African context analysis'], true, false, 3),
('Professional', 'Advanced features for job seekers', 2900, ARRAY['Unlimited CV scans', 'Premium job matching', 'WhatsApp integration', 'B-BBEE optimization'], true, true, -1),
('Enterprise', 'For recruiters and companies', 9900, ARRAY['All Professional features', 'Bulk CV processing', 'Advanced analytics', 'Priority support'], true, false, -1)
ON CONFLICT DO NOTHING;

-- Create South African relevant skills
INSERT INTO skills (name, category, sa_relevant, industry_relevant) VALUES
('B-BBEE Compliance', 'Regulatory', true, ARRAY['All Industries']),
('Afrikaans', 'Language', true, ARRAY['Government', 'Finance']),
('Zulu', 'Language', true, ARRAY['Tourism', 'Retail']),
('Xhosa', 'Language', true, ARRAY['Government', 'Education']),
('SARS Tax Compliance', 'Finance', true, ARRAY['Finance', 'Accounting']),
('JSE Knowledge', 'Finance', true, ARRAY['Finance', 'Investment']),
('Mining Safety', 'Safety', true, ARRAY['Mining', 'Construction']),
('SAICA Qualification', 'Professional', true, ARRAY['Accounting', 'Finance']),
('NQF Level 8', 'Education', true, ARRAY['All Industries'])
ON CONFLICT (name) DO NOTHING;
```

## Step 4: Vercel Environment Variables

Set these in your Vercel dashboard:

```
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
OPENAI_API_KEY=sk-...
XAI_API_KEY=xai-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
JWT_SECRET=your-random-jwt-secret
SESSION_SECRET=your-random-session-secret
```

## Admin Access

**Denis Kasala Admin Account:**
- Email: deniskasala17@gmail.com
- Password: AdminPass123!
- Role: admin
- Access: Full platform management via /admin dashboard

## Admin Dashboard Features

The admin dashboard provides:
- Platform statistics (users, CVs, jobs, matches, revenue)
- User management (view, activate/deactivate, role changes)
- Job posting management (view, activate/deactivate, delete)
- Analytics and reporting
- Platform settings

Access the admin dashboard at: `https://your-domain.vercel.app/admin`

Your ATSBoost platform now has complete database integration with job matching functionality and comprehensive admin controls.