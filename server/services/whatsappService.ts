import twilio from 'twilio';
import { storage } from '../storage';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { aiService } from './aiService';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * WhatsApp Notification Service for ATSBoost
 * 
 * This service handles sending notifications to users via WhatsApp
 * Uses the WhatsApp Business API through Twilio
 */
export class WhatsAppService {
  private client: twilio.Twilio | null = null;
  private config: WhatsAppConfig = {
    enabled: false
  };

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (accountSid && authToken && phoneNumber) {
      this.client = twilio(accountSid, authToken);
      this.config = {
        enabled: true,
        accountSid,
        authToken,
        phoneNumber
      };
      console.log('WhatsApp service initialized successfully');
    } else {
      console.warn('WhatsApp service not configured. Missing environment variables.');
      this.config.enabled = false;
      this.client = null;
    }
  }

  /**
   * Send a message to a WhatsApp number
   */
  async sendMessage(to: string, body: string): Promise<boolean> {
    if (!this.client || !this.config.enabled || !this.config.phoneNumber) {
      console.warn('WhatsApp service not configured or disabled');
      return false;
    }

    try {
      // Format the 'to' number to WhatsApp format if it's not already
      let formattedTo = to;
      if (!to.startsWith('whatsapp:')) {
        // Remove any non-digit characters and ensure proper format
        const digitsOnly = to.replace(/\D/g, '');
        
        // Add country code if it's missing (assuming South African number)
        if (digitsOnly.startsWith('0')) {
          formattedTo = `whatsapp:+27${digitsOnly.substring(1)}`;
        } else if (!digitsOnly.startsWith('27') && !digitsOnly.startsWith('+27')) {
          formattedTo = `whatsapp:+27${digitsOnly}`;
        } else {
          formattedTo = `whatsapp:+${digitsOnly.replace(/^\+/, '')}`;
        }
      }

      await this.client.messages.create({
        from: `whatsapp:${this.config.phoneNumber}`,
        to: formattedTo,
        body
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Send a verification code to a WhatsApp number
   */
  async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    const message = `Your ATSBoost verification code is: ${code}. This code will expire in 10 minutes.`;
    return this.sendMessage(phoneNumber, message);
  }

  /**
   * Send CV analysis results via WhatsApp
   */
  async sendATSScoreResults(phoneNumber: string, score: number, recommendations: string[]): Promise<boolean> {
    let message = `📊 Your ATSBoost CV Score: ${score}/100\n\n`;
    
    if (recommendations.length > 0) {
      message += '🔍 Top Recommendations:\n';
      
      // Include up to 3 recommendations to keep the message manageable
      recommendations.slice(0, 3).forEach((rec, index) => {
        message += `${index + 1}. ${rec}\n`;
      });
      
      message += '\n';
    }
    
    message += '🌐 View your full analysis at: https://atsboost.co.za/dashboard\n\n';
    message += 'Reply with "HELP" for assistance or "STOP" to unsubscribe.';
    
    return this.sendMessage(phoneNumber, message);
  }

  /**
   * Process a WhatsApp webhook for uploaded documents
   * This handles incoming files (CV uploads) via WhatsApp
   */
  async processWebhook(payload: any): Promise<any> {
    if (!this.client || !this.config.enabled) {
      console.warn('WhatsApp service not configured or disabled');
      return { success: false, error: 'Service not available' };
    }

    try {
      // Extract the necessary information from the webhook payload
      const numMedia = parseInt(payload.NumMedia || '0');
      const from = payload.From; // WhatsApp number in format 'whatsapp:+1234567890'
      const cleanedFrom = from.replace('whatsapp:', '');
      
      // Check if there's any media (document) attached
      if (numMedia > 0) {
        // Get first media item (assuming it's a CV)
        const mediaUrl = payload.MediaUrl0;
        const contentType = payload.MediaContentType0;
        
        // Verify if it's a document (PDF or DOCX)
        if (contentType === 'application/pdf' || 
            contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            contentType === 'application/msword') {
          
          // Download the document
          const response = await fetch(mediaUrl);
          const buffer = await response.arrayBuffer();
          
          // Create uploads directory if it doesn't exist
          const uploadsDir = path.join(process.cwd(), 'uploads');
          try {
            await mkdirAsync(uploadsDir, { recursive: true });
          } catch (err) {
            if (err.code !== 'EEXIST') throw err;
          }
          
          // Generate a unique filename
          const fileExtension = contentType === 'application/pdf' ? '.pdf' : 
                               (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? '.docx' : '.doc');
          const filename = `whatsapp_cv_${uuidv4()}${fileExtension}`;
          const filePath = path.join(uploadsDir, filename);
          
          // Save the file
          await writeFileAsync(filePath, Buffer.from(buffer));
          
          // Find user by WhatsApp number or create a temporary user
          let user = await storage.getUserByPhoneNumber(cleanedFrom);
          
          if (!user) {
            // Create a temporary user for this WhatsApp number
            const tempUser = {
              username: `whatsapp_${uuidv4().substring(0, 8)}`,
              password: uuidv4(), // Random password, user can reset later
              email: null,
              phoneNumber: cleanedFrom,
              isTemporary: true
            };
            
            user = await storage.createUser(tempUser);
          }
          
          // Create CV record in database
          const cv = await storage.createCV({
            userId: user.id,
            fileName: filename,
            filePath: filePath,
            fileType: contentType,
            fileSize: buffer.byteLength,
            uploadMethod: 'whatsapp'
          });
          
          // Process the CV and get ATS score
          await this.processAndAnalyzeCV(cv.id, cleanedFrom);
          
          // Send confirmation message
          await this.sendMessage(from, 
            "✅ Your CV has been received! We're analyzing it now and will send you the results shortly. " +
            "This usually takes 1-2 minutes."
          );
          
          return { 
            success: true, 
            message: 'CV received and being processed',
            userId: user.id,
            cvId: cv.id
          };
        } else {
          // Not a supported document type
          await this.sendMessage(from, 
            "❌ Sorry, we only accept CV files in PDF, DOCX, or DOC format. Please send your CV in one of these formats."
          );
          
          return { 
            success: false, 
            error: 'Unsupported file type' 
          };
        }
      } else {
        // Handle text messages - provide instructions
        const message = payload.Body?.trim().toLowerCase();
        
        if (message === 'help') {
          await this.sendMessage(from, 
            "📋 *ATSBoost Help*\n\n" +
            "To analyze your CV, simply send it as a PDF or DOCX file.\n\n" +
            "Commands:\n" +
            "- Send CV file: Upload your CV for analysis\n" +
            "- HELP: Show this help message\n" +
            "- STOP: Unsubscribe from notifications\n\n" +
            "Visit https://atsboost.co.za for more information."
          );
        } else {
          await this.sendMessage(from, 
            "👋 Welcome to ATSBoost!\n\n" +
            "To analyze your CV, please send it as a PDF or DOCX file.\n\n" +
            "Once analyzed, we'll send you your ATS score and recommendations to improve your CV for the South African job market."
          );
        }
        
        return { 
          success: true, 
          message: 'Instructions sent' 
        };
      }
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
      return { 
        success: false, 
        error: 'Failed to process request' 
      };
    }
  }

  /**
   * Process and analyze the uploaded CV
   */
  private async processAndAnalyzeCV(cvId: number, phoneNumber: string): Promise<void> {
    try {
      // Start analysis in the background
      setTimeout(async () => {
        try {
          // Get CV details
          const cv = await storage.getCV(cvId);
          if (!cv) {
            console.error(`CV with ID ${cvId} not found`);
            return;
          }

          // Check if CV has already been analyzed
          let atsScore = await storage.getATSScoreByCV(cvId);
          
          // If not, analyze it
          if (!atsScore) {
            // Extract text from CV
            const cvText = await aiService.extractTextFromCV(cv.filePath);
            
            // Analyze the CV
            const analysisResult = await aiService.analyzeCVText(cvText);
            
            // Save ATS score and recommendations
            atsScore = await storage.createATSScore({
              cvId,
              score: analysisResult.score,
              breakdown: analysisResult.breakdown,
              recommendations: analysisResult.recommendations
            });
          }
          
          // Format recommendations for WhatsApp
          const formattedRecommendations = atsScore.recommendations
            .map(rec => rec.suggestion)
            .slice(0, 5); // Take top 5 recommendations
          
          // Send results via WhatsApp
          await this.sendATSScoreResults(phoneNumber, atsScore.score, formattedRecommendations);
          
        } catch (error) {
          console.error('Error in background CV analysis:', error);
          // Send error message to user
          this.sendMessage(phoneNumber, 
            "❌ Sorry, we encountered an error while analyzing your CV. Please try again or visit our website at https://atsboost.co.za for assistance."
          );
        }
      }, 100); // Start processing immediately but don't block the response
    } catch (error) {
      console.error('Failed to process CV:', error);
    }
  }

  /**
   * Send WhatsApp upload instructions to a user
   */
  async sendUploadInstructions(phoneNumber: string): Promise<boolean> {
    const message = 
      "📄 *Upload Your CV via WhatsApp*\n\n" +
      "To analyze your CV using ATSBoost, please:\n\n" +
      "1️⃣ Save your CV as a PDF or DOCX file\n" +
      "2️⃣ Send that file to this WhatsApp number\n" +
      "3️⃣ Wait for your analysis (typically 1-2 minutes)\n\n" +
      "We'll send your ATS score and personalized recommendations to improve your CV for the South African job market.";
    
    return this.sendMessage(phoneNumber, message);
  }
}

interface WhatsAppConfig {
  enabled: boolean;
  accountSid?: string; 
  authToken?: string;
  phoneNumber?: string;
}

// Singleton instance
export const whatsappService = new WhatsAppService();