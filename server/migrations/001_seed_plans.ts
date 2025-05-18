import { db } from '../db';
import { plans } from '@shared/schema';

/**
 * Seeds the initial subscription plans in the database
 */
export async function seedPlans() {
  try {
    // Check if plans already exist
    const existingPlans = await db.select().from(plans);
    
    // Only seed if no plans exist
    if (existingPlans.length === 0) {
      console.log('Seeding subscription plans...');
      
      await db.insert(plans).values([
        {
          name: 'Free',
          description: 'Basic ATS score check',
          price: 0, // R0 in cents
          interval: 'month',
          features: [
            'Basic ATS score analysis',
            '2 strengths identified',
            '1 improvement suggestion',
            'Limited recommendations'
          ],
          isActive: true,
          isPopular: false,
          scanLimit: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Essential',
          description: 'One-time CV optimization',
          price: 3000, // R30 in cents
          interval: 'once',
          features: [
            'Full ATS score analysis',
            'Comprehensive recommendations',
            'Keyword optimization',
            'Format improvements',
            'B-BBEE & NQF guidance'
          ],
          isActive: true,
          isPopular: false,
          scanLimit: 5,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Premium',
          description: 'Continuous CV improvement',
          price: 10000, // R100 in cents
          interval: 'month',
          features: [
            'Everything in Essential',
            'Unlimited CV uploads',
            'Before/After comparison',
            'Progress tracking',
            'South African job market tips',
            'Industry-specific keywords'
          ],
          isActive: true,
          isPopular: true,
          scanLimit: null, // Unlimited
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Professional',
          description: 'Complete career support',
          price: 20000, // R200 in cents
          interval: 'month',
          features: [
            'Everything in Premium',
            'Interview practice with AI',
            'Personalized feedback',
            'Skill gap analysis',
            'South African job matching',
            'Email support'
          ],
          isActive: true,
          isPopular: false,
          scanLimit: null, // Unlimited
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      
      console.log('Subscription plans seeded successfully!');
    } else {
      console.log('Plans already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding plans:', error);
    throw error;
  }
}

// Execute the seed function if this file is run directly
if (require.main === module) {
  seedPlans()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error running plan seed:', error);
      process.exit(1);
    });
}