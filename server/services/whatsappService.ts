/**
 * WhatsApp Notification Service for ATSBoost
 * 
 * This service handles sending notifications to users via WhatsApp
 * Uses the WhatsApp Business API through a provider like Twilio
 */

interface WhatsAppConfig {
  enabled: boolean;
  accountSid?: string; 
  authToken?: string;
  phoneNumber?: string;
}

interface NotificationData {
  to: string; // Phone number in international format (e.g., +27821234567)
  templateName: string;
  templateData: Record<string, string>;
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  
  constructor() {
    // Check if the required environment variables are set
    this.config = {
      enabled: !!process.env.TWILIO_ACCOUNT_SID && 
               !!process.env.TWILIO_AUTH_TOKEN && 
               !!process.env.TWILIO_PHONE_NUMBER,
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    };
    
    if (!this.config.enabled) {
      console.warn('WhatsApp notifications are disabled due to missing configuration.');
    }
  }
  
  /**
   * Send a CV analysis notification to the user
   * 
   * @param phoneNumber User's phone number in international format (e.g., +27821234567)
   * @param score The ATS score achieved
   * @param cvName Name of the CV
   * @returns Promise resolving to success/failure
   */
  async sendCVAnalysisNotification(phoneNumber: string, score: number, cvName: string): Promise<boolean> {
    if (!this.isValidSAPhoneNumber(phoneNumber)) {
      console.error('Invalid South African phone number:', phoneNumber);
      return false;
    }
    
    return this.sendNotification({
      to: phoneNumber,
      templateName: 'cv_analysis_complete',
      templateData: {
        cv_name: cvName,
        score: score.toString(),
        dashboard_url: 'https://atsboost.co.za/dashboard'
      }
    });
  }
  
  /**
   * Send a job match notification to the user
   * 
   * @param phoneNumber User's phone number
   * @param jobTitle Title of the matched job
   * @param company Company offering the job
   * @param location Job location
   * @returns Promise resolving to success/failure
   */
  async sendJobMatchNotification(
    phoneNumber: string, 
    jobTitle: string, 
    company: string, 
    location: string
  ): Promise<boolean> {
    if (!this.isValidSAPhoneNumber(phoneNumber)) {
      console.error('Invalid South African phone number:', phoneNumber);
      return false;
    }
    
    return this.sendNotification({
      to: phoneNumber,
      templateName: 'job_match',
      templateData: {
        job_title: jobTitle,
        company: company,
        location: location,
        job_url: 'https://atsboost.co.za/jobs/match'
      }
    });
  }
  
  /**
   * Send a subscription confirmation to the user
   * 
   * @param phoneNumber User's phone number
   * @param planName Name of the subscription plan
   * @param expiryDate Expiry date of the subscription
   * @returns Promise resolving to success/failure
   */
  async sendSubscriptionConfirmation(
    phoneNumber: string, 
    planName: string, 
    expiryDate: string
  ): Promise<boolean> {
    if (!this.isValidSAPhoneNumber(phoneNumber)) {
      console.error('Invalid South African phone number:', phoneNumber);
      return false;
    }
    
    return this.sendNotification({
      to: phoneNumber,
      templateName: 'subscription_confirmation',
      templateData: {
        plan_name: planName,
        expiry_date: expiryDate,
        dashboard_url: 'https://atsboost.co.za/dashboard'
      }
    });
  }
  
  /**
   * Send a payment confirmation to the user
   * 
   * @param phoneNumber User's phone number
   * @param serviceType Type of service purchased (e.g., "Deep Analysis")
   * @param amount Amount paid
   * @returns Promise resolving to success/failure
   */
  async sendPaymentConfirmation(
    phoneNumber: string,
    serviceType: string,
    amount: string
  ): Promise<boolean> {
    if (!this.isValidSAPhoneNumber(phoneNumber)) {
      console.error('Invalid South African phone number:', phoneNumber);
      return false;
    }
    
    return this.sendNotification({
      to: phoneNumber,
      templateName: 'payment_confirmation',
      templateData: {
        service_type: serviceType,
        amount: amount,
        dashboard_url: 'https://atsboost.co.za/dashboard'
      }
    });
  }
  
  /**
   * Send a verification code to the user's WhatsApp
   * 
   * @param phoneNumber User's phone number
   * @returns Promise resolving to success/failure
   */
  async sendVerificationCode(phoneNumber: string): Promise<boolean> {
    if (!this.isValidSAPhoneNumber(phoneNumber)) {
      console.error('Invalid South African phone number:', phoneNumber);
      return false;
    }
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    return this.sendNotification({
      to: phoneNumber,
      templateName: 'verification_code',
      templateData: {
        verification_code: verificationCode,
        valid_minutes: '10'
      }
    });
  }
  
  /**
   * General method to send a notification using a template
   * 
   * @param data Notification data including recipient and template details
   * @returns Promise resolving to success/failure
   */
  private async sendNotification(data: NotificationData): Promise<boolean> {
    // Check if WhatsApp integration is enabled
    if (!this.config.enabled) {
      console.log('WhatsApp notification would be sent (DEMO MODE):', data);
      return true; // Simulated success in development
    }
    
    try {
      // In production, this would use the actual Twilio API
      // For development, we'll just log the notification
      console.log('Sending WhatsApp notification:', data);
      
      // Example Twilio API implementation (commented out)
      /*
      const client = require('twilio')(this.config.accountSid, this.config.authToken);
      const message = await client.messages.create({
        body: this.formatTemplateMessage(data.templateName, data.templateData),
        from: `whatsapp:${this.config.phoneNumber}`,
        to: `whatsapp:${data.to}`
      });
      console.log('WhatsApp message sent with SID:', message.sid);
      */
      
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
      return false;
    }
  }
  
  /**
   * Validates if a phone number is a valid South African number
   * 
   * @param phoneNumber Phone number to validate
   * @returns boolean indicating if the number is valid
   */
  private isValidSAPhoneNumber(phoneNumber: string): boolean {
    // Basic validation for South African numbers
    // Should start with +27 followed by 9 digits
    // or 0 followed by 9 digits
    const saPhoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    return saPhoneRegex.test(phoneNumber);
  }
  
  /**
   * Format a template message with the provided data
   * 
   * @param templateName Name of the template to use
   * @param data Data to populate the template with
   * @returns Formatted message string
   */
  private formatTemplateMessage(templateName: string, data: Record<string, string>): string {
    // Templates would be defined and approved in the WhatsApp Business API
    // For development, we'll use simple text templates
    const templates: Record<string, string> = {
      cv_analysis_complete: 
        `ATSBoost: Your CV "${data.cv_name}" analysis is complete! Your ATS score is ${data.score}%. View details: ${data.dashboard_url}`,
      
      job_match:
        `ATSBoost: We found a job match for you! ${data.job_title} at ${data.company} in ${data.location}. View details: ${data.job_url}`,
      
      subscription_confirmation:
        `ATSBoost: Thank you for subscribing to our ${data.plan_name} plan! Your subscription is active until ${data.expiry_date}. View your account: ${data.dashboard_url}`
    };
    
    return templates[templateName] || `ATSBoost notification: Template "${templateName}" not found.`;
  }
}

// Singleton instance
export const whatsappService = new WhatsAppService();