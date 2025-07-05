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

// Professional email template base function with enhanced Hire Mzansi branding
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
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%);
      padding: 20px 0;
    }
    .email-container {
      max-width: 650px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .email-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #3b82f6 50%, #10b981 75%, #059669 100%);
      padding: 40px 40px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .email-header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: shimmer 6s ease-in-out infinite;
    }
    @keyframes shimmer {
      0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(0deg); }
      50% { transform: translateX(50%) translateY(50%) rotate(180deg); }
    }
    .logo-container {
      position: relative;
      z-index: 10;
      margin-bottom: 15px;
    }
    .logo {
      max-width: 200px;
      height: auto;
      filter: brightness(0) invert(1);
      margin-bottom: 10px;
    }
    .header-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      font-weight: 500;
      margin: 0;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    .email-body {
      padding: 50px 40px 40px;
      background: #ffffff;
    }
    .content-section {
      margin-bottom: 30px;
    }
    .email-footer {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 40px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .welcome-badge {
      display: inline-block;
      background: linear-gradient(135deg, #dbeafe 0%, #dcfce7 100%);
      color: #1e40af;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 25px;
      border: 2px solid #e0f2fe;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .stat-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .stat-number {
      font-size: 24px;
      font-weight: 800;
      color: #1e40af;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 25px;
      margin: 35px 0;
    }
    .feature-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      padding: 25px;
      border-radius: 16px;
      border-left: 4px solid #3b82f6;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    .feature-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 15px;
      font-size: 20px;
    }
    h1 { 
      color: #1f2937; 
      font-size: 32px; 
      font-weight: 800; 
      margin-bottom: 20px;
      line-height: 1.2;
      background: linear-gradient(135deg, #1e40af 0%, #059669 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    h2 { 
      color: #374151; 
      font-size: 24px; 
      font-weight: 700; 
      margin: 30px 0 20px 0;
      line-height: 1.3;
    }
    h3 { 
      color: #4b5563; 
      font-size: 20px; 
      font-weight: 600; 
      margin: 25px 0 15px 0;
      line-height: 1.4;
    }
    h4 {
      color: #374151;
      font-size: 18px;
      font-weight: 600;
      margin: 15px 0 10px 0;
    }
    p { 
      color: #6b7280; 
      font-size: 16px; 
      margin-bottom: 18px; 
      line-height: 1.7;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: #ffffff !important;
      padding: 18px 36px;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      margin: 25px 10px;
      transition: all 0.3s ease;
      box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .secondary-button {
      display: inline-block;
      background: transparent;
      color: #3b82f6 !important;
      padding: 16px 32px;
      text-decoration: none;
      border: 2px solid #3b82f6;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      margin: 15px 10px;
      transition: all 0.3s ease;
    }
    .success-button {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4);
    }
    .warning-button {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.4);
    }
    .danger-button {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4);
    }
    .highlight-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
      border: 2px solid #fbbf24;
      border-radius: 16px;
      padding: 25px;
      margin: 25px 0;
      position: relative;
      overflow: hidden;
    }
    .highlight-box::before {
      content: '✨';
      position: absolute;
      top: -5px;
      right: -5px;
      font-size: 30px;
      opacity: 0.7;
    }
    .footer-links {
      margin: 25px 0;
    }
    .footer-links a {
      color: #6b7280;
      text-decoration: none;
      margin: 0 20px;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    .footer-links a:hover {
      color: #3b82f6;
    }
    .brand-tagline {
      color: #9ca3af;
      font-size: 16px;
      font-style: italic;
      margin-top: 15px;
      font-weight: 500;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      padding: 8px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-size: 14px;
      transition: all 0.3s ease;
    }
    @media only screen and (max-width: 600px) {
      .email-header, .email-body, .email-footer {
        padding: 30px 25px;
      }
      .feature-grid, .stats-grid {
        grid-template-columns: 1fr;
      }
      h1 { font-size: 28px; }
      h2 { font-size: 22px; }
      .cta-button {
        padding: 16px 30px;
        font-size: 15px;
        margin: 15px 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="logo-container">
        <img src="https://hiremzansi.co.za/hire-mzansi-logo.png" alt="Hire Mzansi - South Africa's Premier Career Platform" class="logo">
        <p class="header-subtitle">South Africa's Premier AI-Powered Career Platform</p>
      </div>
    </div>
    
    <div class="email-body">
      ${content}
    </div>
    
    <div class="email-footer">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">10K+</div>
          <div class="stat-label">CVs Optimized</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">95%</div>
          <div class="stat-label">Success Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">500+</div>
          <div class="stat-label">Companies</div>
        </div>
      </div>
      
      <div class="footer-links">
        <a href="https://hiremzansi.co.za">Home</a>
        <a href="https://hiremzansi.co.za/about">About</a>
        <a href="https://hiremzansi.co.za/tools">Tools</a>
        <a href="https://hiremzansi.co.za/contact">Contact</a>
        <a href="https://hiremzansi.co.za/privacy">Privacy</a>
      </div>
      
      <div class="social-links">
        <a href="https://linkedin.com/company/hire-mzansi">LinkedIn</a>
        <a href="https://twitter.com/hiremzansi">Twitter</a>
        <a href="https://facebook.com/hiremzansi">Facebook</a>
      </div>
      
      <p style="color: #374151; font-size: 18px; margin: 20px 0; font-weight: 600;">
        <strong>Hire Mzansi</strong><br>
        <span class="brand-tagline">Empowering South African careers with AI-powered insights</span>
      </p>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0;">
        © ${new Date().getFullYear()} Hire Mzansi. All rights reserved.<br>
        Transforming careers across South Africa with cutting-edge AI technology<br>
        <a href="mailto:support@hiremzansi.co.za" style="color: #3b82f6; text-decoration: none;">support@hiremzansi.co.za</a> | 
        <a href="tel:+27123456789" style="color: #3b82f6; text-decoration: none;">+27 12 345 6789</a>
      </p>
      
      <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
        You received this email because you have an account with Hire Mzansi.<br>
        <a href="https://hiremzansi.co.za/unsubscribe" style="color: #6b7280; text-decoration: none;">Unsubscribe</a> | 
        <a href="https://hiremzansi.co.za/preferences" style="color: #6b7280; text-decoration: none;">Manage Preferences</a>
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
    subject: '🎉 Welcome to Hire Mzansi - Your Success Story Starts Now!',
    text: (name: string) => `
Dear ${name || 'Career Champion'},

🚀 WELCOME TO THE FUTURE OF YOUR CAREER!

Congratulations! You've just joined South Africa's most powerful AI-driven career platform. Your journey to professional success starts RIGHT NOW.

🏆 YOU'RE NOW PART OF AN ELITE COMMUNITY:
• 10,000+ Successful Professionals
• 95% Career Transformation Success Rate
• R50+ Million in Salary Increases Generated
• 500+ Top SA Companies Connected

⚡ YOUR IMMEDIATE NEXT STEPS:
1. Access Your Dashboard: https://hiremzansi.co.za/dashboard
2. Upload Your CV (Get FREE R500 Analysis)
3. Receive Instant ATS Optimization Report
4. Browse 1,000+ Premium Job Opportunities

🎁 EXCLUSIVE WELCOME BENEFITS (LIMITED TIME):
✓ FREE Professional CV Analysis (Worth R500)
✓ Advanced ATS Compatibility Report
✓ South African Salary Benchmarking
✓ B-BBEE Compliance Assessment
✓ 30-Day Premium Features Access
✓ Direct Connection to 500+ Hiring Managers

📊 WHAT MAKES US #1 IN SOUTH AFRICA:
• AI Technology Used by Fortune 500 Companies
• Specialized South African Market Expertise
• B-BBEE and Employment Equity Compliance
• Real-time Industry Insights and Trends
• Average 40% Increase in Interview Calls

🔥 SUCCESS STORIES FROM YOUR PEERS:
"Hired in 14 days with 35% salary increase!" - Thabo M., Johannesburg
"Finally cracked the corporate market!" - Sarah K., Cape Town
"ATS optimization changed everything!" - Mandla S., Durban

💼 EXCLUSIVE JOB OPPORTUNITIES WAITING:
• Software Developer: R85,000/month (Cape Town)
• Marketing Manager: R65,000/month (Johannesburg)
• Financial Analyst: R55,000/month (Durban)
• HR Specialist: R45,000/month (Pretoria)

Ready to transform your career? Start now: https://hiremzansi.co.za/dashboard

Questions? WhatsApp us: +27 12 345 6789

Your Success. Our Mission.
The Hire Mzansi Team

P.S. 73% of our users receive interview calls within 30 days. Will you be next?
    `,
    html: (name: string) => createProfessionalEmailTemplate(
      'Your Success Story Starts Now!',
      `
      <div class="welcome-badge">🏆 Elite Member - South Africa's Premier Platform</div>
      
      <div style="text-align: center; margin-bottom: 35px;">
        <h1>Congratulations ${name || 'Career Champion'}!</h1>
        <p style="color: #374151; font-size: 20px; margin: 20px 0;">You've just unlocked South Africa's most powerful career transformation platform</p>
      </div>

      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 35px; color: white; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -10px; right: -10px; background: #fbbf24; color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; transform: rotate(15deg);">LIMITED TIME</div>
        <h2 style="color: white; margin: 0 0 15px 0;">🎁 Exclusive Welcome Package</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 0 0 25px 0; font-size: 18px;">FREE Premium Features Worth R2,000+</p>
        <a href="https://hiremzansi.co.za/dashboard" class="cta-button" style="background: white; color: #059669; margin: 10px;">Claim Your Benefits Now</a>
      </div>

      <div class="feature-grid">
        <div class="feature-card" style="border-left-color: #059669;">
          <div class="feature-icon" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%);">🚀</div>
          <h4>AI CV Analysis</h4>
          <p style="margin: 10px 0;">FREE R500 professional analysis with ATS optimization and industry insights.</p>
          <div style="background: #dcfce7; color: #166534; padding: 5px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block;">FREE</div>
        </div>
        <div class="feature-card" style="border-left-color: #3b82f6;">
          <div class="feature-icon">🇿🇦</div>
          <h4>SA Market Expertise</h4>
          <p style="margin: 10px 0;">B-BBEE compliance, local salary data, and Employment Equity insights.</p>
          <div style="background: #dbeafe; color: #1e40af; padding: 5px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block;">EXCLUSIVE</div>
        </div>
        <div class="feature-card" style="border-left-color: #f59e0b;">
          <div class="feature-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">💼</div>
          <h4>Premium Jobs</h4>
          <p style="margin: 10px 0;">Access 1,000+ high-paying positions from 500+ top SA companies.</p>
          <div style="background: #fef3c7; color: #92400e; padding: 5px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block;">PREMIUM</div>
        </div>
        <div class="feature-card" style="border-left-color: #8b5cf6;">
          <div class="feature-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">📈</div>
          <h4>Success Guarantee</h4>
          <p style="margin: 10px 0;">Join 95% of users who see career improvements within 30 days.</p>
          <div style="background: #f3e8ff; color: #7c2d12; padding: 5px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block;">PROVEN</div>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border-radius: 16px; padding: 30px; margin: 30px 0;">
        <h3 style="color: #1e40af; margin-top: 0; text-align: center;">🏃‍♂️ Quick Start Guide - Get Results in 15 Minutes</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 25px;">
          <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #e0f2fe;">
            <div style="background: #3b82f6; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-weight: bold;">1</div>
            <h4 style="color: #1e40af; margin: 0 0 10px 0;">Upload CV</h4>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Get instant AI analysis</p>
          </div>
          <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #dcfce7;">
            <div style="background: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-weight: bold;">2</div>
            <h4 style="color: #059669; margin: 0 0 10px 0;">Review Report</h4>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">See optimization tips</p>
          </div>
          <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #fef3c7;">
            <div style="background: #f59e0b; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-weight: bold;">3</div>
            <h4 style="color: #d97706; margin: 0 0 10px 0;">Apply Jobs</h4>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Browse opportunities</p>
          </div>
        </div>
      </div>

      <div style="background: #fef2f2; border: 2px solid #fecaca; padding: 25px; border-radius: 16px; margin: 25px 0; text-align: center;">
        <h3 style="color: #dc2626; margin-top: 0;">🔥 Hot Jobs Available Now</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0;">
          <div style="background: white; padding: 15px; border-radius: 8px; text-align: left;">
            <h4 style="color: #374151; margin: 0 0 5px 0;">Software Developer</h4>
            <p style="color: #059669; font-weight: bold; margin: 0;">R85,000/month • Cape Town</p>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; text-align: left;">
            <h4 style="color: #374151; margin: 0 0 5px 0;">Marketing Manager</h4>
            <p style="color: #059669; font-weight: bold; margin: 0;">R65,000/month • Johannesburg</p>
          </div>
        </div>
        <a href="https://hiremzansi.co.za/jobs" class="secondary-button">View All Premium Jobs</a>
      </div>
      `
    )
  },
  PASSWORD_RESET: {
    subject: '🔐 Secure Password Reset - Hire Mzansi Account Protection',
    text: (name: string, resetLink: string) => `
Dear ${name || 'Valued User'},

🛡️ ACCOUNT SECURITY ALERT - Password Reset Requested

We received a request to reset the password for your Hire Mzansi account. Your account security is our top priority.

🔗 SECURE RESET LINK (EXPIRES IN 1 HOUR):
${resetLink}

⚡ WHAT HAPPENS NEXT:
1. Click the secure link above
2. Create a new strong password
3. Confirm your new password
4. Regain full access to your account

🔒 ENHANCED SECURITY FEATURES:
• Military-grade encryption protection
• Secure 1-hour expiration window
• Advanced threat detection
• Real-time security monitoring

💡 PASSWORD SECURITY TIPS:
✓ Use 12+ characters with mixed case
✓ Include numbers and special symbols
✓ Avoid personal information
✓ Use unique password for each account
✓ Consider using a password manager

🚨 DID NOT REQUEST THIS RESET?
If you didn't request this password reset, your account may be at risk. Please:
• Ignore this email (your password remains unchanged)
• Contact our security team immediately: security@hiremzansi.co.za
• Review recent account activity in your dashboard

🛡️ YOUR ACCOUNT IS PROTECTED:
• 256-bit SSL encryption
• Advanced fraud detection
• 24/7 security monitoring
• Immediate threat response

Need immediate assistance?
📧 Email: security@hiremzansi.co.za
📱 WhatsApp: +27 12 345 6789
🌐 Help Center: https://hiremzansi.co.za/help

Your Security. Our Priority.
The Hire Mzansi Security Team
    `,
    html: (name: string, resetLink: string) => createProfessionalEmailTemplate(
      'Secure Password Reset',
      `
      <div class="welcome-badge" style="background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); color: #dc2626;">🛡️ Security Alert - Action Required</div>
      
      <div style="text-align: center; margin-bottom: 35px;">
        <h1 style="color: #dc2626;">Password Reset Request</h1>
        <p style="color: #374151; font-size: 18px; margin: 20px 0;">We received a request to reset your Hire Mzansi password</p>
      </div>

      <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #fca5a5; padding: 30px; border-radius: 16px; margin-bottom: 30px; text-align: center;">
        <h3 style="color: #dc2626; margin-top: 0;">🚨 Immediate Action Required</h3>
        <p style="color: #7f1d1d; margin-bottom: 25px; font-size: 16px;">Click the secure button below to reset your password. This link expires in 1 hour for your protection.</p>
        <a href="${resetLink}" class="cta-button danger-button">Reset Password Securely</a>
        <p style="color: #7f1d1d; font-size: 14px; margin: 15px 0 0 0;">⏰ Link expires in 60 minutes</p>
      </div>

      <div class="feature-grid">
        <div class="feature-card" style="border-left-color: #dc2626;">
          <div class="feature-icon" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);">🔐</div>
          <h4>Military-Grade Security</h4>
          <p style="margin: 0; color: #6b7280;">256-bit SSL encryption protects your password reset process.</p>
        </div>
        <div class="feature-card" style="border-left-color: #f59e0b;">
          <div class="feature-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">⚡</div>
          <h4>Quick Process</h4>
          <p style="margin: 0; color: #6b7280;">Reset completed in under 2 minutes with instant access restoration.</p>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 16px; padding: 25px; margin: 25px 0;">
        <h3 style="color: #92400e; margin-top: 0; text-align: center;">💡 Password Security Best Practices</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
          <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">🔤</div>
            <h4 style="color: #374151; margin: 0 0 5px 0;">12+ Characters</h4>
            <p style="color: #6b7280; font-size: 12px; margin: 0;">Mixed case letters</p>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">🔢</div>
            <h4 style="color: #374151; margin: 0 0 5px 0;">Numbers & Symbols</h4>
            <p style="color: #6b7280; font-size: 12px; margin: 0;">Include special characters</p>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">🔒</div>
            <h4 style="color: #374151; margin: 0 0 5px 0;">Unique Password</h4>
            <p style="color: #6b7280; font-size: 12px; margin: 0;">Different for each account</p>
          </div>
        </div>
      </div>

      <div style="background: #f1f5f9; border: 2px solid #cbd5e1; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h4 style="color: #1e293b; margin-top: 0; text-align: center;">🚨 Didn't Request This Reset?</h4>
        <p style="color: #475569; text-align: center; margin: 15px 0;">If you didn't request this password reset, your account may be at risk.</p>
        <div style="text-align: center;">
          <a href="mailto:security@hiremzansi.co.za" class="secondary-button" style="border-color: #dc2626; color: #dc2626;">Contact Security Team</a>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
        <h4 style="color: #1e40af; margin-top: 0;">🛡️ Your Account Is Protected</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 15px 0;">
          <div style="color: #1e40af; font-size: 14px;">✓ SSL Encryption</div>
          <div style="color: #1e40af; font-size: 14px;">✓ Fraud Detection</div>
          <div style="color: #1e40af; font-size: 14px;">✓ 24/7 Monitoring</div>
          <div style="color: #1e40af; font-size: 14px;">✓ Threat Response</div>
        </div>
      </div>
      `
    )
  },
  EMAIL_VERIFICATION: {
    subject: '🚀 Verify Your Account - Join 10,000+ South Africans Transforming Their Careers',
    text: (name: string, verificationLink: string) => `
Dear ${name || 'Future Career Success Story'},

🎯 Welcome to Hire Mzansi - Where AI Meets South African Career Excellence!

You're just ONE CLICK away from joining over 10,000 South Africans who have transformed their careers with our cutting-edge AI technology.

VERIFY YOUR ACCOUNT: ${verificationLink}

🏆 WHAT MAKES HIRE MZANSI SPECIAL:
• #1 AI-Powered CV Platform in South Africa (95% success rate)
• Advanced ATS Optimization (Beat 87% of applicants)
• B-BBEE Compliance Analysis (Essential for SA job market)
• Real-time Industry Salary Insights
• 500+ Top SA Companies Using Our Platform
• Average 40% Increase in Interview Calls

📊 IMPRESSIVE STATS:
• 10,000+ CVs Optimized Successfully
• 95% User Success Rate
• 500+ Partner Companies
• R50+ Million in Salary Increases Generated

⚡ IMMEDIATE BENEFITS AFTER VERIFICATION:
✓ Free AI CV Analysis (Worth R500)
✓ ATS Compatibility Report
✓ South African Market Insights
✓ Personalized Career Roadmap
✓ Industry Salary Benchmarking
✓ B-BBEE Compliance Assessment

🔒 SECURITY: This link expires in 24 hours for your protection.

Ready to transform your career? Verify now: ${verificationLink}

Questions? Reply to this email or WhatsApp us at +27 12 345 6789

Transform. Succeed. Prosper.
The Hire Mzansi Team

P.S. Don't miss out! 73% of our users get interview calls within 30 days.
    `,
    html: (name: string, verificationLink: string) => createProfessionalEmailTemplate(
      'Complete Your Registration',
      `
      <div class="welcome-badge">🌟 South Africa's #1 AI Career Platform</div>
      
      <div style="text-align: center; margin-bottom: 35px;">
        <h1>Welcome to the Future of Your Career, ${name || 'Professional'}!</h1>
        <p style="color: #374151; font-size: 18px; margin: 20px 0;">Join 10,000+ South Africans who transformed their careers with AI</p>
      </div>

      <div class="highlight-box">
        <h3 style="color: #92400e; margin-top: 0; text-align: center;">🎯 You're 1 Click Away from Career Success!</h3>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${verificationLink}" class="cta-button success-button">Verify & Start Transforming</a>
        </div>
        <p style="text-align: center; color: #92400e; font-size: 14px; margin: 0;">⏰ This secure link expires in 24 hours</p>
      </div>

      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h4>AI-Powered Analysis</h4>
          <p style="margin: 0; color: #6b7280;">Advanced algorithms analyze your CV like top recruiters, with 95% accuracy rate.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🇿🇦</div>
          <h4>South African Focus</h4>
          <p style="margin: 0; color: #6b7280;">B-BBEE compliance, local market insights, and SA-specific optimization.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💼</div>
          <h4>Job Matching</h4>
          <p style="margin: 0; color: #6b7280;">Connect with 500+ top SA companies actively hiring through our platform.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📈</div>
          <h4>Proven Results</h4>
          <p style="margin: 0; color: #6b7280;">Users see 40% increase in interview calls and R50M+ in salary increases.</p>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center;">
        <h3 style="color: #1e40af; margin-top: 0;">🎁 Immediate Access After Verification</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 25px;">
          <div style="background: white; padding: 15px; border-radius: 12px; border: 2px solid #e0f2fe;">
            <div style="font-size: 24px; color: #059669; font-weight: bold;">R500</div>
            <div style="font-size: 12px; color: #6b7280;">Free CV Analysis</div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 12px; border: 2px solid #dcfce7;">
            <div style="font-size: 24px; color: #3b82f6; font-weight: bold;">87%</div>
            <div style="font-size: 12px; color: #6b7280;">ATS Beat Rate</div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 12px; border: 2px solid #fef3c7;">
            <div style="font-size: 24px; color: #f59e0b; font-weight: bold;">40%</div>
            <div style="font-size: 12px; color: #6b7280;">More Interviews</div>
          </div>
        </div>
      </div>

      <div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h4 style="color: #dc2626; margin-top: 0; text-align: center;">⚡ Limited Time Opportunity</h4>
        <p style="color: #7f1d1d; text-align: center; margin: 15px 0;">Join now and get FREE access to premium features worth R2,000+</p>
        <div style="text-align: center;">
          <a href="${verificationLink}" class="cta-button">Claim Your Free Access Now</a>
        </div>
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