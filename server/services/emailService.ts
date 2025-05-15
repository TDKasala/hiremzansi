import { MailService } from '@sendgrid/mail';

// Initialize SendGrid mail service
const mailService = new MailService();

// Check if SendGrid API key is available
const sendgridApiKey = process.env.SENDGRID_API_KEY;
let emailServiceEnabled = false;

if (sendgridApiKey) {
  mailService.setApiKey(sendgridApiKey);
  emailServiceEnabled = true;
  console.log('SendGrid email service initialized successfully');
} else {
  console.warn('SENDGRID_API_KEY not found in environment variables. Email service will be disabled.');
  // You'll need to add SENDGRID_API_KEY to your environment variables to enable email functionality
}

// Email templates
const EMAIL_TEMPLATES = {
  WELCOME: {
    subject: 'Welcome to ATSBoost - Let\'s Boost Your Career!',
    text: (name: string) => `
Hello ${name || 'there'},

Welcome to ATSBoost - Your South African career acceleration platform!

We're excited to have you on board. ATSBoost helps you optimize your CV, find job opportunities, practice interviews, and improve your skills.

To get started:
1. Upload your CV for an instant ATS compatibility score
2. Use our premium tools to boost your job search
3. Complete your profile to get personalized recommendations

If you have any questions, simply reply to this email.

Best regards,
The ATSBoost Team
    `,
    html: (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to ATSBoost</title>
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
      <img src="https://atsboost.co.za/logo.png" alt="ATSBoost Logo" class="logo">
    </div>
    <div class="content">
      <h1>Welcome to ATSBoost, ${name || 'there'}!</h1>
      <p>We're excited to have you on board. ATSBoost is your all-in-one South African career acceleration platform.</p>
      
      <h2>Get started with these simple steps:</h2>
      <ol>
        <li>Upload your CV for an instant ATS compatibility score</li>
        <li>Use our premium tools to boost your job search</li>
        <li>Complete your profile to get personalized recommendations</li>
      </ol>
      
      <p>Our platform offers:</p>
      <ul>
        <li>CV ATS scoring and optimization</li>
        <li>Job search with South African market insights</li>
        <li>Interview practice with realistic scenarios</li>
        <li>Skill gap analysis to advance your career</li>
      </ul>
      
      <a href="https://atsboost.co.za/dashboard" class="button">Go to My Dashboard</a>
      
      <p>If you have any questions, simply reply to this email.</p>
      
      <p>Best regards,<br>The ATSBoost Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ATSBoost. All rights reserved.</p>
      <p>South Africa's premier career advancement platform.</p>
    </div>
  </div>
</body>
</html>
    `
  },
  PASSWORD_RESET: {
    subject: 'ATSBoost - Reset Your Password',
    text: (name: string, resetLink: string) => `
Hello ${name || 'there'},

You recently requested to reset your password for your ATSBoost account. Click the link below to reset it:

${resetLink}

This password reset link is only valid for the next 60 minutes.

If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The ATSBoost Team
    `,
    html: (name: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset Your ATSBoost Password</title>
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
      <img src="https://atsboost.co.za/logo.png" alt="ATSBoost Logo" class="logo">
    </div>
    <div class="content">
      <h1>Reset Your Password</h1>
      <p>Hello ${name || 'there'},</p>
      <p>You recently requested to reset your password for your ATSBoost account. Click the button below to reset it:</p>
      
      <a href="${resetLink}" class="button">Reset My Password</a>
      
      <div class="notice">
        <p><strong>Please note:</strong> This password reset link is only valid for the next 60 minutes.</p>
      </div>
      
      <p>If you did not request a password reset, please ignore this email or contact our support team if you have concerns.</p>
      
      <p>Best regards,<br>The ATSBoost Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ATSBoost. All rights reserved.</p>
      <p>South Africa's premier career advancement platform.</p>
      <p>If you need assistance, please contact <a href="mailto:support@atsboost.co.za">support@atsboost.co.za</a></p>
    </div>
  </div>
</body>
</html>
    `
  },
  EMAIL_VERIFICATION: {
    subject: 'ATSBoost - Verify Your Email Address',
    text: (name: string, verificationLink: string) => `
Hello ${name || 'there'},

Thank you for creating an account with ATSBoost. Please verify your email address by clicking the link below:

${verificationLink}

This verification link will expire in 24 hours.

By verifying your email, you'll get full access to all ATSBoost features and stay updated with job opportunities tailored for the South African market.

If you did not create an account, please ignore this email.

Best regards,
The ATSBoost Team
    `,
    html: (name: string, verificationLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verify Your ATSBoost Email</title>
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
      <img src="https://atsboost.co.za/logo.png" alt="ATSBoost Logo" class="logo">
    </div>
    <div class="content">
      <h1>Verify Your Email Address</h1>
      <p>Hello ${name || 'there'},</p>
      <p>Thank you for creating an account with ATSBoost. Please verify your email address by clicking the button below:</p>
      
      <a href="${verificationLink}" class="button">Verify My Email</a>
      
      <div class="benefits">
        <h3>Benefits of verifying your email:</h3>
        <ul>
          <li>Full access to all ATSBoost features</li>
          <li>Personalized job recommendations</li>
          <li>Latest South African job market insights</li>
          <li>Important account notifications</li>
        </ul>
      </div>
      
      <p>This verification link will expire in 24 hours.</p>
      
      <p>If you did not create an account, please ignore this email.</p>
      
      <p>Best regards,<br>The ATSBoost Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ATSBoost. All rights reserved.</p>
      <p>South Africa's premier career advancement platform.</p>
      <p>If you need assistance, please contact <a href="mailto:support@atsboost.co.za">support@atsboost.co.za</a></p>
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
  subject?: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using SendGrid
 * 
 * @param options Email sending options
 * @returns Promise resolving to boolean indicating success
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!emailServiceEnabled) {
    console.warn('Email service is disabled. Would have sent email to:', options.to);
    return false;
  }
  
  try {
    const fromAddress = options.from || 'notifications@atsboost.co.za';
    
    await mailService.send({
      to: options.to,
      from: fromAddress,
      subject: options.subject,
      text: options.text,
      html: options.html
    });
    
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send a welcome email to a new user
 * 
 * @param email User's email address
 * @param name User's name or username
 * @returns Promise resolving to boolean indicating success
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: EMAIL_TEMPLATES.WELCOME.subject,
    text: EMAIL_TEMPLATES.WELCOME.text(name),
    html: EMAIL_TEMPLATES.WELCOME.html(name)
  });
}

/**
 * Send a password reset email
 * 
 * @param email User's email address
 * @param name User's name or username
 * @param resetToken Password reset token
 * @param baseUrl Base URL for the reset link
 * @returns Promise resolving to boolean indicating success
 */
export async function sendPasswordResetEmail(
  email: string, 
  name: string,
  resetToken: string,
  baseUrl: string = 'https://atsboost.co.za'
): Promise<boolean> {
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: email,
    subject: EMAIL_TEMPLATES.PASSWORD_RESET.subject,
    text: EMAIL_TEMPLATES.PASSWORD_RESET.text(name, resetLink),
    html: EMAIL_TEMPLATES.PASSWORD_RESET.html(name, resetLink)
  });
}

/**
 * Send an email verification link
 * 
 * @param email User's email address
 * @param name User's name or username
 * @param verificationToken Email verification token
 * @param baseUrl Base URL for the verification link
 * @returns Promise resolving to boolean indicating success
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string,
  baseUrl: string = 'https://atsboost.co.za'
): Promise<boolean> {
  const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
  
  return sendEmail({
    to: email,
    subject: EMAIL_TEMPLATES.EMAIL_VERIFICATION.subject,
    text: EMAIL_TEMPLATES.EMAIL_VERIFICATION.text(name, verificationLink),
    html: EMAIL_TEMPLATES.EMAIL_VERIFICATION.html(name, verificationLink)
  });
}

/**
 * Check if email service is enabled
 * 
 * @returns Boolean indicating if email service is available
 */
export function isEmailServiceEnabled(): boolean {
  return emailServiceEnabled;
}