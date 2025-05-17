// Test script for Abacus AI integration
import 'dotenv/config';
import fetch from 'node-fetch';

// Configuration
const ABACUS_API_KEY = process.env.ABACUS_API_KEY || 's2_e3c10fb6b7e44af5bf25bf9c6ece8805';
const ABACUS_API_URL = 'https://api.abacus.ai/api/v0';

async function testAbacusAI() {
  console.log('Starting Abacus AI API test...');
  
  try {
    console.log('Testing connection to Abacus AI API...');
    
    // Test basic completion
    console.log('Testing basic text completion...');
    const response = await fetch(`${ABACUS_API_URL}/llm/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_API_KEY}`
      },
      body: JSON.stringify({
        model: "claude-3-sonnet",
        messages: [
          { role: 'user', content: 'Respond with a single word: "Success"' }
        ],
        max_tokens: 10,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Response:', data.choices[0].message.content);
    console.log('✅ Basic text completion test successful');
    
    // Test JSON response
    console.log('\nTesting JSON response format...');
    const jsonResponse = await fetch(`${ABACUS_API_URL}/llm/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_API_KEY}`
      },
      body: JSON.stringify({
        model: "claude-3-sonnet",
        messages: [
          { 
            role: 'system', 
            content: 'Return your response as a valid JSON object.' 
          },
          { 
            role: 'user', 
            content: 'Create a JSON object with a status field set to "success" and a message field with value "Abacus AI is working correctly".' 
          }
        ],
        max_tokens: 100,
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!jsonResponse.ok) {
      const errorData = await jsonResponse.json();
      throw new Error(`API error: ${JSON.stringify(errorData)}`);
    }

    const jsonData = await jsonResponse.json();
    console.log('JSON Response:', jsonData.choices[0].message.content);
    console.log('✅ JSON format test successful');
    
    console.log('\n✅ All Abacus AI tests completed successfully');
    
  } catch (error) {
    console.error('❌ Abacus AI test failed:', error.message);
    
    console.log('\n⚠️ Troubleshooting tips:');
    console.log('1. Check that your Abacus API key is valid');
    console.log('2. Verify that you have access to the requested models');
    console.log('3. Check your network connection');
    
    process.exit(1);
  }
}

// Run the test
await testAbacusAI();