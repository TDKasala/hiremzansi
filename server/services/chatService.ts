import OpenAI from "openai";

// Initialize xAI client
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

// Initialize OpenAI client as fallback
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  confidence: number;
  category: string;
}

class ChatService {
  private sessions: Map<string, ChatSession> = new Map();

  constructor() {
    this.cleanupOldSessions();
  }

  private cleanupOldSessions() {
    // Clean up sessions older than 24 hours every hour
    setInterval(() => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.lastActivity < oneDayAgo) {
          this.sessions.delete(sessionId);
        }
      }
    }, 60 * 60 * 1000);
  }

  private getSystemPrompt(): string {
    return `You are an AI career assistant for Hire Mzansi, a South African job marketplace and CV optimization platform. Your role is to help users with:

1. CV OPTIMIZATION:
   - ATS (Applicant Tracking System) compliance tips
   - South African CV formatting best practices
   - Keyword optimization for local job market
   - B-BBEE compliance guidance
   - NQF level recommendations

2. JOB SEARCH GUIDANCE:
   - South African job market insights
   - Industry-specific advice
   - Interview preparation tips
   - Salary negotiation in SA context
   - Professional development guidance

3. PLATFORM FEATURES:
   - How to use Hire Mzansi tools
   - Premium service benefits
   - Subscription plans and pricing
   - File upload and analysis process
   - WhatsApp integration features

4. SOUTH AFRICAN CONTEXT:
   - Employment Equity Act compliance
   - Skills development and SETA requirements
   - Provincial job market differences
   - Cultural workplace considerations
   - Local hiring practices

IMPORTANT GUIDELINES:
- Keep responses concise and actionable (under 200 words)
- Use South African terminology and context
- Be encouraging and professional
- Provide specific, practical advice
- Reference Hire Mzansi features when relevant
- If unsure, suggest contacting support or exploring the platform

For pricing questions:
- Essential Pack: R25 one-time (CV analysis + basic recommendations)
- Professional Plan: R50/month (premium features + ongoing support)
- Annual discount available for R100 savings

Always maintain a helpful, professional tone while being culturally aware of the South African job market.`;
  }

  private categorizeQuery(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cv') || lowerMessage.includes('resume') || lowerMessage.includes('ats') || lowerMessage.includes('optimize')) {
      return 'cv_optimization';
    }
    if (lowerMessage.includes('job') || lowerMessage.includes('career') || lowerMessage.includes('interview') || lowerMessage.includes('search')) {
      return 'job_search';
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('plan') || lowerMessage.includes('subscription')) {
      return 'pricing';
    }
    if (lowerMessage.includes('b-bbee') || lowerMessage.includes('bbee') || lowerMessage.includes('equity') || lowerMessage.includes('south africa')) {
      return 'sa_context';
    }
    if (lowerMessage.includes('upload') || lowerMessage.includes('whatsapp') || lowerMessage.includes('how to') || lowerMessage.includes('feature')) {
      return 'platform_help';
    }
    
    return 'general';
  }

  private getQuickResponse(category: string, message: string): string | null {
    const lowerMessage = message.toLowerCase();

    // Quick responses for common questions
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return `Our pricing is designed for the South African market:

**Essential Pack**: R25 (one-time)
- Complete CV analysis
- ATS compatibility check
- Basic optimization tips

**Professional Plan**: R50/month
- Unlimited CV analyses
- Premium recommendations
- Job matching notifications
- Priority support

**Annual Plan**: Save R100 with yearly subscription

All plans include South African context analysis and B-BBEE guidance. Would you like to know more about any specific plan?`;
    }

    if (lowerMessage.includes('b-bbee') || lowerMessage.includes('bbee')) {
      return `B-BBEE compliance is crucial for SA job applications. Here's how we help:

✓ **B-BBEE Status Check**: We analyze if your CV mentions your B-BBEE status appropriately
✓ **EE Compliance**: Guidance on Employment Equity requirements
✓ **Skills Development**: SETA and NQF level recommendations
✓ **Transformation Scoring**: Tips for highlighting transformation contributions

Our AI specifically looks for B-BBEE elements that SA employers value. Would you like tips on how to present your B-BBEE status effectively?`;
    }

    if (lowerMessage.includes('upload') || lowerMessage.includes('how to')) {
      return `Easy ways to get your CV analyzed:

**Website Upload**:
1. Visit our CV analysis page
2. Drag & drop your CV (PDF, DOC, DOCX)
3. Get instant results in 30-60 seconds

**WhatsApp Upload**:
1. Send "Hi" to our WhatsApp number
2. Upload your CV file directly
3. Receive analysis via WhatsApp

**Supported Formats**: PDF, DOC, DOCX, TXT
**File Size**: Up to 10MB

Our AI analyzes for ATS compatibility, South African context, and provides actionable improvements. Ready to upload?`;
    }

    if (lowerMessage.includes('ats') && lowerMessage.includes('optimize')) {
      return `ATS optimization for South African companies:

**Key ATS Tips**:
• Use standard section headings (Experience, Education, Skills)
• Include relevant keywords from job descriptions
• Avoid graphics, tables, headers/footers
• Use standard fonts (Arial, Calibri, Times New Roman)
• Save as PDF or DOC format

**SA-Specific ATS Elements**:
• Include your South African ID number
• Mention relevant NQF levels
• List local qualifications clearly
• Use SA industry terminology

Our analysis checks for 25+ ATS factors specifically tuned for South African employers. Want me to explain any specific ATS requirement?`;
    }

    return null;
  }

  async processMessage(sessionId: string, userMessage: string): Promise<ChatResponse> {
    try {
      // Get or create session
      let session = this.sessions.get(sessionId);
      if (!session) {
        session = {
          sessionId,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(),
              timestamp: new Date()
            }
          ],
          createdAt: new Date(),
          lastActivity: new Date()
        };
        this.sessions.set(sessionId, session);
      }

      // Update last activity
      session.lastActivity = new Date();

      // Categorize the query
      const category = this.categorizeQuery(userMessage);

      // Check for quick responses first
      const quickResponse = this.getQuickResponse(category, userMessage);
      if (quickResponse) {
        // Add messages to session
        session.messages.push({
          role: 'user',
          content: userMessage,
          timestamp: new Date()
        });
        session.messages.push({
          role: 'assistant',
          content: quickResponse,
          timestamp: new Date()
        });

        return {
          message: quickResponse,
          confidence: 0.95,
          category
        };
      }

      // Add user message to session
      session.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Keep only recent messages for context (last 10 messages)
      const recentMessages = session.messages.slice(-11); // 10 + system message

      // Prepare messages for AI
      const aiMessages = recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get AI response
      const aiResponse = await this.generateAIResponse(aiMessages, category);

      // Add AI response to session
      session.messages.push({
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date()
      });

      return {
        message: aiResponse.message,
        confidence: aiResponse.confidence || 0.8,
        category
      };

    } catch (error) {
      console.error('Chat service error:', error);
      
      // Fallback response
      const fallbackMessage = this.getFallbackResponse(userMessage);
      return {
        message: fallbackMessage,
        confidence: 0.3,
        category: 'error'
      };
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('cv') || lowerMessage.includes('resume')) {
      return `I'd love to help with your CV! For detailed CV optimization, try uploading your CV to our analysis tool. You can also explore our premium plans starting at R25 for comprehensive feedback.

For immediate help, you can:
• Visit our CV upload page
• Check our pricing plans
• Contact our support team

What specific CV question can I help with?`;
    }

    if (lowerMessage.includes('job') || lowerMessage.includes('career')) {
      return `Career guidance is one of our specialties! While I work on getting you a detailed response, here are quick resources:

• Browse our job matching features
• Try our interview practice tool
• Explore our career development resources

For personalized career advice, our Professional plan (R50/month) includes ongoing support. What specific career question do you have?`;
    }

    return `Thanks for your question! I'm having a brief technical moment, but I'm here to help with:

• CV optimization and ATS tips
• South African job market advice  
• Platform features and pricing
• B-BBEE compliance guidance

Could you rephrase your question, or would you like to explore our main features while I get back to full capacity?`;
  }

  private async generateAIResponse(messages: any[], category: string): Promise<{ message: string; confidence: number }> {
    try {
      // Try xAI first
      if (process.env.XAI_API_KEY) {
        try {
          const response = await xai.chat.completions.create({
            model: "grok-2-1212",
            messages: messages,
            max_tokens: 300,
            temperature: 0.7,
          });

          const message = response.choices[0].message.content || '';
          return {
            message: message.trim(),
            confidence: 0.9
          };
        } catch (xaiError) {
          console.log('xAI chat failed, trying OpenAI:', xaiError);
        }
      }

      // Try OpenAI as fallback
      if (openai) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            max_tokens: 300,
            temperature: 0.7,
          });

          const message = response.choices[0].message.content || '';
          return {
            message: message.trim(),
            confidence: 0.85
          };
        } catch (openaiError) {
          console.log('OpenAI chat failed:', openaiError);
        }
      }

      // Fallback to categorized response
      throw new Error('AI services unavailable');

    } catch (error) {
      console.error('AI response generation failed:', error);
      // Return a helpful fallback based on category
      return {
        message: this.getFallbackResponse(`Question about ${category}`),
        confidence: 0.3
      };
    }
  }

  getSessionStats(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      messageCount: session.messages.length - 1, // Exclude system message
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      duration: session.lastActivity.getTime() - session.createdAt.getTime()
    };
  }

  getAllSessionsCount(): number {
    return this.sessions.size;
  }
}

export const chatService = new ChatService();