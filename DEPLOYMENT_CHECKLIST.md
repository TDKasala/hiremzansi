# Vercel + Supabase Deployment Checklist

## Pre-Deployment Setup

### ✅ 1. Supabase Project Setup
- [ ] Create new Supabase project at [supabase.com](https://supabase.com)
- [ ] Note down project URL and anon key from Settings > API
- [ ] Run database schema from `COMPLETE_SUPABASE_SETUP.md`
- [ ] Create storage bucket "cv-files" for file uploads
- [ ] Configure Row Level Security (RLS) policies

### ✅ 2. Environment Variables Preparation
- [ ] Supabase Configuration
  - [ ] `SUPABASE_URL=https://your-project.supabase.co`
  - [ ] `SUPABASE_ANON_KEY=your-anon-key`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`

- [ ] Application Security
  - [ ] `SESSION_SECRET=32-character-random-string`
  - [ ] `NODE_ENV=production`

- [ ] AI Services (Optional)
  - [ ] `OPENAI_API_KEY=sk-...`
  - [ ] `XAI_API_KEY=xai-...`

- [ ] Communication Services (Optional)
  - [ ] `SENDGRID_API_KEY=SG...`
  - [ ] `TWILIO_ACCOUNT_SID=AC...`
  - [ ] `TWILIO_AUTH_TOKEN=...`

### ✅ 3. Code Preparation
- [ ] Verify `vercel.json` configuration
- [ ] Check `package.json` build scripts
- [ ] Ensure `shared/supabase.ts` uses environment variables
- [ ] Test local build: `npm run build`

## Vercel Deployment Steps

### ✅ 4. Connect to Vercel
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign up/Login with GitHub
- [ ] Click "New Project"
- [ ] Import your GitHub repository

### ✅ 5. Configure Build Settings
- [ ] Framework Preset: `Vite`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist/public`
- [ ] Install Command: `npm install`
- [ ] Root Directory: `./` (leave empty)

### ✅ 6. Set Environment Variables
- [ ] Go to Project Settings > Environment Variables
- [ ] Add all required variables from Step 2
- [ ] Set environment to "Production" and "Preview"
- [ ] Click "Save"

### ✅ 7. Deploy
- [ ] Click "Deploy" button
- [ ] Monitor build logs for errors
- [ ] Wait for deployment to complete
- [ ] Note the deployment URL

## Post-Deployment Testing

### ✅ 8. Health Check
- [ ] Test API health endpoint: `https://your-app.vercel.app/api/health`
- [ ] Verify response includes status, timestamp, and Supabase connection

### ✅ 9. Functionality Testing
- [ ] Test CV upload and analysis
- [ ] Test newsletter subscription
- [ ] Verify Supabase data storage
- [ ] Check static file serving

### ✅ 10. Performance Testing
- [ ] Test page load times
- [ ] Verify API response times
- [ ] Check for any console errors
- [ ] Test on mobile devices

## Troubleshooting Common Issues

### ❌ Build Failures
- Check build logs for missing dependencies
- Verify all imports are correct
- Ensure TypeScript types are properly defined

### ❌ API Errors
- Verify environment variables are set correctly
- Check Supabase connection and credentials
- Monitor function logs in Vercel dashboard

### ❌ Database Issues
- Verify Supabase schema is properly created
- Check Row Level Security policies
- Ensure correct table names and columns

### ❌ File Upload Issues
- Verify multer configuration
- Check file size limits
- Ensure proper MIME type handling

## Security Checklist

### ✅ 11. Security Verification
- [ ] Environment variables are not exposed in client code
- [ ] CORS is properly configured
- [ ] API endpoints are protected where needed
- [ ] File uploads are validated
- [ ] HTTPS is enforced

### ✅ 12. Monitoring Setup
- [ ] Set up Vercel Analytics
- [ ] Configure error tracking (Sentry recommended)
- [ ] Set up Supabase monitoring
- [ ] Configure performance monitoring

## Final Steps

### ✅ 13. Custom Domain (Optional)
- [ ] Go to Settings > Domains in Vercel
- [ ] Add your custom domain
- [ ] Configure DNS records
- [ ] Update BASE_URL environment variable

### ✅ 14. Documentation
- [ ] Update README with deployment information
- [ ] Document environment variables
- [ ] Create troubleshooting guide
- [ ] Set up team access if needed

## Success Criteria

Your deployment is successful when:
- ✅ Application loads without errors
- ✅ API endpoints respond correctly
- ✅ Supabase connection is working
- ✅ File uploads function properly
- ✅ All core features are operational
- ✅ Performance is acceptable
- ✅ Security measures are in place

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Supabase Community](https://github.com/supabase/supabase/discussions)