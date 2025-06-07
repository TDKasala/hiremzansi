# Vercel Deployment Guide with Supabase

This guide walks you through deploying Hire Mzansi to Vercel with Supabase as the database.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project name: `hire-mzansi`
5. Enter a strong database password
6. Select region closest to your users (e.g., Cape Town)
7. Click "Create new project"

### 1.2 Get Database Connection Details
1. Go to Settings → Database
2. Copy the Connection string under "Connection pooling"
3. Replace `[YOUR-PASSWORD]` with your database password
4. Save this as your `DATABASE_URL`

### 1.3 Set Up Database Schema
1. Go to SQL Editor in Supabase
2. Run the contents of `supabase-schema-corrected.sql` to create tables
3. Run the contents of `supabase-rls-policies.sql` to set up security

### 1.4 Get API Keys
1. Go to Settings → API
2. Copy the Project URL (SUPABASE_URL)
3. Copy the anon public key (SUPABASE_ANON_KEY)
4. Copy the service_role secret key (SUPABASE_SERVICE_ROLE_KEY)

## Step 2: Configure Environment Variables

### 2.1 Required Environment Variables
Set these in your Vercel project settings:

```bash
# Database
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# PostgreSQL Direct Connection
PGHOST=aws-0-[region].pooler.supabase.com
PGPORT=6543
PGDATABASE=postgres
PGUSER=postgres.[project-ref]
PGPASSWORD=your_database_password

# Application
SESSION_SECRET=generate_random_32_character_string
NODE_ENV=production
REPLIT_DOMAINS=your-app-name.vercel.app
```

### 2.2 Optional Environment Variables
```bash
# Email (for contact forms)
SENDGRID_API_KEY=your_sendgrid_key

# Payments (if enabling paid features)
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# AI Services (for CV analysis)
OPENAI_API_KEY=your_openai_key
```

## Step 3: Deploy to Vercel

### 3.1 Connect Repository
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository

### 3.2 Configure Build Settings
Vercel should auto-detect the settings, but verify:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 3.3 Add Environment Variables
1. In the Vercel project settings
2. Go to Environment Variables
3. Add all the variables from Step 2.1
4. Make sure to mark sensitive keys as "Encrypted"

### 3.4 Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## Step 4: Post-Deployment Setup

### 4.1 Test Database Connection
1. Visit your deployed app
2. Try the CV upload feature
3. Check Supabase dashboard for data

### 4.2 Set Up Custom Domain (Optional)
1. In Vercel project settings
2. Go to Domains
3. Add your custom domain
4. Follow DNS configuration instructions

### 4.3 Configure Authentication
Update the REPLIT_DOMAINS environment variable with your actual domain:
```bash
REPLIT_DOMAINS=your-actual-domain.com,your-app-name.vercel.app
```

## Step 5: Database Migrations

If you need to update the database schema:

1. Update the SQL files in your repository
2. Run migrations in Supabase SQL Editor
3. Or use the migration scripts in the `migrations/` folder

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DATABASE_URL format
   - Check Supabase project is not paused
   - Ensure connection pooling is enabled

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check for TypeScript errors

3. **Environment Variables Not Loading**
   - Ensure variables are set in Vercel dashboard
   - Check variable names match exactly
   - Redeploy after adding new variables

4. **CORS Issues**
   - Add your domain to Supabase allowed origins
   - Check API endpoint configurations

### Performance Optimization

1. **Enable Edge Functions** (if needed)
2. **Configure Caching** for static assets
3. **Set up Monitoring** in Vercel
4. **Configure Supabase Edge Functions** for heavy operations

## Security Checklist

- [ ] All sensitive keys are encrypted in Vercel
- [ ] RLS policies are enabled in Supabase
- [ ] HTTPS is enforced
- [ ] API rate limiting is configured
- [ ] Database connection uses SSL
- [ ] Session secrets are properly generated
- [ ] CORS is properly configured

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs and metrics
3. Verify environment variables
4. Test database connectivity
5. Check network/firewall settings

Your Hire Mzansi application should now be successfully deployed on Vercel with Supabase!