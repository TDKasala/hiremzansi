import OpenAI from "openai";

// Initialize xAI client (primary)
function getXAIClient() {
  // Use the verified API key from xAI service
  const newApiKey = "xai-O1xSO3enl5WxdZovrvVjD5be1ECK3q8ozSWYychZY37wDzgEiUINGv6vtXgtxpp1DLsXAH8tusj0NhvE";
  const apiKey = newApiKey || process.env.XAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("XAI_API_KEY environment variable is not set");
  }
  
  return new OpenAI({
    baseURL: "https://api.x.ai/v1",
    apiKey: apiKey,
  });
}

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

    // Skip quick responses for questions we want enhanced responses for
    if (lowerMessage.includes('capital') || 
        lowerMessage.includes('cv') || 
        lowerMessage.includes('resume') ||
        lowerMessage.includes('job') ||
        lowerMessage.includes('career') ||
        lowerMessage.includes('interview')) {
      return null; // Use enhanced fallback instead
    }

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

    // Check for capital question - use enhanced response instead
    if (lowerMessage.includes('capital') && lowerMessage.includes('south africa')) {
      return null; // Use enhanced fallback instead
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

      // Check for built-in quick responses first
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
    // Use enhanced fallback instead
    const fakeMessages = [{ content: userMessage, role: 'user' }];
    const enhancedResponse = this.getEnhancedFallbackResponse(fakeMessages, 'general');
    return enhancedResponse.message;
  }

  private async generateAIResponse(messages: any[], category: string): Promise<{ message: string; confidence: number }> {
    try {
      // Try xAI first
      try {
        const xaiClient = getXAIClient();
        console.log('Sending messages to xAI:', JSON.stringify(messages, null, 2));
        const response = await xaiClient.chat.completions.create({
          model: "grok-3-mini",
          messages: messages,
          max_tokens: 500,
          temperature: 0.3,
          stream: false,
        });

        console.log('xAI response received:', JSON.stringify(response, null, 2));
        // For Grok models, the actual response content might be in reasoning_content
        const choice = response.choices[0];
        const message = choice.message.content || (choice.message as any).reasoning_content || '';
        console.log('Extracted message:', message);
        return {
          message: message.trim(),
          confidence: 0.95
        };
      } catch (xaiError) {
        console.log('xAI chat failed, trying OpenAI fallback:', xaiError);
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

      // Enhanced fallback responses based on category and user message
      return this.getEnhancedFallbackResponse(messages, category);

    } catch (error) {
      console.error('AI response generation failed:', error);
      // Return a helpful fallback based on category
      return this.getEnhancedFallbackResponse(messages, category);
    }
  }

  private getEnhancedFallbackResponse(messages: any[], category: string): { message: string; confidence: number } {
    const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    // Enhanced responses based on user intent
    if (userMessage.includes('capital') && userMessage.includes('south africa')) {
      return {
        message: `South Africa has three capital cities:

**🏛️ Cape Town** - Legislative capital (Parliament)
**🏢 Pretoria** - Executive capital (Government)  
**⚖️ Bloemfontein** - Judicial capital (Supreme Court)

This unique arrangement reflects our constitutional democracy. For job seekers, this means opportunities in government, legal, and administrative sectors are distributed across these cities.

Would you like tips on finding government jobs or relocating between these cities for work?`,
        confidence: 0.8
      };
    }

    if (userMessage.includes('cv') || userMessage.includes('resume')) {
      return {
        message: `I can help you optimize your CV for the South African job market! Here are key tips:

**🎯 ATS Optimization:**
• Use standard headings (Personal Details, Experience, Education, Skills)
• Include SA ID number and relevant NQF levels
• Use keywords from job descriptions
• Save as PDF or DOC format

**🇿🇦 South African Context:**
• Mention B-BBEE status if applicable
• Include languages spoken
• List province/city clearly
• Add driver's license if relevant

**📝 Format Tips:**
• Keep to 2-3 pages maximum
• Use professional fonts (Arial, Calibri)
• Avoid graphics, tables, headers/footers
• Include contact details at top

Ready to upload your CV for detailed analysis?`,
        confidence: 0.8
      };
    }

    if (userMessage.includes('job') || userMessage.includes('career') || userMessage.includes('work')) {
      return {
        message: `Great question about careers in South Africa! Here's guidance:

**🔍 Job Search Strategy:**
• Leverage networks and referrals (70% of jobs aren't advertised)
• Use SA job sites: CareerJunction, Indeed, LinkedIn
• Consider recruitment agencies in your industry
• Apply directly to company websites

**💼 South African Job Market:**
• Skills shortage areas: IT, engineering, healthcare, finance
• Government jobs: Check government careers portal
• Growth sectors: Renewable energy, mining tech, fintech

**📈 Career Development:**
• Focus on SETA-accredited training
• Consider NQF level qualifications
• Learn additional SA languages for advantage
• Network through professional associations

**💰 Salary Insights:**
• Research market rates on PayScale, Salary.com
• Factor in medical aid, pension, car allowance
• Negotiate 13th cheque and leave benefits

What specific career area interests you most?`,
        confidence: 0.85
      };
    }

    if (userMessage.includes('interview')) {
      return {
        message: `Excellent! Interview preparation is crucial for success. Here's South African interview guidance:

**🎯 Common SA Interview Questions:**
• "Tell me about yourself" (2-minute professional summary)
• "Why do you want to work in South Africa?"
• "How do you handle diverse work environments?"
• "Describe your experience with transformation initiatives"

**🇿🇦 Cultural Considerations:**
• Arrive 10-15 minutes early
• Dress professionally (business formal)
• Maintain eye contact and firm handshake
• Show respect for hierarchy and diversity

**💡 Key Preparation Tips:**
• Research company's B-BBEE rating and values
• Prepare examples using STAR method
• Know current industry trends in SA
• Ask about career development opportunities

**❓ Questions to Ask:**
• "What does success look like in this role?"
• "How does the company support skills development?"
• "What are the growth opportunities?"

Try our interview practice tool for personalized coaching!`,
        confidence: 0.8
      };
    }

    // Default enhanced response
    return {
      message: `I'm here to help with your South African career journey! I can assist with:

**📄 CV Optimization:**
• ATS compatibility checks
• South African formatting standards
• Keyword optimization for local market

**🎯 Job Search Strategy:**
• Market insights and trends
• Application best practices
• Interview preparation tips

**🇿🇦 Local Context:**
• B-BBEE compliance guidance
• NQF level recommendations
• Provincial job market differences

**💼 Platform Features:**
• CV analysis tools (R25 Essential Pack)
• Premium job matching (R50/month)
• Interview practice sessions

What specific area would you like help with today?`,
      confidence: 0.7
    };
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