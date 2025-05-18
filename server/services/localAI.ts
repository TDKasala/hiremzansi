/**
 * LocalAI Service for CV Analysis
 * 
 * This service provides an AI-like analysis for CVs using local rule-based algorithms.
 * It's specifically designed for South African job market analysis without requiring external API keys.
 * 
 * The scoring algorithm follows a structured approach:
 * - South African Context Detection (20% of score)
 * - CV Format Evaluation (40% of score)
 * - Skills Identification (40% of score)
 */

import { randomUUID } from 'crypto';

export interface LocalAIAnalysisResult {
  overall_score: number;
  rating: string;
  format_score: number;
  skill_score: number;
  sa_score: number;
  sa_relevance: string;
  strengths: string[];
  improvements: string[];
  format_feedback: string[];
  sections_detected: string[];
  skills_identified: string[];
  sa_elements_detected: string[];
}

// Dictionary of South African specific terms and patterns to recognize
const SA_PATTERNS = {
  // B-BBEE related terms (10 points per valid instance, max 20)
  b_bbee: /(b-bbee|bbbee|broad[- ]based black economic empowerment|bee|black[- ]owned|hdi|transformation[- ]focused)/i,
  
  // NQF levels (5 points per correct level, max 10)
  nqf: /nqf level \d+|national qualifications? framework level \d+|nqf \d+/i,
  
  // South African cities (2 points per entity, max 5)
  sa_cities: /(johannesburg|cape town|durban|pretoria|bloemfontein|port elizabeth|gqeberha|east london|polokwane|nelspruit|mbombela|kimberley|pietermaritzburg|stellenbosch|potchefstroom)/i,
  
  // South African provinces (2 points per entity, max 5)
  sa_provinces: /(gauteng|western cape|kwazulu[- ]natal|eastern cape|mpumalanga|limpopo|north west|free state|northern cape)/i,
  
  // South African currencies (2 points per entity, max 5)
  sa_currencies: /(r\d+|zar|rand)/i,
  
  // South African languages (3 points per instance, max 5)
  sa_languages: /(afrikaans|xhosa|zulu|ndebele|sepedi|sesotho|setswana|siswati|tshivenda|xitsonga|isizulu|isixhosa)/i,
  
  // South African universities (2 points per entity, max 5)
  sa_universities: /(university of (cape town|witwatersrand|pretoria|stellenbosch|johannesburg|kwazulu[- ]natal|the western cape)|uct|wits|tuks|up|uj|ukzn|uwc|unisa|north west university|rhodes university)/i,
  
  // South African companies (2 points per entity, max 5)
  sa_companies: /(sasol|standard bank|fnb|absa|nedbank|mtn|vodacom|multichoice|shoprite|pick n pay|sanlam|old mutual|discovery|telkom|transnet|eskom|denel|sappi)/i,
  
  // South African regulations (3 points per instance, max 5)
  sa_regulations: /(popi act|popia|protection of personal information|fais|fica|national credit act|consumer protection act|employment equity act|skills development act|labor relations act|bcea)/i
};

// List of common job skills for matching (8 points per skill, max 40)
// High-demand South African skills in 2025 (weighting x1.5)
const HIGH_DEMAND_SKILLS = [
  'data analysis', 'python', 'machine learning', 'artificial intelligence',
  'cybersecurity', 'cloud computing', 'aws', 'azure', 
  'renewable energy', 'sustainability', 'solar energy',
  'project management', 'agile', 'scrum', 
  'digital marketing', 'e-commerce', 'user experience',
];

// Regular skills (standard weighting)
const COMMON_SKILLS = [
  'microsoft office', 'excel', 'word', 'powerpoint', 'outlook',
  'team leadership', 'problem solving', 'communication',
  'javascript', 'java', 'c#', 'c++', 'php', 'typescript',
  'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express',
  'sql', 'postgresql', 'mysql', 'mongodb', 'database management',
  'google cloud', 'docker', 'kubernetes',
  'kanban', 'waterfall',
  'customer service', 'sales', 'marketing', 'seo', 'social media',
  'budgeting', 'financial analysis', 'accounting',
  'research', 'critical thinking', 'strategic planning',
  'writing', 'editing', 'content creation',
  'adobe photoshop', 'illustrator', 'indesign', 'ui/ux design',
  'human resources', 'recruitment', 'training', 'onboarding',
  'logistics', 'supply chain', 'inventory management',
  'quality assurance', 'quality control', 'testing',
];

// Section patterns to identify CV structure (15 points per header, max 60)
const SECTION_PATTERNS = {
  summary: /^(professional|career|personal|summary|profile|objective)s?:?$/im,
  skills: /^(skills|technical skills|competencies|core competencies|expertise|areas of expertise):?$/im,
  experience: /^(experience|work experience|professional experience|employment history|work history):?$/im,
  education: /^(education|academic|qualifications|educational background|academic qualifications):?$/im,
  projects: /^(projects|portfolio|key projects|personal projects|major projects):?$/im,
  awards: /^(awards|achievements|honors|recognitions|accolades):?$/im,
  certifications: /^(certifications|certificates|professional certifications|accreditations):?$/im,
  languages: /^(languages|language proficiency|spoken languages):?$/im,
  references: /^(references|professional references):?$/im,
  volunteer: /^(volunteer|volunteering|community service|community involvement):?$/im,
  interests: /^(interests|hobbies|personal interests|activities):?$/im,
  publications: /^(publications|research|papers|articles|published works):?$/im
};

// Format patterns to check for good CV structure
const FORMAT_PATTERNS = {
  // Bullet points (10 points)
  bullet_points: /^\s*[•\*➢→✓\-∙⋅]\s/m,
  
  // Contact info patterns
  contact_info: /email|phone|mobile|linkedin|github|website/i,
  
  // Date formats (10 points)
  dates: /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)[a-z]* \d{4}|\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}/i,
  
  // Quantified achievements (10 points)
  quantified_achievements: /increased by \d+%|decreased by \d+%|reduced \d+%|improved \d+%|grew \d+%|\d+% increase|saved \$\d+|generated \$\d+|[R₹]\d+|led team of \d+|managed \d+ people/i,
  
  // Action verbs (10 points)
  action_verbs: /^(developed|managed|created|implemented|designed|led|coordinated|analyzed|achieved|launched|built|delivered|trained|mentored|established|improved|increased|reduced|resolved|streamlined)/im
};

/**
 * Service class for local CV analysis with refined scoring algorithm
 */
export class LocalAIService {
  /**
   * Analyze CV text to provide ATS and South African market specific feedback
   * without requiring external API calls
   */
  analyzeCV(cvText: string): LocalAIAnalysisResult {
    // Count total words for statistics
    const wordCount = cvText.split(/\s+/).length;
    
    // Detect CV sections
    const sectionsDetected = this.detectSections(cvText);
    
    // Detect skills with improved scoring for high-demand skills
    const { skillsIdentified, skillScore } = this.evaluateSkills(cvText);
    
    // Evaluate format with updated scoring criteria
    const formatScore = this.evaluateFormat(cvText);
    const formatFeedback = this.generateFormatFeedback(cvText, formatScore);
    
    // Evaluate South African context with refined scoring
    const { saScore, saElementsDetected } = this.evaluateSAContext(cvText);
    
    // Calculate overall score with proper weighting
    // Format: 40%, Skills: 40%, SA Relevance: 20%
    const overallScore = Math.round(
      (formatScore * 0.4) + 
      (skillScore * 0.4) + 
      (saScore * 0.2)
    );
    
    // Determine SA relevance label
    let saRelevance = 'Low';
    if (saScore >= 80) saRelevance = 'Excellent';
    else if (saScore >= 60) saRelevance = 'High';
    else if (saScore >= 40) saRelevance = 'Medium';
    
    // Generate strengths and improvement suggestions
    const strengths = this.generateStrengths(
      formatScore, 
      skillScore, 
      saScore, 
      sectionsDetected, 
      skillsIdentified, 
      saElementsDetected
    );
    
    const improvements = this.generateImprovements(
      formatScore, 
      skillScore, 
      saScore, 
      sectionsDetected, 
      skillsIdentified, 
      saElementsDetected
    );
    
    // Determine rating based on overall score
    let rating = 'Poor';
    if (overallScore >= 90) rating = 'Excellent';
    else if (overallScore >= 80) rating = 'Very Good';
    else if (overallScore >= 70) rating = 'Good';
    else if (overallScore >= 60) rating = 'Above Average';
    else if (overallScore >= 50) rating = 'Average';
    else if (overallScore >= 40) rating = 'Below Average';
    
    return {
      overall_score: overallScore,
      rating,
      format_score: formatScore,
      skill_score: skillScore,
      sa_score: saScore,
      sa_relevance: saRelevance,
      strengths,
      improvements,
      format_feedback: formatFeedback,
      sections_detected: sectionsDetected,
      skills_identified: skillsIdentified,
      sa_elements_detected: saElementsDetected
    };
  }
  
  /**
   * Detect CV sections to evaluate structure and completeness
   */
  private detectSections(cvText: string): string[] {
    const sections: string[] = [];
    
    // Detect sections using improved regex patterns
    for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(cvText)) {
        sections.push(section);
      }
    }
    
    return sections;
  }
  
  /**
   * Detect skills with enhanced scoring for high-demand South African skills
   */
  private evaluateSkills(cvText: string): { skillsIdentified: string[], skillScore: number } {
    const skills: string[] = [];
    const lowerText = cvText.toLowerCase();
    let score = 0;
    let highDemandCount = 0;
    
    // First check for high-demand skills (weighted x1.5)
    for (const skill of HIGH_DEMAND_SKILLS) {
      if (lowerText.includes(skill.toLowerCase())) {
        // Avoid duplicates
        if (!skills.includes(skill)) {
          skills.push(skill);
          score += 12; // 8 points × 1.5 weight = 12 points
          highDemandCount++;
        }
      }
    }
    
    // Then check regular skills (8 points each)
    for (const skill of COMMON_SKILLS) {
      if (lowerText.includes(skill.toLowerCase())) {
        // Avoid duplicates
        if (!skills.includes(skill)) {
          skills.push(skill);
          score += 8;
        }
      }
    }
    
    // Add diversity bonus if at least 5 skills are found
    if (skills.length >= 5) {
      score += 5;
    }
    
    // Add relevance bonus if candidate has top in-demand skills (at least 3)
    if (highDemandCount >= 3) {
      score += 5;
    }
    
    // Cap score at 100
    const finalScore = Math.min(100, score);
    
    return { 
      skillsIdentified: skills,
      skillScore: finalScore
    };
  }
  
  /**
   * Evaluate CV format quality with updated scoring criteria
   */
  private evaluateFormat(cvText: string): number {
    let score = 0;
    const lines = cvText.split('\n');
    
    // 1. Check for section headers (15 points per header, max 60)
    const sectionsFound = this.detectSections(cvText);
    score += Math.min(60, sectionsFound.length * 15);
    
    // 2. Check for bullet points and action verbs (10 points each)
    let hasBulletPoints = false;
    let hasActionVerbs = false;
    
    for (const line of lines) {
      if (!hasBulletPoints && FORMAT_PATTERNS.bullet_points.test(line)) {
        hasBulletPoints = true;
        score += 10;
      }
      
      if (!hasActionVerbs && FORMAT_PATTERNS.action_verbs.test(line)) {
        hasActionVerbs = true;
        score += 10;
      }
      
      // If both found, break the loop
      if (hasBulletPoints && hasActionVerbs) break;
    }
    
    // 3. Check for dates and quantified achievements (10 points each)
    let hasProperDates = false;
    let hasQuantifiedAchievements = false;
    
    for (const line of lines) {
      if (!hasProperDates && FORMAT_PATTERNS.dates.test(line)) {
        hasProperDates = true;
        score += 10;
      }
      
      if (!hasQuantifiedAchievements && FORMAT_PATTERNS.quantified_achievements.test(line)) {
        hasQuantifiedAchievements = true;
        score += 10;
      }
      
      // If both found, break the loop
      if (hasProperDates && hasQuantifiedAchievements) break;
    }
    
    // 4. Evaluate length (ideal 300-500 words)
    const wordCount = cvText.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 500) {
      // Ideal length
      score += 10;
    } else if (wordCount > 500) {
      // Penalty for excessive length (-5 per 100 words over, max penalty 20)
      const excessWordPenalty = Math.floor((wordCount - 500) / 100) * 5;
      score -= Math.min(20, excessWordPenalty);
    }
    
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    // Cap score at 100
    return Math.min(100, score);
  }
  
  /**
   * Generate format feedback based on evaluation
   */
  private generateFormatFeedback(cvText: string, formatScore: number): string[] {
    const feedback: string[] = [];
    const lines = cvText.split('\n');
    const wordCount = cvText.split(/\s+/).length;
    
    // Length feedback
    if (wordCount < 300) {
      feedback.push('Your CV is too short. Aim for 300-500 words to provide enough detail while remaining concise.');
    } else if (wordCount > 600) {
      feedback.push('Your CV is lengthy. Consider condensing to 1-2 pages with 300-500 words to maintain recruiter interest.');
    }
    
    // Section headers feedback
    const sectionsFound = this.detectSections(cvText);
    const missingSections = ['summary', 'skills', 'experience', 'education'].filter(
      section => !sectionsFound.includes(section)
    );
    
    if (missingSections.length > 0) {
      feedback.push(`Add clear section headers for: ${missingSections.join(', ')}.`);
    }
    
    // Bullet points feedback
    let hasBulletPoints = false;
    for (const line of lines) {
      if (FORMAT_PATTERNS.bullet_points.test(line)) {
        hasBulletPoints = true;
        break;
      }
    }
    
    if (!hasBulletPoints) {
      feedback.push('Use bullet points (•) to highlight your experiences and achievements.');
    }
    
    // Dates feedback
    let hasProperDates = false;
    for (const line of lines) {
      if (FORMAT_PATTERNS.dates.test(line)) {
        hasProperDates = true;
        break;
      }
    }
    
    if (!hasProperDates) {
      feedback.push('Include clear dates for your work experience and education sections (e.g., January 2022 - Present).');
    }
    
    // Quantified achievements feedback
    let hasQuantifiedAchievements = false;
    for (const line of lines) {
      if (FORMAT_PATTERNS.quantified_achievements.test(line)) {
        hasQuantifiedAchievements = true;
        break;
      }
    }
    
    if (!hasQuantifiedAchievements) {
      feedback.push('Add quantified achievements using numbers and percentages to demonstrate your impact (e.g., "increased sales by 25%").');
    }
    
    // Action verbs feedback
    let hasActionVerbs = false;
    for (const line of lines) {
      if (FORMAT_PATTERNS.action_verbs.test(line)) {
        hasActionVerbs = true;
        break;
      }
    }
    
    if (!hasActionVerbs) {
      feedback.push('Begin bullet points with strong action verbs (e.g., developed, managed, created) to describe your experiences.');
    }
    
    return feedback;
  }
  
  /**
   * Evaluate South African context relevance with improved scoring
   */
  private evaluateSAContext(cvText: string): { saScore: number, saElementsDetected: string[] } {
    let score = 0;
    const saElementsDetected: string[] = [];
    
    // 1. Check for B-BBEE status (10 points per valid instance, max 20)
    let bbbeeMatches = 0;
    const bbbeeRegex = SA_PATTERNS.b_bbee;
    const bbbeeMatches1 = cvText.match(bbbeeRegex);
    if (bbbeeMatches1) {
      bbbeeMatches = bbbeeMatches1.length;
      saElementsDetected.push('B-BBEE Status');
      score += Math.min(20, bbbeeMatches * 10);
    }
    
    // 2. Check for NQF levels (5 points per correct level, max 10)
    let nqfMatches = 0;
    const nqfRegex = SA_PATTERNS.nqf;
    const nqfMatches1 = cvText.match(nqfRegex);
    if (nqfMatches1) {
      nqfMatches = nqfMatches1.length;
      saElementsDetected.push('NQF Level');
      score += Math.min(10, nqfMatches * 5);
    }
    
    // 3. Check for South African entities (2 points per entity, max 5 for each category)
    
    // Cities
    if (SA_PATTERNS.sa_cities.test(cvText)) {
      saElementsDetected.push('SA Location');
      score += 2;
    }
    
    // Provinces
    if (SA_PATTERNS.sa_provinces.test(cvText)) {
      saElementsDetected.push('SA Province');
      score += 2;
    }
    
    // Currency
    if (SA_PATTERNS.sa_currencies.test(cvText)) {
      saElementsDetected.push('SA Currency (Rand/ZAR)');
      score += 2;
    }
    
    // Universities
    if (SA_PATTERNS.sa_universities.test(cvText)) {
      saElementsDetected.push('SA Education');
      score += 2;
    }
    
    // Companies
    if (SA_PATTERNS.sa_companies.test(cvText)) {
      saElementsDetected.push('SA Companies');
      score += 2;
    }
    
    // 4. Check for South African languages or regulations (3 points per instance, max 5 for each)
    
    // Languages
    if (SA_PATTERNS.sa_languages.test(cvText)) {
      saElementsDetected.push('SA Languages');
      score += 3;
    }
    
    // Regulations
    if (SA_PATTERNS.sa_regulations.test(cvText)) {
      saElementsDetected.push('SA Regulations');
      score += 3;
    }
    
    // Cap score at 40 to maintain the 20% weight in overall assessment
    const normalizedScore = Math.min(100, score * 2.5);
    
    return { saScore: normalizedScore, saElementsDetected };
  }
  
  /**
   * Generate strengths based on analysis (scores >80% in any category)
   */
  private generateStrengths(
    formatScore: number, 
    skillScore: number, 
    saScore: number, 
    sectionsDetected: string[], 
    skillsIdentified: string[],
    saElementsDetected: string[]
  ): string[] {
    const strengths: string[] = [];
    
    // Format strengths (if score >80%)
    if (formatScore >= 80) {
      strengths.push('Your CV has an excellent structure that makes it easy for ATS systems to parse.');
    }
    
    // Skills strengths (if score >80%)
    if (skillScore >= 80) {
      strengths.push('You have an impressive range of in-demand skills that South African employers are seeking.');
    }
    
    // SA Context strengths (if score >80%)
    if (saScore >= 80) {
      strengths.push('Your CV is exceptionally well-tailored for the South African job market.');
    }
    
    // Add specific strength for B-BBEE if found
    if (saElementsDetected.includes('B-BBEE Status')) {
      strengths.push('Including your B-BBEE status significantly increases opportunities with transformation-focused companies.');
    }
    
    // Add specific strength for NQF if found
    if (saElementsDetected.includes('NQF Level')) {
      strengths.push('Specifying NQF levels for your qualifications helps employers understand your education within South African standards.');
    }
    
    // Add specific strength for comprehensive sections
    if (sectionsDetected.length >= 5) {
      strengths.push('Your CV includes comprehensive sections that provide a well-rounded view of your qualifications.');
    }
    
    // Add specific strength for high-demand skills
    const highDemandSkillCount = skillsIdentified.filter(skill => HIGH_DEMAND_SKILLS.includes(skill)).length;
    if (highDemandSkillCount >= 3) {
      strengths.push('You possess multiple high-demand skills that are particularly valuable in the 2025 South African job market.');
    }
    
    // Add specific strength for SA languages
    if (saElementsDetected.includes('SA Languages')) {
      strengths.push('Your multilingual capabilities are a significant asset in South Africa\'s diverse workplace environment.');
    }
    
    // Return 3-5 top strengths, or provide defaults if not enough found
    if (strengths.length < 3) {
      strengths.push(
        'Your CV includes some key information that employers are looking for.',
        'You have included specific details about your experience that add credibility.'
      );
    }
    
    return strengths.slice(0, 5);
  }
  
  /**
   * Generate improvement suggestions based on analysis (scores <60% in any category)
   */
  private generateImprovements(
    formatScore: number, 
    skillScore: number, 
    saScore: number, 
    sectionsDetected: string[], 
    skillsIdentified: string[],
    saElementsDetected: string[]
  ): string[] {
    const improvements: string[] = [];
    
    // Format improvements (if score <60%)
    if (formatScore < 60) {
      improvements.push('Improve your CV format with clearly labeled section headers (Summary, Experience, etc.).');
    }
    
    // Skills improvements (if score <60%)
    if (skillScore < 60) {
      improvements.push('Add more industry-relevant keywords to help your CV pass ATS screening systems.');
    }
    
    // SA Context improvements (if score <60%)
    if (saScore < 60) {
      improvements.push('Add more South African specific elements to make your CV more relevant for local employers.');
    }
    
    // Add specific improvement for B-BBEE if not found
    if (!saElementsDetected.includes('B-BBEE Status')) {
      improvements.push('Include your B-BBEE status to increase opportunities with transformation-focused companies.');
    }
    
    // Add specific improvement for NQF if not found
    if (!saElementsDetected.includes('NQF Level')) {
      improvements.push('Specify NQF levels for your qualifications to align with South African standards.');
    }
    
    // Add specific improvement for missing key sections
    const missingSections = ['summary', 'skills', 'experience', 'education'].filter(
      section => !sectionsDetected.includes(section)
    );
    
    if (missingSections.length > 0) {
      improvements.push(`Add clear section headers for: ${missingSections.join(', ')} to improve CV structure.`);
    }
    
    // Add specific improvement for SA languages if not found
    if (!saElementsDetected.includes('SA Languages')) {
      improvements.push('Highlight South African language proficiencies which are highly valued in the local job market.');
    }
    
    // Add specific improvement for bullet points if missing
    const formatFeedback = this.generateFormatFeedback(cvText, formatScore);
    if (formatFeedback.some(feedback => feedback.includes('bullet points'))) {
      improvements.push('Use bullet points to highlight your experiences and achievements.');
    }
    
    // Add specific improvement for quantified achievements if missing
    if (formatFeedback.some(feedback => feedback.includes('quantified achievements'))) {
      improvements.push('Add more quantified achievements with specific numbers (e.g., "increased efficiency by 30%").');
    }
    
    // Return 3-5 top improvements, or provide defaults if not enough found
    if (improvements.length < 3) {
      improvements.push(
        'Consider adding more quantified achievements to demonstrate the impact of your work.',
        'Use more industry-specific terminology to better match job descriptions.'
      );
    }
    
    return improvements.slice(0, 5);
  }
  
  /**
   * Generate a unique ID for the analysis
   */
  generateAnalysisId(): string {
    return randomUUID();
  }
}

// Export singleton instance
export const localAIService = new LocalAIService();