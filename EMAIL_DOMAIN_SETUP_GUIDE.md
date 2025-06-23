# Email Domain Setup Guide for hiremzansi.co.za

## Current Status
Your Hire Mzansi platform has been configured to use your custom domain `hiremzansi.co.za` for email verification links and improved deliverability.

## Changes Made
1. ✅ Updated BASE_URL to use `https://hiremzansi.co.za`
2. ✅ Changed email verification redirects to your custom domain
3. ✅ Modified email sender to use `noreply@hiremzansi.co.za`
4. ✅ Enhanced email headers for better deliverability
5. ✅ Improved email templates to avoid spam triggers

## Critical Setup Required: SendGrid Domain Authentication

To prevent emails from landing in spam folders, you must authenticate your domain with SendGrid:

### Step 1: Access SendGrid Settings
1. Log into your SendGrid dashboard
2. Go to **Settings** → **Sender Authentication**
3. Click **Authenticate Your Domain**

### Step 2: Domain Authentication Setup
1. Select **I'm not using a hosting service**
2. Enter your domain: `hiremzansi.co.za`
3. Choose **Yes** for branded links
4. Click **Next**

### Step 3: Add DNS Records
SendGrid will provide you with DNS records to add to your domain. Add these to your DNS provider:

**CNAME Records** (examples - use the actual values SendGrid provides):
```
em123.hiremzansi.co.za → sendgrid.net
s1._domainkey.hiremzansi.co.za → s1.domainkey.u123.wl.sendgrid.net
s2._domainkey.hiremzansi.co.za → s2.domainkey.u123.wl.sendgrid.net
```

**TXT Record**:
```
hiremzansi.co.za → "v=spf1 include:sendgrid.net ~all"
```

### Step 4: Verify Authentication
1. After adding DNS records, return to SendGrid
2. Click **Verify** to confirm domain ownership
3. Wait for verification (can take up to 48 hours)

### Step 5: Update Sender Identity
1. Go to **Settings** → **Sender Identity** → **Single Sender Verification**
2. Create a verified sender with:
   - From Email: `noreply@hiremzansi.co.za`
   - From Name: `Hire Mzansi`
   - Reply To: `support@hiremzansi.co.za`

## Additional Spam Prevention Measures

### Email Content Best Practices
✅ **Already Implemented:**
- Professional subject line: "Complete Your Hire Mzansi Registration"
- Clear, legitimate content without spam trigger words
- Proper HTML structure with text alternative
- Unsubscribe link included
- Company contact information

### Technical Improvements
✅ **Already Implemented:**
- Disabled click and open tracking (improves reputation)
- Added proper email headers
- Set appropriate priority levels
- Included List-Unsubscribe header

## Testing Your Setup

### 1. Test Email Delivery
Create a test account with different email providers:
- Gmail
- Outlook
- Yahoo
- Local South African providers

### 2. Check Spam Scores
Use tools like:
- Mail-tester.com
- SendGrid's inbox testing tools
- Gmail's postmaster tools

### 3. Monitor Reputation
- Check SendGrid reputation dashboard
- Monitor delivery rates
- Watch for bounce and complaint rates

## Troubleshooting

### If Emails Still Go to Spam:
1. **Verify domain authentication is complete**
2. **Check DNS propagation** (use dig or nslookup)
3. **Warm up your IP** by sending small volumes initially
4. **Request users to whitelist** your domain
5. **Monitor feedback loops** in SendGrid

### Common Issues:
- **DNS not propagated**: Wait 24-48 hours after adding records
- **SPF/DKIM failures**: Verify DNS records are correct
- **IP reputation**: New IPs need warming up period
- **Content filtering**: Avoid promotional language in transactional emails

## Next Steps
1. Complete SendGrid domain authentication
2. Test email delivery across multiple providers
3. Monitor delivery rates in SendGrid dashboard
4. Consider implementing DMARC policy for additional security

## Support
If you need help with DNS configuration or encounter issues:
- Contact your domain registrar for DNS support
- Use SendGrid's support documentation
- Check the platform logs for email delivery status

---
**Status**: Email verification now redirects to hiremzansi.co.za correctly. Domain authentication required for optimal deliverability.