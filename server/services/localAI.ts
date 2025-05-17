/**
 * Local AI Service for CV Analysis
 * 
 * This module provides CV analysis functionality without requiring external AI services.
 * It uses rule-based analysis to evaluate CVs and provide feedback.
 */

// Define score thresholds
const SCORE_THRESHOLDS = {
  POOR: 40,
  AVERAGE: 60,
  GOOD: 80,
  EXCELLENT: 95
};

// Define skills categories for South African job market
const SKILL_CATEGORIES = {
  TECHNICAL: ['javascript', 'python', 'java', 'c++', 'react', 'angular', 'node', 'typescript', 
              'html', 'css', 'php', 'sql', 'postgresql', 'mongodb', 'aws', 'azure', 'git'],
  SOFT: ['communication', 'teamwork', 'leadership', 'problem solving', 'time management', 
         'adaptability', 'creativity', 'critical thinking', 'conflict resolution'],
  CERTIFICATIONS: ['certification', 'certified', 'certificate', 'diploma', 'degree', 'mba', 'bsc', 'ba', 'phd', 'btech', 'msc']
};

// Common ATS keywords per industry
const INDUSTRY_KEYWORDS = {
  SOFTWARE: ['software', 'developer', 'engineer', 'programming', 'code', 'web', 'app', 'mobile', 'frontend', 'backend', 'fullstack'],
  FINANCE: ['finance', 'accounting', 'auditing', 'banking', 'investment', 'financial', 'analyst', 'budget', 'tax', 'capital'],
  MARKETING: ['marketing', 'digital', 'social media', 'seo', 'content', 'brand', 'campaign', 'strategy', 'analytics', 'advertising'],
  HEALTHCARE: ['healthcare', 'medical', 'clinical', 'patient', 'nurse', 'doctor', 'therapy', 'pharmaceutical', 'health'],
  EDUCATION: ['education', 'teaching', 'lecturer', 'curriculum', 'learning', 'students', 'school', 'academic', 'training']
};

// South Africa specific terms
const SA_TERMS = ['b-bbee', 'bbbee', 'bee', 'nqf', 'saqa', 'seta', 'matric', 'south africa', 'south african', 'sa', 'rsa'];

/**
 * Extracts skills from CV text
 * @param cvText The CV text content
 * @returns Array of identified skills
 */
function extractSkills(cvText: string): string[] {
  const text = cvText.toLowerCase();
  const foundSkills: string[] = [];
  
  // Check for technical skills
  SKILL_CATEGORIES.TECHNICAL.forEach(skill => {
    if (text.includes(skill)) {
      foundSkills.push(skill);
    }
  });
  
  // Check for soft skills
  SKILL_CATEGORIES.SOFT.forEach(skill => {
    if (text.includes(skill)) {
      foundSkills.push(skill);
    }
  });
  
  // Check for certifications
  SKILL_CATEGORIES.CERTIFICATIONS.forEach(cert => {
    if (text.includes(cert)) {
      foundSkills.push(cert);
    }
  });
  
  return foundSkills;
}

/**
 * Analyze CV format and structure
 * @param cvText The CV text content
 * @returns Object with format analysis
 */
function analyzeFormat(cvText: string): {score: number, feedback: string[]} {
  const feedback: string[] = [];
  let score = 0;
  
  // Check length
  const wordCount = cvText.split(/\s+/).length;
  if (wordCount < 200) {
    feedback.push("CV appears too short. Consider adding more detailed information.");
    score += 5;
  } else if (wordCount > 200 && wordCount < 600) {
    feedback.push("CV length is appropriate.");
    score += 20;
  } else {
    feedback.push("CV is quite lengthy. Consider making it more concise for ATS readability.");
    score += 10;
  }
  
  // Check for contact details
  if (/email|@|phone|tel|contact/i.test(cvText)) {
    feedback.push("Contact information is present.");
    score += 15;
  } else {
    feedback.push("Ensure your contact information is clearly visible at the top of your CV.");
    score += 0;
  }
  
  // Check for education section
  if (/education|qualification|degree|diploma/i.test(cvText)) {
    feedback.push("Education section detected.");
    score += 15;
  } else {
    feedback.push("Consider adding an education section to your CV.");
    score += 0;
  }
  
  // Check for experience section
  if (/experience|work|employment|career/i.test(cvText)) {
    feedback.push("Experience section detected.");
    score += 15;
  } else {
    feedback.push("Your CV should include detailed work experience.");
    score += 0;
  }
  
  // Check for skills section
  if (/skills|abilities|competencies/i.test(cvText)) {
    feedback.push("Skills section detected.");
    score += 15;
  } else {
    feedback.push("Consider adding a dedicated skills section to highlight your capabilities.");
    score += 0;
  }
  
  // Check for South African specific elements
  const saTermsFound = SA_TERMS.filter(term => cvText.toLowerCase().includes(term));
  if (saTermsFound.length > 0) {
    feedback.push("South African specific elements detected: " + saTermsFound.join(", "));
    score += 20;
  } else {
    feedback.push("Consider adding South African specific information like B-BBEE status or NQF levels if applicable.");
    score += 0;
  }
  
  return {
    score: Math.min(score, 100),
    feedback
  };
}

/**
 * Score CV against ATS criteria
 * @param cvText The CV text content 
 * @returns ATS score and feedback
 */
function scoreAgainstATS(cvText: string): {score: number, strengths: string[], improvements: string[]} {
  const text = cvText.toLowerCase();
  const strengths: string[] = [];
  const improvements: string[] = [];
  let score = 0;
  
  // Check skills presence
  const skills = extractSkills(cvText);
  if (skills.length >= 5) {
    strengths.push(`Strong skills section with ${skills.length} relevant skills identified`);
    score += 20;
  } else if (skills.length > 0) {
    improvements.push(`Add more specific skills to your CV. Only ${skills.length} skills were identified`);
    score += 10;
  } else {
    improvements.push("No specific skills were identified. Add a detailed skills section");
    score += 0;
  }
  
  // Check quantifiable achievements
  const hasNumbers = /\d+%|\d+ years|\d+\+?%|\d+ team|increased by \d+/i.test(text);
  if (hasNumbers) {
    strengths.push("Contains quantifiable achievements with metrics");
    score += 15;
  } else {
    improvements.push("Add quantifiable achievements with specific numbers/percentages");
    score += 0;
  }
  
  // Check for keyword density
  let keywordMatches = 0;
  for (const industry in INDUSTRY_KEYWORDS) {
    INDUSTRY_KEYWORDS[industry as keyof typeof INDUSTRY_KEYWORDS].forEach(keyword => {
      if (text.includes(keyword)) {
        keywordMatches++;
      }
    });
  }
  
  if (keywordMatches >= 8) {
    strengths.push("Strong keyword optimization for ATS");
    score += 25;
  } else if (keywordMatches >= 4) {
    strengths.push("Good keyword presence, but could be improved");
    score += 15;
  } else {
    improvements.push("Add more industry-relevant keywords to pass ATS screening");
    score += 5;
  }
  
  // Check file format readability (simplified)
  if (text.includes('summary') || text.includes('profile') || text.includes('objective')) {
    strengths.push("Good structure with clear sections");
    score += 15;
  } else {
    improvements.push("Add clear section headings like 'Professional Summary', 'Work Experience'");
    score += 5;
  }
  
  // Check for action verbs
  const actionVerbs = ['managed', 'developed', 'created', 'implemented', 'achieved', 'led', 'increased', 'reduced', 'improved'];
  const actionVerbCount = actionVerbs.filter(verb => text.includes(verb)).length;
  
  if (actionVerbCount >= 4) {
    strengths.push("Strong use of action verbs to describe experience");
    score += 15;
  } else {
    improvements.push("Use more action verbs like 'developed', 'achieved', 'implemented'");
    score += 5;
  }
  
  // Final score capping
  score = Math.min(score, 100);
  
  // Ensure we have at least one strength and one improvement
  if (strengths.length === 0) {
    strengths.push("Your CV has a good foundation to build upon");
  }
  
  if (improvements.length === 0) {
    improvements.push("Continue updating your CV with recent achievements");
  }
  
  return {
    score,
    strengths,
    improvements
  };
}

/**
 * Main function to analyze a CV
 * @param cvText The CV text content
 * @returns Analysis results
 */
export function analyzeCVText(cvText: string): any {
  try {
    // Extract skills
    const skills = extractSkills(cvText);
    
    // Analyze format
    const formatAnalysis = analyzeFormat(cvText);
    
    // Score against ATS
    const atsScore = scoreAgainstATS(cvText);
    
    // Calculate overall score (weighted average)
    const overallScore = Math.round((formatAnalysis.score * 0.4) + (atsScore.score * 0.6));
    
    // Determine rating based on overall score
    let rating = "Poor";
    if (overallScore >= SCORE_THRESHOLDS.EXCELLENT) {
      rating = "Excellent";
    } else if (overallScore >= SCORE_THRESHOLDS.GOOD) {
      rating = "Good";
    } else if (overallScore >= SCORE_THRESHOLDS.AVERAGE) {
      rating = "Average";
    }
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      overall_score: overallScore,
      rating: rating,
      ats_score: atsScore.score,
      format_score: formatAnalysis.score,
      skills_identified: skills,
      strengths: atsScore.strengths,
      improvements: atsScore.improvements,
      format_feedback: formatAnalysis.feedback
    };
  } catch (error) {
    console.error('Error analyzing CV:', error);
    return {
      success: false,
      error: "Failed to analyze the CV",
      timestamp: new Date().toISOString()
    };
  }
}

export default {
  analyzeCVText
};