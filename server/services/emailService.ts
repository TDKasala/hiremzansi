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

// Email templates
const EMAIL_TEMPLATES = {
  CAREER_DIGEST: {
    subject: 'Your Personalized Career Recommendations - Hire Mzansi Weekly Digest',
    text: (name: string, recommendations: any) => `
Hello ${name || 'there'},

Here are your personalized career recommendations for this week:

${recommendations.jobMatches ? `JOB MATCHES:
${recommendations.jobMatches.map((job: any) => `- ${job.title} at ${job.company} (Match Score: ${job.matchScore}%)`).join('\n')}` : ''}

${recommendations.skillGaps ? `SKILL GAPS TO FOCUS ON:
${recommendations.skillGaps.map((skill: any) => `- ${skill}`).join('\n')}` : ''}

${recommendations.courses ? `RECOMMENDED COURSES:
${recommendations.courses.map((course: any) => `- ${course.title}: ${course.description}`).join('\n')}` : ''}

${recommendations.industryTips ? `INDUSTRY INSIGHTS:
${recommendations.industryTips}` : ''}

Log in to your Hire Mzansi dashboard to see more details and take action on these recommendations.

To manage your email preferences, visit your account settings.

Best regards,
The Hire Mzansi Team
    `,
    html: (name: string, recommendations: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Personalized Career Recommendations</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #FFCA28;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #fff;
      padding: 20px;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    h1 { color: #0D6EFD; margin-top: 0; }
    h2 { color: #333; font-size: 18px; margin-top: 20px; }
    .job-match {
      background-color: #f9f9f9;
      padding: 10px;
      margin-bottom: 10px;
      border-left: 4px solid #0D6EFD;
      border-radius: 3px;
    }
    .match-score {
      font-weight: bold;
      color: #0D6EFD;
    }
    .skill-gap {
      padding: 5px 10px;
      margin: 5px 0;
      background-color: #f0f0f0;
      border-radius: 15px;
      display: inline-block;
    }
    .course {
      margin-bottom: 15px;
    }
    .cta-button {
      display: inline-block;
      background-color: #0D6EFD;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin-top: 20px;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your Weekly Career Digest</h1>
  </div>
  <div class="content">
    <p>Hello ${name || 'there'},</p>
    <p>Here are your personalized career recommendations based on your CV and profile:</p>
    
    ${recommendations.jobMatches && recommendations.jobMatches.length > 0 ? `
    <h2>🔍 Job Matches</h2>
    ${recommendations.jobMatches.map((job: any) => `
    <div class="job-match">
      <strong>${job.title}</strong> at ${job.company}<br/>
      Location: ${job.location}<br/>
      <span class="match-score">Match Score: ${job.matchScore}%</span>
    </div>
    `).join('')}
    ` : ''}
    
    ${recommendations.skillGaps && recommendations.skillGaps.length > 0 ? `
    <h2>🎯 Skills to Focus On</h2>
    <p>Based on your CV and current job market trends, these skills would boost your employability:</p>
    <p>
      ${recommendations.skillGaps.map((skill: any) => `<span class="skill-gap">${skill}</span>`).join(' ')}
    </p>
    ` : ''}
    
    ${recommendations.courses && recommendations.courses.length > 0 ? `
    <h2>📚 Recommended Courses</h2>
    ${recommendations.courses.map((course: any) => `
    <div class="course">
      <strong>${course.title}</strong><br/>
      ${course.description}
    </div>
    `).join('')}
    ` : ''}
    
    ${recommendations.industryTips ? `
    <h2>💡 Industry Insights</h2>
    <p>${recommendations.industryTips}</p>
    ` : ''}
    
    <a href="https://hiremzansi.co.za/dashboard" class="cta-button">View Details on Dashboard</a>
    
    <p class="footer">
      To manage your email preferences, <a href="https://hiremzansi.co.za/profile/settings">visit your account settings</a>.<br/>
      © 2025 Hire Mzansi. All rights reserved.
    </p>
  </div>
</body>
</html>
    `,
  },
  WELCOME: {
    subject: 'Welcome to Hire Mzansi - Let\'s Boost Your Career!',
    text: (name: string) => `
Hello ${name || 'there'},

Welcome to Hire Mzansi - Your South African career acceleration platform!

We're excited to have you on board. Hire Mzansi helps you optimize your CV, find job opportunities, practice interviews, and improve your skills.

To get started:
1. Upload your CV for an instant ATS compatibility score
2. Use our premium tools to boost your job search
3. Complete your profile to get personalized recommendations

If you have any questions, simply reply to this email.

Best regards,
The Hire Mzansi Team
    `,
    html: (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Hire Mzansi</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .container { padding: 20px; }
    .header { 
      background-color: #ffffff;
      padding: 20px;
      text-align: center;
      border-bottom: 4px solid #ffca28;
    }
    .logo { max-width: 200px; }
    .content { padding: 20px; }
    .button {
      display: inline-block;
      background-color: #1a73e8;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .features {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      font-size: 12px;
      color: #666;
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://hiremzansi.co.za/logo.png" alt="Hire Mzansi Logo" class="logo">
    </div>
    <div class="content">
      <h1>Welcome to Hire Mzansi!</h1>
      <p>Hello ${name || 'there'},</p>
      <p>Welcome to Hire Mzansi - Your South African career acceleration platform!</p>
      
      <p>We're excited to have you on board. Our platform helps you:</p>
      
      <ul>
        <li>CV ATS scoring and optimization</li>
        <li>Job search with South African market insights</li>
        <li>Interview practice with realistic scenarios</li>
        <li>Skill gap analysis to advance your career</li>
      </ul>
      
      <a href="https://hiremzansi.co.za/dashboard" class="button">Go to My Dashboard</a>
      
      <p>If you have any questions, simply reply to this email.</p>
      
      <p>Best regards,<br>The Hire Mzansi Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Hire Mzansi. All rights reserved.</p>
      <p>South Africa's premier career advancement platform.</p>
    </div>
  </div>
</body>
</html>
    `
  },
  PASSWORD_RESET: {
    subject: 'Hire Mzansi - Reset Your Password',
    text: (name: string, resetLink: string) => `
Hello ${name || 'there'},

You recently requested to reset your password for your Hire Mzansi account. Click the link below to reset it:

${resetLink}

This password reset link is only valid for the next 60 minutes.

If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The Hire Mzansi Team
    `,
    html: (name: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset Your Hire Mzansi Password</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .container { padding: 20px; }
    .header { 
      background-color: #ffffff;
      padding: 20px;
      text-align: center;
      border-bottom: 4px solid #ffca28;
    }
    .logo { max-width: 200px; }
    .content { padding: 20px; }
    .button {
      display: inline-block;
      background-color: #1a73e8;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .notice {
      background-color: #fff8e1;
      border-left: 4px solid #ffca28;
      padding: 12px;
      margin: 20px 0;
    }
    .footer {
      font-size: 12px;
      color: #666;
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://hiremzansi.co.za/logo.png" alt="Hire Mzansi Logo" class="logo">
    </div>
    <div class="content">
      <h1>Reset Your Password</h1>
      <p>Hello ${name || 'there'},</p>
      <p>You recently requested to reset your password for your Hire Mzansi account. Click the button below to reset it:</p>
      
      <a href="${resetLink}" class="button">Reset My Password</a>
      
      <div class="notice">
        <p><strong>Please note:</strong> This password reset link is only valid for the next 60 minutes.</p>
      </div>
      
      <p>If you did not request a password reset, please ignore this email or contact our support team if you have concerns.</p>
      
      <p>Best regards,<br>The Hire Mzansi Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Hire Mzansi. All rights reserved.</p>
      <p>South Africa's premier career advancement platform.</p>
      <p>If you need assistance, please contact <a href="mailto:support@hiremzansi.co.za">support@hiremzansi.co.za</a></p>
    </div>
  </div>
</body>
</html>
    `
  },
  EMAIL_VERIFICATION: {
    subject: 'Hire Mzansi - Verify Your Email Address',
    text: (name: string, verificationLink: string) => `
Hello ${name || 'there'},

Thank you for creating an account with Hire Mzansi. Please verify your email address by clicking the link below:

${verificationLink}

This verification link will expire in 24 hours.

By verifying your email, you'll get full access to all Hire Mzansi features and stay updated with job opportunities tailored for the South African market.

If you did not create an account, please ignore this email.

Best regards,
The Hire Mzansi Team
    `,
    html: (name: string, verificationLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verify Your Hire Mzansi Email</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .container { padding: 20px; }
    .header { 
      background-color: #ffffff;
      padding: 20px;
      text-align: center;
      border-bottom: 4px solid #ffca28;
    }
    .logo { max-width: 200px; }
    .content { padding: 20px; }
    .button {
      display: inline-block;
      background-color: #1a73e8;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .benefits {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      font-size: 12px;
      color: #666;
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://hiremzansi.co.za/logo.png" alt="Hire Mzansi Logo" class="logo">
    </div>
    <div class="content">
      <h1>Verify Your Email Address</h1>
      <p>Hello ${name || 'there'},</p>
      <p>Thank you for creating an account with Hire Mzansi. Please verify your email address by clicking the button below:</p>
      
      <a href="${verificationLink}" class="button">Verify My Email</a>
      
      <div class="benefits">
        <h3>Benefits of verifying your email:</h3>
        <ul>
          <li>Full access to all Hire Mzansi features</li>
          <li>Personalized job recommendations</li>
          <li>Weekly career development digest</li>
          <li>Priority support and updates</li>
        </ul>
      </div>
      
      <p><strong>Please note:</strong> This verification link will expire in 24 hours.</p>
      
      <p>If you did not create an account, please ignore this email.</p>
      
      <p>Best regards,<br>The Hire Mzansi Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Hire Mzansi. All rights reserved.</p>
      <p>South Africa's premier career advancement platform.</p>
    </div>
  </div>
</body>
</html>
    `
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
    emailData.textContent = options.text || '';
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
    if (isDevelopment) {
      console.log('Brevo sender not verified yet - using development mode');
      return true; // Return true in development to continue flow
    }
    console.error('Failed to send email:', error);
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