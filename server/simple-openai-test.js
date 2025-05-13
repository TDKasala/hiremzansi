// Simple OpenAI test script
// Uses ES Modules syntax and doesn't require dotenv

import OpenAI from 'openai';

async function testOpenAI() {
  console.log('Starting OpenAI API test...');
  
  // Check if the API key is available
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY environment variable is not set');
    process.exit(1);
  }
  
  // Create OpenAI client
  const openai = new OpenAI({
    apiKey: apiKey
  });
  
  console.log('Testing connection to OpenAI API...');
  
  try {
    // Test GPT-3.5 Turbo (used for free tier)
    console.log('Testing GPT-3.5 Turbo (free tier model)...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'user', 
          content: 'Respond with a single word: "Success"'
        }
      ],
      max_tokens: 10
    });
    
    console.log('Response:', response.choices[0].message.content);
    console.log('✅ GPT-3.5 Turbo test successful');
    
    // Optionally test GPT-4o if user needs premium analysis
    try {
      console.log('\nTesting GPT-4o (premium tier model)...');
      const gpt4Response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'user', 
            content: 'Respond with a single word: "Premium"'
          }
        ],
        max_tokens: 10
      });
      
      console.log('Response:', gpt4Response.choices[0].message.content);
      console.log('✅ GPT-4o test successful');
      console.log('\n✅ All OpenAI models are working correctly!');
      
    } catch (gpt4Error) {
      console.error('❌ GPT-4o test failed:', gpt4Error.message);
      console.log('Note: GPT-4o is only needed for premium deep analysis.');
    }
    
  } catch (error) {
    console.error('❌ OpenAI test failed:', error.message);
    
    if (error.code === 'insufficient_quota') {
      console.log('\n⚠️ Your API key has insufficient quota. Options:');
      console.log('1. Add billing information to your OpenAI account');
      console.log('2. Set CONFIG.USE_OPENAI to false in server/services/atsScoring.ts to use rule-based system');
    }
    
    process.exit(1);
  }
}

// Run the test
await testOpenAI();