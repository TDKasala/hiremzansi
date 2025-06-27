# Production Deployment Guide - Hire Mzansi

## Prerequisites (Required API Keys)

To launch Hire Mzansi in production, you need these API keys:

### 1. Essential Services
- **XAI_API_KEY**: For AI-powered CV analysis (core feature)
- **SENDGRID_API_KEY**: For email verification and notifications
- **SESSION_SECRET**: Secure random string for session encryption

### 2. Optional Services
- **OPENAI_API_KEY**: Fallback AI service for reliability
- **TWILIO_ACCOUNT_SID**: For WhatsApp upload feature
- **TWILIO_AUTH_TOKEN**: For WhatsApp upload feature

## Deployment Steps

### Step 1: Run Database Migration

First, add the referral_code column to enable full referral system:

```sql
-- Execute this in your production database
\i add-referral-code-migration.sql
```

This adds:
- `referral_code` column to users table
- Generates codes for existing users
- Creates index for performance

### Step 2: Configure Environment Variables

Set these in your Replit deployment:

```bash
NODE_ENV=production
DATABASE_URL=your_supabase_postgresql_url
SESSION_SECRET=your_secure_random_string_32_chars_min
XAI_API_KEY=your_xai_api_key
SENDGRID_API_KEY=your_sendgrid_api_key
OPENAI_API_KEY=your_openai_api_key (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid (optional)
TWILIO_AUTH_TOKEN=your_twilio_token (optional)
```

### Step 3: Deploy to Replit

1. Click the "Deploy" button in Replit
2. Configure your custom domain (hiremzansi.co.za)
3. Enable HTTPS
4. Set environment variables in deployment settings

### Step 4: Verify Production Features

Test these core functions:
- [ ] User registration and email verification
- [ ] CV upload and AI analysis
- [ ] Referral link generation
- [ ] Job posting and matching
- [ ] Admin dashboard access
- [ ] WhatsApp upload (if enabled)

## Production-Ready Features

### ✅ Core Platform (Ready)
- User authentication with database sessions
- CV upload and AI-powered analysis
- ATS keyword optimization
- South African context awareness
- Job posting and matching system
- Referral program with tracking
- Admin dashboard with full management
- Interview practice tool
- Mobile-responsive design
- SEO optimization

### ✅ AI Integration (Ready)
- Primary: xAI Grok-2-1212 (131K context)
- Fallback: OpenAI GPT-4o
- South African job market awareness
- B-BBEE compliance analysis
- Skills gap identification

### ✅ Email System (Ready)
- SendGrid integration
- Email verification flow
- Career digest notifications
- Spam folder prevention

### ✅ Security (Production-Ready)
- Scrypt password hashing
- Session-based authentication
- CSRF protection
- SQL injection prevention
- XSS protection
- Secure headers

## Post-Deployment Checklist

1. **Domain Configuration**
   - [ ] SSL certificate active
   - [ ] DNS pointing to Replit deployment
   - [ ] Custom domain working

2. **Feature Testing**
   - [ ] User signup flow complete
   - [ ] Email verification working
   - [ ] CV analysis generating results
   - [ ] Admin login functional

3. **Monitoring Setup**
   - [ ] Error tracking active
   - [ ] Database performance monitored
   - [ ] Email delivery rates tracked

## Support and Maintenance

### Daily Monitoring
- Check `/api/health` endpoint
- Monitor user registration metrics
- Track CV analysis success rates
- Review referral system performance

### Weekly Tasks
- Review email delivery rates
- Check database performance
- Monitor AI API usage
- Update job market data

## Troubleshooting

### Common Issues
1. **Email verification not working**: Check SendGrid API key and domain authentication
2. **CV analysis failing**: Verify XAI/OpenAI API keys and quotas
3. **Database connection errors**: Check Supabase connection string
4. **Session issues**: Verify SESSION_SECRET is set and secure

### Emergency Contacts
- Database: Supabase support
- Email: SendGrid support
- AI Services: xAI/OpenAI support
- Domain: Your registrar support

---

**Status**: Platform is production-ready. Need API keys for full functionality.
**Launch Readiness**: 95% - Waiting for environment configuration