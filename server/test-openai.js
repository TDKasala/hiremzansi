// Simple test for OpenAI integration
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function testOpenAI() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "You are an ATS analyzer for South African job market. Analyze the following CV content in JSON format."
        },
        {
          role: "user", 
          content: "I am a software developer with 5 years of experience in Java and Python. I have a Bachelor's degree in Computer Science."
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    console.log("OpenAI response:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error testing OpenAI:", error);
  }
}

testOpenAI();