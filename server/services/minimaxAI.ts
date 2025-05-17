import fetch from 'node-fetch';

// Type definitions for Minimax API responses
interface MinimaxMessage {
  role: string;
  content: string;
}

interface MinimaxChoice {
  message: MinimaxMessage;
  finish_reason: string;
  index: number;
}

interface MinimaxResponse {
  id: string;
  created: number;
  model: string;
  choices: MinimaxChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Minimax AI Configuration
const MINIMAX_CONFIG = {
  // API Information
  API_KEY: process.env.MINIMAX_API_KEY,
  API_URL: 'https://api.minimax.chat/v1/text/completion',
  
  // Models
  FREE_TIER_MODEL: "abab6-chat",  // For basic CV analysis
  PREMIUM_TIER_MODEL: "abab6-chat", // More detailed analysis using same model
  
  // API Limits
  MAX_TOKENS: 4000,
  
  // Temperature settings
  STANDARD_TEMPERATURE: 0.2,       // Lower temp for more consistent, factual responses
  CREATIVE_TEMPERATURE: 0.7,       // Higher temp for more diverse recommendations
};

/**
 * Generate text using Minimax AI
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
    const model = options.model || MINIMAX_CONFIG.FREE_TIER_MODEL;
    const temperature = options.temperature || MINIMAX_CONFIG.STANDARD_TEMPERATURE;
    const maxTokens = options.maxTokens || MINIMAX_CONFIG.MAX_TOKENS;
    const systemPrompt = options.systemPrompt || '';

    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(MINIMAX_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });

    // Read the response body once
    const responseText = await response.text();
    
    if (!response.ok) {
      // Try to parse the error message, but don't throw if it fails
      try {
        const errorData = JSON.parse(responseText) as Record<string, any>;
        throw new Error(`Minimax AI API error: ${errorData.message || response.statusText}`);
      } catch (parseError) {
        throw new Error(`Minimax AI API error: ${response.statusText}, Response: ${responseText}`);
      }
    }

    // Parse the successful response
    try {
      const data = JSON.parse(responseText) as MinimaxResponse;
      return data.choices[0].message.content || "No response generated";
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      return `Error parsing response: ${responseText.substring(0, 100)}...`;
    }
  } catch (error) {
    console.error("Minimax AI API error:", error);
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
    const jsonPrompt = systemPrompt + " Return your response as a valid JSON object. Make sure your response contains only valid JSON and can be parsed directly.";
    
    const messages = [
      { role: 'system', content: jsonPrompt },
      { role: 'user', content: text }
    ];

    const response = await fetch(MINIMAX_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        model: MINIMAX_CONFIG.PREMIUM_TIER_MODEL,
        messages: messages,
        temperature: MINIMAX_CONFIG.STANDARD_TEMPERATURE,
        max_tokens: MINIMAX_CONFIG.MAX_TOKENS,
        stream: false
      })
    });

    // Read the response body once
    const responseText = await response.text();
    
    if (!response.ok) {
      // Try to parse the error message, but don't throw if it fails
      try {
        const errorData = JSON.parse(responseText) as Record<string, any>;
        throw new Error(`Minimax AI API error: ${errorData.message || response.statusText}`);
      } catch (parseError) {
        throw new Error(`Minimax AI API error: ${response.statusText}, Response: ${responseText}`);
      }
    }

    // Parse the successful response
    try {
      const data = JSON.parse(responseText) as MinimaxResponse;
      const content = data.choices[0].message.content || "{}";
      
      // Try to parse the content as JSON
      try {
        return JSON.parse(content);
      } catch (jsonError) {
        console.error("Error parsing response as JSON, trying to extract JSON from text", jsonError);
        
        // Sometimes AI models wrap JSON in backticks or add text before/after
        // Try to extract JSON content with regex (anything between { and })
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        throw jsonError;
      }
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      return { error: "Failed to parse response" };
    }
  } catch (error) {
    console.error("Minimax AI API analysis error:", error);
    return { error: "Analysis failed" };
  }
}

/**
 * Check if the Minimax AI API is working
 * @returns Boolean indicating if the API is working
 */
export async function testMinimaxAI(): Promise<boolean> {
  try {
    const response = await generateTextCompletion("Return a single word: 'Working'");
    return response.includes("Working");
  } catch (error) {
    console.error("Minimax AI test failed:", error);
    return false;
  }
}

export default {
  generateTextCompletion,
  analyzeText,
  testMinimaxAI,
  MINIMAX_CONFIG
};