import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import mammoth from 'mammoth';

const readFileAsync = promisify(fs.readFile);

/**
 * AI Service for ATSBoost
 * Handles CV text extraction and analysis
 */
class AIService {
  /**
   * Extract text content from CV file
   */
  async extractTextFromCV(filePath: string): Promise<string> {
    try {
      const fileExtension = path.extname(filePath).toLowerCase();
      
      if (fileExtension === '.pdf') {
        return this.extractFromPdf(filePath);
      } else if (fileExtension === '.docx') {
        return this.extractFromDocx(filePath);
      } else if (fileExtension === '.doc') {
        // For .doc files, we'll need conversion or a different library
        return this.extractFromDoc(filePath);
      } else {
        throw new Error(`Unsupported file type: ${fileExtension}`);
      }
    } catch (error) {
      console.error('Error extracting text from CV:', error);
      throw new Error('Failed to extract text from CV');
    }
  }

  /**
   * Extract text from PDF file
   */
  private async extractFromPdf(filePath: string): Promise<string> {
    try {
      // Import PDF text extraction service dynamically to avoid startup issues
      const { extractTextFromPDF } = await import('./simplePdfParser');
      return await extractTextFromPDF(filePath);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return 'PDF text extraction failed. Please check the file format.';
    }
  }

  /**
   * Extract text from DOCX file
   */
  private async extractFromDocx(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      console.error('Error extracting text from DOCX:', error);
      throw error;
    }
  }

  /**
   * Extract text from DOC file
   * This is more challenging as it requires external tools or conversion
   */
  private async extractFromDoc(filePath: string): Promise<string> {
    // For now, we'll use a simple approach with a warning
    // In a production environment, you might want to use LibreOffice
    // or another tool to convert DOC to DOCX first
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      console.error('Error extracting text from DOC:', error);
      // Fallback to a default message
      return 'Could not extract content. Please convert your DOC file to DOCX or PDF and try again.';
    }
  }

  /**
   * Analyze CV text content to generate ATS score and recommendations
   */
  async analyzeCVText(text: string): Promise<{
    score: number;
    breakdown: {
      format: number;
      skills: number;
      context: number;
    };
    recommendations: { category: string; suggestion: string }[];
  }> {
    // For demo purposes, we're using simplified analysis
    // In production, this would call your AI model (OpenAI, xAI, etc.)
    
    // Simple keyword-based analysis
    const formatScore = this.calculateFormatScore(text);
    const skillsScore = this.calculateSkillsScore(text);
    const contextScore = this.calculateContextScore(text);
    
    // Calculate overall score (weighted average)
    const score = Math.round(
      (formatScore * 0.4) + (skillsScore * 0.4) + (contextScore * 0.2)
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      formatScore, skillsScore, contextScore, text
    );
    
    return {
      score,
      breakdown: {
        format: formatScore,
        skills: skillsScore,
        context: contextScore
      },
      recommendations
    };
  }

  /**
   * Calculate format score
   */
  private calculateFormatScore(text: string): number {
    // Basic format scoring logic
    let score = 50; // Start with a base score
    
    // Check for clear section headers
    const hasHeaders = /education|experience|skills|objective|summary/i.test(text);
    if (hasHeaders) score += 15;
    
    // Check for bullet points
    const hasBullets = /•|\*|-|→|✓/.test(text);
    if (hasBullets) score += 10;
    
    // Check for consistent date formats
    const hasConsistentDates = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(\s+\d{4}|\s+\d{2})\b/i.test(text) || 
                               /\b\d{2}\/\d{2}\/\d{4}\b/.test(text) ||
                               /\b\d{4}\s*-\s*\d{4}\b|\b\d{4}\s*-\s*Present\b/i.test(text);
    if (hasConsistentDates) score += 10;
    
    // Check for good spacing (crude approximation)
    const lines = text.split('\n');
    const hasGoodSpacing = lines.some(line => line.trim() === '');
    if (hasGoodSpacing) score += 15;
    
    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Calculate skills score
   */
  private calculateSkillsScore(text: string): number {
    let score = 40; // Start with base score
    
    // Technical skills check
    const technicalSkills = [
      'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue', 
      'node', 'express', 'django', 'flask', 'spring', 'html', 'css', 'sql',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'devops',
      'excel', 'word', 'powerpoint', 'data analysis', 'project management',
      'sales', 'marketing', 'customer service', 'accounting', 'finance'
    ];
    
    const technicalMatches = technicalSkills.filter(skill => 
      new RegExp(`\\b${skill}\\b`, 'i').test(text)
    );
    
    score += Math.min(technicalMatches.length * 5, 25);
    
    // Soft skills check
    const softSkills = [
      'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking',
      'time management', 'adaptability', 'creativity', 'collaboration', 'attention to detail',
      'organization', 'interpersonal', 'analytical', 'negotiation', 'presentation',
      'conflict resolution', 'decision making', 'strategy', 'innovation'
    ];
    
    const softMatches = softSkills.filter(skill => 
      new RegExp(`\\b${skill}\\b`, 'i').test(text)
    );
    
    score += Math.min(softMatches.length * 3, 20);
    
    // Qualifications check
    const hasQualifications = /degree|diploma|bachelor|master|phd|certification|certified|license|nqf level/i.test(text);
    if (hasQualifications) score += 15;
    
    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Calculate South African context score
   */
  private calculateContextScore(text: string): number {
    let score = 30; // Start with base score
    
    // Check for B-BBEE information
    const hasBBBEE = /b-bbee|bbbee|broad.based black economic empowerment|black economic empowerment|bee score|bee level|bee certificate/i.test(text);
    if (hasBBBEE) score += 30;
    
    // Check for NQF levels
    const hasNQF = /nqf\s+level|nqf\s+\d|saqa|south african qualifications authority/i.test(text);
    if (hasNQF) score += 20;
    
    // Check for South African locations
    const saLocations = [
      'johannesburg', 'cape town', 'durban', 'pretoria', 'bloemfontein', 'port elizabeth', 'gqeberha',
      'east london', 'kimberley', 'polokwane', 'nelspruit', 'mbombela', 'pietermaritzburg', 'stellenbosch',
      'gauteng', 'western cape', 'kwazulu-natal', 'kzn', 'eastern cape', 'free state', 'limpopo',
      'mpumalanga', 'north west', 'northern cape'
    ];
    
    const locationMatches = saLocations.filter(location => 
      new RegExp(`\\b${location}\\b`, 'i').test(text)
    );
    
    if (locationMatches.length > 0) score += 15;
    
    // Check for South African languages
    const saLanguages = [
      'afrikaans', 'zulu', 'isizulu', 'xhosa', 'isixhosa', 'setswana', 'tswana', 'sesotho', 'sotho',
      'sepedi', 'ndebele', 'swati', 'siswati', 'venda', 'tshivenda', 'tsonga', 'xitsonga'
    ];
    
    const languageMatches = saLanguages.filter(language => 
      new RegExp(`\\b${language}\\b`, 'i').test(text)
    );
    
    if (languageMatches.length > 0) score += 5;
    
    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Generate personalized recommendations based on scores
   */
  private generateRecommendations(
    formatScore: number, 
    skillsScore: number, 
    contextScore: number, 
    text: string
  ): { category: string; suggestion: string }[] {
    const recommendations: { category: string; suggestion: string }[] = [];
    
    // Format recommendations
    if (formatScore < 70) {
      if (!(/education|experience|skills|objective|summary/i.test(text))) {
        recommendations.push({ 
          category: 'Format', 
          suggestion: 'Add clear section headers (e.g., Experience, Education, Skills) to organize your CV.' 
        });
      }
      
      if (!(/•|\*|-|→|✓/.test(text))) {
        recommendations.push({ 
          category: 'Format', 
          suggestion: 'Use bullet points to highlight achievements and responsibilities for better readability.' 
        });
      }
      
      if (recommendations.length < 2) {
        recommendations.push({ 
          category: 'Format', 
          suggestion: 'Ensure consistent spacing and alignment throughout your CV.' 
        });
      }
    }
    
    // Skills recommendations
    if (skillsScore < 70) {
      recommendations.push({ 
        category: 'Skills', 
        suggestion: 'Quantify your achievements with specific metrics and numbers.' 
      });
      
      recommendations.push({ 
        category: 'Skills', 
        suggestion: 'Include a dedicated Skills section that highlights both technical and soft skills.' 
      });
    }
    
    // South African context recommendations
    if (contextScore < 70) {
      if (!(/b-bbee|bbbee|broad.based black economic empowerment/i.test(text))) {
        recommendations.push({ 
          category: 'South African Context', 
          suggestion: 'Add your B-BBEE status if applicable to improve eligibility for certain positions.' 
        });
      }
      
      if (!(/nqf\s+level|nqf\s+\d|saqa/i.test(text))) {
        recommendations.push({ 
          category: 'South African Context', 
          suggestion: 'Include NQF levels for your qualifications to align with South African standards.' 
        });
      }
    }
    
    // General recommendations
    if (recommendations.length < 3) {
      recommendations.push({ 
        category: 'General', 
        suggestion: 'Tailor your CV keywords to match the specific job descriptions you\'re applying for.' 
      });
    }
    
    if (recommendations.length < 3) {
      recommendations.push({ 
        category: 'General', 
        suggestion: 'Keep your CV concise and limit it to 2-3 pages maximum.' 
      });
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const aiService = new AIService();