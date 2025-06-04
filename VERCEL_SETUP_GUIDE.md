# Complete Vercel Setup Guide for Hire Mzansi

## Prerequisites
- GitHub repository with your code
- Working Supabase database
- Vercel account (free tier available)

## Step 1: Prepare Your Project for Vercel

### Update package.json scripts
Your current scripts are already configured:
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

### Verify vercel.json configuration
Your `vercel.json` is already set up correctly:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ]
}
```

## Step 2: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the framework

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Node.js Version: 18.x or 20.x

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel --prod
   ```

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to Settings → Environment Variables and add:

### Required Database Variables
```
DATABASE_URL = postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
SUPABASE_URL = https://[project-ref].supabase.co
SUPABASE_ANON_KEY = [your-anon-key]
```

### Required Authentication
```
SESSION_SECRET = [generate-32-char-random-string]
```

### API Services
```
OPENAI_API_KEY = [your-openai-key]
```

### Optional Services
```
TWILIO_ACCOUNT_SID = [your-twilio-sid]
TWILIO_AUTH_TOKEN = [your-twilio-token]
TWILIO_PHONE_NUMBER = [your-twilio-number]
SENDGRID_API_KEY = [your-sendgrid-key]
```

## Step 4: Generate Required Secrets

### Session Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database URL Format
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## Step 5: Test Deployment

1. **After deployment, check:**
   - Build logs for any errors
   - Function logs for runtime errors
   - Database connectivity

2. **Test key features:**
   - User registration/login
   - CV upload functionality
   - Job matching (free for all users)
   - Pricing page displays correctly

## Step 6: Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to Settings → Domains
   - Add `hiremzansi.co.za`
   - Follow DNS configuration instructions

2. **DNS Records:**
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

## Step 7: Environment-Specific Configuration

### Production Optimizations
```javascript
// In your server/index.ts, add production checks
if (process.env.NODE_ENV === 'production') {
  // Enable compression, security headers, etc.
}
```

### Database Connection Pooling
Your current setup handles this with:
```javascript
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Troubleshooting Common Issues

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Review build logs in Vercel dashboard

### Database Connection Issues
- Verify DATABASE_URL format is correct
- Check Supabase project is not paused
- Ensure SSL settings match Supabase requirements

### Function Timeouts
- Vercel has 10-second timeout for Hobby plan
- Optimize database queries and AI calls
- Consider upgrading for longer timeouts

### Static Assets
- Ensure client build outputs to correct directory
- Check routing configuration in vercel.json
- Verify asset paths are correct

## Monitoring and Scaling

### Performance Monitoring
- Use Vercel Analytics
- Monitor function execution time
- Track database query performance

### Scaling Considerations
- Upgrade Vercel plan for higher limits
- Optimize database queries with indexes
- Consider CDN for static assets

## Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] User authentication works
- [ ] CV upload and analysis functional
- [ ] Job matching operates (free for all users)
- [ ] Database connections stable
- [ ] Environment variables set correctly
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Performance monitoring enabled

## Deployment Commands Summary

```bash
# Option 1: GitHub deployment (recommended)
git push origin main
# Then import in Vercel dashboard

# Option 2: Direct deployment
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]
```

Your Hire Mzansi platform will be production-ready once these steps are completed with your working Supabase database credentials.