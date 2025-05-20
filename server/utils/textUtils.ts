/**
 * Text Utility Functions
 * 
 * Common text processing utilities used throughout the application
 */

/**
 * Sanitize HTML content to extract plain text
 * 
 * @param html HTML string to sanitize
 * @returns Plain text version of the HTML content
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  return html
    // Remove style tags and their content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove script tags and their content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove head tags and their content
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Replace multiple spaces with a single space
    .replace(/\s+/g, ' ')
    // Replace HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Trim the result
    .trim();
}

/**
 * Extract keywords from text based on frequency and common South African context
 * 
 * @param text Text to extract keywords from
 * @returns Array of keywords found in the text
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // South African specific terms to look for (B-BBEE, NQF levels, locations, etc.)
  const saKeywords = [
    'b-bbee', 'bbbee', 'nqf', 'johannesburg', 'pretoria', 'cape town', 'durban', 
    'bloemfontein', 'port elizabeth', 'gqeberha', 'east london', 'polokwane', 
    'nelspruit', 'mbombela', 'kimberley', 'gauteng', 'western cape', 'eastern cape',
    'kwazulu-natal', 'kwazulu natal', 'free state', 'north west', 'limpopo', 'mpumalanga',
    'northern cape', 'popia', 'fica', 'seta', 'saqa', 'zulu', 'xhosa', 'afrikaans',
    'sotho', 'tswana', 'ndebele', 'swati', 'venda', 'tsonga'
  ];
  
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Find all SA keywords in the text
  const foundKeywords: string[] = [];
  
  for (const keyword of saKeywords) {
    if (lowerText.includes(keyword)) {
      // Extract the actual term as it appears in the text (with correct capitalization)
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      const match = text.match(regex);
      if (match) {
        foundKeywords.push(match[0]);
      }
    }
  }
  
  return foundKeywords;
}

/**
 * Count occurrences of a term in text (case-insensitive)
 * 
 * @param text Text to search in
 * @param term Term to search for
 * @returns Number of occurrences
 */
export function countOccurrences(text: string, term: string): number {
  if (!text || !term) return 0;
  
  const regex = new RegExp(`\\b${term}\\b`, 'gi');
  const matches = text.match(regex);
  
  return matches ? matches.length : 0;
}

/**
 * Check if a CV mentions specific South African elements
 * 
 * @param cvText CV text content
 * @returns Object with counts of different SA-specific elements
 */
export function checkSouthAfricanContext(cvText: string): {
  bbbeeCount: number;
  nqfCount: number;
  locationsCount: number;
  languagesCount: number;
  regulationsCount: number;
} {
  if (!cvText) {
    return {
      bbbeeCount: 0,
      nqfCount: 0,
      locationsCount: 0,
      languagesCount: 0,
      regulationsCount: 0
    };
  }
  
  // Check for B-BBEE mentions
  const bbbeeRegex = /\b(b-bbee|bbbee|broad.based.black.economic.empowerment|level \d)\b/gi;
  const bbbeeMatches = cvText.match(bbbeeRegex);
  const bbbeeCount = bbbeeMatches ? bbbeeMatches.length : 0;
  
  // Check for NQF level mentions
  const nqfRegex = /\b(nqf|national qualifications framework) level \d+\b/gi;
  const nqfMatches = cvText.match(nqfRegex);
  const nqfCount = nqfMatches ? nqfMatches.length : 0;
  
  // Check for South African locations
  const locations = [
    'johannesburg', 'pretoria', 'cape town', 'durban', 'bloemfontein', 'port elizabeth',
    'gqeberha', 'east london', 'polokwane', 'nelspruit', 'mbombela', 'kimberley',
    'gauteng', 'western cape', 'eastern cape', 'kwazulu-natal', 'kwazulu natal',
    'free state', 'north west', 'limpopo', 'mpumalanga', 'northern cape'
  ];
  
  let locationsCount = 0;
  for (const location of locations) {
    locationsCount += countOccurrences(cvText.toLowerCase(), location);
  }
  
  // Check for South African languages
  const languages = ['zulu', 'xhosa', 'afrikaans', 'sotho', 'tswana', 'ndebele', 'swati', 'venda', 'tsonga'];
  
  let languagesCount = 0;
  for (const language of languages) {
    languagesCount += countOccurrences(cvText.toLowerCase(), language);
  }
  
  // Check for South African regulations and compliance frameworks
  const regulations = ['popia', 'fica', 'seta', 'saqa', 'bcea', 'lra', 'employment equity'];
  
  let regulationsCount = 0;
  for (const regulation of regulations) {
    regulationsCount += countOccurrences(cvText.toLowerCase(), regulation);
  }
  
  return {
    bbbeeCount,
    nqfCount,
    locationsCount,
    languagesCount,
    regulationsCount
  };
}

export default {
  sanitizeHtml,
  extractKeywords,
  countOccurrences,
  checkSouthAfricanContext
};