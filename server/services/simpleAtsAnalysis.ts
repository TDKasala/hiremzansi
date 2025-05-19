/**
 * Simple ATS Analysis Service with South African Context Scoring
 */

export interface AtsAnalysisResult {
  overallScore: number;
  skillScore: number;
  formatScore: number;
  saContextScore: number;
  strengths: string[];
  improvements: string[];
  foundSkills: string[];
  saRating: string;
}

export function analyzeCV(text: string): AtsAnalysisResult {
  // SOUTH AFRICAN CONTEXT DETECTION (20% of score)
  
  // B-BBEE related terms (10 points per instance, max 20)
  const bbbeeTerms = ["b-bbee", "bbbee", "broad based black economic empowerment", "bee", "black owned"];
  let bbbeeScore = 0;
  for (const term of bbbeeTerms) {
    if (text.toLowerCase().includes(term)) {
      bbbeeScore += 10;
      if (bbbeeScore >= 20) break;
    }
  }
  
  // NQF levels (5 points per correct level, max 10)
  const nqfMatches = text.match(/nqf level \d+|national qualifications? framework level \d+|nqf \d+/gi) || [];
  const nqfScore = Math.min(10, nqfMatches.length * 5);
  
  // South African cities (2 points per entity, max 5)
  const saCities = ["johannesburg", "cape town", "durban", "pretoria", "bloemfontein"];
  let citiesScore = 0;
  for (const city of saCities) {
    if (text.toLowerCase().includes(city)) {
      citiesScore += 2;
      if (citiesScore >= 5) break;
    }
  }
  
  // SA languages (3 points per instance, max 5)
  const saLanguages = ["afrikaans", "xhosa", "zulu", "sotho", "tswana"];
  let languageScore = 0;
  for (const lang of saLanguages) {
    if (text.toLowerCase().includes(lang)) {
      languageScore += 3;
      if (languageScore >= 5) break;
    }
  }
  
  // Calculate SA context score (20% of total)
  const saContextScore = Math.min(100, bbbeeScore + nqfScore + citiesScore + languageScore);
  
  // CV FORMAT ANALYSIS (40% of score)
  
  // Section headers (15 points each, max 60)
  const sectionHeaders = [
    /^(summary|profile|objective)s?:?$/im,
    /^(skills|competencies):?$/im,
    /^(experience|work|employment):?$/im,
    /^(education|qualifications):?$/im
  ];
  
  let sectionScore = 0;
  for (const pattern of sectionHeaders) {
    if (pattern.test(text)) {
      sectionScore += 15;
    }
  }
  sectionScore = Math.min(60, sectionScore);
  
  // Bullet points (10 points)
  const hasBullets = text.includes("•") || text.includes("-") || /^\s*[-•]\s+/m.test(text);
  const bulletScore = hasBullets ? 10 : 0;
  
  // Dates format (10 points)
  const hasDates = /\d{4}\s*(-|to)\s*\d{4}|\d{4}\s*(-|to)\s*(present|current)/i.test(text);
  const dateScore = hasDates ? 10 : 0;
  
  // Achievements (10 points)
  const hasAchievements = /increased|improved|reduced|generated|by\s+\d+%/i.test(text);
  const achievementsScore = hasAchievements ? 10 : 0;
  
  // Calculate format score (40% of total)
  const formatScore = Math.min(100, sectionScore + bulletScore + dateScore + achievementsScore);
  
  // SKILLS ANALYSIS (40% of score)
  
  // High-demand skills
  const highDemandSkills = [
    "data analysis", "python", "machine learning", "artificial intelligence",
    "cybersecurity", "cloud", "project management", "agile"
  ];
  
  const regularSkills = [
    "microsoft office", "excel", "word", "leadership", "communication",
    "javascript", "java", "html", "css", "sql", "customer service"
  ];
  
  const foundHighDemandSkills = highDemandSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  const foundRegularSkills = regularSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  // High-demand skills worth 12 points, regular skills worth 8 points
  const skillScore = Math.min(100, 
    (foundHighDemandSkills.length * 12) + 
    (foundRegularSkills.length * 8)
  );
  
  // OVERALL SCORE
  const overallScore = Math.round(
    (skillScore * 0.4) + 
    (formatScore * 0.4) + 
    (saContextScore * 0.2)
  );
  
  // STRENGTHS & IMPROVEMENTS
  const strengths = [];
  const improvements = [];
  
  // Generate strengths
  if (saContextScore > 30) strengths.push("Your CV includes South African context that employers value.");
  if (foundHighDemandSkills.length > 0) strengths.push("Your CV features high-demand skills for 2025.");
  if (formatScore > 70) strengths.push("Your CV has good formatting with clear section headers.");
  if (bulletScore > 0) strengths.push("Your CV uses bullet points to highlight information effectively.");
  if (hasAchievements) strengths.push("You've included quantified achievements that demonstrate impact.");
  
  // Generate improvements
  if (saContextScore < 30) improvements.push("Include South African context like B-BBEE status and NQF levels.");
  if (foundHighDemandSkills.length === 0) improvements.push("Add high-demand skills relevant to South African job market.");
  if (sectionScore < 30) improvements.push("Use clear section headers to organize your CV better.");
  if (bulletScore === 0) improvements.push("Add bullet points to make your CV more scannable.");
  if (!hasAchievements) improvements.push("Quantify your achievements with specific metrics.");
  
  // If we don't have enough, add generic ones
  if (strengths.length < 3) {
    strengths.push("Your CV has been successfully processed.");
    strengths.push("Your CV demonstrates professional experience.");
  }
  
  if (improvements.length < 3) {
    improvements.push("Tailor your CV to match specific job descriptions.");
    improvements.push("Consider adding more South African context to your CV.");
  }
  
  // Determine SA relevance rating
  let saRating = "Low";
  if (saContextScore >= 80) saRating = "Excellent";
  else if (saContextScore >= 60) saRating = "High";
  else if (saContextScore >= 40) saRating = "Medium";
  
  // Combine all found skills
  const allSkills = [...foundHighDemandSkills, ...foundRegularSkills];
  
  return {
    overallScore,
    skillScore,
    formatScore,
    saContextScore,
    strengths: strengths.slice(0, 5),
    improvements: improvements.slice(0, 5),
    foundSkills: allSkills.slice(0, 8),
    saRating
  };
}
