import { AnalysisReport } from "@shared/schema";
import { analyzeCV as openAIAnalyzeCV, createDeepAnalysis } from "./openaiService";

// Flag to control whether to use OpenAI or the rule-based system
const USE_OPENAI = true;

// Keyword categories for South African job market
const skillsKeywords = [
  "management", "leadership", "communication", "project management", "teamwork",
  "problem solving", "customer service", "sales", "marketing", "research",
  "analysis", "reporting", "presentation", "microsoft office", "excel",
  "powerpoint", "word", "outlook", "database", "crm", "erp", "sap",
  "programming", "coding", "software development", "web development",
  "java", "python", "javascript", "html", "css", "react", "angular", "vue",
  "nodejs", "php", "sql", "nosql", "mongodb", "mysql", "postgresql",
  "accounting", "finance", "budgeting", "forecasting", "audit", "tax",
  "legal", "compliance", "regulatory", "governance", "risk management",
  "human resources", "recruitment", "training", "development", "performance management",
  "operations", "logistics", "supply chain", "procurement", "inventory management",
  "quality control", "quality assurance", "business analysis", "business development",
  "strategy", "planning", "execution", "implementation", "stakeholder management",
  // Additional South African focused skills
  "mobile money", "fintech", "telecommunications", "ecommerce", "retail banking",
  "mining", "agriculture", "tourism", "hospitality", "conservation", 
  "renewable energy", "sustainable development", "public sector", "government",
  "healthcare", "pharmaceuticals", "education", "teaching", "social services"
];

// South African context-specific keywords
const saContextKeywords = [
  // Regulatory frameworks and certifications
  "b-bbee", "bee", "broad-based black economic empowerment", 
  "nqf", "national qualifications framework",
  "saqa", "south african qualifications authority", 
  "seta", "sector education and training authority",
  "employment equity", "affirmative action", "skills development", 
  "diversity", "transformation", "popi", "popia", "protection of personal information",
  
  // Cities and provinces
  "johannesburg", "cape town", "durban", "pretoria", "bloemfontein", 
  "port elizabeth", "east london", "nelspruit", "polokwane", "kimberley",
  "rustenburg", "pietermaritzburg", "vereeniging", "soweto", "tembisa",
  "gauteng", "western cape", "kwazulu-natal", "eastern cape", "free state", 
  "mpumalanga", "limpopo", "north west", "northern cape", 
  
  // Languages
  "south africa", "bilingual", "multilingual", "afrikaans", "zulu", "isiZulu",
  "xhosa", "isiXhosa", "sotho", "sesotho", "tswana", "setswana", "venda", "tsonga", 
  "swati", "ndebele", "proficient in multiple languages",
  
  // Education and qualifications
  "bcom", "bsc", "ba", "llb", "ca(sa)", "saica", "saipa", "cima", "acca", 
  "ict", "matric", "senior certificate", "nsc", "national senior certificate",
  "diploma", "higher certificate", "higher diploma", "degree", "masters", "doctorate",
  "technical qualification", "trade test", "apprenticeship", "learnership",
  "honors", "honours", "cum laude", "distinction",
  
  // B-BBEE specific terms
  "black-owned", "black ownership", "level 1", "level 2", "level 3", "level 4",
  "contributor", "generic scorecard", "qse", "emc", "black-owned business",
  "previously disadvantaged", "economic inclusion", "black economic empowerment",
  
  // Industry bodies
  "sabs", "sans", "iso", "sacnasp", "ecsa", "hpcsa", "sacssp", "saica", "irba",
  "sahpra", "fica", "fsca", "sarb", "icasa", "nersa", "samrc", "teta",
  
  // NQF specific terms
  "nqf level", "level 1", "level 2", "level 3", "level 4", "level 5", 
  "level 6", "level 7", "level 8", "level 9", "level 10",
  
  // South African companies
  "eskom", "sasol", "mtn", "vodacom", "standard bank", "fnb", "absa", "nedbank", 
  "sanlam", "discovery", "multichoice", "shoprite", "checkers", "pick n pay", 
  "woolworths", "telkom", "transnet", "sabc", "sars", "denel", "sappi"
];

// Format issues that can impact ATS scanning
const formatIssues = [
  { regex: /<[^>]*>/g, issue: "HTML tags found in CV. These may disrupt ATS parsing." },
  { regex: /\[\w+\]/g, issue: "Square brackets found in CV. These may disrupt ATS parsing." },
  { regex: /\{[^}]*\}/g, issue: "Curly braces found in CV. These may disrupt ATS parsing." },
  { regex: /([^\s]*\d+[^\s]*){10,}/g, issue: "Too many numbers/codes in CV may confuse ATS systems." },
  { regex: /([A-Z][a-z]*\s){7,}/g, issue: "Long sentences without keywords may reduce ATS relevance." },
  { regex: /\/(\/[^\n]*)/g, issue: "Comments or unusual formatting may not be readable by ATS." },
  { regex: /(\.{2,})/g, issue: "Multiple periods or unusual punctuation may confuse ATS systems." },
  { regex: /\s{2,}/g, issue: "Multiple spaces can disrupt ATS parsing. Use consistent spacing." },
  { regex: /\t/g, issue: "Tab characters may cause issues with ATS parsing. Use standard spacing." },
  { regex: /[^\x00-\x7F]/g, issue: "Non-standard characters detected. These may cause issues with some ATS systems." }
];

// South African specific B-BBEE and NQF detection patterns
const bbeeRegex = /b-?bbee|bee|broad.?based black economic empowerment|level \d contributor/i;
const nqfRegex = /nqf\s*level\s*\d+|national qualifications framework level \d+/i;

// Regional job market keywords - for specific provincial suggestions
const provincialKeywords: Record<string, string[]> = {
  "gauteng": ["johannesburg", "pretoria", "midrand", "sandton", "centurion", "soweto", "financial services", "banking", "mining"],
  "western_cape": ["cape town", "stellenbosch", "paarl", "technology", "wine", "tourism", "it", "tech startup"],
  "kwazulu_natal": ["durban", "pietermaritzburg", "umhlanga", "manufacturing", "logistics", "shipping", "automotive"],
  "eastern_cape": ["port elizabeth", "east london", "gqeberha", "automotive", "manufacturing", "logistics"],
  "free_state": ["bloemfontein", "welkom", "agriculture", "mining", "manufacturing"],
  "mpumalanga": ["nelspruit", "witbank", "secunda", "mining", "agriculture", "forestry", "energy"],
  "limpopo": ["polokwane", "mining", "agriculture", "tourism", "public sector"],
  "north_west": ["rustenburg", "potchefstroom", "mining", "agriculture", "tourism"],
  "northern_cape": ["kimberley", "upington", "mining", "agriculture", "renewable energy", "solar power"]
};

/**
 * Analyzes CV content and generates a comprehensive ATS score with South African specific recommendations
 * 
 * @param content The full text content of the CV to analyze
 * @param jobDescription Optional job description to compare CV against
 * @returns A detailed analysis report with scores, strengths, improvements and issues
 */
export async function analyzeCV(content: string, jobDescription?: string): Promise<AnalysisReport> {
  // Use OpenAI for analysis if enabled
  if (USE_OPENAI) {
    try {
      return await openAIAnalyzeCV(content, jobDescription);
    } catch (error) {
      console.error("OpenAI analysis failed, falling back to rule-based system:", error);
      // Fall back to rule-based system if OpenAI fails
    }
  }
  
  // Rule-based analysis (original implementation)
  const normalizedContent = content.toLowerCase();
  const hasJobDescription = !!jobDescription;
  const normalizedJobDesc = hasJobDescription ? jobDescription.toLowerCase() : "";
  
  // Check skill keyword matches
  const skillMatches = skillsKeywords.filter(keyword => 
    normalizedContent.includes(keyword.toLowerCase())
  );
  
  // Check SA context keyword matches
  const saKeywordsFound = saContextKeywords.filter(keyword => 
    normalizedContent.includes(keyword.toLowerCase())
  );
  
  // Check format issues
  const foundFormatIssues = formatIssues.filter(({ regex }) => 
    regex.test(content)
  ).map(({ issue }) => issue);
  
  // Detect B-BBEE and NQF specific mentions
  const bbbeeDetected = bbeeRegex.test(normalizedContent);
  const nqfDetected = nqfRegex.test(normalizedContent);
  
  // Calculate provincial relevance - find which province has most keyword matches
  let topProvince = "";
  let topProvinceMatches = 0;
  
  for (const [province, keywords] of Object.entries(provincialKeywords)) {
    const matches = keywords.filter(keyword => 
      normalizedContent.includes(keyword.toLowerCase())
    ).length;
    
    if (matches > topProvinceMatches) {
      topProvinceMatches = matches;
      topProvince = province;
    }
  }
  
  // Extract job description keywords if available
  let jobDescKeywords: string[] = [];
  let jobDescMatches = 0;
  let jobMatchBonus = 0;
  
  if (hasJobDescription && normalizedJobDesc.length > 0) {
    // Extract important words from job description (excluding common words)
    const commonWords = ["and", "the", "a", "an", "is", "are", "in", "to", "for", "of", "with", "on"];
    jobDescKeywords = normalizedJobDesc
      .replace(/[^\w\s]/gi, '') // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(word => 
        word.length > 3 && // Only words longer than 3 chars
        !commonWords.includes(word) && // Exclude common words
        /^[a-z]+$/.test(word) // Only alphabetical words
      );
    
    // Count matches between CV and job description keywords
    jobDescMatches = jobDescKeywords.filter(keyword => 
      normalizedContent.includes(keyword)
    ).length;
    
    // Calculate job match bonus (max 15 points)
    jobMatchBonus = Math.min(15, Math.round((jobDescMatches / Math.max(5, jobDescKeywords.length * 0.3)) * 15));
  }
  
  // Calculate score components
  const skillScore = Math.min(40, Math.round((skillMatches.length / 15) * 40)); // Reduced from 50 to make room for job match
  const saContextScore = Math.min(25, Math.round((saKeywordsFound.length / 8) * 25)); // Reduced from 30
  const formatScore = Math.max(0, 20 - (foundFormatIssues.length * 4)); // Keep at 20
  
  // Apply South African context bonuses
  let contextBonus = 0;
  if (bbbeeDetected) contextBonus += 3;
  if (nqfDetected) contextBonus += 3;
  if (topProvinceMatches >= 3) contextBonus += 4;
  
  // Calculate total score with contextual bonus and job match bonus
  const totalScore = Math.min(100, skillScore + saContextScore + formatScore + contextBonus + jobMatchBonus);
  
  // Generate strengths based on the analysis
  const strengths: string[] = [];
  if (skillMatches.length > 8) {
    strengths.push("You've included key skills that match many South African job descriptions");
  } else if (skillMatches.length > 4) {
    strengths.push("You've included some relevant skills that employers look for");
  }
  
  if (saKeywordsFound.length > 5) {
    strengths.push("Your CV contains strong South African context that local employers value");
  } else if (saKeywordsFound.length > 2) {
    strengths.push("Your CV includes some South African specific terminology");
  }
  
  if (bbbeeDetected) {
    strengths.push("Including B-BBEE status helps with employment equity requirements");
  }
  
  if (nqfDetected) {
    strengths.push("NQF qualification level clearly indicated, which aids in skills verification");
  }
  
  if (foundFormatIssues.length === 0) {
    strengths.push("Your CV format is clean and ATS-friendly");
  }
  
  if (topProvinceMatches >= 3) {
    strengths.push(`Your CV is well-targeted for the ${topProvince.replace('_', ' ')} job market`);
  }
  
  if (normalizedContent.length > 1800) {
    strengths.push("Your CV has excellent content length with comprehensive details");
  } else if (normalizedContent.length > 1200) {
    strengths.push("Your CV has good content length with sufficient detail");
  }
  
  // Generate improvements based on gaps
  const improvements: string[] = [];
  
  if (skillMatches.length < 10) {
    improvements.push("Add more industry-specific keywords from South African job sites like CareerJunction or PNet");
  }
  
  if (!bbbeeDetected) {
    improvements.push("Consider adding your B-BBEE status if applicable (important for South African employers)");
  }
  
  if (!nqfDetected) {
    improvements.push("Add NQF levels to your qualifications to meet South African standards");
  }
  
  if (saKeywordsFound.length < 4) {
    improvements.push("Include more South African context like provinces, cities, and local terminology");
  }
  
  if (topProvinceMatches < 2 && saKeywordsFound.length > 0) {
    improvements.push("Consider targeting your CV to a specific South African province or region");
  }
  
  if (normalizedContent.length < 1000) {
    improvements.push("Your CV is too brief for South African employers. Add more relevant details");
  }
  
  // Add job description-specific improvements if available
  if (hasJobDescription) {
    if (jobDescMatches < jobDescKeywords.length * 0.3 && jobDescKeywords.length > 5) {
      improvements.push("Your CV doesn't match well with the job description. Consider tailoring it with more relevant keywords.");
    }
    
    if (jobMatchBonus < 8) {
      improvements.push("Enhance your CV by incorporating more phrases and terminology from the job description.");
    }
  }
  
  // Generate keyword recommendations
  const keywordRecommendations: string[][] = [];
  
  // If job description is available, prioritize keywords from it
  if (hasJobDescription && jobDescKeywords.length > 5) {
    // Extract missing keywords from job description
    const missingJobKeywords = jobDescKeywords
      .filter(keyword => !normalizedContent.includes(keyword))
      .slice(0, 6);
      
    if (missingJobKeywords.length > 0) {
      keywordRecommendations.push([
        "Add these keywords from the job description:",
        ...missingJobKeywords.map(keyword => `- ${keyword}`)
      ]);
    }
  }
  // Otherwise use general skill recommendations
  else if (skillMatches.length < 10) {
    // Recommend relevant skills not found in the CV
    const missingSkills = skillsKeywords
      .filter(skill => !normalizedContent.includes(skill.toLowerCase()))
      .slice(0, 5);
    
    if (missingSkills.length > 0) {
      keywordRecommendations.push([
        "Consider adding these skills (if relevant):",
        ...missingSkills.map(skill => `- ${skill}`)
      ]);
    }
  }
  
  if (saKeywordsFound.length < 4) {
    // Recommend SA-specific terms not found
    const missingSATerms = [
      "B-BBEE status level",
      "NQF qualification level",
      "South African city/province",
      "Local industry terminology",
      "Relevant local certifications"
    ];
    
    keywordRecommendations.push([
      "Add these South African specific elements:",
      ...missingSATerms.map(term => `- ${term}`)
    ]);
  }
  
  // Generate serious issues
  const issues: string[] = foundFormatIssues.slice(0, 3); // Limit to top 3 format issues
  
  if (skillMatches.length < 3) {
    issues.push("Very few relevant skills detected. Your CV needs significant keyword optimization for South African employers");
  }
  
  if (saKeywordsFound.length === 0) {
    issues.push("No South African context found. Add location, qualifications, and local terminology for better ATS performance");
  }
  
  if (normalizedContent.length < 600) {
    issues.push("CV is severely lacking in content. South African employers expect detailed CVs with comprehensive information");
  }
  
  return {
    score: totalScore,
    skillsScore: skillScore,
    contextScore: saContextScore,
    formatScore: formatScore,
    jobMatchScore: jobMatchBonus, // Include the job match bonus
    jobDescKeywords: hasJobDescription ? jobDescKeywords : [], // Include job desc keywords
    jobDescMatches: hasJobDescription ? jobDescMatches : 0, // Include matched keywords count
    strengths: strengths.length ? strengths : ["You've started creating your CV"],
    improvements: improvements.length ? improvements : ["Continue improving your CV with more relevant content"],
    issues,
    saKeywordsFound: saKeywordsFound,
    saContextScore: saContextScore,
    bbbeeDetected,
    nqfDetected,
    keywordRecommendations: keywordRecommendations.length > 0 ? keywordRecommendations : undefined
  };
}

/**
 * Performs a premium deep analysis of CV content with comprehensive recommendations
 * This is the paid (R30) deep analysis service
 * 
 * @param content The full text content of the CV to analyze
 * @param jobDescription Optional job description to compare CV against
 * @returns A detailed premium analysis report with comprehensive insights
 */
export async function performDeepAnalysis(content: string, jobDescription?: string): Promise<AnalysisReport> {
  // Always use OpenAI for premium deep analysis
  try {
    return await createDeepAnalysis(content, jobDescription);
  } catch (error) {
    console.error("Deep analysis with OpenAI failed:", error);
    // Fall back to the regular analyzeCV as a last resort
    return await analyzeCV(content, jobDescription);
  }
}
