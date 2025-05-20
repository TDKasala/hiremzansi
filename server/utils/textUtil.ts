/**
 * Text Utility Functions
 * 
 * Provides utility functions for text processing, especially for CV content
 */

/**
 * Sanitize HTML content to extract plain text
 * 
 * @param html HTML content to sanitize
 * @returns Plain text extracted from HTML
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML tag removal - for more complex needs, consider using a dedicated library
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags and content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags and content
    .replace(/<[^>]+>/g, ' ') // Replace any remaining tags with spaces
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
  
  // Remove extra spaces and normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Break into proper paragraphs for better readability
  return text;
}

/**
 * Extract keywords from text
 * 
 * @param text Text to extract keywords from
 * @returns Array of extracted keywords
 */
export function extractKeywords(text: string): string[] {
  // Simple keyword extraction based on word frequency
  // This is a basic implementation - consider using NLP libraries for production
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const stopWords = new Set([
    'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 
    'but', 'his', 'her', 'she', 'from', 'they', 'will', 'would', 'there',
    'their', 'what', 'about', 'which', 'when', 'make', 'can', 'like', 
    'time', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
    'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'only',
    'come', 'its', 'over', 'also', 'back', 'after', 'use', 'two', 'how',
    'our', 'work', 'well', 'way', 'even', 'new', 'want', 'because', 'any',
    'these', 'day', 'most', 'all', 'was', 'were', 'been', 'has', 'had', 'did'
  ]);
  
  // Filter out stop words and count occurrences
  const wordCount: Record<string, number> = {};
  for (const word of words) {
    if (!stopWords.has(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  }
  
  // Convert to array of [word, count] pairs and sort by count (descending)
  const sortedWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20) // Take top 20 keywords
    .map(([word]) => word);
  
  return sortedWords;
}

/**
 * Find South African context-specific keywords in text
 * 
 * @param text Text to search for SA-specific keywords
 * @returns Object with categorized SA context keywords
 */
export function findSouthAfricanContext(text: string): {
  bbbee: string[],
  nqf: string[],
  locations: string[],
  regulations: string[],
  languages: string[]
} {
  const normalizedText = text.toLowerCase();
  
  // B-BBEE related terms
  const bbbeeTerms = [
    'b-bbee', 'bbbee', 'bee', 'broad-based black economic empowerment',
    'level 1', 'level 2', 'level 3', 'level 4', 'level 5', 
    'level 6', 'level 7', 'level 8', 'level one', 'level two',
    'level three', 'level four', 'level five', 'level six',
    'level seven', 'level eight'
  ];
  
  // NQF levels and qualifications
  const nqfTerms = [
    'nqf', 'national qualifications framework', 
    'nqf level 1', 'nqf level 2', 'nqf level 3', 'nqf level 4',
    'nqf level 5', 'nqf level 6', 'nqf level 7', 'nqf level 8',
    'nqf level 9', 'nqf level 10', 'saqa'
  ];
  
  // South African cities and provinces
  const locationTerms = [
    'johannesburg', 'cape town', 'durban', 'pretoria', 'bloemfontein',
    'port elizabeth', 'gqeberha', 'east london', 'pietermaritzburg', 'nelspruit',
    'kimberley', 'polokwane', 'mbombela', 'rustenburg', 'george',
    'gauteng', 'western cape', 'eastern cape', 'kwazulu-natal', 'kzn',
    'free state', 'north west', 'northern cape', 'limpopo', 'mpumalanga'
  ];
  
  // South African regulations and legislation
  const regulationTerms = [
    'popia', 'fica', 'protection of personal information act',
    'employment equity', 'ee', 'skills development', 'sda',
    'national credit act', 'consumer protection act', 'basic conditions of employment',
    'bcea', 'occupational health and safety', 'ohsa', 'coida',
    'labour relations act', 'lra', 'financial intelligence centre act'
  ];
  
  // South African languages
  const languageTerms = [
    'afrikaans', 'zulu', 'isizulu', 'xhosa', 'isixhosa',
    'setswana', 'tswana', 'sepedi', 'pedi', 'sesotho', 'sotho',
    'venda', 'tshivenda', 'tsonga', 'xitsonga', 'ndebele', 'isindebele',
    'swati', 'siswati', 'english'
  ];
  
  // Function to find matches in text
  const findMatches = (terms: string[]): string[] => {
    return terms.filter(term => normalizedText.includes(term.toLowerCase()));
  };
  
  return {
    bbbee: findMatches(bbbeeTerms),
    nqf: findMatches(nqfTerms),
    locations: findMatches(locationTerms),
    regulations: findMatches(regulationTerms),
    languages: findMatches(languageTerms)
  };
}

export default {
  sanitizeHtml,
  extractKeywords,
  findSouthAfricanContext
};