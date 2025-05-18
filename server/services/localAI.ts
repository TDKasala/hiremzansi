/**
 * LocalAI Service for CV Analysis
 * 
 * This service provides an AI-like analysis for CVs using local rule-based algorithms.
 * It's specifically designed for South African job market analysis without requiring external API keys.
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
  b_bbee: /(b-bbee|bbbee|broad[- ]based black economic empowerment|bee )/i,
  nqf: /nqf level \d+|national qualifications? framework/i,
  sa_cities: /(johannesburg|cape town|durban|pretoria|bloemfontein|port elizabeth|gqeberha|east london|polokwane|nelspruit|mbombela|kimberley|pietermaritzburg|stellenbosch|potchefstroom)/i,
  sa_provinces: /(gauteng|western cape|kwazulu[- ]natal|eastern cape|mpumalanga|limpopo|north west|free state|northern cape)/i,
  sa_currencies: /(r\d+|zar|rand)/i,
  sa_languages: /(afrikaans|xhosa|zulu|ndebele|sepedi|sesotho|setswana|siswati|tshivenda|xitsonga)/i,
  sa_universities: /(university of (cape town|witwatersrand|pretoria|stellenbosch|johannesburg|kwazulu[- ]natal|the western cape)|uct|wits|tuks|up|uj|ukzn|uwc|unisa|north west university|rhodes university)/i,
  sa_companies: /(sasol|standard bank|fnb|absa|nedbank|mtn|vodacom|multichoice|shoprite|pick n pay|sanlam|old mutual|discovery|telkom|transnet|eskom|denel|sappi)/i,
  sa_regulations: /(popi act|protection of personal information|fais|fica|national credit act|consumer protection act|employment equity act|skills development act|labor relations act|bcea)/i
};

// List of common job skills for matching
const COMMON_SKILLS = [
  'microsoft office', 'excel', 'word', 'powerpoint', 'outlook',
  'project management', 'team leadership', 'problem solving', 'communication',
  'javascript', 'python', 'java', 'c#', 'c++', 'php', 'typescript',
  'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express',
  'sql', 'postgresql', 'mysql', 'mongodb', 'database management',
  'aws', 'azure', 'google cloud', 'cloud computing',
  'agile', 'scrum', 'kanban', 'waterfall',
  'customer service', 'sales', 'marketing', 'seo', 'social media',
  'data analysis', 'machine learning', 'artificial intelligence',
  'budgeting', 'financial analysis', 'accounting',
  'research', 'critical thinking', 'strategic planning',
  'writing', 'editing', 'content creation',
  'adobe photoshop', 'illustrator', 'indesign', 'ui/ux design',
  'human resources', 'recruitment', 'training', 'onboarding',
  'logistics', 'supply chain', 'inventory management',
  'quality assurance', 'quality control', 'testing',
];

// Section patterns to identify CV structure
const SECTION_PATTERNS = {
  summary: /(professional|career|personal|summary|profile|objective)/i,
  skills: /skills|technical skills|competencies|core competencies|expertise|areas of expertise/i,
  experience: /experience|work experience|professional experience|employment history|work history/i,
  education: /education|academic|qualifications|educational background|academic qualifications/i,
  projects: /projects|portfolio|key projects|personal projects|major projects/i,
  awards: /awards|achievements|honors|recognitions|accolades/i,
  certifications: /certifications|certificates|professional certifications|accreditations/i,
  languages: /languages|language proficiency|spoken languages/i,
  references: /references|professional references/i,
  volunteer: /volunteer|volunteering|community service|community involvement/i,
  interests: /interests|hobbies|personal interests|activities/i,
  publications: /publications|research|papers|articles|published works/i
};

// Format patterns to check for good CV structure
const FORMAT_PATTERNS = {
  bullet_points: /•|\*|➢|→|✓|-|∙|⋅/,
  contact_info: /email|phone|mobile|linkedin|github|website/i,
  dates: /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)[a-z]* \d{4}/i,
  quantified_achievements: /increased|decreased|reduced|improved|grew|won|launched|developed|created|managed|led/i,
  action_verbs: /developed|managed|created|implemented|designed|led|coordinated|analyzed|achieved|launched/i
};

/**
 * Service class for local CV analysis
 */
export class LocalAIService {
  /**
   * Analyze CV text to provide ATS and South African market specific feedback
   * without requiring external API calls
   */
  analyzeCV(cvText: string): LocalAIAnalysisResult {
    // Count total words for statistics
    const wordCount = cvText.split(/\s+/).length;
    const lineCount = cvText.split('\n').length;
    
    // Detect CV sections
    const sectionsDetected = this.detectSections(cvText);
    
    // Detect skills
    const skillsIdentified = this.detectSkills(cvText);
    
    // Evaluate format
    const formatScore = this.evaluateFormat(cvText);
    const formatFeedback = this.generateFormatFeedback(cvText, formatScore);
    
    // Evaluate South African context
    const { saScore, saElementsDetected } = this.evaluateSAContext(cvText);
    
    // Calculate overall score
    // Format: 40%, Skills: 40%, SA Relevance: 20%
    const skillScore = Math.min(100, Math.round((skillsIdentified.length / 10) * 100));
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
    
    // Determine rating
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
    
    // Detect sections using regex patterns
    for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(cvText)) {
        sections.push(section);
      }
    }
    
    return sections;
  }
  
  /**
   * Detect skills mentioned in the CV
   */
  private detectSkills(cvText: string): string[] {
    const skills: string[] = [];
    const lowerText = cvText.toLowerCase();
    
    // Match against common skills list
    for (const skill of COMMON_SKILLS) {
      if (lowerText.includes(skill.toLowerCase())) {
        // Avoid duplicates
        if (!skills.includes(skill)) {
          skills.push(skill);
        }
      }
    }
    
    return skills;
  }
  
  /**
   * Evaluate CV format quality
   */
  private evaluateFormat(cvText: string): number {
    let score = 0;
    const lines = cvText.split('\n');
    
    // Check for appropriate length (300-700 words ideal)
    const wordCount = cvText.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 700) {
      score += 20;
    } else if (wordCount > 200 && wordCount < 900) {
      score += 10;
    }
    
    // Check for section headers
    const sectionsFound = this.detectSections(cvText);
    score += Math.min(20, sectionsFound.length * 4);
    
    // Check for bullet points
    let bulletPointsFound = 0;
    for (const line of lines) {
      if (FORMAT_PATTERNS.bullet_points.test(line)) {
        bulletPointsFound++;
      }
    }
    
    if (bulletPointsFound >= 10) {
      score += 15;
    } else if (bulletPointsFound >= 5) {
      score += 10;
    } else if (bulletPointsFound >= 1) {
      score += 5;
    }
    
    // Check for contact information
    if (FORMAT_PATTERNS.contact_info.test(cvText)) {
      score += 10;
    }
    
    // Check for dates
    let datesFound = 0;
    for (const line of lines) {
      if (FORMAT_PATTERNS.dates.test(line)) {
        datesFound++;
      }
    }
    
    if (datesFound >= 3) {
      score += 15;
    } else if (datesFound >= 1) {
      score += 10;
    }
    
    // Check for quantified achievements
    let quantifiedAchievementsFound = 0;
    for (const line of lines) {
      if (FORMAT_PATTERNS.quantified_achievements.test(line)) {
        quantifiedAchievementsFound++;
      }
    }
    
    if (quantifiedAchievementsFound >= 5) {
      score += 15;
    } else if (quantifiedAchievementsFound >= 3) {
      score += 10;
    } else if (quantifiedAchievementsFound >= 1) {
      score += 5;
    }
    
    // Check for strong action verbs
    let actionVerbsFound = 0;
    for (const line of lines) {
      if (FORMAT_PATTERNS.action_verbs.test(line)) {
        actionVerbsFound++;
      }
    }
    
    if (actionVerbsFound >= 8) {
      score += 15;
    } else if (actionVerbsFound >= 5) {
      score += 10;
    } else if (actionVerbsFound >= 2) {
      score += 5;
    }
    
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
      feedback.push('Your CV is too short. Aim for 300-700 words to provide enough detail while remaining concise.');
    } else if (wordCount > 800) {
      feedback.push('Your CV is quite lengthy. Consider condensing to 2 pages maximum to maintain recruiter interest.');
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
    let bulletPointsFound = 0;
    for (const line of lines) {
      if (FORMAT_PATTERNS.bullet_points.test(line)) {
        bulletPointsFound++;
      }
    }
    
    if (bulletPointsFound < 5) {
      feedback.push('Use more bullet points to highlight your experiences and achievements.');
    }
    
    // Contact information feedback
    if (!FORMAT_PATTERNS.contact_info.test(cvText)) {
      feedback.push('Include complete contact information at the top of your CV.');
    }
    
    // Dates feedback
    let datesFound = 0;
    for (const line of lines) {
      if (FORMAT_PATTERNS.dates.test(line)) {
        datesFound++;
      }
    }
    
    if (datesFound < 2) {
      feedback.push('Include clear dates for your work experience and education sections.');
    }
    
    // Quantified achievements feedback
    let quantifiedAchievementsFound = 0;
    for (const line of lines) {
      if (FORMAT_PATTERNS.quantified_achievements.test(line)) {
        quantifiedAchievementsFound++;
      }
    }
    
    if (quantifiedAchievementsFound < 3) {
      feedback.push('Add more quantified achievements using numbers and percentages to demonstrate your impact.');
    }
    
    // Action verbs feedback
    let actionVerbsFound = 0;
    for (const line of lines) {
      if (FORMAT_PATTERNS.action_verbs.test(line)) {
        actionVerbsFound++;
      }
    }
    
    if (actionVerbsFound < 5) {
      feedback.push('Use more strong action verbs at the beginning of bullet points to describe your experiences.');
    }
    
    return feedback;
  }
  
  /**
   * Evaluate South African context relevance
   */
  private evaluateSAContext(cvText: string): { saScore: number, saElementsDetected: string[] } {
    let score = 0;
    const saElementsDetected: string[] = [];
    
    // Check for B-BBEE status
    if (SA_PATTERNS.b_bbee.test(cvText)) {
      score += 20;
      saElementsDetected.push('B-BBEE Status');
    }
    
    // Check for NQF levels
    if (SA_PATTERNS.nqf.test(cvText)) {
      score += 20;
      saElementsDetected.push('NQF Level');
    }
    
    // Check for South African cities
    if (SA_PATTERNS.sa_cities.test(cvText)) {
      score += 10;
      saElementsDetected.push('SA Location');
    }
    
    // Check for South African provinces
    if (SA_PATTERNS.sa_provinces.test(cvText)) {
      score += 10;
      saElementsDetected.push('SA Province');
    }
    
    // Check for South African currencies
    if (SA_PATTERNS.sa_currencies.test(cvText)) {
      score += 10;
      saElementsDetected.push('SA Currency (Rand/ZAR)');
    }
    
    // Check for South African languages
    if (SA_PATTERNS.sa_languages.test(cvText)) {
      score += 15;
      saElementsDetected.push('SA Languages');
    }
    
    // Check for South African universities
    if (SA_PATTERNS.sa_universities.test(cvText)) {
      score += 15;
      saElementsDetected.push('SA Education');
    }
    
    // Check for South African companies
    if (SA_PATTERNS.sa_companies.test(cvText)) {
      score += 10;
      saElementsDetected.push('SA Companies');
    }
    
    // Check for South African regulations
    if (SA_PATTERNS.sa_regulations.test(cvText)) {
      score += 15;
      saElementsDetected.push('SA Regulations');
    }
    
    // Normalize score to 100
    const normalizedScore = Math.min(100, score);
    
    return { saScore: normalizedScore, saElementsDetected };
  }
  
  /**
   * Generate strengths based on analysis
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
    
    // Format strengths
    if (formatScore >= 80) {
      strengths.push('Your CV has an excellent structure that makes it easy for ATS systems to parse.');
    } else if (formatScore >= 70) {
      strengths.push('Your CV has a good overall format with clear sections.');
    }
    
    if (sectionsDetected.includes('summary')) {
      strengths.push('Your professional summary provides a strong overview of your background and aspirations.');
    }
    
    if (sectionsDetected.length >= 6) {
      strengths.push('Your CV includes comprehensive sections that provide a well-rounded view of your qualifications.');
    }
    
    // Skills strengths
    if (skillScore >= 80) {
      strengths.push('You have a diverse set of relevant skills that align well with job requirements.');
    } else if (skillScore >= 60) {
      strengths.push('You have included several in-demand skills that employers are looking for.');
    }
    
    if (skillsIdentified.length >= 8) {
      strengths.push('The range of technical and soft skills demonstrated in your CV is impressive.');
    }
    
    // South African context strengths
    if (saScore >= 80) {
      strengths.push('Your CV is exceptionally well-tailored for the South African job market.');
    } else if (saScore >= 60) {
      strengths.push('Your CV includes important South African context that will benefit local applications.');
    }
    
    if (saElementsDetected.includes('B-BBEE Status')) {
      strengths.push('Including your B-BBEE status is valuable for South African employers focused on transformation.');
    }
    
    if (saElementsDetected.includes('NQF Level')) {
      strengths.push('Specifying NQF levels for your qualifications helps employers understand South African equivalencies.');
    }
    
    if (saElementsDetected.includes('SA Languages')) {
      strengths.push('Your multilingual capabilities are an asset in South Africa\'s diverse workplace environment.');
    }
    
    if (saElementsDetected.includes('SA Regulations')) {
      strengths.push('Your knowledge of South African regulations demonstrates valuable local industry understanding.');
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
   * Generate improvement suggestions based on analysis
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
    
    // Format improvements
    if (formatScore < 60) {
      improvements.push('Improve your CV format with clear section headers and consistent formatting.');
    }
    
    if (!sectionsDetected.includes('summary')) {
      improvements.push('Add a professional summary at the top to quickly highlight your value proposition.');
    }
    
    if (!sectionsDetected.includes('skills')) {
      improvements.push('Include a dedicated skills section to highlight your technical and soft skills.');
    }
    
    // Skills improvements
    if (skillScore < 60) {
      improvements.push('Add more industry-relevant keywords to help your CV pass ATS screening.');
    }
    
    if (skillsIdentified.length < 5) {
      improvements.push('Expand the range of skills listed in your CV to demonstrate versatility.');
    }
    
    // South African context improvements
    if (saScore < 40) {
      improvements.push('Add more South African specific elements to make your CV more relevant for local employers.');
    }
    
    if (!saElementsDetected.includes('B-BBEE Status')) {
      improvements.push('Include your B-BBEE status to increase opportunities with transformation-focused companies.');
    }
    
    if (!saElementsDetected.includes('NQF Level')) {
      improvements.push('Specify NQF levels for your qualifications to align with South African standards.');
    }
    
    if (!saElementsDetected.includes('SA Languages')) {
      improvements.push('Highlight South African language proficiencies which are valued in the local job market.');
    }
    
    if (sectionsDetected.includes('education') && !saElementsDetected.includes('SA Education')) {
      improvements.push('If applicable, ensure your educational institutions are clearly identified as South African.');
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