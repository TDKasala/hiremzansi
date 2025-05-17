import fetch from 'node-fetch';

// Abacus AI Configuration
const ABACUS_CONFIG = {
  // API Information
  API_KEY: process.env.ABACUS_API_KEY || 's2_e3c10fb6b7e44af5bf25bf9c6ece8805',
  API_URL: 'https://api.abacus.ai/api/v0',
  
  // Models
  FREE_TIER_MODEL: "claude-3-sonnet",  // Less expensive for basic analysis
  PREMIUM_TIER_MODEL: "claude-3-opus",  // More expensive but better for deep analysis
  
  // API Limits
  MAX_TOKENS: 4000,
  
  // Temperature settings
  STANDARD_TEMPERATURE: 0.2,       // Lower temp for more consistent, factual responses
  CREATIVE_TEMPERATURE: 0.7,       // Higher temp for more diverse recommendations
};

/**
 * Generate text using Abacus AI
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
    const model = options.model || ABACUS_CONFIG.FREE_TIER_MODEL;
    const temperature = options.temperature || ABACUS_CONFIG.STANDARD_TEMPERATURE;
    const maxTokens = options.maxTokens || ABACUS_CONFIG.MAX_TOKENS;
    const systemPrompt = options.systemPrompt || '';

    const response = await fetch(`${ABACUS_CONFIG.API_URL}/llm/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
      })
    });

    if (!response.ok) {
      const errorData = await response.json() as any;
      throw new Error(`Abacus AI API error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content || "No response generated";
  } catch (error) {
    console.error("Abacus AI API error:", error);
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
    const response = await fetch(`${ABACUS_CONFIG.API_URL}/llm/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        model: ABACUS_CONFIG.PREMIUM_TIER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt + " Return your response as a valid JSON object." },
          { role: 'user', content: text }
        ],
        temperature: ABACUS_CONFIG.STANDARD_TEMPERATURE,
        max_tokens: ABACUS_CONFIG.MAX_TOKENS,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json() as any;
      throw new Error(`Abacus AI API error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json() as any;
    const content = data.choices[0].message.content || "{}";
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return { error: "Failed to parse JSON response" };
    }
  } catch (error) {
    console.error("Abacus AI API analysis error:", error);
    return { error: "Analysis failed" };
  }
}

/**
 * Check if the Abacus AI API is working
 * @returns Boolean indicating if the API is working
 */
export async function testAbacusAI(): Promise<boolean> {
  try {
    const response = await generateTextCompletion("Return a single word: 'Working'");
    return response.includes("Working");
  } catch (error) {
    console.error("Abacus AI test failed:", error);
    return false;
  }
}

export default {
  generateTextCompletion,
  analyzeText,
  testAbacusAI,
  ABACUS_CONFIG
};