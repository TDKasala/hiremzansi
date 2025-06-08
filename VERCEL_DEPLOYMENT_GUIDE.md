# Vercel Deployment Guide for Hire Mzansi CV Optimization Platform

## Prerequisites

1. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)
2. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
3. **Environment Variables**: Prepare your API keys and configuration

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key
3. Go to Settings > API to find your keys

### 1.2 Set Up Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL to create all necessary tables and functions

### 1.3 Configure Storage (Optional)
1. Go to Storage in Supabase dashboard
2. Create a bucket named "cv-files" for CV uploads
3. Set appropriate policies for file access

## Step 2: Environment Variables

### 2.1 Required Environment Variables
Set these in your Vercel project settings:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Session Security
SESSION_SECRET=b6a9f6e0115cff0c5d88acc4bff804540a3662e2de2d6ea50429ddc5a811d6046208e88e115a8cc8f3d8bf9f881ee95fe3448e72cffced73166b68af3022bd52

# AI Services (Choose one or both)
XAI_API_KEY=your-xai-api-key
OPENAI_API_KEY=your-openai-api-key

# Application Settings
NODE_ENV=production
BASE_URL=https://your-domain.vercel.app

# Optional Services
SENDGRID_API_KEY=your-sendgrid-api-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### 2.2 Setting Variables in Vercel
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with appropriate values
4. Set environment to "Production" and "Preview"

## Step 3: Deployment Configuration

### 3.1 Verify Configuration Files
Ensure these files are properly configured:

- `vercel.json` - Routing and build configuration
- `api/index.ts` - Serverless API handler
- `package.json` - Dependencies and scripts

### 3.2 Build Settings
The following settings should be configured in Vercel:

- **Framework Preset**: Vite
- **Build Command**: `vite build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Step 4: Deploy to Vercel

### 4.1 Connect Repository
1. Connect your GitHub repository to Vercel
2. Import the project
3. Configure the build settings as above

### 4.2 Deploy
1. Click "Deploy" to start the deployment
2. Monitor the build logs for any errors
3. Once deployed, test the application

## Step 5: Post-Deployment Testing

### 5.1 Health Check
Test the API health endpoint:
```bash
curl https://your-domain.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-08T15:40:00.000Z",
  "environment": "production",
  "supabase": true
}
```

### 5.2 CV Upload Test
Test CV upload functionality:
1. Visit your deployed site
2. Upload a test CV file
3. Verify analysis results are returned
4. Check Supabase dashboard for stored data

### 5.3 Database Connection
Verify Supabase connection:
1. Check application logs in Vercel
2. Verify data is being stored in Supabase tables
3. Test newsletter subscription functionality

## Step 6: Domain Configuration (Optional)

### 6.1 Custom Domain
1. Go to Settings > Domains in Vercel
2. Add your custom domain
3. Configure DNS records as instructed
4. Update BASE_URL environment variable

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs for missing dependencies
   - Verify all imports are correct
   - Ensure TypeScript types are properly defined

2. **API Errors**
   - Verify environment variables are set
   - Check Supabase connection and credentials
   - Monitor function logs in Vercel

3. **Database Issues**
   - Verify Supabase schema is properly created
   - Check Row Level Security policies
   - Ensure correct table names and columns

4. **File Upload Issues**
   - Verify multer configuration
   - Check file size limits
   - Ensure proper MIME type handling

### Monitoring

1. **Vercel Analytics**: Monitor performance and usage
2. **Supabase Logs**: Check database operations
3. **Error Tracking**: Set up error monitoring (Sentry, etc.)

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to repository
2. **CORS**: Properly configure CORS for your domain
3. **Rate Limiting**: Consider implementing rate limiting for API endpoints
4. **File Validation**: Ensure thorough file validation for uploads

## Performance Optimization

1. **Caching**: Configure appropriate caching headers
2. **Image Optimization**: Use Vercel's image optimization
3. **Bundle Analysis**: Monitor bundle size and optimize
4. **Database Indexing**: Ensure proper database indexes

This deployment should provide a fully functional CV optimization platform with Supabase backend integration.