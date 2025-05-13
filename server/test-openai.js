// Simple script to test OpenAI API connectivity
// Run with: node server/test-openai.js
// This helps verify that your API key is valid and has sufficient quota

import 'dotenv/config';
import OpenAI from 'openai';

async function testOpenAI() {
  // Check if API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set');
    console.log('Please set this variable in your .env file or environment');
    process.exit(1);
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.log('Testing OpenAI connectivity...');
  
  try {
    // Test connection with a simple query using GPT-3.5 Turbo (cheaper model)
    console.log('Testing GPT-3.5 Turbo...');
    const gpt35Response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'user', 
          content: 'Return a simple JSON object with a "status" field set to "success" and an "api" field set to "gpt-3.5". Make the response as brief as possible.'
        }
      ],
      max_tokens: 50,
      response_format: { type: "json_object" }
    });

    console.log('GPT-3.5 Turbo Response:');
    console.log(gpt35Response.choices[0].message.content);
    console.log('✅ GPT-3.5 Turbo test successful\n');

    // Test the GPT-4o model if available (for premium analysis)
    console.log('Testing GPT-4o (for premium features)...');
    try {
      const gpt4Response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'user', 
            content: 'Return a simple JSON object with a "status" field set to "success" and an "api" field set to "gpt-4o". Make the response as brief as possible.'
          }
        ],
        max_tokens: 50,
        response_format: { type: "json_object" }
      });
      
      console.log('GPT-4o Response:');
      console.log(gpt4Response.choices[0].message.content);
      console.log('✅ GPT-4o test successful');
    } catch (gpt4Error) {
      console.log('❌ GPT-4o test failed:');
      console.error(gpt4Error.message);
      console.log('Note: GPT-4o is only needed for premium deep analysis. The basic CV analysis will still work with GPT-3.5 Turbo.');
    }

    console.log('\n✅ OpenAI connection test completed successfully');
    console.log('Your API key is valid and has sufficient quota for basic operations.');
    
  } catch (error) {
    console.error('❌ OpenAI connection test failed:');
    console.error(error.message);
    
    if (error.code === 'insufficient_quota') {
      console.log('\n⚠️ Your API key has insufficient quota. You can:');
      console.log('1. Add billing information to your OpenAI account');
      console.log('2. Set CONFIG.USE_OPENAI to false in server/services/atsScoring.ts to use the rule-based system instead');
    }
    
    process.exit(1);
  }
}

// Use top-level await to run the function
await testOpenAI();