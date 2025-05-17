// A simple OpenAI test script
import OpenAI from 'openai';

async function testOpenAI() {
  try {
    // Initialize OpenAI with key from environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log("Testing OpenAI API...");
    
    // Simple test prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // The latest OpenAI model (May 2024)
      messages: [
        { role: "system", content: "You are a CV analysis assistant specialized in South African job markets." },
        { role: "user", content: "Why is ATS optimization important for job seekers in South Africa?" }
      ],
      max_tokens: 300
    });
    
    console.log("OpenAI response:");
    console.log("-----------------");
    console.log(completion.choices[0].message.content);
    console.log("-----------------");
    
    console.log("\nTest completed successfully!");
    return true;
  } catch (error) {
    console.error("OpenAI test failed:", error);
    return false;
  }
}

// Run the test
testOpenAI();