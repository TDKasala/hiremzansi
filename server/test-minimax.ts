import { generateTextCompletion, analyzeText, testMinimaxAI } from './services/minimaxAI';

async function runTests() {
  console.log("Testing Minimax AI API Integration...");

  try {
    // Test connectivity
    console.log("Testing basic connectivity...");
    const isWorking = await testMinimaxAI();
    console.log(`Basic connectivity test: ${isWorking ? "PASSED" : "FAILED"}`);

    // Test text generation
    console.log("\nTesting text generation...");
    const testPrompt = "Explain why ATS optimization is important for job seekers in South Africa in 2 sentences.";
    const completionResult = await generateTextCompletion(testPrompt);
    console.log("Text generation result:");
    console.log("----------");
    console.log(completionResult);
    console.log("----------");

    // Test JSON response
    console.log("\nTesting JSON response analysis...");
    const systemPrompt = "You are an expert CV analyzer. Analyze the following CV text and identify key skills, experience, and recommendations.";
    const sampleCV = `
JOHN SMITH
Cape Town, South Africa | +27 12 345 6789 | john.smith@email.com

PROFESSIONAL SUMMARY
Experienced software developer with 5 years experience in web development and mobile applications.
Proficient in JavaScript, React, and Node.js.

SKILLS
- JavaScript, TypeScript, React, Node.js
- RESTful API design
- Mobile application development
- Agile methodologies

EXPERIENCE
Senior Developer, TechCorp SA
January 2022 - Present
- Developed e-commerce platform that increased sales by 35%
- Led team of 5 junior developers
- Implemented CI/CD pipelines

Developer, WebSolutions
March 2019 - December 2021
- Created responsive web applications for clients
- Maintained legacy codebase

EDUCATION
Bachelor of Science, Computer Science
University of Cape Town, 2018
    `;

    const analysisResult = await analyzeText(sampleCV, systemPrompt);
    console.log("Analysis result:");
    console.log("----------");
    console.log(JSON.stringify(analysisResult, null, 2));
    console.log("----------");

    console.log("\nAll tests completed!");
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

// Run the tests
runTests();