# Quick Start: Deploy to Vercel with Supabase

## 🚀 5-Minute Deployment Guide

### Step 1: Supabase Setup (2 minutes)
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from Settings > API
3. Go to SQL Editor and run the schema from `COMPLETE_SUPABASE_SETUP.md`

### Step 2: Vercel Deployment (3 minutes)
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project" and import your repository
3. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
4. Add environment variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   NODE_ENV=production
   ```
5. Click "Deploy"

### Step 3: Test Your Deployment
1. Visit your Vercel URL
2. Test the health endpoint: `https://your-app.vercel.app/api/health`
3. Try uploading a CV to test the analysis feature

## ✅ Success Checklist
- [ ] Application loads without errors
- [ ] API health endpoint responds
- [ ] CV upload and analysis works
- [ ] Supabase connection is active

## 🔧 Troubleshooting
- **Build fails**: Check build logs and verify all dependencies
- **API errors**: Verify environment variables are set correctly
- **Database issues**: Ensure Supabase schema is properly created

## 📚 Next Steps
- Add custom domain
- Configure additional services (email, SMS, payments)
- Set up monitoring and analytics
- Implement advanced features

Your Hire Mzansi CV optimization platform is now live! 🎉