import OpenAI from 'openai';

// Test xAI API connection
async function testXaiApi() {
  const xai = new OpenAI({ 
    baseURL: "https://api.x.ai/v1", 
    apiKey: process.env.XAI_API_KEY 
  });

  console.log('Testing xAI API...');
  console.log('API Key (first 10 chars):', process.env.XAI_API_KEY?.substring(0, 10));
  console.log('API Key length:', process.env.XAI_API_KEY?.length);

  try {
    const response = await xai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant."
        },
        {
          role: "user",
          content: "Say hello and test if the API is working."
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    console.log('SUCCESS! xAI API Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('xAI API Error:', error.message);
    console.error('Error details:', error);
  }
}

testXaiApi();