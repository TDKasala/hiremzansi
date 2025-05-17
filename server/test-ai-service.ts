import aiService from './services/aiService';

async function runTests() {
  console.log("Testing AI Service Integration...");

  try {
    // Test connectivity
    console.log("Testing connection to AI service...");
    const isConnected = await aiService.testConnection();
    console.log(`Connection test: ${isConnected ? "PASSED" : "FAILED"}`);

    if (!isConnected) {
      console.log("Connection failed, skipping further tests.");
      return;
    }

    // Test text generation
    console.log("\nTesting text generation...");
    const testPrompt = "Explain why ATS optimization is important for job seekers in South Africa in 2-3 sentences.";
    const textResult = await aiService.generateText(testPrompt);
    console.log("Text generation result:");
    console.log("----------");
    console.log(textResult);
    console.log("----------");

    // Test CV analysis
    console.log("\nTesting CV analysis...");
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

    const analysisResult = await aiService.analyzeCV(sampleCV);
    console.log("CV Analysis result:");
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