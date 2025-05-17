/**
 * Local AI Service for CV Analysis
 * 
 * This service provides rule-based CV analysis optimized for South African job market,
 * eliminating the need for external API calls and enabling offline functionality.
 */

import { createHash } from 'crypto';

interface AnalysisResult {
  overall_score: number;
  rating: string;
  strengths: string[];
  improvements: string[];
  format_feedback: string[];
  skills_identified: string[];
  sa_score: number;
  sa_relevance: string;
}

// South African specific keywords
const SA_KEYWORDS = [
  "south africa", "sa", "cape town", "johannesburg", "pretoria", "durban", 
  "bloemfontein", "port elizabeth", "east london", "pietermaritzburg", "polokwane",
  "nelspruit", "kimberley", "rustenburg", "b-bbee", "bee", "bbbee", "nqf", "saqa", 
  "matric", "seta", "ieb", "unisa", "wits", "uct", "ukzn", "up", "uj", "ufs", "uwc",
  "tut", "cput", "vut", "cut", "dut", "nmmu", "spu", "sol plaatje", "rhodes", "ump",
  "zulu", "xhosa", "afrikaans", "sesotho", "setswana", "sepedi", "venda", "tsonga", 
  "swazi", "ndebele", "south african", "rsa", "republic of south africa"
];

// Common skills to detect
const COMMON_SKILLS = [
  "javascript", "python", "java", "c#", "c++", "react", "angular", "vue",
  "node.js", "express", "django", "flask", "spring", "asp.net", "php", "ruby",
  "html", "css", "sql", "nosql", "mongodb", "mysql", "postgresql", "oracle",
  "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "terraform",
  "typescript", "redux", "graphql", "rest api", "soap", "microservices", "agile",
  "scrum", "kanban", "jira", "confluence", "bitbucket", "github", "gitlab",
  "ci/cd", "testing", "tdd", "bdd", "junit", "jest", "mocha", "selenium",
  "cypress", "postman", "swagger", "oauth", "jwt", "authentication", "authorization",
  "data analysis", "data science", "machine learning", "deep learning", "nlp",
  "computer vision", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
  "r", "data visualization", "tableau", "power bi", "excel", "vba", "spss", "stata",
  "sas", "matlab", "scala", "hadoop", "spark", "kafka", "airflow", "etl", "elt",
  "data warehouse", "data lake", "big data", "analytics", "reporting", "dashboard",
  "bi", "business intelligence", "data modeling", "data mining", "data engineering",
  "cloud computing", "serverless", "devops", "sre", "security", "penetration testing",
  "vulnerability assessment", "ethical hacking", "cryptography", "encryption",
  "firewalls", "ips", "ids", "siem", "soc", "incident response", "disaster recovery",
  "business continuity", "risk management", "compliance", "gdpr", "popia", "pci-dss",
  "iso27001", "hipaa", "sox", "itil", "cobit", "togaf", "enterprise architecture",
  "solution architecture", "technical architecture", "systems design", "uml",
  "erp", "crm", "salesforce", "sap", "oracle", "microsoft dynamics", "workday",
  "product management", "project management", "program management", "portfolio management",
  "pmp", "prince2", "msp", "scrum master", "product owner", "business analysis",
  "requirements gathering", "user stories", "use cases", "user experience", "ui/ux",
  "wireframing", "prototyping", "figma", "sketch", "adobe xd", "invision", "zeplin",
  "mobile development", "ios", "android", "swift", "kotlin", "react native", "flutter",
  "xamarin", "cordova", "ionic", "progressive web apps", "responsive design", "accessibility",
  "wcag", "section 508", "localization", "internationalization", "seo", "sem", "smm",
  "content marketing", "email marketing", "affiliate marketing", "digital marketing",
  "analytics", "google analytics", "adobe analytics", "marketing automation", "hubspot",
  "mailchimp", "constant contact", "marketo", "pardot", "eloqua", "customer success",
  "saas", "paas", "iaas", "faas", "cloud native", "web3", "blockchain", "ethereum",
  "smart contracts", "solidity", "truffle", "web3.js", "metamask", "nft", "dao",
  "defi", "cryptocurrency", "bitcoin", "artificial intelligence", "chatgpt", "openai",
  "prompt engineering", "llm", "generative ai", "ai ethics", "responsible ai",
  "data privacy", "data governance", "data quality", "data stewardship", "data catalog",
  "data lineage", "data fabric", "data mesh", "data virtualization", "data integration",
  "api management", "api gateway", "api security", "websockets", "grpc", "message queue",
  "pub/sub", "event-driven architecture", "domain-driven design", "clean architecture",
  "solid principles", "design patterns", "refactoring", "continuous integration",
  "continuous delivery", "continuous deployment", "feature flags", "a/b testing",
  "canary releases", "blue-green deployments", "chaos engineering", "resilience engineering",
  "observability", "monitoring", "logging", "tracing", "metrics", "alerting", "notification",
  "on-call", "sla", "slo", "sli", "uptime", "availability", "reliability", "performance",
  "scalability", "load balancing", "caching", "cdn", "edge computing", "iot",
  "embedded systems", "firmware", "drivers", "rtos", "low-level programming", "assembly",
  "networking", "tcp/ip", "http", "https", "dns", "dhcp", "vpn", "ssh", "ftp", "smtp",
  "imap", "ldap", "active directory", "sso", "identity management", "federated identity",
  "oauth2", "openid connect", "saml", "kerberos", "radius", "2fa", "mfa", "biometrics",
  "facial recognition", "voice recognition", "fingerprint", "iris recognition", "gait analysis"
];

// South African professional bodies and certifications
const SA_CERTIFICATIONS = [
  "sacnasp", "ecsa", "saica", "saipa", "iacsa", "cisa", "acca", "cia", "cfa", 
  "fpi", "sabpp", "pmsa", "saiee", "cssa", "icsa", "pmi-sa", "isaca", "iitpsa", 
  "bla", "saia", "asaqs", "sacpcmp", "sacap", "saci", "ilasa", "saiw", "plato", 
  "hpcsa", "sanc", "sapc", "sama", "sacssp", "sabs", "nrcs", "sanas", "sans"
];

/**
 * Analyze CV text and return detailed analysis results
 * 
 * @param text The CV text content to analyze
 * @returns Analysis result with scores, ratings, and recommendations
 */
export function analyzeCVText(text: string): AnalysisResult {
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
  const hasActionVerbs = /\b(managed|developed|created|implemented|led|designed|improved|increased|reduced|achieved|launched|organized|coordinated|established|executed|generated|maintained|negotiated|operated|performed|planned|resolved|supervised|trained|transformed|won|delivered|enabled|guided)\b/i.test(content);
  const hasNumbers = /\b\d+%|\d+ percent|increased by \d+|decreased by \d+|reduced \d+|improved \d+|generated \d+|saved \d+|over \d+|more than \d+/i.test(content);
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
  const foundSaCertifications = SA_CERTIFICATIONS.filter(cert => content.includes(cert.toLowerCase()));
  
  const hasB_BBEE = /\b(b-bbee|bbbee|bee|broad.based black economic empowerment|level \d b-bbee|previously disadvantaged|employment equity|affirmative action)\b/i.test(content);
  const hasNQF = /\bnqf level \d+\b|national qualifications framework|saqa/i.test(content);
  const hasSaAddress = /\b(south africa|gauteng|western cape|eastern cape|northern cape|kwazulu-natal|kzn|free state|north west|limpopo|mpumalanga)\b/i.test(content);
  const hasSaLanguages = /\b(zulu|xhosa|afrikaans|sesotho|setswana|sepedi|venda|tsonga|swazi|ndebele)\b/i.test(content);
  
  const saContextScore = Math.round(
    ((foundSaKeywords.length > 0 ? Math.min(foundSaKeywords.length * 5, 30) : 0)) +
    ((foundSaCertifications.length > 0 ? Math.min(foundSaCertifications.length * 10, 20) : 0)) +
    (hasB_BBEE ? 20 : 0) +
    (hasNQF ? 15 : 0) + 
    (hasSaAddress ? 10 : 0) +
    (hasSaLanguages ? 5 : 0)
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
  const strengths: string[] = [];
  
  if (hasSections) strengths.push('Well-structured CV with clear sections');
  if (hasBulletPoints) strengths.push('Effective use of bullet points improves readability');
  if (hasActionVerbs) strengths.push('Uses strong action verbs to highlight achievements');
  if (hasNumbers) strengths.push('Quantifies achievements with specific numbers and percentages');
  if (hasKeySkills) strengths.push('Contains relevant skills that ATS systems look for');
  if (hasDateRanges) strengths.push('Clear timeline of work experience');
  if (hasB_BBEE) strengths.push('Includes B-BBEE status, important for South African employers');
  if (hasNQF) strengths.push('Specifies NQF levels for qualifications, aligning with SA standards');
  if (hasSaAddress) strengths.push('Includes South African location information');
  if (foundSaKeywords.length > 3) strengths.push('Well-optimized for South African job market');
  if (foundSaCertifications.length > 0) strengths.push('Includes relevant South African certifications/professional bodies');
  
  // Generate improvements
  const improvements: string[] = [];
  
  if (!hasSections) improvements.push('Add clear section headings (Education, Experience, Skills, etc.)');
  if (!hasBulletPoints) improvements.push('Use bullet points to highlight achievements and responsibilities');
  if (!hasActionVerbs) improvements.push('Include strong action verbs to describe achievements');
  if (!hasNumbers) improvements.push('Quantify achievements with specific numbers and percentages');
  if (!hasKeySkills) improvements.push('Add industry-relevant skills and keywords');
  if (!hasDateRanges) improvements.push('Include clear date ranges for education and work experience');
  if (!hasB_BBEE && saContextScore < 60) improvements.push('Consider adding B-BBEE status information if applicable');
  if (!hasNQF && saContextScore < 60) improvements.push('Add NQF levels to your qualifications');
  if (!hasSaAddress && saContextScore < 60) improvements.push('Include your location in South Africa');
  if (foundSaCertifications.length === 0 && saContextScore < 60) improvements.push('Add relevant South African certifications or professional body memberships');
  if (lines.some(line => line.length > 200)) improvements.push('Shorten long paragraphs for better readability');
  
  // Format feedback
  const formatFeedback: string[] = [];
  
  if (avgLineLength > 200) formatFeedback.push('Shorten your bullet points to 1-2 lines each');
  if (!hasContactInfo) formatFeedback.push('Add complete contact information (phone, email, LinkedIn)');
  if (content.length > 5000) formatFeedback.push('Consider shortening your CV to 2-3 pages maximum');
  if (content.length < 1500) formatFeedback.push('Your CV may be too short - add more relevant details');
  if (!hasDates) formatFeedback.push('Add dates to your work experience and education sections');
  
  // Return the analysis result
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
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Benchmark the performance of the local AI service
 * @returns Benchmark results
 */
export function benchmarkLocalAI(): { 
  executionTime: number, 
  memoryUsage: number 
} {
  const start = performance.now();
  const memBefore = process.memoryUsage().heapUsed;
  
  // Run 100 analyses with a randomized CV
  for (let i = 0; i < 100; i++) {
    const mockCV = generateMockCV();
    analyzeCVText(mockCV);
  }
  
  const end = performance.now();
  const memAfter = process.memoryUsage().heapUsed;
  
  return {
    executionTime: end - start,
    memoryUsage: memAfter - memBefore
  };
}

/**
 * Generate a mock CV for testing
 */
function generateMockCV(): string {
  const sections = [
    "PERSONAL DETAILS",
    "EDUCATION",
    "WORK EXPERIENCE",
    "SKILLS",
    "REFERENCES"
  ];
  
  const randomText = createHash('md5').update(Math.random().toString()).digest('hex');
  
  let cv = '';
  
  for (const section of sections) {
    cv += section + '\n\n';
    for (let i = 0; i < 5; i++) {
      cv += '• ' + randomText.slice(0, 30 + i * 5) + '\n';
    }
    cv += '\n';
  }
  
  return cv;
}