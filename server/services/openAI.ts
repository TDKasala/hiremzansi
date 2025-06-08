import OpenAI from 'openai';

// Type definitions for the AI client
type MessageRole = 'system' | 'user' | 'assistant';

interface Message {
  role: MessageRole;
  content: string;
}

// Initialize xAI client (primary) and OpenAI client (fallback)
const xai = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configuration
const AI_CONFIG = {
  // Models
  XAI_MODEL: "grok-2-1212", // Primary xAI model
  OPENAI_FALLBACK_MODEL: "gpt-4o", // Fallback OpenAI model
  
  // API Limits
  MAX_TOKENS: 4000,
  
  // Temperature settings
  STANDARD_TEMPERATURE: 0.2,     // Lower temp for more consistent, factual responses
  CREATIVE_TEMPERATURE: 0.7,     // Higher temp for more diverse recommendations
};

/**
 * Generate text using xAI (primary) with OpenAI fallback
 * @param prompt Text prompt to send to the model
 * @param options Additional options for the API call
 * @returns Generated text response
 */
export async function generateTextCompletion(
  prompt: string, 
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}
): Promise<string> {
  const temperature = options.temperature || AI_CONFIG.STANDARD_TEMPERATURE;
  const maxTokens = options.maxTokens || AI_CONFIG.MAX_TOKENS;
  const systemPrompt = options.systemPrompt || '';

  const messages: Array<{role: MessageRole, content: string}> = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  messages.push({ role: 'user', content: prompt });

  // Try xAI first, fallback to OpenAI
  try {
    const response = await xai.chat.completions.create({
      model: AI_CONFIG.XAI_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    console.log("Successfully used xAI for text generation");
    return response.choices[0].message.content || "No response generated";
  } catch (xaiError: any) {
    console.log("xAI failed, falling back to OpenAI:", xaiError.message);
    
    try {
      const response = await openai.chat.completions.create({
        model: AI_CONFIG.OPENAI_FALLBACK_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      return response.choices[0].message.content || "No response generated";
    } catch (openaiError) {
      console.error("Both xAI and OpenAI failed:", openaiError);
      return "An error occurred while generating the response";
    }
  }
}

/**
 * Analyze text and return JSON response
 * @param text Text to analyze
 * @param systemPrompt System prompt to set context for the analysis
 * @returns JSON object with analysis results
 */
export async function analyzeText(text: string, systemPrompt: string): Promise<any> {
  const messages: Array<{role: MessageRole, content: string}> = [
    { role: 'system', content: systemPrompt + " Return your response as a valid JSON object." },
    { role: 'user', content: text }
  ];

  // Try xAI first, fallback to OpenAI
  try {
    const response = await xai.chat.completions.create({
      model: AI_CONFIG.XAI_MODEL,
      messages: messages,
      temperature: AI_CONFIG.STANDARD_TEMPERATURE,
      max_tokens: AI_CONFIG.MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    console.log("Successfully used xAI for text analysis");
    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (xaiError: any) {
    console.log("xAI failed, falling back to OpenAI:", xaiError.message);
    
    try {
      const response = await openai.chat.completions.create({
        model: AI_CONFIG.OPENAI_FALLBACK_MODEL,
        messages: messages,
        temperature: AI_CONFIG.STANDARD_TEMPERATURE,
        max_tokens: AI_CONFIG.MAX_TOKENS,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (openaiError) {
      console.error("Both xAI and OpenAI failed for text analysis:", openaiError);
      return { error: "Analysis failed" };
    }
  }
}

/**
 * Check if the OpenAI API is working
 * @returns Boolean indicating if the API is working
 */
export async function testOpenAI(): Promise<boolean> {
  try {
    const response = await generateTextCompletion("Return a single word: 'Working'");
    return response.includes("Working");
  } catch (error) {
    console.error("OpenAI test failed:", error);
    return false;
  }
}

export default {
  generateTextCompletion,
  analyzeText,
  testOpenAI,
  AI_CONFIG
};