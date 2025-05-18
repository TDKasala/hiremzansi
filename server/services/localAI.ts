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

// Common ATS keywords per industry (South Africa focused)
const INDUSTRY_KEYWORDS = {
  SOFTWARE: [
    // General tech terms
    'software', 'developer', 'engineer', 'programming', 'code', 'web', 'app', 'mobile', 'frontend', 'backend', 'fullstack',
    // SA-specific tech terms
    'systems development', 'vodacom', 'mtn', 'standard bank', 'fnb', 'discovery', 'takealot', 'superbalist', 'multichoice', 
    'dstv', 'eoh', 'bbd', 'entelect', 'adapt it', 'altron', 'dimension data', 'aws partner'
  ],
  FINANCE: [
    // General finance terms
    'finance', 'accounting', 'auditing', 'banking', 'investment', 'financial', 'analyst', 'budget', 'tax', 'capital',
    // SA-specific finance terms
    'jse', 'johannesburg stock exchange', 'standard bank', 'fnb', 'absa', 'nedbank', 'capitec', 'investec', 'old mutual', 
    'sanlam', 'liberty', 'discovery', 'outsurance', 'momentum', 'allan gray', 'saica', 'sarb', 'fsca', 'fais', 'fica'
  ],
  MARKETING: [
    // General marketing terms
    'marketing', 'digital', 'social media', 'seo', 'content', 'brand', 'campaign', 'strategy', 'analytics', 'advertising',
    // SA-specific marketing terms
    'multichoice', 'dstv', 'sabc', 'etv', 'primedia', 'media24', 'vodacom', 'mtn', 'telkom', 'cell c', 'woolworths', 
    'shoprite', 'pick n pay', 'clicks', 'dischem', 'takealot', 'superbalist', 'saarf', 'amasa'
  ],
  HEALTHCARE: [
    // General healthcare terms
    'healthcare', 'medical', 'clinical', 'patient', 'nurse', 'doctor', 'therapy', 'pharmaceutical', 'health',
    // SA-specific healthcare terms
    'discovery health', 'mediclinic', 'netcare', 'life healthcare', 'clicks', 'dischem', 'medical aid', 'hpcsa', 'sanc', 
    'sapc', 'nhls', 'medical scheme', 'council', 'registered'
  ],
  EDUCATION: [
    // General education terms
    'education', 'teaching', 'lecturer', 'curriculum', 'learning', 'students', 'school', 'academic', 'training',
    // SA-specific education terms
    'caps', 'dbe', 'department of education', 'ieb', 'uct', 'wits', 'up', 'ukzn', 'stellenbosch', 'unisa', 'uj', 'nwu', 
    'rhodes', 'tutor', 'principal', 'sace', 'registered educator', 'saqa', 'facilitator'
  ],
  MINING: [
    'mining', 'minerals', 'resources', 'gold', 'platinum', 'coal', 'diamond', 'copper', 'safety', 'engineer', 
    'anglo american', 'anglogold ashanti', 'impala platinum', 'sibanye-stillwater', 'glencore', 'bhp', 'sasol', 
    'harmony gold', 'dmr', 'mhsa', 'geologist', 'metallurgist', 'mine manager'
  ],
  AGRICULTURE: [
    'agriculture', 'farming', 'crops', 'livestock', 'irrigation', 'harvest', 'sustainable', 'agribusiness', 
    'agri-processing', 'agritech', 'food security', 'wine', 'viticulture', 'forestry', 'daff', 'horticulture', 
    'aquaculture', 'agronomy', 'soil science'
  ]
};

// South Africa specific terms
const SA_TERMS = [
  // BEE and Compliance
  'b-bbee', 'bbbee', 'bee', 'black economic empowerment', 'employment equity', 'affirmative action',
  
  // Education & Qualification Frameworks
  'nqf', 'saqa', 'seta', 'matric', 'national senior certificate', 'n diploma', 'national diploma',
  
  // Regions & Geographic Terms
  'south africa', 'south african', 'sa', 'rsa', 'gauteng', 'western cape', 'eastern cape', 
  'kwazulu-natal', 'free state', 'north west', 'mpumalanga', 'limpopo', 'northern cape',
  'johannesburg', 'cape town', 'durban', 'pretoria', 'port elizabeth', 'bloemfontein',
  
  // Professional Bodies & Certifications
  'ecsa', 'sacnasp', 'saica', 'icsa', 'ict seta', 'services seta', 'psira',
  
  // Languages
  'bilingual', 'multilingual', 'afrikaans', 'zulu', 'xhosa', 'sotho', 'tswana', 'venda', 'tsonga', 'swati', 'ndebele',
  
  // Industry-Specific SA Terms
  'jse', 'fsca', 'fais', 're5', 're1', 'fica'
];

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
function analyzeFormat(cvText: string): {score: number, feedback: string[], saElements: string[]} {
  const feedback: string[] = [];
  const saElements: string[] = [];
  let score = 0;
  const text = cvText.toLowerCase();
  
  // Check length
  const wordCount = cvText.split(/\s+/).length;
  if (wordCount < 200) {
    feedback.push("CV appears too short. Consider adding more detailed information.");
    score += 5;
  } else if (wordCount > 200 && wordCount < 600) {
    feedback.push("CV length is appropriate for South African employers.");
    score += 20;
  } else {
    feedback.push("CV is quite lengthy. In South Africa, recruiters prefer concise 2-3 page CVs.");
    score += 10;
  }
  
  // Check for contact details
  if (/email|@|phone|tel|contact/i.test(text)) {
    feedback.push("Contact information is present.");
    score += 15;
  } else {
    feedback.push("Ensure your contact information is clearly visible at the top of your CV.");
    score += 0;
  }
  
  // Check for education section
  if (/education|qualification|degree|diploma/i.test(text)) {
    feedback.push("Education section detected.");
    score += 15;
  } else {
    feedback.push("Consider adding an education section to your CV.");
    score += 0;
  }
  
  // Check for experience section
  if (/experience|work|employment|career/i.test(text)) {
    feedback.push("Experience section detected.");
    score += 15;
  } else {
    feedback.push("Your CV should include detailed work experience.");
    score += 0;
  }
  
  // Check for skills section
  if (/skills|abilities|competencies/i.test(text)) {
    feedback.push("Skills section detected.");
    score += 15;
  } else {
    feedback.push("Consider adding a dedicated skills section to highlight your capabilities.");
    score += 0;
  }
  
  // Check for B-BBEE information
  if (/b-bbee|bbbee|bee|black economic empowerment/i.test(text)) {
    feedback.push("B-BBEE information detected - this is valuable for South African employers.");
    saElements.push("B-BBEE information");
    score += 10;
  } else {
    feedback.push("Consider adding your B-BBEE status which is often valuable in South African job applications.");
  }
  
  // Check for NQF levels
  if (/nqf level|nqf \d/i.test(text)) {
    feedback.push("NQF level information detected - this clarifies your qualification level.");
    saElements.push("NQF level");
    score += 5;
  }
  
  // Check for South African languages
  const languages = ['english', 'afrikaans', 'zulu', 'xhosa', 'sotho', 'tswana', 'venda', 'tsonga', 'swati', 'ndebele'];
  const languagesFound = languages.filter(lang => text.includes(lang));
  if (languagesFound.length > 0) {
    feedback.push("South African language proficiency section detected - multilingual skills are valuable in SA.");
    saElements.push("Language proficiency: " + languagesFound.join(", "));
    score += 5;
  } else {
    feedback.push("Consider adding your South African language proficiencies, as multilingual skills are valued by employers.");
  }
  
  // Check for ID number (privacy-aware check - don't extract the number)
  if (/id number|identity number|id no|id:/i.test(text)) {
    feedback.push("ID information referenced - this is common in South African CVs, but ensure it's secure when sharing electronically.");
    saElements.push("ID reference");
    score += 5;
  }
  
  // Check for other South African specific elements
  const saTermsFound = SA_TERMS.filter(term => text.includes(term));
  if (saTermsFound.length > 0) {
    // Only add terms not already counted
    const uniqueTerms = saTermsFound.filter(term => 
      !term.includes('b-bbee') && !term.includes('bee') && 
      !term.includes('nqf') && !languages.includes(term)
    );
    
    if (uniqueTerms.length > 0) {
      feedback.push("Additional South African elements detected: " + uniqueTerms.slice(0, 5).join(", "));
      saElements.push(...uniqueTerms.slice(0, 5));
      score += Math.min(uniqueTerms.length * 2, 10); // Up to 10 points for SA terms
    }
  } else {
    feedback.push("Consider adding South African specific information to localize your CV.");
  }
  
  return {
    score: Math.min(score, 100),
    feedback,
    saElements
  };
}

/**
 * Score CV against ATS criteria
 * @param cvText The CV text content 
 * @returns ATS score and feedback
 */
function scoreAgainstATS(cvText: string): {score: number, strengths: string[], improvements: string[], saScore: number} {
  const text = cvText.toLowerCase();
  const strengths: string[] = [];
  const improvements: string[] = [];
  let score = 0;
  let saScore = 0; // South African specific score
  
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
  let saTotalKeywords = 0;
  let saMatchedKeywords = 0;
  
  // Count SA-specific keywords for each industry
  for (const industry in INDUSTRY_KEYWORDS) {
    const allKeywords = INDUSTRY_KEYWORDS[industry as keyof typeof INDUSTRY_KEYWORDS];
    const industryKeywords = allKeywords.filter(keyword => text.includes(keyword));
    
    keywordMatches += industryKeywords.length;
    
    // Calculate South African specific keywords
    // We consider SA-specific ones after the general terms in each category
    const generalTermsCount = 11; // First 11 items in each array are general terms
    const saKeywords = allKeywords.slice(generalTermsCount);
    saTotalKeywords += saKeywords.length;
    
    const matchedSaKeywords = saKeywords.filter(keyword => text.includes(keyword));
    saMatchedKeywords += matchedSaKeywords.length;
  }
  
  // Score general keywords
  if (keywordMatches >= 8) {
    strengths.push("Strong keyword optimization for ATS");
    score += 20;
  } else if (keywordMatches >= 4) {
    strengths.push("Good keyword presence, but could be improved");
    score += 10;
  } else {
    improvements.push("Add more industry-relevant keywords to pass ATS screening");
    score += 5;
  }
  
  // Score SA-specific keywords
  if (saMatchedKeywords >= 6) {
    strengths.push("Excellent South African industry keywords - well optimized for local employers");
    score += 10;
    saScore += 25;
  } else if (saMatchedKeywords >= 3) {
    strengths.push("Good South African context, but could add more local industry terms");
    score += 5;
    saScore += 15;
  } else if (saMatchedKeywords > 0) {
    improvements.push("Add more South African industry-specific keywords to improve local relevance");
    saScore += 5;
  } else {
    improvements.push("Include South African companies, institutions or industry terms relevant to your field");
    saScore += 0;
  }
  
  // Check for South African education formatting
  if (/matric|national senior certificate|nsc/i.test(text)) {
    if (/matric .*?with|nsc .*?with|distinction/i.test(text)) {
      strengths.push("Clearly formatted South African education qualifications with achievement levels");
      saScore += 10;
    } else {
      strengths.push("Includes South African basic education qualification (Matric/NSC)");
      saScore += 5;
    }
  }
  
  // Check for NQF levels 
  if (/nqf level \d|nqf \d/i.test(text)) {
    strengths.push("Includes NQF levels for qualifications - important for South African employers");
    saScore += 10;
  } else if (/diploma|degree|qualification/i.test(text)) {
    improvements.push("Consider adding NQF levels to your qualifications for South African employer clarity");
  }
  
  // Check file format readability (simplified)
  if (text.includes('summary') || text.includes('profile') || text.includes('objective')) {
    strengths.push("Good structure with clear sections");
    score += 10;
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
  
  // Check for job title matching
  if (/position|job title|role|designation/i.test(text)) {
    strengths.push("Includes clear job titles which helps with ATS keyword matching");
    score += 10;
  } else {
    improvements.push("Ensure each position includes a clear, industry-standard job title");
    score += 0;
  }
  
  // Final score capping
  score = Math.min(score, 100);
  saScore = Math.min(saScore, 100);
  
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
    improvements,
    saScore
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
    // Include South African relevance in the scoring
    const overallScore = Math.round(
      (formatAnalysis.score * 0.3) + 
      (atsScore.score * 0.5) + 
      (atsScore.saScore * 0.2)
    );
    
    // Determine rating based on overall score
    let rating = "Poor";
    if (overallScore >= SCORE_THRESHOLDS.EXCELLENT) {
      rating = "Excellent";
    } else if (overallScore >= SCORE_THRESHOLDS.GOOD) {
      rating = "Good";
    } else if (overallScore >= SCORE_THRESHOLDS.AVERAGE) {
      rating = "Average";
    }
    
    // Determine South African relevance rating
    let saRelevance = "Low";
    if (atsScore.saScore >= 80) {
      saRelevance = "Excellent";
    } else if (atsScore.saScore >= 60) {
      saRelevance = "High";
    } else if (atsScore.saScore >= 40) {
      saRelevance = "Medium";
    }
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      overall_score: overallScore,
      rating: rating,
      ats_score: atsScore.score,
      format_score: formatAnalysis.score,
      sa_score: atsScore.saScore,
      sa_relevance: saRelevance,
      sa_elements: formatAnalysis.saElements,
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