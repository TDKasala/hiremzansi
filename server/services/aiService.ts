import fetch from 'node-fetch';

// Define interfaces for strong typing
interface MinimaxResponse {
  reply?: string;
  messages?: any[];
  usage?: {
    total_tokens: number;
  };
  [key: string]: any;
}

// Configuration for API access
const AI_CONFIG = {
  API_KEY: process.env.MINIMAX_API_KEY,
  API_BASE_URL: 'https://api.minimax.chat/v1',
  
  // Default model for CV analysis
  DEFAULT_MODEL: "abab6-chat",
  
  // API limits and parameters
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.2,
};

/**
 * Generate text using the AI service
 */
export async function generateText(prompt: string, systemPrompt: string = ''): Promise<string> {
  try {
    console.log('Generating text with AI service...');
    
    const messages = [];
    if (systemPrompt) {
      messages.push({
        sender_type: "USER",
        sender_name: "system",
        text: systemPrompt
      });
    }
    
    messages.push({
      sender_type: "USER",
      text: prompt
    });
    
    const response = await fetch(`${AI_CONFIG.API_BASE_URL}/text/chatcompletion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.DEFAULT_MODEL,
        messages: messages,
        temperature: AI_CONFIG.TEMPERATURE,
        max_tokens: AI_CONFIG.MAX_TOKENS,
        bot_setting: [
          {
            bot_name: "Assistant",
            content: "You are a helpful assistant specializing in CV analysis for South African job market."
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI service error:', errorText);
      throw new Error(`AI service error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as MinimaxResponse;
    
    if (data.reply) {
      return data.reply;
    } else {
      console.error('Unexpected response format:', data);
      return "Sorry, I couldn't generate a response at this time.";
    }
  } catch (error) {
    console.error('Error generating text:', error);
    return "There was an error processing your request. Please try again later.";
  }
}

/**
 * Analyze CV text and return structured results
 */
export async function analyzeCV(cvText: string): Promise<any> {
  try {
    const systemPrompt = `
      You are an expert CV analyzer for the South African job market.
      Analyze the CV text and provide:
      1. A list of key skills identified
      2. An assessment of strengths
      3. Suggestions for improvement
      4. An evaluation of how well it would perform with ATS systems
      Return your analysis in a clear, structured format.
    `;
    
    const result = await generateText(cvText, systemPrompt);
    
    // Create a structured object from the text response
    // This is a simple parsing, you might want to implement more sophisticated extraction
    return {
      analysis: result,
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing CV:', error);
    return {
      success: false, 
      error: "Failed to analyze the CV",
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test connection to AI service
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await generateText("Please respond with the word 'connected' if you can hear me.");
    return result.toLowerCase().includes('connected');
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

export default {
  generateText,
  analyzeCV,
  testConnection
};