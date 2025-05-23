import twilio from 'twilio';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { storage } from '../storage';
import { aiService } from './aiService';
import crypto from 'crypto';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Check if required environment variables are set
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client if credentials are available
let twilioClient: twilio.Twilio | null = null;
if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
} else {
  console.warn('WhatsApp service not configured. Missing environment variables.');
}

/**
 * Service for handling WhatsApp interactions
 */
class WhatsAppService {
  /**
   * Process incoming webhook from WhatsApp
   */
  async processWebhook(payload: any): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Processing WhatsApp webhook:', JSON.stringify(payload, null, 2));
      
      // Check if this is a media message (CV upload)
      if (payload.NumMedia && parseInt(payload.NumMedia) > 0) {
        return await this.handleMediaMessage(payload);
      } 
      
      // Handle text message
      if (payload.Body) {
        return await this.handleTextMessage(payload);
      }
      
      return { success: true, message: 'Webhook received, but no actionable content' };
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
      return { success: false, message: 'Error processing webhook' };
    }
  }
  
  /**
   * Handle media messages (CV uploads)
   */
  private async handleMediaMessage(payload: any): Promise<{ success: boolean; message: string }> {
    const from = payload.From;
    const numMedia = parseInt(payload.NumMedia);
    
    // Only process the first media item if multiple are sent
    if (numMedia > 0) {
      const mediaUrl = payload.MediaUrl0;
      const contentType = payload.MediaContentType0;
      
      // Check if media type is supported (PDF, DOC, DOCX)
      if (this.isSupportedFileType(contentType)) {
        try {
          // Download the file
          const filePath = await this.downloadFile(mediaUrl, contentType);
          
          // Find or create user by phone number
          const user = await this.findOrCreateUserByPhone(from);
          
          if (user) {
            // Save the CV to the database
            const cv = await this.saveCV(user.id, filePath, contentType);
            
            // Analyze the CV
            const analysis = await this.analyzeCV(cv.id);
            
            // Send the analysis results back via WhatsApp
            await this.sendAnalysisResults(from, analysis);
            
            return { 
              success: true, 
              message: 'CV received, analyzed, and results sent' 
            };
          }
          
          return { 
            success: false, 
            message: 'Error finding or creating user' 
          };
        } catch (err) {
          console.error('Error processing media file:', err);
          this.sendSimpleMessage(from, 'Sorry, we had an issue processing your CV. Please try again or upload in a different format.');
          return { success: false, message: 'Error processing media file' };
        }
      } else {
        // Unsupported file type
        this.sendSimpleMessage(from, 
          'Sorry, we only support CV files in PDF, DOC, or DOCX format. Please upload your CV in one of these formats.'
        );
        return { 
          success: false, 
          message: 'Unsupported file type' 
        };
      }
    }
    
    return { success: false, message: 'No media found' };
  }
  
  /**
   * Handle text messages
   */
  private async handleTextMessage(payload: any): Promise<{ success: boolean; message: string }> {
    const from = payload.From;
    const message = payload.Body.trim().toLowerCase();
    
    // Basic command handling
    if (message === 'help') {
      this.sendSimpleMessage(from, 
        'Welcome to ATSBoost! To get your CV analyzed, simply send your CV as a file attachment. ' +
        'We support PDF, DOC, and DOCX formats. For more information, visit our website at atsboost.co.za'
      );
      return { success: true, message: 'Help message sent' };
    } 
    else if (message === 'feedback') {
      this.sendSimpleMessage(from, 
        'Thanks for using ATSBoost! We would love to hear your feedback. ' +
        'Please let us know how our service has helped with your job search journey.'
      );
      return { success: true, message: 'Feedback request sent' };
    }
    else {
      // Default response for other text messages
      this.sendSimpleMessage(from, 
        'To get your CV analyzed, please send your CV as a file attachment (PDF, DOC, or DOCX). ' +
        'Type "help" for more information.'
      );
      return { success: true, message: 'Default instruction sent' };
    }
  }
  
  /**
   * Check if a file type is supported
   */
  private isSupportedFileType(contentType: string): boolean {
    const supportedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    return supportedTypes.includes(contentType);
  }
  
  /**
   * Download file from media URL
   */
  private async downloadFile(url: string, contentType: string): Promise<string> {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
      await mkdirAsync(uploadsDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    
    // Generate a unique filename
    const fileExt = this.getFileExtension(contentType);
    const fileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Fetch and save the file
    // Simplified version - in a real app we'd use another package like axios/node-fetch
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    await writeFileAsync(filePath, Buffer.from(buffer));
    
    return filePath;
  }
  
  /**
   * Get file extension based on content type
   */
  private getFileExtension(contentType: string): string {
    switch (contentType) {
      case 'application/pdf':
        return '.pdf';
      case 'application/msword':
        return '.doc';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '.docx';
      default:
        return '.txt';
    }
  }
  
  /**
   * Find or create a user by phone number
   */
  private async findOrCreateUserByPhone(phoneNumber: string): Promise<any> {
    // Clean phone number
    const cleanedNumber = this.cleanPhoneNumber(phoneNumber);
    
    // Check if user with this phone number already exists
    const existingUser = await storage.getUserByPhoneNumber(cleanedNumber);
    
    if (existingUser) {
      return existingUser;
    }
    
    // Create a new temporary user
    const username = `whatsapp_${Date.now()}`;
    const password = crypto.randomBytes(16).toString('hex');
    
    const newUser = await storage.createUser({
      username, 
      password, 
      email: 'placeholder@example.com', 
      phoneNumber: cleanedNumber,
      phoneVerified: true,
      isTemporary: true
    });
    
    return newUser;
  }
  
  /**
   * Save CV to database
   */
  private async saveCV(userId: number, filePath: string, contentType: string): Promise<any> {
    // Get filename from path
    const fileName = path.basename(filePath);
    
    // Get file size
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    // Create CV record
    const cv = await storage.createCV({
      userId,
      fileName,
      filePath,
      fileType: contentType,
      fileSize,
      uploadMethod: 'whatsapp',
      content: 'CV content will be extracted later',
      title: 'CV uploaded via WhatsApp'
    });
    
    return cv;
  }
  
  /**
   * Analyze CV and generate ATS score
   */
  private async analyzeCV(cvId: number): Promise<any> {
    // Get CV details
    const cv = await storage.getCV(cvId);
    
    if (!cv) {
      throw new Error('CV not found');
    }
    
    // Extract text from CV file
    const text = await aiService.extractTextFromCV(cv.filePath || '');
    
    // Update CV with extracted text
    await storage.updateCV(cv.id, { content: text });
    
    // Analyze the CV text
    const analysis = await aiService.analyzeCVText(text);
    
    // Create ATS score record
    const atsScore = await storage.createATSScore({
      cvId: cv.id,
      score: analysis.score,
      skillsScore: analysis.skillsScore,
      contextScore: analysis.contextScore,
      formatScore: analysis.formatScore,
      issues: analysis.issues,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      breakdown: analysis.breakdown
    });
    
    return {
      cv,
      atsScore,
      recommendations: analysis.improvements
    };
  }
  
  /**
   * Send analysis results via WhatsApp
   */
  private async sendAnalysisResults(to: string, analysis: any): Promise<boolean> {
    if (!twilioClient || !twilioPhoneNumber) {
      console.error('Cannot send analysis results: Twilio not configured');
      return false;
    }
    
    const { cv, atsScore } = analysis;
    
    // Build a message with the ATS score and recommendations
    let message = `📄 *ATS Score Analysis* 📄\n\n`;
    message += `Your CV scored *${atsScore.score}/100* on our ATS compatibility check.\n\n`;
    message += `*Breakdown:*\n`;
    message += `• Format: ${atsScore.formatScore}/40\n`;
    message += `• Skills: ${atsScore.skillsScore}/40\n`;
    message += `• SA Context: ${atsScore.contextScore}/20\n\n`;
    
    message += `*Top Recommendations:*\n`;
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      analysis.recommendations.slice(0, 3).forEach((rec, i) => {
        message += `${i + 1}. ${rec}\n`;
      });
    } else {
      message += `No specific recommendations at this time.\n`;
    }
    
    message += `\n📱 Get your complete analysis at atsboost.co.za\n`;
    
    try {
      await twilioClient.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: to
      });
      
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp analysis:', error);
      return false;
    }
  }
  
  /**
   * Send a simple WhatsApp message
   */
  private async sendSimpleMessage(to: string, message: string): Promise<boolean> {
    if (!twilioClient || !twilioPhoneNumber) {
      console.error('Cannot send message: Twilio not configured');
      return false;
    }
    
    try {
      await twilioClient.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: to
      });
      
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }
  
  /**
   * Send upload instructions via WhatsApp
   */
  async sendUploadInstructions(phoneNumber: string): Promise<boolean> {
    const message = 
      `📄 *Upload Your CV via WhatsApp* 📄\n\n` +
      `Thanks for using ATSBoost! You can now upload your CV directly through WhatsApp for instant ATS scoring.\n\n` +
      `*How to upload:*\n` +
      `1. Find your CV file (PDF or Word document)\n` +
      `2. Send it as an attachment to this chat\n` +
      `3. Wait for your ATS score and recommendations\n\n` +
      `Your CV will be automatically analyzed by our AI system to maximize your chances of getting past Applicant Tracking Systems.`;
    
    // Format phone number properly
    const formattedNumber = this.cleanPhoneNumber(phoneNumber);
    
    return await this.sendSimpleMessage(formattedNumber, message);
  }
  
  /**
   * Send verification code via WhatsApp
   */
  async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    const message = 
      `📱 *Your ATSBoost Verification Code* 📱\n\n` +
      `Your verification code is: *${code}*\n\n` +
      `This code will expire in 10 minutes.\n\n` +
      `If you didn't request this code, please ignore this message.`;
    
    // Format phone number properly
    const formattedNumber = this.cleanPhoneNumber(phoneNumber);
    
    return await this.sendSimpleMessage(formattedNumber, message);
  }
  
  /**
   * Clean phone number to standard format
   */
  private cleanPhoneNumber(phoneNumber: string): string {
    // Remove any non-digits
    let digits = phoneNumber.replace(/\D/g, '');
    
    // For WhatsApp numbers with standard format "whatsapp:+27712345678"
    if (phoneNumber.startsWith('whatsapp:')) {
      return phoneNumber;
    }
    
    // If it's a South African number starting with 0, replace with +27
    if (digits.startsWith('0') && digits.length === 10) {
      digits = `27${digits.substring(1)}`;
    }
    
    // Ensure it has the whatsapp: prefix and + for the country code
    if (!digits.startsWith('27') && digits.length === 9) {
      digits = `27${digits}`;
    }
    
    return `whatsapp:+${digits}`;
  }
}

export const whatsappService = new WhatsAppService();