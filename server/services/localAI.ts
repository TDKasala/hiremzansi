/**
 * LocalAI Service
 * 
 * This service provides CV analysis capabilities without requiring external API calls.
 * It's specifically designed for South African job market analysis and works entirely
 * within the application, with no dependencies on external AI services.
 */

// South African specific keywords and terms
const SA_KEYWORDS = [
  'b-bbee', 'bbbee', 'broad-based black economic empowerment',
  'nqf', 'national qualifications framework',
  'saqa', 'south african qualifications authority',
  'seta', 'sector education and training authority',
  'johannesburg', 'cape town', 'durban', 'pretoria', 'bloemfontein',
  'western cape', 'gauteng', 'kwazulu-natal', 'free state', 'eastern cape',
  'south africa', 'south african',
  'jse', 'johannesburg stock exchange',
  'bcom', 'b.com', 'bsc', 'b.sc', 
  'matric',
  'popi', 'popia', 'protection of personal information act',
  'icasa', 'fsca', 'fais',
  'btech', 'national diploma',
  'unisa', 'university of cape town', 'wits', 'university of johannesburg',
  'stellenbosch',
  'afrikaans', 'zulu', 'xhosa', 'sotho', 'tswana', 'venda', 'tsonga', 'ndebele'
];

// Skills that are valued in the South African job market
const VALUED_SKILLS = [
  'project management', 'leadership', 'communication', 'teamwork',
  'microsoft office', 'excel', 'powerpoint', 'word',
  'javascript', 'python', 'java', 'c#', 'html', 'css',
  'data analysis', 'business intelligence', 'power bi', 'tableau',
  'accounting', 'financial management', 'budgeting',
  'operations', 'logistics', 'supply chain',
  'sales', 'marketing', 'customer service',
  'human resources', 'recruitment', 'training',
  'research', 'analysis', 'problem solving',
  'bilingual', 'multilingual'
];

// Common CV sections to check for
const CV_SECTIONS = [
  'professional summary', 'summary', 'profile', 'objective',
  'experience', 'work experience', 'employment history',
  'education', 'qualifications', 'academic background',
  'skills', 'key skills', 'technical skills', 'competencies',
  'achievements', 'accomplishments',
  'references', 'professional references'
];

/**
 * Analyzes CV text and provides an assessment with South African context
 * 
 * @param cvText The raw text content of the CV
 * @returns Comprehensive analysis results
 */
export function analyzeCVText(cvText: string) {
  // Normalize text for analysis
  const text = cvText.toLowerCase();
  
  // Check for sections presence
  const detectedSections = CV_SECTIONS.filter(section => 
    text.includes(section) || 
    text.includes(section + ':') || 
    text.includes(section + ' ')
  );
  
  const hasProperSections = detectedSections.length >= 3;
  
  // Check for proper formatting
  const hasBulletPoints = /•|-|\*/i.test(cvText);
  const hasDates = /20\d{2}|19\d{2}|january|february|march|april|may|june|july|august|september|october|november|december/i.test(text);
  
  // Formatting score calculation
  const formatScore = Math.round(
    (hasProperSections ? 40 : 0) +
    (hasBulletPoints ? 30 : 0) +
    (hasDates ? 30 : 0)
  );
  
  // Detect skills
  const detectedSkills = VALUED_SKILLS.filter(skill => 
    text.includes(skill) || 
    text.includes(skill + 's') || 
    text.includes(skill + 'ing')
  );
  
  // Calculate skill score
  const skillScore = Math.min(100, Math.round((detectedSkills.length / 10) * 100));
  
  // Detect South African specific elements
  const detectedSAElements = SA_KEYWORDS.filter(element => text.includes(element));
  
  // Calculate South African relevance score
  const saScore = Math.min(100, Math.round((detectedSAElements.length / 5) * 100));
  
  // Determine South African relevance rating
  let saRelevance = "Low";
  if (saScore >= 80) saRelevance = "Excellent";
  else if (saScore >= 60) saRelevance = "High";
  else if (saScore >= 30) saRelevance = "Medium";
  
  // Calculate overall score (weighted average)
  const overall_score = Math.round(
    (formatScore * 0.4) + 
    (skillScore * 0.4) + 
    (saScore * 0.2)
  );
  
  // Determine overall rating
  let rating = "Needs Improvement";
  if (overall_score >= 80) rating = "Excellent";
  else if (overall_score >= 70) rating = "Very Good";
  else if (overall_score >= 60) rating = "Good";
  else if (overall_score >= 40) rating = "Average";
  
  // Generate actionable feedback
  const strengths = [];
  const improvements = [];
  const format_feedback = [];
  
  // Format feedback
  if (hasProperSections) {
    strengths.push("CV has a good structure with clear sections");
  } else {
    improvements.push("Add clear section headings (e.g., Profile, Experience, Education, Skills)");
    format_feedback.push("Organize your CV into distinct sections with clear headings");
  }
  
  if (hasBulletPoints) {
    strengths.push("Effective use of bullet points to highlight information");
  } else {
    improvements.push("Use bullet points to make achievements and responsibilities stand out");
    format_feedback.push("Add bullet points (•) to list your responsibilities and achievements");
  }
  
  if (hasDates) {
    strengths.push("Timeline is clear with proper dates");
  } else {
    improvements.push("Include dates for your work experience and education");
    format_feedback.push("Add specific dates (month and year) for each position and qualification");
  }
  
  // South African context feedback
  if (saScore >= 60) {
    strengths.push("Good inclusion of South African specific information");
  } else {
    improvements.push("Add more South African context (e.g., B-BBEE status, NQF levels)");
    
    if (!text.includes('bbee') && !text.includes('b-bbee')) {
      improvements.push("Consider adding your B-BBEE status if applicable");
    }
    
    if (!text.includes('nqf')) {
      improvements.push("Include NQF levels for your qualifications");
    }
  }
  
  // Skills feedback
  if (detectedSkills.length >= 7) {
    strengths.push("Strong skills section with relevant keywords");
  } else if (detectedSkills.length >= 3) {
    improvements.push("Expand your skills section with more relevant keywords");
  } else {
    improvements.push("Add a dedicated skills section with relevant keywords");
  }
  
  // Return comprehensive analysis
  return {
    overall_score,
    rating,
    format_score: formatScore,
    skill_score: skillScore,
    sa_score: saScore,
    sa_relevance: saRelevance,
    strengths,
    improvements,
    format_feedback,
    sections_detected: detectedSections,
    skills_identified: detectedSkills,
    sa_elements_detected: detectedSAElements
  };
}

/**
 * Performs a deep analysis of a CV with additional South African context
 * 
 * @param cvText The raw text content of the CV
 * @param jobDescription Optional job description to match against
 * @returns Detailed analysis with additional insights
 */
export function performDeepAnalysis(cvText: string, jobDescription?: string) {
  // Get basic analysis first
  const basicAnalysis = analyzeCVText(cvText);
  
  // Additional deep analysis logic
  const hasQuantifiableAchievements = /increased|decreased|improved|reduced|achieved|won|grew|delivered|managed|led|created/i.test(cvText);
  const hasMetrics = /\d+%|\d+ percent|\d+ million|\dM|R\d+|\$\d+|ZAR \d+/i.test(cvText);
  const hasActionVerbs = /managed|led|developed|implemented|created|designed|analyzed|coordinated|achieved|delivered/i.test(cvText);
  
  // Advanced formatting checks
  const hasConsistentFormatting = !(/\n\n\n/.test(cvText)); // No excessive spacing
  const hasAppropriateLength = cvText.length > 1000 && cvText.length < 8000; // Not too short or long
  
  // South African specific checks
  const hasLocalCompanies = /(vodacom|mtn|shoprite|spar|pick n pay|absa|standard bank|fnb|nedbank|sasol|multichoice|telkom|eskom|transnet|denel|sanlam|discovery|old mutual)/i.test(cvText);
  const hasLocalDegrees = /(bachelor|bsc|ba|bcom|nqf|n4|n5|n6)/i.test(cvText);
  
  let saContextScore = basicAnalysis.sa_score;
  
  // Boost SA score based on additional checks
  if (hasLocalCompanies) saContextScore = Math.min(100, saContextScore + 15);
  if (hasLocalDegrees) saContextScore = Math.min(100, saContextScore + 10);
  
  // Extended strengths and suggestions
  const extendedStrengths = [...basicAnalysis.strengths];
  const extendedImprovements = [...basicAnalysis.improvements];
  
  if (hasQuantifiableAchievements) {
    extendedStrengths.push("Good use of quantifiable achievements");
  } else {
    extendedImprovements.push("Add numbers and metrics to quantify your achievements");
  }
  
  if (hasMetrics) {
    extendedStrengths.push("Effective use of metrics to demonstrate impact");
  } else {
    extendedImprovements.push("Include metrics (percentages, amounts, etc.) to show your impact");
  }
  
  if (hasActionVerbs) {
    extendedStrengths.push("Strong action verbs to describe your experience");
  } else {
    extendedImprovements.push("Use more powerful action verbs to describe your responsibilities");
  }
  
  if (hasConsistentFormatting) {
    extendedStrengths.push("Consistent formatting throughout the document");
  } else {
    extendedImprovements.push("Ensure consistent formatting and spacing throughout your CV");
  }
  
  if (hasAppropriateLength) {
    extendedStrengths.push("Appropriate CV length for South African standards");
  } else if (cvText.length < 1000) {
    extendedImprovements.push("Your CV is too short. Expand on your experience and skills");
  } else {
    extendedImprovements.push("Your CV is too long. Try to keep it within 2-3 pages for South African standards");
  }
  
  // South African context improvements
  if (!hasLocalCompanies) {
    extendedImprovements.push("Highlight experience with South African companies if applicable");
  }
  
  if (!hasLocalDegrees) {
    extendedImprovements.push("Clearly indicate South African qualifications and their NQF levels");
  }
  
  // Return the enhanced analysis
  return {
    ...basicAnalysis,
    sa_score: saContextScore,
    strengths: extendedStrengths,
    improvements: extendedImprovements,
    has_quantifiable_achievements: hasQuantifiableAchievements,
    has_metrics: hasMetrics,
    has_action_verbs: hasActionVerbs,
    has_consistent_formatting: hasConsistentFormatting,
    has_appropriate_length: hasAppropriateLength,
    has_local_companies: hasLocalCompanies,
    has_local_degrees: hasLocalDegrees
  };
}