import { AnalysisReport } from "@shared/schema";

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
  "strategy", "planning", "execution", "implementation", "stakeholder management"
];

// South African context-specific keywords
const saContextKeywords = [
  "b-bbee", "bee", "broad-based black economic empowerment", "nqf", "national qualifications framework",
  "saqa", "south african qualifications authority", "seta", "sector education and training authority",
  "employment equity", "affirmative action", "skills development", "diversity", "transformation",
  "johannesburg", "cape town", "durban", "pretoria", "bloemfontein", "port elizabeth", "east london",
  "gauteng", "western cape", "kwazulu-natal", "eastern cape", "free state", "mpumalanga", "limpopo",
  "north west", "northern cape", "south africa", "bilingual", "multilingual", "afrikaans", "zulu",
  "xhosa", "sotho", "tswana", "venda", "tsonga", "swati", "ndebele", "popi", "popia", "protection of personal information",
  "bcom", "bsc", "ba", "llb", "ca(sa)", "saica", "saipa", "cima", "acca", "ict", "matric"
];

// Format issues that can impact ATS scanning
const formatIssues = [
  { regex: /<[^>]*>/g, issue: "HTML tags found in CV. These may disrupt ATS parsing." },
  { regex: /\[\w+\]/g, issue: "Square brackets found in CV. These may disrupt ATS parsing." },
  { regex: /\{[^}]*\}/g, issue: "Curly braces found in CV. These may disrupt ATS parsing." },
  { regex: /([^\s]*\d+[^\s]*){10,}/g, issue: "Too many numbers/codes in CV may confuse ATS systems." },
  { regex: /([A-Z][a-z]*\s){7,}/g, issue: "Long sentences without keywords may reduce ATS relevance." },
  { regex: /\/(\/[^\n]*)/g, issue: "Comments or unusual formatting may not be readable by ATS." },
  { regex: /(\.{2,})/g, issue: "Multiple periods or unusual punctuation may confuse ATS systems." }
];

// Analyze CV content and generate ATS score with recommendations
export function analyzeCV(content: string): AnalysisReport {
  const normalizedContent = content.toLowerCase();
  
  // Check skill keyword matches
  const skillMatches = skillsKeywords.filter(keyword => 
    normalizedContent.includes(keyword.toLowerCase())
  );
  
  // Check SA context keyword matches
  const contextMatches = saContextKeywords.filter(keyword => 
    normalizedContent.includes(keyword.toLowerCase())
  );
  
  // Check format issues
  const foundFormatIssues = formatIssues.filter(({ regex }) => 
    regex.test(content)
  ).map(({ issue }) => issue);
  
  // Calculate score based on matches and issues
  // Base score out of 100
  const skillScore = Math.min(50, Math.round((skillMatches.length / 15) * 50));
  const contextScore = Math.min(30, Math.round((contextMatches.length / 5) * 30));
  const formatScore = Math.max(0, 20 - (foundFormatIssues.length * 5));
  
  const totalScore = skillScore + contextScore + formatScore;
  
  // Generate strengths
  const strengths: string[] = [];
  if (skillMatches.length > 5) {
    strengths.push("You've included key skills that match many job descriptions");
  }
  if (contextMatches.length > 2) {
    strengths.push("Your CV contains South African specific terminology that employers look for");
  }
  if (foundFormatIssues.length === 0) {
    strengths.push("Your CV format is clean and ATS-friendly");
  }
  if (normalizedContent.length > 1500) {
    strengths.push("Your CV has good content length with sufficient detail");
  }
  
  // Generate improvements
  const improvements: string[] = [];
  if (skillMatches.length <= 10) {
    improvements.push("Add more industry-specific keywords found in CareerJunction job ads");
  }
  if (contextMatches.length <= 3) {
    improvements.push("Include South African qualifications (NQF levels) and B-BBEE status if applicable");
  }
  if (normalizedContent.length < 1000) {
    improvements.push("Your CV may be too brief. Consider adding more relevant experience and skills");
  }
  
  // Generate issues (serious problems)
  const issues: string[] = foundFormatIssues.slice(0, 3); // Limit to top 3 issues
  if (skillMatches.length < 3) {
    issues.push("Very few relevant skills detected. Your CV needs significant keyword optimization");
  }
  if (contextMatches.length === 0) {
    issues.push("No South African context found. Add location, qualifications, and local terminology");
  }
  
  return {
    score: totalScore,
    strengths: strengths.length ? strengths : ["You've started creating your CV"],
    improvements: improvements.length ? improvements : ["Continue improving your CV with more relevant content"],
    issues
  };
}
