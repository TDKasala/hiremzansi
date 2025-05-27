import { db } from "../db";
import { 
  cvs, 
  jobMatches, 
  saProfiles 
} from "@shared/schema";
import { eq, desc, and, sql, asc, gte, lte, inArray } from "drizzle-orm";

// South African specific skills and keywords
const SA_SPECIFIC_KEYWORDS = [
  // Legislation & Regulatory Keywords
  "B-BBEE", "BBBEE", "Black Economic Empowerment", 
  "Employment Equity", "EE", "Skills Development", 
  "SETA", "NQF", "SAQA", "King IV", "POPI", "POPIA",
  "FICA", "FAIS", "National Credit Act", "Consumer Protection Act",
  
  // Education & Qualification Keywords
  "Matric", "NSC", "National Senior Certificate",
  "UNISA", "Wits", "UCT", "UJ", "UP", "UKZN", "NWU", "UFS",
  
  // Government & Public Sector
  "Public Service", "Government", "Municipality",
  "PFMA", "Municipal Finance Management Act", "MFMA",
  
  // Industries & Sectors
  "Mining", "Agriculture", "Financial Services",
  "JSE", "Banking", "Retail", "Telecommunications",
  "Manufacturing", "Tourism", "Energy", "Resources",
  
  // Languages
  "Afrikaans", "isiZulu", "isiXhosa", "Sesotho", "Setswana",
  "Sepedi", "siSwati", "Tshivenda", "Xitsonga", "isiNdebele",
  
  // Provinces & Locations
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Free State", "Mpumalanga", "Limpopo", "North West", "Northern Cape",
  "Johannesburg", "Cape Town", "Durban", "Pretoria", "Bloemfontein",
  "East London", "Port Elizabeth", "Gqeberha", "Nelspruit", "Kimberley",
  "Polokwane", "Rustenburg", "Pietermaritzburg"
];

// Industry categories specific to South Africa
const SA_INDUSTRIES = [
  "Mining & Minerals",
  "Agriculture & Farming",
  "Financial Services",
  "Information Technology",
  "Retail & Consumer Goods",
  "Manufacturing",
  "Government & Public Sector",
  "Education & Training",
  "Healthcare & Medical",
  "Construction & Engineering",
  "Tourism & Hospitality",
  "Transport & Logistics",
  "Energy & Utilities",
  "Telecommunications",
  "Legal Services",
  "Media & Communications"
];

// Weight factors for scoring components
const WEIGHT_FACTORS = {
  // Standard scoring components
  SKILLS_MATCH: 0.30,
  EXPERIENCE_LEVEL_MATCH: 0.15,
  RECENCY: 0.10,
  INDUSTRY_MATCH: 0.15,
  
  // South African specific components
  LOCATION_MATCH: 0.10,
  SA_KEYWORDS_MATCH: 0.10,
  BBBEE_RELEVANCE: 0.05,
  NQF_MATCH: 0.05
};

// Interface for job recommendations
export interface JobMatchDetails {
  skillsMatch: number;
  skillsMatched: string[];
  industryMatch: number;
  locationMatch: number;
  saContextMatch: number;
  experienceMatch: number;
  bbbeeRelevance: number;
  nqfMatch: number;
}

export interface JobRecommendation {
  jobId: number;
  title: string;
  company: string;
  location: string | null;
  matchScore: number;
  matchDetails: JobMatchDetails;
  postedAt: Date;
  applicationDeadline?: Date | null;
  salary?: string | null;
  employmentType: string | null;
}

/**
 * Get personalized job recommendations for a user based on their CV and preferences
 * with specific consideration for South African context
 */
export async function getPersonalizedJobRecommendations(
  userId: number,
  cvId: number,
  options: {
    limit?: number;
    includeApplied?: boolean;
    provincePreference?: string;
    industryPreferences?: string[];
    experienceLevelPreference?: string;
  } = {}
): Promise<JobRecommendation[]> {
  // Default options
  const limit = options.limit || 10;
  const includeApplied = options.includeApplied || false;
  
  try {
    // Get user's CV
    const [cv] = await db
      .select()
      .from(cvs)
      .where(eq(cvs.id, cvId));
    
    if (!cv || cv.userId !== userId) {
      throw new Error("CV not found or doesn't belong to user");
    }
    
    // Get user's SA profile for preferences if available
    const [saProfile] = await db
      .select()
      .from(saProfiles)
      .where(eq(saProfiles.userId, userId));
    
    // Determine province preference (from options, profile, or none)
    const provincePreference = options.provincePreference || 
      (saProfile?.province ? saProfile.province : undefined);
      
    // Determine industry preferences (from options, profile, or none)
    const industryPreferences = options.industryPreferences || 
      (saProfile?.industries ? saProfile.industries : undefined);
    
    // Get all active job postings
    let jobsQuery = db.select({
      job: jobPostings,
      employer: employers
    })
    .from(jobPostings)
    .innerJoin(employers, eq(jobPostings.employerId, employers.id))
    .where(eq(jobPostings.isActive, true));
    
    // If user has already applied to jobs and we don't want to include those
    if (!includeApplied) {
      // Get IDs of jobs the user has already applied to
      const appliedJobs = await db
        .select({ jobId: jobMatches.jobId })
        .from(jobMatches)
        .where(eq(jobMatches.userId, userId));
      
      const appliedJobIds = appliedJobs.map(j => j.jobId);
      
      // Exclude applied jobs if there are any
      if (appliedJobIds.length > 0) {
        jobsQuery = jobsQuery.where(sql`${jobPostings.id} NOT IN (${appliedJobIds.join(',')})`);
      }
    }
    
    // Get job postings
    const jobResults = await jobsQuery;
    
    // No job postings found
    if (jobResults.length === 0) {
      return [];
    }
    
    // Calculate match scores for each job
    const scoredJobs = await Promise.all(
      jobResults.map(async ({ job, employer }) => {
        const matchDetails = await calculateJobMatchScore(cv, job, employer, {
          provincePreference,
          industryPreferences,
          experienceLevelPreference: options.experienceLevelPreference,
          saProfile
        });
        
        // Calculate overall score from components
        const overallScore = 
          (matchDetails.skillsMatch * WEIGHT_FACTORS.SKILLS_MATCH) +
          (matchDetails.industryMatch * WEIGHT_FACTORS.INDUSTRY_MATCH) +
          (matchDetails.locationMatch * WEIGHT_FACTORS.LOCATION_MATCH) +
          (matchDetails.saContextMatch * WEIGHT_FACTORS.SA_KEYWORDS_MATCH) +
          (matchDetails.experienceMatch * WEIGHT_FACTORS.EXPERIENCE_LEVEL_MATCH) +
          (matchDetails.bbbeeRelevance * WEIGHT_FACTORS.BBBEE_RELEVANCE) +
          (matchDetails.nqfMatch * WEIGHT_FACTORS.NQF_MATCH);
        
        return {
          jobId: job.id,
          title: job.title,
          company: employer.companyName,
          location: employer.location,
          matchScore: Math.round(overallScore * 100), // Convert to percentage
          matchDetails,
          postedAt: job.createdAt,
          applicationDeadline: job.deadline,
          salary: job.salaryRange,
          employmentType: job.employmentType
        };
      })
    );
    
    // Sort jobs by match score (descending)
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
    
    // Return top N recommendations
    return scoredJobs.slice(0, limit);
    
  } catch (error) {
    console.error("Error getting job recommendations:", error);
    throw error;
  }
}

/**
 * Calculate match score between a CV and job posting with South African context
 */
async function calculateJobMatchScore(
  cv: any,
  job: any,
  employer: any,
  options: {
    provincePreference?: string;
    industryPreferences?: string[];
    experienceLevelPreference?: string;
    saProfile?: any;
  }
): Promise<any> {
  const cvContent = cv.content.toLowerCase();
  const jobDescription = job.description.toLowerCase();
  const jobRequiredSkills = job.requiredSkills || [];
  
  // 1. Calculate skills match
  const matchedSkills = [];
  
  // If we have explicit required skills on the job posting
  if (jobRequiredSkills.length > 0) {
    for (const skill of jobRequiredSkills) {
      const skillLower = skill.toLowerCase();
      if (cvContent.includes(skillLower)) {
        matchedSkills.push(skill);
      }
    }
  } else {
    // Extract common skills from job description and check CV
    const commonSkills = await getCommonSkills();
    for (const skill of commonSkills) {
      const skillName = skill.name.toLowerCase();
      if (jobDescription.includes(skillName) && cvContent.includes(skillName)) {
        matchedSkills.push(skill.name);
      }
    }
  }
  
  // Calculate skills match percentage
  const skillsMatchPercentage = jobRequiredSkills.length > 0 
    ? matchedSkills.length / jobRequiredSkills.length 
    : matchedSkills.length > 0 ? 0.5 : 0; // Default score if no explicit skills
    
  // Make sure matchedSkills is string array
  const typedMatchedSkills: string[] = matchedSkills.map(skill => String(skill));
  
  // 2. Calculate industry match
  let industryMatchScore = 0;
  
  if (job.industry) {
    // Direct match with CV's target industry or user preferences
    if (cv.targetIndustry && cv.targetIndustry.toLowerCase() === job.industry.toLowerCase()) {
      industryMatchScore = 1.0;
    } else if (options.industryPreferences && options.industryPreferences.includes(job.industry)) {
      industryMatchScore = 0.9;
    } else if (cvContent.includes(job.industry.toLowerCase())) {
      industryMatchScore = 0.7;
    } else {
      // Partial industry match (check if parts of the industry name appear)
      const industryWords = job.industry.toLowerCase().split(/\\s+/);
      const matchingWords = industryWords.filter((word: string) => 
        word.length > 3 && cvContent.includes(word)
      );
      
      if (matchingWords.length > 0) {
        industryMatchScore = 0.5 * (matchingWords.length / industryWords.length);
      }
    }
  }
  
  // 3. Calculate location match (South African provinces)
  let locationMatchScore = 0;
  
  if (employer.location) {
    // Direct match with preference
    if (options.provincePreference && employer.location.includes(options.provincePreference)) {
      locationMatchScore = 1.0;
    } else if (options.saProfile?.city && employer.location.includes(options.saProfile.city)) {
      locationMatchScore = 0.9;
    } else if (cvContent.includes(employer.location.toLowerCase())) {
      locationMatchScore = 0.7;
    } else {
      // Check for major cities in the province
      const provinceCities = getProvinceCities(employer.location);
      const cityMatches = provinceCities.filter(city => 
        cvContent.includes(city.toLowerCase())
      );
      
      if (cityMatches.length > 0) {
        locationMatchScore = 0.5;
      }
    }
  }
  
  // 4. Calculate South African context match
  let saContextMatchScore = 0;
  let saKeywordsFound = [];
  
  // Check CV for South African specific keywords
  for (const keyword of SA_SPECIFIC_KEYWORDS) {
    if (cvContent.includes(keyword.toLowerCase())) {
      saKeywordsFound.push(keyword);
    }
  }
  
  // Calculate SA context score based on keywords found
  const saKeywordCount = saKeywordsFound.length;
  if (saKeywordCount > 10) {
    saContextMatchScore = 1.0;
  } else if (saKeywordCount > 5) {
    saContextMatchScore = 0.8;
  } else if (saKeywordCount > 2) {
    saContextMatchScore = 0.5;
  } else if (saKeywordCount > 0) {
    saContextMatchScore = 0.3;
  }
  
  // 5. Calculate experience level match
  let experienceMatchScore = 0;
  
  if (job.experienceLevel && cv.targetPosition) {
    // Simple keyword matching for experience levels
    const expLevels = {
      "entry level": ["entry", "junior", "graduate", "intern", "trainee"],
      "mid level": ["mid", "intermediate", "experienced"],
      "senior level": ["senior", "manager", "head", "lead", "expert", "principal"]
    };
    
    // Find the job's experience level category
    let jobExpCategory = null;
    for (const [category, keywords] of Object.entries(expLevels)) {
      if (keywords.some(k => job.experienceLevel.toLowerCase().includes(k))) {
        jobExpCategory = category;
        break;
      }
    }
    
    // Find the CV's implied experience level
    let cvExpCategory = null;
    for (const [category, keywords] of Object.entries(expLevels)) {
      if (keywords.some(k => cv.targetPosition.toLowerCase().includes(k))) {
        cvExpCategory = category;
        break;
      }
    }
    
    // Calculate match score
    if (jobExpCategory && cvExpCategory) {
      if (jobExpCategory === cvExpCategory) {
        experienceMatchScore = 1.0;
      } else {
        // Partial match for adjacent experience levels
        const categories = ["entry level", "mid level", "senior level"];
        const jobIdx = categories.indexOf(jobExpCategory);
        const cvIdx = categories.indexOf(cvExpCategory);
        const distance = Math.abs(jobIdx - cvIdx);
        
        if (distance === 1) {
          experienceMatchScore = 0.5; // Adjacent level
        } else {
          experienceMatchScore = 0.1; // Distant level
        }
      }
    }
  }
  
  // 6. Calculate B-BBEE relevance
  let bbbeeRelevanceScore = 0;
  
  if (employer.bbbeeLevel) {
    // Check if B-BBEE is mentioned in CV
    if (cvContent.includes("b-bbee") || cvContent.includes("bbbee") || 
        cvContent.includes("black economic empowerment")) {
      bbbeeRelevanceScore = 1.0;
    } else if (options.saProfile?.bbbeeStatus) {
      bbbeeRelevanceScore = 0.9;
    }
  }
  
  // 7. Calculate NQF level match
  let nqfMatchScore = 0;
  
  if (job.description.includes("NQF")) {
    // Extract NQF level from job description using regex
    const nqfMatch = job.description.match(/NQF\s+level\s+(\d+)/i);
    const jobNqfLevel = nqfMatch ? parseInt(nqfMatch[1]) : null;
    
    // Get user's NQF level from profile if available
    const userNqfLevel = options.saProfile?.nqfLevel;
    
    if (jobNqfLevel && userNqfLevel) {
      if (userNqfLevel >= jobNqfLevel) {
        nqfMatchScore = 1.0; // User meets or exceeds the required NQF level
      } else {
        // Partial match based on how close the levels are
        nqfMatchScore = 0.5 * (userNqfLevel / jobNqfLevel);
      }
    }
  }
  
  return {
    skillsMatch: skillsMatchPercentage,
    skillsMatched: typedMatchedSkills,
    industryMatch: industryMatchScore,
    locationMatch: locationMatchScore,
    saContextMatch: saContextMatchScore,
    saKeywordsFound,
    experienceMatch: experienceMatchScore,
    bbbeeRelevance: bbbeeRelevanceScore,
    nqfMatch: nqfMatchScore
  };
}

/**
 * Get a list of common skills from the database
 */
async function getCommonSkills() {
  return db.select().from(skillsTable);
}

/**
 * Get major cities for a South African province
 */
function getProvinceCities(province: string): string[] {
  const provinceCities = {
    "Gauteng": ["Johannesburg", "Pretoria", "Centurion", "Sandton", "Midrand", "Soweto"],
    "Western Cape": ["Cape Town", "Stellenbosch", "Paarl", "George", "Hermanus"],
    "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Richards Bay", "Newcastle", "Ladysmith"],
    "Eastern Cape": ["Port Elizabeth", "Gqeberha", "East London", "Mthatha", "Grahamstown", "Makhanda"],
    "Free State": ["Bloemfontein", "Welkom", "Bethlehem", "Sasolburg"],
    "Mpumalanga": ["Nelspruit", "Mbombela", "Witbank", "Emalahleni", "Secunda"],
    "Limpopo": ["Polokwane", "Tzaneen", "Mokopane", "Thohoyandou"],
    "North West": ["Rustenburg", "Potchefstroom", "Klerksdorp", "Mahikeng"],
    "Northern Cape": ["Kimberley", "Upington", "Springbok"]
  };
  
  // Clean up province name
  const normalizedProvince = province.trim();
  
  // Try to match to a province
  for (const [provinceName, cities] of Object.entries(provinceCities)) {
    if (normalizedProvince.includes(provinceName)) {
      return cities;
    }
  }
  
  // Default return empty array if no match
  return [];
}

/**
 * Generate industry-specific search templates for popular South African sectors
 */
export function getIndustrySearchTemplate(industry: string): any {
  // Base template
  const baseTemplate = {
    searchTerms: [],
    locations: [],
    skills: [],
    qualifications: [],
    experienceLevels: ["Entry Level", "Mid Level", "Senior Level"],
    employmentTypes: ["Full-Time", "Part-Time", "Contract", "Temporary"],
    salaryRange: null
  };
  
  // Industry-specific templates
  const templates: Record<string, any> = {
    "Mining & Minerals": {
      ...baseTemplate,
      searchTerms: ["Mining", "Minerals", "Resources", "Extraction", "Geology"],
      locations: ["Rustenburg", "Johannesburg", "Mpumalanga", "Limpopo", "North West"],
      skills: ["Mining Operations", "Geology", "Mineral Processing", "Safety Management", "Environmental Compliance"],
      qualifications: ["Engineering Degree", "Geology Degree", "Mining Diploma", "NQF Level 4+"],
      salaryRange: "R25,000 - R120,000 monthly"
    },
    
    "Financial Services": {
      ...baseTemplate,
      searchTerms: ["Banking", "Financial", "Investment", "Insurance", "Wealth"],
      locations: ["Johannesburg", "Sandton", "Cape Town", "Durban", "Pretoria"],
      skills: ["Financial Analysis", "Risk Management", "Compliance", "FAIS", "FICA", "Client Relationship Management"],
      qualifications: ["BCom Finance", "CFP", "CFA", "SAICA", "NQF Level 6+"],
      salaryRange: "R30,000 - R100,000 monthly"
    },
    
    "Information Technology": {
      ...baseTemplate,
      searchTerms: ["Software", "Development", "IT", "Tech", "Digital", "Programming"],
      locations: ["Johannesburg", "Cape Town", "Pretoria", "Durban", "Stellenbosch"],
      skills: ["Software Development", "Cloud Computing", "Cybersecurity", "Data Analysis", "Project Management"],
      qualifications: ["Computer Science Degree", "IT Diploma", "Certifications", "NQF Level 5+"],
      salaryRange: "R30,000 - R90,000 monthly"
    },
    
    "Government & Public Sector": {
      ...baseTemplate,
      searchTerms: ["Government", "Public Service", "Municipality", "Public Sector", "Civil Service"],
      locations: ["Pretoria", "Cape Town", "Bloemfontein", "Provincial Capitals"],
      skills: ["Public Administration", "Policy Development", "PFMA", "MFMA", "Governance"],
      qualifications: ["Public Administration Degree", "NQF Level 4+"],
      salaryRange: "R15,000 - R80,000 monthly"
    },
    
    "Healthcare & Medical": {
      ...baseTemplate,
      searchTerms: ["Healthcare", "Medical", "Hospital", "Clinic", "Nursing", "Pharmacy"],
      locations: ["All major cities", "Provincial hospitals", "Rural areas"],
      skills: ["Patient Care", "Medical Administration", "Clinical Skills", "Healthcare Management"],
      qualifications: ["Medical Degree", "Nursing Diploma", "Healthcare Certifications", "NQF Level 5+"],
      salaryRange: "R20,000 - R100,000 monthly"
    },
    
    "Retail & Consumer Goods": {
      ...baseTemplate,
      searchTerms: ["Retail", "Consumer", "Sales", "Merchandising", "Store", "FMCG"],
      locations: ["Shopping centers", "Urban areas", "All provinces"],
      skills: ["Sales", "Customer Service", "Merchandising", "Inventory Management", "Retail Operations"],
      qualifications: ["Retail Management Diploma", "Marketing Degree", "NQF Level 3+"],
      salaryRange: "R8,000 - R60,000 monthly"
    },
    
    "Construction & Engineering": {
      ...baseTemplate,
      searchTerms: ["Construction", "Engineering", "Building", "Infrastructure", "Projects"],
      locations: ["Urban centers", "Development areas", "All provinces"],
      skills: ["Project Management", "CAD", "Structural Design", "Site Supervision", "Quantity Surveying"],
      qualifications: ["Engineering Degree", "Construction Diploma", "NQF Level 4+"],
      salaryRange: "R20,000 - R90,000 monthly"
    },
    
    "Agriculture & Farming": {
      ...baseTemplate,
      searchTerms: ["Agriculture", "Farming", "Agribusiness", "Livestock", "Crops"],
      locations: ["Free State", "Western Cape", "KwaZulu-Natal", "Mpumalanga", "Rural areas"],
      skills: ["Crop Management", "Livestock Management", "Farm Operations", "Agricultural Technology"],
      qualifications: ["Agricultural Degree", "Farming Diploma", "NQF Level 3+"],
      salaryRange: "R10,000 - R60,000 monthly"
    }
  };
  
  // Return the requested industry template or a default if not found
  return templates[industry] || baseTemplate;
}

// Create and export the service object
export const saJobMatchingService = {
  getPersonalizedJobRecommendations,
  getIndustrySearchTemplate
};