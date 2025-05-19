import { db } from '../db';
import { cvs, atsScores, users, jobMatches, jobPostings, employers } from '@shared/schema';
import { storage } from '../storage';
import { eq, and, desc, sql, gt, lte } from 'drizzle-orm';
import { sendCareerDigestEmail } from './emailService';

/**
 * Get skill gaps based on user's latest CV analysis
 * 
 * @param userId User ID
 * @returns Array of skill gaps
 */
async function getUserSkillGaps(userId: number): Promise<string[]> {
  try {
    // Get the user's latest CV
    const latestCV = await storage.getLatestCVByUser(userId);
    if (!latestCV) return [];
    
    // Get the ATS score for this CV
    const atsScore = await storage.getATSScoreByCV(latestCV.id);
    if (!atsScore) return [];
    
    // Extract improvement recommendations as skill gaps
    const skillGaps: string[] = [];
    
    // Add skills from improvements that mention skills
    if (atsScore.improvements && atsScore.improvements.length > 0) {
      const skillRelatedImprovements = atsScore.improvements.filter(
        imp => imp.toLowerCase().includes('skill') || 
              imp.toLowerCase().includes('experience') ||
              imp.toLowerCase().includes('knowledge')
      );
      skillGaps.push(...skillRelatedImprovements);
    }
    
    // Add keyword recommendations if available
    if (atsScore.keywordRecommendations && Array.isArray(atsScore.keywordRecommendations)) {
      // Flatten the array and take first 5 keywords
      const keywords = atsScore.keywordRecommendations.flat().slice(0, 5);
      skillGaps.push(...keywords);
    }
    
    // Return unique skill gaps, limited to 10
    return [...new Set(skillGaps)].slice(0, 10);
  } catch (error) {
    console.error('Error getting user skill gaps:', error);
    return [];
  }
}

/**
 * Get job matches for a user
 * 
 * @param userId User ID
 * @returns Array of job matches
 */
async function getUserJobMatches(userId: number): Promise<Array<{
  title: string;
  company: string;
  location: string;
  matchScore: number;
}>> {
  try {
    // Get the user's latest CV
    const latestCV = await storage.getLatestCVByUser(userId);
    if (!latestCV) return [];
    
    // Get job matches for this CV
    const matches = await storage.getJobMatchesForCV(latestCV.id);
    if (!matches || matches.length === 0) return [];
    
    // Get job and employer details for each match
    const enhancedMatches = await Promise.all(
      matches.map(async (match) => {
        const job = await storage.getJobPosting(match.jobId);
        if (!job) return null;
        
        const employer = await storage.getEmployer(job.employerId);
        if (!employer) return null;
        
        return {
          title: job.title,
          company: employer.companyName,
          location: job.location || 'South Africa',
          matchScore: match.matchScore
        };
      })
    );
    
    // Filter out null values and sort by match score
    return enhancedMatches
      .filter(match => match !== null) as Array<{
        title: string;
        company: string;
        location: string;
        matchScore: number;
      }>;
  } catch (error) {
    console.error('Error getting user job matches:', error);
    return [];
  }
}

/**
 * Get recommended courses based on user's skill gaps
 * 
 * @param skillGaps Array of skill gaps
 * @returns Array of recommended courses
 */
function getRecommendedCourses(skillGaps: string[]): Array<{
  title: string;
  description: string;
}> {
  // This would typically come from a course database
  // For now, we'll use a simplified mapping of skills to courses
  const courseRecommendations: Record<string, {title: string, description: string}> = {
    'python': {
      title: 'Python for Data Analysis',
      description: 'Learn Python programming for data science and analysis with this comprehensive course.'
    },
    'sql': {
      title: 'SQL Database Management',
      description: 'Master SQL queries, database design, and performance optimization for business applications.'
    },
    'javascript': {
      title: 'Modern JavaScript Development',
      description: 'Build interactive web applications with JavaScript, React, and modern tooling.'
    },
    'communication': {
      title: 'Business Communication Skills',
      description: 'Enhance your verbal and written communication skills for professional success.'
    },
    'project management': {
      title: 'Project Management Essentials',
      description: 'Learn the fundamentals of project planning, execution, and delivery.'
    },
    'excel': {
      title: 'Advanced Excel for Business',
      description: 'Master Excel formulas, pivot tables, and data analysis techniques.'
    },
    'leadership': {
      title: 'Leadership and Team Management',
      description: 'Develop essential skills for leading teams and driving organizational success.'
    },
    'sales': {
      title: 'Modern Sales Techniques',
      description: 'Learn consultative selling approaches for the South African market.'
    }
  };
  
  // Match skill gaps to recommended courses
  const recommendations: Array<{title: string, description: string}> = [];
  
  for (const gap of skillGaps) {
    // Look for keyword matches in the course database
    for (const [keyword, course] of Object.entries(courseRecommendations)) {
      if (gap.toLowerCase().includes(keyword.toLowerCase())) {
        recommendations.push(course);
        break; // Only add one course per skill gap
      }
    }
  }
  
  // Add some default recommendations if we don't have enough
  if (recommendations.length < 3) {
    const defaultCourses = [
      {
        title: 'South African Job Market Essentials',
        description: 'Learn key skills and strategies for success in the South African job market.'
      },
      {
        title: 'Digital Marketing Fundamentals',
        description: 'Develop essential digital marketing skills applicable across industries.'
      },
      {
        title: 'Business Analysis Certification',
        description: 'Learn how to analyze business needs and deliver effective solutions.'
      }
    ];
    
    // Add default courses not already in recommendations
    for (const course of defaultCourses) {
      if (recommendations.length >= 3) break;
      if (!recommendations.some(rec => rec.title === course.title)) {
        recommendations.push(course);
      }
    }
  }
  
  return recommendations.slice(0, 3); // Limit to 3 courses
}

/**
 * Get industry tips based on user's CV content and target industry
 * 
 * @param userId User ID
 * @returns Industry tips string
 */
async function getIndustryTips(userId: number): Promise<string> {
  try {
    // Get the user's latest CV
    const latestCV = await storage.getLatestCVByUser(userId);
    if (!latestCV) return getDefaultIndustryTips();
    
    // If we have a target industry, provide specific tips
    if (latestCV.targetIndustry) {
      return getIndustrySpecificTips(latestCV.targetIndustry);
    }
    
    return getDefaultIndustryTips();
  } catch (error) {
    console.error('Error getting industry tips:', error);
    return getDefaultIndustryTips();
  }
}

/**
 * Get industry-specific tips
 * 
 * @param industry Target industry
 * @returns Industry-specific tips
 */
function getIndustrySpecificTips(industry: string): string {
  // Map of industries to specific tips
  const industryTips: Record<string, string> = {
    'information technology': 'The South African IT sector continues to grow rapidly. Consider obtaining certifications in cloud computing (AWS/Azure) or cybersecurity, which are in high demand. Many IT companies now operate under hybrid work models, so highlight your experience with remote collaboration tools.',
    
    'finance': 'Financial services in South Africa are undergoing digital transformation. Skills in fintech, regulatory compliance (POPIA), and data analysis are highly valued. The industry also increasingly values candidates with knowledge of financial inclusion initiatives.',
    
    'healthcare': 'South Africa\'s healthcare sector is expanding with significant investments in telemedicine and health-tech. Experience with electronic health records and health information systems is valuable. Highlight any experience with public health initiatives or private healthcare operations.',
    
    'education': 'The education sector is embracing digital learning platforms and technologies. Experience with learning management systems, online assessment tools, and digital content creation is highly valued. Knowledge of the South African curriculum and NQF levels is important.',
    
    'manufacturing': 'South Africa\'s manufacturing sector is focusing on efficiency and sustainability. Skills in lean manufacturing, supply chain optimization, and sustainable production practices are in demand. Knowledge of B-BBEE requirements for manufacturing companies is a plus.',
    
    'retail': 'E-commerce is rapidly growing in South Africa. Experience with omnichannel retail strategies, digital marketing, and customer experience design is valuable. Understanding of local payment systems and logistics challenges is highly beneficial.',
    
    'mining': 'The mining industry in South Africa is evolving with increased focus on sustainability, safety, and community engagement. Skills in environmental management, employee wellness programs, and innovative extraction technologies are valued. Knowledge of the Mining Charter and relevant regulations is essential.',
    
    'tourism': 'South Africa\'s tourism industry is recovering post-pandemic with a focus on domestic tourism and unique experiences. Digital marketing skills, experience with virtual tours, and knowledge of sustainable tourism practices are in demand. Highlight any experience with local tourism initiatives or customer service excellence.'
  };
  
  // Normalize the industry name for matching
  const normalizedIndustry = industry.toLowerCase();
  
  // Find a matching industry or return default tips
  for (const [key, tips] of Object.entries(industryTips)) {
    if (normalizedIndustry.includes(key)) {
      return tips;
    }
  }
  
  return getDefaultIndustryTips();
}

/**
 * Get default industry tips when specific industry is unknown
 * 
 * @returns Default industry tips
 */
function getDefaultIndustryTips(): string {
  const defaultTips = [
    'The South African job market is placing increased emphasis on digital literacy across all sectors. Consider enhancing your skills in basic data analysis, digital marketing, or project management tools.',
    
    'Employers in South Africa are prioritizing candidates with strong problem-solving skills and adaptability. In your CV and interviews, highlight specific examples of how you\'ve overcome challenges in previous roles.',
    
    'Networking remains crucial in the South African job market. Consider joining industry-specific professional associations or attending virtual networking events to expand your connections.',
    
    'Companies in South Africa are increasingly valuing sustainability initiatives and social responsibility. Highlighting any experience with these areas can differentiate your application.',
    
    'With remote and hybrid work becoming standard, employers are looking for candidates with strong self-management skills and digital collaboration capabilities. Be sure to emphasize these in your applications.'
  ];
  
  // Return a random tip from the list
  return defaultTips[Math.floor(Math.random() * defaultTips.length)];
}

/**
 * Generate personalized recommendations for a user
 * 
 * @param userId User ID
 * @returns Object containing personalized recommendations
 */
export async function generatePersonalizedRecommendations(userId: number): Promise<{
  jobMatches?: Array<{title: string, company: string, location: string, matchScore: number}>,
  skillGaps?: Array<string>,
  courses?: Array<{title: string, description: string}>,
  industryTips?: string
}> {
  try {
    // Get job matches
    const jobMatches = await getUserJobMatches(userId);
    
    // Get skill gaps
    const skillGaps = await getUserSkillGaps(userId);
    
    // Get recommended courses based on skill gaps
    const courses = getRecommendedCourses(skillGaps);
    
    // Get industry tips
    const industryTips = await getIndustryTips(userId);
    
    return {
      jobMatches: jobMatches.length > 0 ? jobMatches : undefined,
      skillGaps: skillGaps.length > 0 ? skillGaps : undefined,
      courses: courses.length > 0 ? courses : undefined,
      industryTips
    };
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return {
      industryTips: getDefaultIndustryTips()
    };
  }
}

/**
 * Send career digest emails to eligible users
 * 
 * @returns Promise<number> Number of emails sent
 */
export async function sendWeeklyCareerDigests(): Promise<number> {
  try {
    // Get users who have opted in for email digests and haven't received one recently
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const eligibleUsers = await db.select()
      .from(users)
      .where(
        and(
          eq(users.receiveEmailDigest, true),
          eq(users.emailVerified, true),
          eq(users.isActive, true),
          or(
            sql`${users.lastEmailDigestSent} IS NULL`,
            lte(users.lastEmailDigestSent, oneWeekAgo)
          )
        )
      )
      .limit(100); // Process in batches to avoid overloading the system
    
    console.log(`Found ${eligibleUsers.length} users eligible for career digest emails`);
    
    let sentCount = 0;
    
    // Send digest emails to each eligible user
    for (const user of eligibleUsers) {
      try {
        // Generate personalized recommendations
        const recommendations = await generatePersonalizedRecommendations(user.id);
        
        // Only send if we have meaningful recommendations
        if (
          recommendations.jobMatches || 
          recommendations.skillGaps || 
          recommendations.courses || 
          recommendations.industryTips
        ) {
          // Send the email
          const success = await sendCareerDigestEmail(
            user.email,
            user.name || user.username,
            recommendations
          );
          
          if (success) {
            // Update the last email sent timestamp
            await db.update(users)
              .set({ lastEmailDigestSent: new Date() })
              .where(eq(users.id, user.id));
            
            sentCount++;
          }
        }
      } catch (error) {
        console.error(`Error sending digest email to user ${user.id}:`, error);
        continue; // Skip to next user
      }
    }
    
    console.log(`Successfully sent ${sentCount} career digest emails`);
    return sentCount;
  } catch (error) {
    console.error('Error in sendWeeklyCareerDigests:', error);
    return 0;
  }
}

// Helper function for where clause
function or(...conditions: any[]): any {
  return sql`(${sql.join(conditions, sql` OR `)})`;
}