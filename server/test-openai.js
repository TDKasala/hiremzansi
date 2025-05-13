// Simple test for OpenAI integration directly using the API
import OpenAI from 'openai';

// Using environment variable directly
const openai = new OpenAI();

// Sample CV content for testing
const sampleCV = `
DENIS KASALA
Software Developer
Johannesburg, South Africa
Phone: +27 (71) 234-5678
Email: denis.kasala@email.co.za

PROFESSIONAL SUMMARY
Dedicated software developer with 5 years of experience in full-stack development. 
Skilled in Java, Python, JavaScript, and React. Passionate about creating efficient 
and scalable solutions for complex problems.

SKILLS
• Programming Languages: Java, Python, JavaScript, TypeScript
• Frameworks: Spring Boot, Django, React, Node.js
• Database: PostgreSQL, MongoDB, MySQL
• Tools: Git, Docker, AWS, Azure
• Methodologies: Agile, Scrum, Test-Driven Development

WORK EXPERIENCE
Senior Software Developer
TechSolutions, Johannesburg
January 2022 - Present
• Developed and maintained web applications using React and Node.js
• Implemented RESTful APIs for client-server communication
• Improved application performance by 40% through code optimization
• Collaborated with cross-functional teams to deliver projects on time

Software Developer
DataTech Systems, Cape Town
March 2019 - December 2021
• Built and maintained Java-based enterprise applications
• Designed database schemas and implemented data models
• Created automated testing frameworks reducing bug reports by 35%
• Mentored junior developers and conducted code reviews

EDUCATION
Bachelor of Science in Computer Science (NQF Level 7)
University of Cape Town
2015 - 2018

CERTIFICATIONS
• AWS Certified Developer Associate
• Oracle Certified Professional, Java SE 11 Developer
• Microsoft Certified: Azure Developer Associate

B-BBEE STATUS
Level 2 Contributor
`;

// Sample job description for testing
const sampleJobDescription = `
Senior Full Stack Developer - Johannesburg

We are looking for a skilled Full Stack Developer to join our team in Johannesburg.
The ideal candidate will have experience in developing web applications using React,
Node.js, and Python. Knowledge of cloud platforms like AWS is a plus.

Requirements:
- 3+ years of experience in full-stack development
- Proficiency in JavaScript, TypeScript, and Python
- Experience with React, Node.js, and Django
- Knowledge of database systems including PostgreSQL
- Understanding of AWS services
- Excellent problem-solving skills
- Bachelor's degree in Computer Science or related field
- Experience working in Agile teams

Nice to have:
- B-BBEE status
- Understanding of South African data protection regulations (POPIA)
- Experience working with South African financial institutions
`;

async function testOpenAI() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using the cheaper model for testing
      messages: [
        {
          role: "system", 
          content: `You are ATSBoost, a professional CV analyzer specializing in the South African job market. 
          Your task is to analyze CVs and provide detailed feedback tailored to South African hiring practices.
          
          Evaluate the CV based on ATS compatibility, content quality, alignment with South African standards,
          B-BBEE information, NQF levels, and South African-specific qualifications.
          
          If a job description is provided, compare the CV against it for keyword matches and overall fit.
          
          Return your analysis in JSON format with these fields:
          - score (0-100)
          - skillsScore (0-100)
          - formatScore (0-100)
          - saContextScore (0-100)
          - jobMatchScore (0-100 if job description provided)
          - strengths (array of strengths)
          - improvements (array of suggested improvements)
          - issues (array of issues)
          - bbbeeDetected (boolean)
          - nqfDetected (boolean)
          - saKeywordsFound (array of South African terms found)
          `
        },
        {
          role: "user", 
          content: `Please analyze this CV for the South African job market:
          
          CV CONTENT:
          ${sampleCV}
          
          JOB DESCRIPTION:
          ${sampleJobDescription}
          
          Provide a detailed analysis with specific scores and recommendations.`
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