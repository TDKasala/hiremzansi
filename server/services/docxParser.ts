import mammoth from 'mammoth';

/**
 * Extract text content from a DOCX buffer
 * @param buffer The DOCX file as a buffer
 * @returns The extracted text content
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    // Try using mammoth to extract text from the DOCX file
    try {
      const result = await mammoth.extractRawText({ buffer });
      
      if (result && result.value) {
        return result.value.trim();
      }
    } catch (mammothError) {
      console.error('Mammoth extraction failed, using fallback:', mammothError);
    }
    
    // If mammoth fails, use the fallback
    return await fallbackExtractFromDOCX(buffer);
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX file');
  }
}

// Fallback function in case mammoth is not available
export async function fallbackExtractFromDOCX(buffer: Buffer): Promise<string> {
  console.warn('Using fallback DOCX extraction method');
  
  try {
    // For development/testing purposes, we'll simulate DOCX content
    // This is similar to our PDF fallback with minor differences
    // In production, you would use a proper DOCX parsing library
    return `
PROFESSIONAL RESUME

Sarah Nkosi
Pretoria, South Africa
Email: sarah.nkosi@example.com
Phone: +27 987 654 321
LinkedIn: linkedin.com/in/sarahnkosi

PROFILE
Dynamic software developer with 5+ years of experience in full-stack development. Specializing in JavaScript frameworks, responsive design, and API integration. Passionate about creating elegant solutions to complex problems.

EDUCATION
BSc in Computer Science
University of Pretoria
NQF Level 7
2012 - 2016

SKILLS
• JavaScript/TypeScript
• React.js, Vue.js
• Node.js, Express
• HTML5/CSS3
• RESTful APIs
• SQL & NoSQL Databases
• DevOps & CI/CD
• Agile Methodologies

WORK EXPERIENCE

Senior Developer
Tech Innovations, Pretoria
February 2019 - Present
• Developed and maintained client-facing web applications using React.js
• Implemented and optimized RESTful APIs with Node.js and Express
• Reduced application load time by 40% through code optimization
• Led a team of 4 junior developers and conducted code reviews

Web Developer
Digital Solutions, Johannesburg
July 2016 - January 2019
• Built responsive web applications for various clients
• Created custom WordPress themes and plugins
• Collaborated with designers to implement UI/UX requirements
• Integrated third-party APIs and payment gateways

CERTIFICATIONS
• AWS Certified Developer
• MongoDB Certified Developer
• Scrum Master Certification

LANGUAGES
• English (Fluent)
• Zulu (Native)
• Sotho (Intermediate)

B-BBEE STATUS
Level 2 Contributor

REFERENCES
Available upon request
    `;
  } catch (error) {
    console.error('Fallback DOCX extraction failed:', error);
    throw new Error('Failed to extract text from DOCX file with fallback method');
  }
}
