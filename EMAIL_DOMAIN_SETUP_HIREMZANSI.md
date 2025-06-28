# Email Domain Setup Guide: noreply@hiremzansi.co.za

## Current Status
✅ Email sender changed to: `noreply@hiremzansi.co.za`  
✅ Brevo API key configured and working  
⚠️ Domain verification required for production deployment

## What You Need to Setup

### 1. Domain Authentication in Brevo

To use `noreply@hiremzansi.co.za` as the sender address, you must verify domain ownership in your Brevo account.

**Steps:**
1. Log into your Brevo dashboard
2. Go to **Senders & IP** → **Domains**
3. Click **"Add a domain"**
4. Enter: `hiremzansi.co.za`
5. Brevo will provide DNS records to add

### 2. DNS Records to Add

Brevo will provide specific DNS records like these (exact values will be different):

**DKIM Records (TXT)**
```
brevo-code._domainkey.hiremzansi.co.za
Value: [Brevo will provide the specific DKIM key]
```

**SPF Record (TXT)**
```
hiremzansi.co.za
Value: v=spf1 include:spf.brevo.com ~all
```

**DMARC Record (TXT)**
```
_dmarc.hiremzansi.co.za
Value: v=DMARC1; p=none; rua=mailto:dmarc@hiremzansi.co.za
```

### 3. Where to Add DNS Records

Since you're using `hiremzansi.co.za`, add these records in your domain registrar's DNS management panel:

- **Cloudflare** (if using Cloudflare DNS)
- **Replit Custom Domains** (if managed through Replit)
- **Your domain registrar** (wherever you bought hiremzansi.co.za)

### 4. Verification Process

1. Add the DNS records Brevo provides
2. Wait 24-48 hours for DNS propagation
3. Return to Brevo and click **"Verify Domain"**
4. Once verified, you can send from `noreply@hiremzansi.co.za`

## Current Behavior

**Development Mode:**
- Emails work but show "Brevo sender not verified yet"
- Links are logged to console for testing
- All functionality works for development

**Production Mode:**
- Will fail to send emails until domain is verified
- Brevo requires verified domains for production sending

## Alternative Solutions

### Option A: Use Verified Domain (Recommended)
Complete the domain verification process above.

### Option B: Use Different Sender
If domain verification is complex, you could use:
- `noreply.hiremzansi@atsboost.co.za` (already working)
- Any other verified domain you own

### Option C: Generic Brevo Sender
Use Brevo's default sender (not recommended for brand consistency):
- Sender would appear as your Brevo account email

## Email Templates Affected

All system emails will use the new sender:
- ✉️ User email verification
- ✉️ Password reset emails  
- ✉️ Welcome emails
- ✉️ Career digest newsletters
- ✉️ System notifications

## Testing

You can test the current setup with:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123", "name": "Test User"}'
```

The verification email will be logged to console in development mode, allowing you to test the flow without domain verification.

## Production Checklist

- [ ] Add Brevo DNS records to hiremzansi.co.za domain
- [ ] Wait 24-48 hours for DNS propagation  
- [ ] Verify domain in Brevo dashboard
- [ ] Test email sending in production environment
- [ ] Monitor email deliverability and spam rates

## Support

If you need help with DNS setup:
1. Check your domain registrar's documentation
2. Contact Brevo support for specific DNS values
3. Use online DNS propagation checkers to verify records

The platform is ready to use the new email address once domain verification is complete.