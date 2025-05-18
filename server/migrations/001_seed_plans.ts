import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema';

// Define our default plans
const defaultPlans = [
  {
    name: 'Free',
    description: 'Basic ATS score and limited features',
    price: 0,
    currency: 'ZAR',
    featureJson: JSON.stringify({
      maxCVUploads: 2,
      maxATSScans: 2,
      atsReportFeatures: ['basicScore', 'keywordMatching', 'formatCheck'],
      aiAssistance: false,
      beforeAfterComparison: false,
      deepAnalysis: false,
      careerGuidance: false,
      interviewPrep: false,
      jobBoardAccess: false,
      prioritySupport: false,
    }),
    billingPeriod: 'monthly',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Essential',
    description: 'Enhanced ATS scoring with detailed recommendations',
    price: 30,
    currency: 'ZAR',
    featureJson: JSON.stringify({
      maxCVUploads: 5,
      maxATSScans: 5,
      atsReportFeatures: ['basicScore', 'keywordMatching', 'formatCheck', 'contentSuggestions', 'sectionAnalysis'],
      aiAssistance: true,
      beforeAfterComparison: true,
      deepAnalysis: false,
      careerGuidance: false,
      interviewPrep: false,
      jobBoardAccess: false,
      prioritySupport: false,
    }),
    billingPeriod: 'monthly',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Professional',
    description: 'Complete CV optimization with AI assistance',
    price: 100,
    currency: 'ZAR',
    featureJson: JSON.stringify({
      maxCVUploads: 10,
      maxATSScans: 15,
      atsReportFeatures: ['basicScore', 'keywordMatching', 'formatCheck', 'contentSuggestions', 'sectionAnalysis', 'industryComparison', 'skillGapAnalysis'],
      aiAssistance: true,
      beforeAfterComparison: true,
      deepAnalysis: true,
      careerGuidance: true,
      interviewPrep: false,
      jobBoardAccess: true,
      prioritySupport: false,
    }),
    billingPeriod: 'monthly',
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Career Growth',
    description: 'Ultimate career advancement toolset',
    price: 200,
    currency: 'ZAR',
    featureJson: JSON.stringify({
      maxCVUploads: 25,
      maxATSScans: 50,
      atsReportFeatures: ['basicScore', 'keywordMatching', 'formatCheck', 'contentSuggestions', 'sectionAnalysis', 'industryComparison', 'skillGapAnalysis', 'careerPathPlanning'],
      aiAssistance: true,
      beforeAfterComparison: true,
      deepAnalysis: true,
      careerGuidance: true,
      interviewPrep: true,
      jobBoardAccess: true,
      prioritySupport: true,
    }),
    billingPeriod: 'monthly',
    isActive: true, 
    sortOrder: 4,
  },
];

export async function seedPlans() {
  console.log('Starting plan seeding...');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    return;
  }
  
  // Create database connection
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  
  try {
    // Check if plans already exist
    const existingPlans = await db.select().from(schema.plans);
    
    if (existingPlans.length > 0) {
      console.log(`Plans already seeded (${existingPlans.length} plans found). Skipping.`);
      return;
    }
    
    console.log('No plans found. Seeding default plans...');
    
    // Insert default plans
    const results = await db.insert(schema.plans).values(defaultPlans).returning();
    
    console.log(`Successfully seeded ${results.length} plans`);
  } catch (error) {
    console.error('Error seeding plans:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// If this file is run directly, execute the seed function
if (require.main === module) {
  seedPlans()
    .then(() => {
      console.log('Plan seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Plan seeding failed:', error);
      process.exit(1);
    });
}