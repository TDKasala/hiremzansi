-- Add employer and job-related tables for the matching platform

-- Create skills table
CREATE TABLE IF NOT EXISTS "skills" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create user skills table
CREATE TABLE IF NOT EXISTS "user_skills" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "skill_id" INTEGER NOT NULL REFERENCES "skills"("id") ON DELETE CASCADE,
  "proficiency" INTEGER NOT NULL, -- 1-10 scale
  "years_experience" INTEGER,
  "is_verified" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create employers table
CREATE TABLE IF NOT EXISTS "employers" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "company_name" TEXT NOT NULL,
  "industry" TEXT,
  "company_size" TEXT,
  "website" TEXT,
  "contact_email" TEXT,
  "contact_phone" TEXT,
  "logo" TEXT,
  "description" TEXT,
  "is_verified" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create job postings table
CREATE TABLE IF NOT EXISTS "job_postings" (
  "id" SERIAL PRIMARY KEY,
  "employer_id" INTEGER NOT NULL REFERENCES "employers"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT,
  "employment_type" TEXT,
  "experience_level" TEXT,
  "salary_range" TEXT,
  "required_skills" TEXT[],
  "preferred_skills" TEXT[],
  "industry" TEXT,
  "deadline" TIMESTAMP,
  "is_active" BOOLEAN DEFAULT TRUE,
  "is_featured" BOOLEAN DEFAULT FALSE,
  "views" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create job matches table
CREATE TABLE IF NOT EXISTS "job_matches" (
  "id" SERIAL PRIMARY KEY,
  "job_id" INTEGER NOT NULL REFERENCES "job_postings"("id") ON DELETE CASCADE,
  "cv_id" INTEGER NOT NULL REFERENCES "cvs"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "match_score" INTEGER NOT NULL,
  "skills_matched" TEXT[],
  "is_paid_by_jobseeker" BOOLEAN DEFAULT FALSE,
  "is_viewed_by_employer" BOOLEAN DEFAULT FALSE,
  "is_paid_by_employer" BOOLEAN DEFAULT FALSE,
  "is_shortlisted" BOOLEAN DEFAULT FALSE,
  "is_rejected" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS "payments" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "amount" NUMERIC NOT NULL,
  "currency" TEXT DEFAULT 'ZAR' NOT NULL,
  "payment_type" TEXT NOT NULL, -- subscription, job-match, feature-post
  "status" TEXT NOT NULL, -- pending, completed, failed, refunded
  "payment_provider" TEXT NOT NULL, -- PayFast, etc.
  "transaction_id" TEXT,
  "related_entity_id" INTEGER,
  "related_entity_type" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- job-match, payment, system, etc.
  "is_read" BOOLEAN DEFAULT FALSE,
  "related_entity_id" INTEGER,
  "related_entity_type" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add indexes for better performance
CREATE INDEX "idx_user_skills_user_id" ON "user_skills" ("user_id");
CREATE INDEX "idx_user_skills_skill_id" ON "user_skills" ("skill_id");
CREATE INDEX "idx_employers_user_id" ON "employers" ("user_id");
CREATE INDEX "idx_job_postings_employer_id" ON "job_postings" ("employer_id");
CREATE INDEX "idx_job_postings_is_active" ON "job_postings" ("is_active");
CREATE INDEX "idx_job_matches_job_id" ON "job_matches" ("job_id");
CREATE INDEX "idx_job_matches_cv_id" ON "job_matches" ("cv_id");
CREATE INDEX "idx_job_matches_user_id" ON "job_matches" ("user_id");
CREATE INDEX "idx_payments_user_id" ON "payments" ("user_id");
CREATE INDEX "idx_payments_status" ON "payments" ("status");
CREATE INDEX "idx_notifications_user_id" ON "notifications" ("user_id");
CREATE INDEX "idx_notifications_is_read" ON "notifications" ("is_read");

-- Add role field to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'jobseeker';

-- Add skill categories for the app
INSERT INTO "skills" (name, category) VALUES 
('JavaScript', 'Programming'),
('Python', 'Programming'),
('Java', 'Programming'),
('SQL', 'Database'),
('CSS', 'Frontend'),
('HTML', 'Frontend'),
('React', 'Frontend'),
('Node.js', 'Backend'),
('Marketing Strategy', 'Marketing'),
('SEO', 'Marketing'),
('Social Media Marketing', 'Marketing'),
('Content Writing', 'Content'),
('Data Analysis', 'Analytics'),
('Excel', 'Office'),
('Project Management', 'Management'),
('Leadership', 'Management'),
('Customer Service', 'Customer Support'),
('Sales', 'Business'),
('Accounting', 'Finance'),
('Financial Analysis', 'Finance'),
('Cloud Computing', 'Infrastructure'),
('AWS', 'Cloud'),
('Azure', 'Cloud'),
('UI/UX Design', 'Design'),
('Graphic Design', 'Design'),
('Market Research', 'Research'),
('Machine Learning', 'AI'),
('Android Development', 'Mobile'),
('iOS Development', 'Mobile'),
('Supply Chain Management', 'Logistics')
ON CONFLICT (id) DO NOTHING;