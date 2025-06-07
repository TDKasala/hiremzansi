# Complete Environment Variables for Hire Mzansi

## Required Variables (Core Platform)

### Database Configuration
```bash
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# PostgreSQL Direct Connection
PGHOST=aws-0-[region].pooler.supabase.com
PGPORT=6543
PGDATABASE=postgres
PGUSER=postgres.[project-ref]
PGPASSWORD=[your-database-password]
```

### Application Security
```bash
SESSION_SECRET=[32-character-random-string]
NODE_ENV=production
REPLIT_DOMAINS=[your-app].vercel.app
```

## AI Services (CV Analysis & Optimization)

### OpenAI (Primary AI Provider)
```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
```

### xAI (Grok - Alternative AI Provider)
```bash
XAI_API_KEY=xai-...
XAI_API_URL=https://api.x.ai/v1
XAI_MODEL=grok-beta
```

### Anthropic Claude (Backup AI Provider)
```bash
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

### Together AI (Cost-effective option)
```bash
TOGETHER_API_KEY=...
TOGETHER_MODEL=meta-llama/Llama-2-70b-chat-hf
```

## Communication Services

### Twilio (SMS & WhatsApp)
```bash
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+27...
TWILIO_WHATSAPP_NUMBER=whatsapp:+27...
```

### SendGrid (Email Services)
```bash
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@hiremzansi.com
SENDGRID_FROM_NAME=Hire Mzansi
```

### Resend (Alternative Email Service)
```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@hiremzansi.com
```

## Payment Processing

### Stripe (Primary Payment Provider)
```bash
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_ESSENTIAL=price_...
STRIPE_PRICE_ID_PROFESSIONAL=price_...
```

### PayFast (South African Payment Gateway)
```bash
PAYFAST_MERCHANT_ID=...
PAYFAST_MERCHANT_KEY=...
PAYFAST_PASSPHRASE=...
PAYFAST_SANDBOX=false
```

### Ozow (South African EFT)
```bash
OZOW_API_KEY=...
OZOW_PRIVATE_KEY=...
OZOW_SITE_CODE=...
OZOW_COUNTRY_CODE=ZA
```

## File Storage & CDN

### Cloudinary (Image/Document Storage)
```bash
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_PRESET=hire_mzansi_cvs
```

### AWS S3 (Alternative Storage)
```bash
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=af-south-1
AWS_S3_BUCKET=hire-mzansi-files
```

## Analytics & Monitoring

### Google Analytics
```bash
VITE_GA_TRACKING_ID=G-...
GA_MEASUREMENT_ID=G-...
```

### Mixpanel (Event Tracking)
```bash
MIXPANEL_TOKEN=...
VITE_MIXPANEL_TOKEN=...
```

### Sentry (Error Tracking)
```bash
SENTRY_DSN=https://...
VITE_SENTRY_DSN=https://...
SENTRY_ORG=hire-mzansi
SENTRY_PROJECT=hire-mzansi-web
```

### LogRocket (Session Recording)
```bash
VITE_LOGROCKET_APP_ID=...
```

## Job Board Integration

### LinkedIn API
```bash
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_REDIRECT_URI=https://hiremzansi.com/auth/linkedin/callback
```

### Indeed API
```bash
INDEED_PUBLISHER_ID=...
INDEED_API_TOKEN=...
```

### CareerJet API
```bash
CAREERJET_LOCALE=en_ZA
CAREERJET_API_KEY=...
```

### PNet (South African Job Site)
```bash
PNET_API_KEY=...
PNET_PARTNER_ID=...
```

## Document Processing

### PDF Processing
```bash
PDF_API_KEY=...
ADOBE_PDF_SERVICES_CLIENT_ID=...
ADOBE_PDF_SERVICES_CLIENT_SECRET=...
```

### OCR Services (Tesseract alternatives)
```bash
GOOGLE_VISION_API_KEY=...
AZURE_COMPUTER_VISION_KEY=...
AZURE_COMPUTER_VISION_ENDPOINT=...
```

## Social Media & Marketing

### Meta (Facebook/Instagram)
```bash
META_APP_ID=...
META_APP_SECRET=...
META_ACCESS_TOKEN=...
```

### Twitter/X API
```bash
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_TOKEN_SECRET=...
```

### Google Ads
```bash
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_DEVELOPER_TOKEN=...
```

## Local South African Services

### South African ID Verification
```bash
HOME_AFFAIRS_API_KEY=...
TRUECALLER_API_KEY=...
```

### Banking Integration (South African)
```bash
ABSA_API_KEY=...
FNB_API_KEY=...
STANDARD_BANK_API_KEY=...
CAPITEC_API_KEY=...
```

### Location Services
```bash
GOOGLE_MAPS_API_KEY=...
VITE_GOOGLE_MAPS_API_KEY=...
```

## Development & Testing

### Development Environment
```bash
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

### Testing Services
```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
CYPRESS_BASE_URL=http://localhost:3000
```

## Security & Compliance

### Rate Limiting
```bash
REDIS_URL=redis://...
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### CORS Configuration
```bash
CORS_ORIGIN=https://hiremzansi.com,https://www.hiremzansi.com
```

### SSL/TLS
```bash
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

## Webhook Endpoints

### Stripe Webhooks
```bash
STRIPE_WEBHOOK_ENDPOINT=/api/webhooks/stripe
```

### Twilio Webhooks
```bash
TWILIO_WEBHOOK_ENDPOINT=/api/webhooks/twilio
```

### SendGrid Webhooks
```bash
SENDGRID_WEBHOOK_ENDPOINT=/api/webhooks/sendgrid
```

## Priority Environment Variables for Launch

### Tier 1 (Essential - Must Have)
- All Database variables
- SESSION_SECRET
- NODE_ENV
- OPENAI_API_KEY
- SENDGRID_API_KEY
- STRIPE keys (if payments enabled)

### Tier 2 (Important - Should Have)
- TWILIO credentials (for SMS/WhatsApp)
- CLOUDINARY credentials (for file storage)
- Google Analytics
- SENTRY_DSN (error tracking)

### Tier 3 (Nice to Have - Can Add Later)
- Alternative AI providers
- Social media integrations
- Advanced analytics
- South African banking APIs

## Environment-Specific Files

### .env.local (Development)
```bash
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/hiremzansi_dev
OPENAI_API_KEY=sk-...
SENDGRID_API_KEY=SG...
```

### .env.production (Vercel)
All production values with live API keys and production database URLs.

### .env.example (Repository Template)
```bash
# Database
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
OPENAI_API_KEY=your_openai_api_key

# Communication
SENDGRID_API_KEY=your_sendgrid_api_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

This comprehensive list covers all potential integrations for your South African CV optimization platform.