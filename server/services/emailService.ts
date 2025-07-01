import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

// Initialize Brevo (formerly Sendinblue) mail service
let apiInstance: TransactionalEmailsApi;
let emailServiceEnabled = false;

// Check if Brevo API key is available
const brevoApiKey = process.env.BREVO_API_KEY || process.env.SENDGRID_API_KEY; // Fallback to SendGrid key for smooth transition

if (brevoApiKey) {
  // Initialize Brevo API with API key
  apiInstance = new TransactionalEmailsApi();
  apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);
  emailServiceEnabled = true;
  console.log('Brevo email service initialized successfully');
} else {
  console.warn('BREVO_API_KEY not found in environment variables. Email service will be disabled.');
}

// Professional email template base function
function createProfessionalEmailTemplate(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Hire Mzansi</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
      padding: 40px 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .logo {
      max-width: 180px;
      height: auto;
      margin-bottom: 20px;
    }
    .email-body {
      padding: 40px 30px;
      background-color: #ffffff;
    }
    .content-section {
      margin-bottom: 25px;
    }
    .email-footer {
      background-color: #f8fafc;
      padding: 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    h1 { 
      color: #111827; 
      font-size: 28px; 
      font-weight: 700; 
      margin-bottom: 15px;
      line-height: 1.2;
    }
    h2 { 
      color: #374151; 
      font-size: 22px; 
      font-weight: 600; 
      margin: 25px 0 15px 0;
    }
    h3 { 
      color: #4b5563; 
      font-size: 18px; 
      font-weight: 600; 
      margin: 20px 0 10px 0;
    }
    p { 
      color: #6b7280; 
      font-size: 16px; 
      margin-bottom: 15px; 
      line-height: 1.7;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: #ffffff !important;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .secondary-button {
      display: inline-block;
      background: transparent;
      color: #3b82f6 !important;
      padding: 14px 28px;
      text-decoration: none;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      margin: 10px 5px;
    }
    .footer-links {
      margin: 20px 0;
    }
    .footer-links a {
      color: #6b7280;
      text-decoration: none;
      margin: 0 15px;
      font-size: 14px;
    }
    .social-links {
      margin: 20px 0;
    }
    .brand-tagline {
      color: #9ca3af;
      font-size: 14px;
      font-style: italic;
      margin-top: 10px;
    }
    @media only screen and (max-width: 600px) {
      .email-header, .email-body, .email-footer {
        padding: 25px 20px;
      }
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      .cta-button {
        padding: 14px 24px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="https://hiremzansi.co.za/hire-mzansi-logo.png" alt="Hire Mzansi - South Africa's Premier Career Platform" class="logo">
    </div>
    
    <div class="email-body">
      ${content}
    </div>
    
    <div class="email-footer">
      <div class="footer-links">
        <a href="https://hiremzansi.co.za">Home</a>
        <a href="https://hiremzansi.co.za/about">About</a>
        <a href="https://hiremzansi.co.za/contact">Contact</a>
        <a href="https://hiremzansi.co.za/privacy">Privacy</a>
      </div>
      
      <p style="color: #9ca3af; font-size: 14px; margin: 15px 0;">
        <strong>Hire Mzansi</strong><br>
        <span class="brand-tagline">Empowering South African careers with AI-powered insights</span>
      </p>
      
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.4;">
        © ${new Date().getFullYear()} Hire Mzansi. All rights reserved.<br>
        South Africa's premier AI-powered career platform<br>
        <a href="mailto:support@hiremzansi.co.za" style="color: #6b7280;">support@hiremzansi.co.za</a>
      </p>
      
      <p style="color: #9ca3af; font-size: 11px; margin-top: 15px;">
        You received this email because you have an account with Hire Mzansi.<br>
        <a href="https://hiremzansi.co.za/unsubscribe" style="color: #6b7280;">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Professional email templates with Hire Mzansi branding
const EMAIL_TEMPLATES = {
  CAREER_DIGEST: {
    subject: 'Your Weekly Career Insights - Hire Mzansi Professional Digest',
    text: (name: string, recommendations: any) => `
Dear ${name || 'Professional'},

Here's your personalized weekly career digest from Hire Mzansi:

${recommendations.jobMatches ? `RECOMMENDED OPPORTUNITIES:
${recommendations.jobMatches.map((job: any) => `• ${job.title} at ${job.company} (${job.matchScore}% match)`).join('\n')}` : ''}

${recommendations.skillGaps ? `SKILLS TO DEVELOP:
${recommendations.skillGaps.map((skill: any) => `• ${skill}`).join('\n')}` : ''}

${recommendations.courses ? `RECOMMENDED TRAINING:
${recommendations.courses.map((course: any) => `• ${course.title} - ${course.description}`).join('\n')}` : ''}

${recommendations.industryTips ? `INDUSTRY INSIGHTS:
${recommendations.industryTips}` : ''}

TAKE ACTION:
Visit your dashboard to explore these opportunities and continue building your career.

Dashboard: https://hiremzansi.co.za/dashboard
Manage Preferences: https://hiremzansi.co.za/profile

Best regards,
The Hire Mzansi Career Team

Website: https://hiremzansi.co.za
    `,
    html: (name: string, recommendations: any) => createProfessionalEmailTemplate(
      'Your Weekly Career Digest',
      `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #7c3aed; margin-bottom: 10px;">Your Career Insights</h1>
        <p style="color: #6b7280; font-size: 16px;">Personalized recommendations for your professional growth</p>
      </div>

      ${recommendations.jobMatches ? `
      <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
        <h3 style="color: #0c4a6e; margin-top: 0;">🎯 Recommended Opportunities</h3>
        ${recommendations.jobMatches.map((job: any) => `
        <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border: 1px solid #e0f2fe;">
          <h4 style="color: #1e40af; margin: 0 0 5px 0;">${job.title}</h4>
          <p style="color: #64748b; margin: 0 0 8px 0;">${job.company}</p>
          <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">${job.matchScore}% Match</span>
        </div>
        `).join('')}
      </div>
      ` : ''}

      ${recommendations.skillGaps ? `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
        <h3 style="color: #92400e; margin-top: 0;">📈 Skills to Develop</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px;">
          ${recommendations.skillGaps.map((skill: any) => `
          <span style="background: white; color: #92400e; padding: 8px 12px; border-radius: 6px; font-size: 14px; border: 1px solid #fcd34d;">${skill}</span>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${recommendations.courses ? `
      <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
        <h3 style="color: #166534; margin-top: 0;">📚 Recommended Training</h3>
        ${recommendations.courses.map((course: any) => `
        <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border: 1px solid #dcfce7;">
          <h4 style="color: #166534; margin: 0 0 5px 0;">${course.title}</h4>
          <p style="color: #64748b; margin: 0; font-size: 14px;">${course.description}</p>
        </div>
        `).join('')}
      </div>
      ` : ''}

      ${recommendations.industryTips ? `
      <div style="background: #faf5ff; border-left: 4px solid #a855f7; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
        <h3 style="color: #7e22ce; margin-top: 0;">💡 Industry Insights</h3>
        <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e9d5ff;">
          <p style="color: #6b7280; margin: 0; line-height: 1.6;">${recommendations.industryTips}</p>
        </div>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://hiremzansi.co.za/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px;">View Dashboard</a>
        <a href="https://hiremzansi.co.za/profile" style="display: inline-block; background: transparent; color: #7c3aed; padding: 15px 30px; text-decoration: none; border-radius: 8px; border: 2px solid #7c3aed; font-weight: bold;">Manage Preferences</a>
      </div>
      `
    )
  },
  WELCOME: {
    subject: 'Welcome to Hire Mzansi - Your AI-Powered Career Journey Begins!',
    text: (name: string) => `
Dear ${name || 'Valued User'},

Welcome to Hire Mzansi! We're thrilled to have you join South Africa's premier AI-powered career platform.

Your account has been successfully created and verified. You're now ready to:

OPTIMIZE YOUR CV:
• Upload your CV for instant AI analysis
• Get ATS compatibility scores and recommendations
• Receive South African market-specific insights
• Ensure B-BBEE compliance assessment

DISCOVER OPPORTUNITIES:
• Access personalized job recommendations
• Get matched with roles that fit your skills
• Receive weekly career insights and industry trends
• Connect with top South African employers

GET STARTED TODAY:
1. Log in to your dashboard: https://hiremzansi.co.za/login
2. Upload your CV for analysis
3. Complete your professional profile
4. Explore job opportunities

Need help getting started? Visit our help center or contact support@hiremzansi.co.za

Thank you for choosing Hire Mzansi to advance your career!

Best regards,
The Hire Mzansi Team
Empowering South African careers with AI-powered insights

Website: https://hiremzansi.co.za
Support: support@hiremzansi.co.za
    `,
    html: (name: string) => createProfessionalEmailTemplate(
      'Welcome to Hire Mzansi!',
      `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #059669; margin-bottom: 10px;">Welcome to Hire Mzansi!</h1>
        <p style="color: #6b7280; font-size: 18px;">Your AI-powered career journey begins now</p>
      </div>

      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h2 style="color: white; margin: 0 0 15px 0;">Account Successfully Created!</h2>
        <p style="color: #a7f3d0; margin: 0 0 20px 0;">You're now part of South Africa's premier career platform</p>
        <a href="https://hiremzansi.co.za/dashboard" style="display: inline-block; background: white; color: #059669; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Access Your Dashboard</a>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="color: #166534; margin-top: 0;">CV Optimization</h3>
          <p style="color: #15803d; font-size: 14px;">AI-powered analysis with ATS scoring and South African market insights</p>
        </div>
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="color: #1e40af; margin-top: 0;">Smart Matching</h3>
          <p style="color: #2563eb; font-size: 14px;">Personalized job recommendations based on your skills and preferences</p>
        </div>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #374151; margin-top: 0;">Get Started in 3 Easy Steps:</h3>
        <ol style="color: #6b7280; line-height: 1.8;">
          <li><strong>Upload Your CV:</strong> Get instant AI analysis and optimization tips</li>
          <li><strong>Complete Your Profile:</strong> Add skills, experience, and preferences</li>
          <li><strong>Explore Opportunities:</strong> Browse personalized job matches</li>
        </ol>
      </div>
      `
    )
  },
  PASSWORD_RESET: {
    subject: 'Reset Your Password - Hire Mzansi',
    text: (name: string, resetLink: string) => `
Dear ${name || 'Valued User'},

We received a request to reset your password for your Hire Mzansi account.

To reset your password, please click the link below:

${resetLink}

This password reset link will expire in 1 hour for security reasons.

If you did not request a password reset, please ignore this email and ensure your account is secure. Your password will remain unchanged.

For additional security:
• Use a strong, unique password
• Enable two-factor authentication when available
• Never share your login credentials

If you need assistance, contact our support team at support@hiremzansi.co.za

Best regards,
The Hire Mzansi Security Team

Website: https://hiremzansi.co.za
    `,
    html: (name: string, resetLink: string) => createProfessionalEmailTemplate(
      'Password Reset Request',
      `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #dc2626; margin-bottom: 10px;">Password Reset Request</h1>
        <p style="color: #6b7280; font-size: 16px;">We received a request to reset your password</p>
      </div>

      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #dc2626; margin-top: 0;">Action Required</h3>
        <p style="color: #7f1d1d; margin-bottom: 20px;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <div style="text-align: center;">
          <a href="${resetLink}" style="display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
      </div>

      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px;">
        <h4 style="color: #92400e; margin-top: 0;">Security Tips:</h4>
        <ul style="color: #92400e; margin: 10px 0;">
          <li>Use a strong, unique password</li>
          <li>Never share your login credentials</li>
          <li>Contact us if you didn't request this reset</li>
        </ul>
      </div>

      <p style="color: #6b7280; font-size: 14px; text-align: center;">If you didn't request this password reset, please ignore this email.</p>
      `
    )
  },
  EMAIL_VERIFICATION: {
    subject: 'Verify Your Email - Welcome to Hire Mzansi',
    text: (name: string, verificationLink: string) => `
Dear ${name || 'Valued User'},

Welcome to Hire Mzansi - South Africa's premier AI-powered career platform!

To complete your registration and start optimizing your CV for the South African job market, please verify your email address by clicking the link below:

${verificationLink}

This verification link will expire in 24 hours for your security.

Once verified, you'll have access to:
• AI-powered CV analysis with ATS optimization
• South African market insights and B-BBEE compliance assessment
• Personalized job matching and career recommendations
• Industry-specific advice tailored for the local market

If you did not create an account with Hire Mzansi, please ignore this email.

For support, contact us at support@hiremzansi.co.za

Best regards,
The Hire Mzansi Team
Empowering South African careers with AI-powered insights

Follow us:
LinkedIn: linkedin.com/company/hire-mzansi
Website: https://hiremzansi.co.za
    `,
    html: (name: string, verificationLink: string) => createProfessionalEmailTemplate(
      'Verify Your Email Address',
      `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to Hire Mzansi!</h1>
        <p style="color: #6b7280; font-size: 18px;">Let's get your account verified and start your career journey</p>
      </div>

      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 25px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h2 style="color: white; margin: 0 0 15px 0;">Complete Your Registration</h2>
        <p style="color: #dbeafe; margin: 0 0 20px 0;">Click the button below to verify your email and unlock full access</p>
        <a href="${verificationLink}" style="display: inline-block; background: white; color: #1d4ed8; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #374151; margin-top: 0;">What you'll get with Hire Mzansi:</h3>
        <ul style="color: #6b7280; line-height: 1.8; margin: 15px 0;">
          <li><strong>AI-Powered CV Analysis:</strong> Get detailed feedback with ATS optimization</li>
          <li><strong>South African Context:</strong> B-BBEE compliance and local market insights</li>
          <li><strong>Smart Job Matching:</strong> Find opportunities that match your skills</li>
          <li><strong>Career Guidance:</strong> Personalized recommendations for your growth</li>
        </ul>
      </div>

      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px;">
        <p style="margin: 0; color: #92400e;"><strong>Security Note:</strong> This verification link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
      </div>
      `
    )
  }
};

interface EmailOptions {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using Brevo (formerly Sendinblue)
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!emailServiceEnabled) {
    console.warn('Email service is disabled. Would have sent email to:', options.to);
    console.log('Subject:', options.subject);
    return false;
  }
  
  // Development mode - always log verification links for easy testing
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    console.log('\n=== EMAIL SERVICE (DEVELOPMENT MODE) ===');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    const verificationLink = extractVerificationLink(options.html || options.text || '');
    if (verificationLink !== 'No verification link found') {
      console.log(`🔗 VERIFICATION LINK: ${verificationLink}`);
      console.log('Copy this link to your browser to verify the email');
    }
    console.log('=========================================\n');
  }
  
  try {
    // Use verified sender with proper domain name
    const fromAddress = options.from || 'noreply@hiremzansi.co.za';
    
    // Prepare Brevo email data
    const emailData = new SendSmtpEmail();
    emailData.to = [{ email: options.to }];
    emailData.sender = { email: fromAddress, name: 'Hire Mzansi' };
    emailData.replyTo = { email: 'support@hiremzansi.co.za', name: 'Hire Mzansi Support' };
    emailData.subject = options.subject;
    emailData.textContent = options.text || `Please visit ${options.html ? 'the link in this email' : 'our website'} to complete your action.`;
    emailData.htmlContent = options.html || '';
    
    // Add headers for better deliverability
    emailData.headers = {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'High',
      'List-Unsubscribe': '<mailto:unsubscribe@hiremzansi.co.za>',
      'X-Mailer': 'Hire Mzansi Email Service'
    };
    
    // Send email via Brevo
    await apiInstance.sendTransacEmail(emailData);
    
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email via Brevo:', error);
    if (isDevelopment) {
      console.log('Brevo sender not verified yet - using development mode');
      console.log('Error details:', (error as any).response?.data || (error as any).message);
      return true; // Return true in development to continue flow
    }
    return false;
  }
}

function extractVerificationLink(content: string): string {
  const linkMatch = content.match(/https?:\/\/[^\s<>"]+verify-email[^\s<>"]*/);
  return linkMatch ? linkMatch[0] : 'No verification link found';
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: EMAIL_TEMPLATES.WELCOME.subject,
    text: EMAIL_TEMPLATES.WELCOME.text(name || ''),
    html: EMAIL_TEMPLATES.WELCOME.html(name || '')
  });
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(email: string, verificationLink: string, name?: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: EMAIL_TEMPLATES.EMAIL_VERIFICATION.subject,
    text: EMAIL_TEMPLATES.EMAIL_VERIFICATION.text(name || '', verificationLink),
    html: EMAIL_TEMPLATES.EMAIL_VERIFICATION.html(name || '', verificationLink)
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetLink: string, name?: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: EMAIL_TEMPLATES.PASSWORD_RESET.subject,
    text: EMAIL_TEMPLATES.PASSWORD_RESET.text(name || '', resetLink),
    html: EMAIL_TEMPLATES.PASSWORD_RESET.html(name || '', resetLink)
  });
}



/**
 * Send career digest email
 */
export async function sendCareerDigestEmail(email: string, recommendations: any, name?: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: EMAIL_TEMPLATES.CAREER_DIGEST.subject,
    text: EMAIL_TEMPLATES.CAREER_DIGEST.text(name || '', recommendations),
    html: EMAIL_TEMPLATES.CAREER_DIGEST.html(name || '', recommendations)
  });
}

export { EMAIL_TEMPLATES };