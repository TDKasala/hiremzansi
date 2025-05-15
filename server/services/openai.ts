import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// Make sure the OPENAI_API_KEY environment variable is set
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. AI-enhanced features will be limited.");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTextCompletion(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest model
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    });

    return response.choices[0].message.content ?? "No response generated";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "An error occurred while generating the response";
  }
}

export async function analyzeText(text: string, systemPrompt: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
    });

    const content = response.choices[0].message.content ?? "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("OpenAI API analysis error:", error);
    return { error: "Analysis failed" };
  }
}

// Add other OpenAI-related functions as needed
export async function enhanceCVContent(cvText: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a professional CV enhancer specializing in South African job market requirements. Improve this CV while maintaining its factual accuracy and personal information." 
        },
        { role: "user", content: cvText }
      ],
      max_tokens: 2048,
    });

    return response.choices[0].message.content ?? cvText;
  } catch (error) {
    console.error("CV enhancement error:", error);
    return cvText; // Return original if enhancement fails
  }
}

export async function generateCoverLetter(cvText: string, jobDescription: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional cover letter writer specializing in South African job applications. Create a personalized cover letter based on the provided CV and job description."
        },
        {
          role: "user",
          content: `Create a professional cover letter for this job description using the information from my CV:
          
Job Description:
${jobDescription}

My CV:
${cvText}

Focus on relevant skills and experience, and highlight B-BBEE status if mentioned in the CV. Include appropriate South African context.`
        }
      ],
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content ?? "Cover letter generation failed";
    return content;
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return "Unable to generate cover letter due to an error";
  }
}