# Replit Production Deployment Guide

## ✅ Configuration Complete

Your Hire Mzansi CV Optimization Platform is ready for Replit deployment with Supabase production database.

### Environment Variables Configured:
- ✅ SUPABASE_URL: https://vkfqohfaxapfajwrzebz.supabase.co
- ✅ SUPABASE_ANON_KEY: Configured
- ✅ SESSION_SECRET: Generated for secure sessions
- ✅ NODE_ENV: Set for production mode

### Database Tables Required in Supabase:

Run this SQL in your Supabase SQL Editor to create the required tables:

```sql
-- CVs table for storing uploaded CV data
CREATE TABLE IF NOT EXISTS cvs (
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  content TEXT,
  title TEXT,
  analysis_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access on cvs" ON cvs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on cvs" ON cvs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on newsletter" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
```

### Deployment Steps:

1. **Replit Configuration:**
   - Your app will automatically start with `npm run dev`
   - The server runs on port 5000
   - Frontend is accessible at the Replit URL
   - API endpoints available at `/api/*`

2. **Production Environment:**
   - Update NODE_ENV=production in Replit Secrets
   - All Supabase credentials are configured
   - SSL/TLS handled by Replit automatically

3. **Features Ready:**
   - ✅ CV Upload & Analysis
   - ✅ South African Context Analysis (B-BBEE, NQF levels)
   - ✅ ATS Score Calculation
   - ✅ Newsletter Subscription
   - ✅ Job Matching Announcement (Coming Soon)

### API Endpoints:
- `GET /api/health` - System health check
- `POST /api/upload` - CV upload and analysis
- `POST /api/newsletter/subscribe` - Newsletter signup
- `GET /api/latest-cv` - Retrieve latest CV analysis

### Next Steps:
1. Run the SQL commands in Supabase
2. Click "Deploy" in Replit
3. Your CV optimization platform will be live

The platform is production-ready with authentic AI analysis and Supabase database integration.