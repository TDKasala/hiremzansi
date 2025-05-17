import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configuration
const OPENAI_CONFIG = {
  // Models
  FREE_TIER_MODEL: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  PREMIUM_TIER_MODEL: "gpt-4o", // Use the same model for premium tier, but with more tokens/complexity
  
  // API Limits
  MAX_TOKENS: 4000,
  
  // Temperature settings
  STANDARD_TEMPERATURE: 0.2,     // Lower temp for more consistent, factual responses
  CREATIVE_TEMPERATURE: 0.7,     // Higher temp for more diverse recommendations
};

/**
 * Generate text using OpenAI
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
  try {
    const model = options.model || OPENAI_CONFIG.FREE_TIER_MODEL;
    const temperature = options.temperature || OPENAI_CONFIG.STANDARD_TEMPERATURE;
    const maxTokens = options.maxTokens || OPENAI_CONFIG.MAX_TOKENS;
    const systemPrompt = options.systemPrompt || '';

    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content || "No response generated";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "An error occurred while generating the response";
  }
}

/**
 * Analyze text and return JSON response
 * @param text Text to analyze
 * @param systemPrompt System prompt to set context for the analysis
 * @returns JSON object with analysis results
 */
export async function analyzeText(text: string, systemPrompt: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.PREMIUM_TIER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt + " Return your response as a valid JSON object." },
        { role: 'user', content: text }
      ],
      temperature: OPENAI_CONFIG.STANDARD_TEMPERATURE,
      max_tokens: OPENAI_CONFIG.MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI API analysis error:", error);
    return { error: "Analysis failed" };
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
  OPENAI_CONFIG
};