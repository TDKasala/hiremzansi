# Vercel Deployment Guide for Hire Mzansi

## Prerequisites Completed
- ✅ Database schema applied to Supabase
- ✅ Build configuration ready
- ✅ Environment variables configured

## Step 1: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)
1. Push your code to GitHub repository
2. Go to https://vercel.com/dashboard
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Option B: Deploy via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Step 2: Configure Environment Variables in Vercel

Go to your Vercel project dashboard → Settings → Environment Variables

Add these variables:

### Required Database Variables
```
DATABASE_URL = postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL = https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY = [YOUR-ANON-KEY]
```

### Required API Keys
```
OPENAI_API_KEY = [YOUR-OPENAI-KEY]
SESSION_SECRET = [GENERATE-32-CHAR-SECRET]
```

### Optional Services
```
TWILIO_ACCOUNT_SID = [YOUR-TWILIO-SID]
TWILIO_AUTH_TOKEN = [YOUR-TWILIO-TOKEN]
TWILIO_PHONE_NUMBER = [YOUR-TWILIO-NUMBER]
SENDGRID_API_KEY = [YOUR-SENDGRID-KEY]
```

## Step 3: Update Your Values

Replace these placeholders with your actual Supabase values:

1. **Get from Supabase Dashboard → Settings → API:**
   - Project URL: `https://[your-project-ref].supabase.co`
   - Anon/Public Key: `eyJ...` (starts with eyJ)

2. **Get from Supabase Dashboard → Settings → Database:**
   - Connection string: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

3. **Generate Session Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Test Deployment

1. After deployment, visit your Vercel URL
2. Test key features:
   - User registration/login
   - CV upload and analysis
   - Job matching (now free for job seekers)
   - Pricing page displays correctly

## Step 5: Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add `hiremzansi.co.za`
3. Configure DNS records as shown
4. Enable SSL (automatic)

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL format is correct
- Check Supabase project is not paused
- Ensure password has no special characters that need URL encoding

### Build Failures
- Check all dependencies are in package.json
- Verify TypeScript types are correct
- Review build logs in Vercel dashboard

### Runtime Errors
- Check environment variables are set
- Review function logs in Vercel dashboard
- Ensure API routes are working

## Post-Deployment Checklist

- [ ] Database connection working
- [ ] User authentication functional
- [ ] CV upload and analysis working
- [ ] Job matching service operational
- [ ] Pricing pages display correctly
- [ ] Free job matching for all users
- [ ] WhatsApp integration (if configured)
- [ ] Email notifications (if configured)

## Monitor and Scale

1. **Monitor Usage:**
   - Vercel Analytics
   - Supabase Database usage
   - API response times

2. **Scale as Needed:**
   - Upgrade Vercel plan for more bandwidth
   - Upgrade Supabase plan for more database capacity
   - Consider CDN for static assets

Your Hire Mzansi platform is now ready for production deployment!