import { analyzeCVText } from './services/localAI';

async function runLocalAITest() {
  console.log("Testing Local AI CV Analysis...");
  
  // Sample CV text for testing
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

CERTIFICATIONS
- AWS Certified Developer
- Certified ScrumMaster

B-BBEE Status: Level 2 contributor
  `;
  
  // Analyze the CV
  const results = analyzeCVText(sampleCV);
  
  // Display results
  console.log("Analysis Results:");
  console.log("----------");
  console.log(JSON.stringify(results, null, 2));
  console.log("----------");
  
  console.log("\nTest completed!");
}

// Run the test
runLocalAITest();