/**
 * South African ATS Analyzer
 * 
 * A rule-based CV analysis system optimized for the South African job market
 */

// South African specific keywords
const SA_KEYWORDS = [
  "south africa", "sa", "cape town", "johannesburg", "pretoria", "durban", 
  "b-bbee", "bee", "bbbee", "nqf", "saqa", "matric", "seta", "unisa", "wits"
];

// Common skills to detect
const COMMON_SKILLS = [
  "javascript", "python", "java", "react", "angular", "node.js", 
  "html", "css", "sql", "aws", "communication", "leadership", "excel"
];

/**
 * Analyze CV text and return detailed analysis results
 */
function analyzeCVText(text) {
  const content = text.trim().toLowerCase();
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  // Check formatting factors
  const hasSections = /education|experience|skills|qualifications|work history|employment|references|personal details/i.test(content);
  const hasBulletPoints = /•|-|\*/i.test(content);
  const hasContactInfo = /email|phone|tel|mobile|address|linkedin/i.test(content);
  const hasDateRanges = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec).+?-|to\b.+?(20\d{2}|present)/i.test(content);
  const hasDates = /\b(20\d{2}|19\d{2})\b/i.test(content);
  
  // Calculate format score
  const formatScore = Math.round(
    (hasSections ? 25 : 0) +
    (hasBulletPoints ? 25 : 0) +
    (hasContactInfo ? 20 : 0) +
    (hasDateRanges ? 15 : 0) +
    (hasDates ? 15 : 0)
  );
  
  // Check content quality
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  const hasActionVerbs = /\b(managed|developed|created|implemented|led|designed|improved|increased|reduced|achieved)\b/i.test(content);
  const hasNumbers = /\b\d+%|\d+ percent|increased by \d+|decreased by \d+|reduced \d+|improved \d+/i.test(content);
  const hasKeySkills = COMMON_SKILLS.some(skill => content.includes(skill.toLowerCase()));
  
  // Calculate content score
  const contentScore = Math.round(
    (avgLineLength > 30 && avgLineLength < 200 ? 25 : 0) +
    (hasActionVerbs ? 25 : 0) +
    (hasNumbers ? 25 : 0) +
    (hasKeySkills ? 25 : 0)
  );
  
  // Calculate South African context score
  const foundSaKeywords = SA_KEYWORDS.filter(keyword => content.includes(keyword.toLowerCase()));
  
  const hasB_BBEE = /\b(b-bbee|bbbee|bee|broad.based black economic empowerment|level \d b-bbee)\b/i.test(content);
  const hasNQF = /\bnqf level \d+\b|national qualifications framework|saqa/i.test(content);
  const hasSaAddress = /\b(south africa|gauteng|western cape|eastern cape|kwazulu-natal|kzn|free state)\b/i.test(content);
  
  const saContextScore = Math.round(
    ((foundSaKeywords.length > 0 ? Math.min(foundSaKeywords.length * 5, 30) : 0)) +
    (hasB_BBEE ? 25 : 0) +
    (hasNQF ? 25 : 0) + 
    (hasSaAddress ? 20 : 0)
  );
  
  // Extract skills
  const skillsFound = COMMON_SKILLS.filter(skill => 
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(content)
  );
  
  // Calculate overall ATS score (format, content, and SA context)
  const overallScore = Math.round(
    formatScore * 0.3 + 
    contentScore * 0.4 + 
    saContextScore * 0.3
  );
  
  // Determine rating
  let rating = '';
  if (overallScore >= 80) rating = 'Excellent';
  else if (overallScore >= 65) rating = 'Good';
  else if (overallScore >= 50) rating = 'Average';
  else rating = 'Needs Improvement';
  
  // Determine SA relevance rating
  let saRelevance = '';
  if (saContextScore >= 80) saRelevance = 'Excellent';
  else if (saContextScore >= 60) saRelevance = 'Good';
  else if (saContextScore >= 40) saRelevance = 'Average';
  else saRelevance = 'Low';
  
  // Generate strengths
  const strengths = [];
  
  if (hasSections) strengths.push('Well-structured CV with clear sections');
  if (hasBulletPoints) strengths.push('Effective use of bullet points improves readability');
  if (hasActionVerbs) strengths.push('Uses strong action verbs to highlight achievements');
  if (hasNumbers) strengths.push('Quantifies achievements with specific numbers');
  if (hasKeySkills) strengths.push('Contains relevant skills that ATS systems look for');
  if (hasDateRanges) strengths.push('Clear timeline of work experience');
  if (hasB_BBEE) strengths.push('Includes B-BBEE status, important for South African employers');
  if (hasNQF) strengths.push('Specifies NQF levels for qualifications');
  if (hasSaAddress) strengths.push('Includes South African location information');
  if (foundSaKeywords.length > 3) strengths.push('Well-optimized for South African job market');
  
  // Generate improvements
  const improvements = [];
  
  if (!hasSections) improvements.push('Add clear section headings (Education, Experience, Skills)');
  if (!hasBulletPoints) improvements.push('Use bullet points to highlight achievements');
  if (!hasActionVerbs) improvements.push('Include strong action verbs to describe achievements');
  if (!hasNumbers) improvements.push('Quantify achievements with specific numbers');
  if (!hasKeySkills) improvements.push('Add industry-relevant skills and keywords');
  if (!hasDateRanges) improvements.push('Include clear date ranges for education and work experience');
  if (!hasB_BBEE && saContextScore < 60) improvements.push('Consider adding B-BBEE status information if applicable');
  if (!hasNQF && saContextScore < 60) improvements.push('Add NQF levels to your qualifications');
  if (!hasSaAddress && saContextScore < 60) improvements.push('Include your location in South Africa');
  
  // Format feedback
  const formatFeedback = [];
  
  if (avgLineLength > 200) formatFeedback.push('Shorten your bullet points to 1-2 lines each');
  if (!hasContactInfo) formatFeedback.push('Add complete contact information (phone, email, LinkedIn)');
  if (content.length > 5000) formatFeedback.push('Consider shortening your CV to 2-3 pages maximum');
  if (content.length < 1500) formatFeedback.push('Your CV may be too short - add more relevant details');
  if (!hasDates) formatFeedback.push('Add dates to your work experience and education sections');
  
  // Shuffle arrays to provide variety in results
  return {
    overall_score: overallScore,
    rating,
    strengths: shuffle(strengths),
    improvements: shuffle(improvements),
    format_feedback: shuffle(formatFeedback),
    skills_identified: shuffle(skillsFound.slice(0, 15)),
    sa_score: saContextScore,
    sa_relevance: saRelevance
  };
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

module.exports = { analyzeCVText };