# Production Deployment Guide - Hire Mzansi

## Overview
This guide provides step-by-step instructions for deploying Hire Mzansi to production using Vercel and Supabase.

## Pre-Deployment Requirements

### 1. Accounts Required
- GitHub account with repository access
- Vercel account (free tier sufficient)
- Supabase account (free tier sufficient)

### 2. Repository Preparation
Ensure your code is pushed to GitHub with all latest changes including:
- Updated `vercel.json` configuration
- Production-ready `api/index.ts` handler
- Supabase database schema file
- Environment variable documentation

## Step 1: Supabase Database Setup

### Create Supabase Project
1. Visit [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Select your organization
4. Enter project details:
   - Name: `hire-mzansi-production`
   - Database Password: Generate strong password (save it)
   - Region: Choose closest to your users (e.g., Cape Town)
5. Click "Create new project" and wait for initialization

### Configure Database
1. Go to SQL Editor in your Supabase project
2. Copy and paste the entire contents of `supabase-deployment-ready.sql`
3. Click "Run" to execute the schema creation
4. Verify tables are created in the Table Editor

### Collect Database Credentials
Navigate to Settings → Database and collect:
- Connection string (under "Connection pooling")
- Project URL (Settings → API)
- Anon public key (Settings → API)
- Service role key (Settings → API - keep this secret)

## Step 2: Vercel Deployment

### Connect Repository
1. Visit [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing Hire Mzansi

### Configure Build Settings
Vercel should auto-detect settings, but verify:
- Build Command: `vite build`
- Output Directory: `dist`
- Install Command: `npm install`
- Node.js Version: 18.x or 20.x

### Add Environment Variables
In Vercel project settings → Environment Variables, add:

**Required Variables:**
```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
SESSION_SECRET=[generate-32-char-random-string]
NODE_ENV=production
REPLIT_DOMAINS=[your-vercel-app].vercel.app
```

**PostgreSQL Direct Connection:**
```
PGHOST=aws-0-[region].pooler.supabase.com
PGPORT=6543
PGDATABASE=postgres
PGUSER=postgres.[project-ref]
PGPASSWORD=[your-database-password]
```

### Deploy Application
1. Click "Deploy" in Vercel
2. Wait for build completion (usually 2-3 minutes)
3. Your app will be available at `https://[project-name].vercel.app`

## Step 3: Post-Deployment Configuration

### Test Core Functionality
1. Visit your deployed application
2. Test CV upload feature
3. Test newsletter subscription
4. Verify database connectivity via health check at `/api/health`

### Configure Custom Domain (Optional)
1. In Vercel project settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `REPLIT_DOMAINS` environment variable

### Enable Production Features
1. Configure email service (SendGrid recommended)
2. Set up payment processing (Stripe)
3. Configure AI services (OpenAI)
4. Set up monitoring and analytics

## Step 4: Security and Performance

### Security Checklist
- [ ] All API keys encrypted in Vercel
- [ ] RLS policies active in Supabase
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] CORS properly configured
- [ ] Database connections use SSL
- [ ] Session secrets are cryptographically secure

### Performance Optimization
- [ ] Static assets cached via Vercel CDN
- [ ] Database indexes created
- [ ] Connection pooling enabled
- [ ] Image optimization enabled
- [ ] Edge functions configured if needed

## Step 5: Monitoring and Maintenance

### Set Up Monitoring
1. Enable Vercel Analytics
2. Configure Supabase monitoring
3. Set up error tracking
4. Monitor performance metrics

### Backup Strategy
1. Enable Supabase automatic backups
2. Configure point-in-time recovery
3. Test backup restoration process
4. Document recovery procedures

## Troubleshooting Common Issues

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Review build logs for specific errors
- Ensure TypeScript compilation succeeds

### Database Connection Issues
- Verify DATABASE_URL format exactly matches Supabase
- Check connection pooling is enabled
- Ensure SSL configuration is correct
- Test connection from Supabase dashboard

### API Endpoint Errors
- Check environment variables are set correctly
- Verify CORS configuration
- Test endpoints individually
- Review Vercel function logs

### Performance Issues
- Monitor database query performance
- Check connection pool usage
- Optimize slow queries
- Configure appropriate caching

## Environment Variable Templates

### Development (.env.local)
```
DATABASE_URL=postgresql://localhost:5432/hiremzansi_dev
SESSION_SECRET=dev-secret-key-minimum-32-characters
NODE_ENV=development
REPLIT_DOMAINS=localhost:5000
```

### Production (Vercel)
```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
SESSION_SECRET=[secure-32-char-random-string]
NODE_ENV=production
REPLIT_DOMAINS=[your-app].vercel.app
SENDGRID_API_KEY=[optional-email-service]
STRIPE_SECRET_KEY=[optional-payments]
VITE_STRIPE_PUBLIC_KEY=[optional-payments]
OPENAI_API_KEY=[optional-ai-features]
```

## Success Verification

### Deployment Success Indicators
1. Build completes without errors
2. Application loads at deployment URL
3. Health check endpoint returns 200 status
4. Database queries execute successfully
5. CV upload functionality works
6. Newsletter subscription processes

### Next Steps After Deployment
1. Configure custom domain
2. Set up email service integration
3. Enable payment processing
4. Configure AI services for CV analysis
5. Set up monitoring and analytics
6. Plan user onboarding strategy

Your Hire Mzansi application is now ready for production use with enterprise-grade infrastructure!