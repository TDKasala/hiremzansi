import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '@shared/schema';
import { getPool } from '../db-pool';
import { log } from '../vite';

/**
 * Seeds the default subscription plans for ATSBoost
 */
export async function seedPlans() {
  try {
    log('Seeding default plans...', 'db');
    const pool = getPool();
    const db = drizzle(pool, { schema });

    // Create Free Plan
    await db.insert(schema.plans).values({
      name: 'Free',
      description: 'Basic CV analysis with limited insights.',
      price: 0,
      interval: 'month',
      features: [
        'Basic ATS compatibility score',
        'Limited formatting suggestions',
        '2 CV scans per month',
        'South African context analysis'
      ],
      isActive: true,
      isPopular: false,
      scanLimit: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create Starter Plan
    await db.insert(schema.plans).values({
      name: 'Starter',
      description: 'Enhanced CV analysis with deeper insights.',
      price: 3000, // R30 in cents
      interval: 'month',
      features: [
        'Full ATS compatibility score',
        'Detailed formatting suggestions',
        '10 CV scans per month',
        'South African keyword recommendations',
        'B-BBEE and NQF level detection',
        'Before/after comparison tracking'
      ],
      isActive: true,
      isPopular: false,
      scanLimit: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create Premium Plan
    await db.insert(schema.plans).values({
      name: 'Premium',
      description: 'Comprehensive CV optimization for serious job seekers.',
      price: 10000, // R100 in cents
      interval: 'month',
      features: [
        'Full ATS compatibility score',
        'Detailed formatting suggestions',
        '30 CV scans per month',
        'Advanced South African context analysis',
        'Industry-specific keyword recommendations',
        'B-BBEE and NQF level optimization',
        'Job description matching',
        'PDF export of analysis results',
        'CV improvement tracking'
      ],
      isActive: true,
      isPopular: true, // Most popular plan
      scanLimit: 30,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create Pro Plan
    await db.insert(schema.plans).values({
      name: 'Pro',
      description: 'Premium features plus advanced career development tools.',
      price: 20000, // R200 in cents
      interval: 'month',
      features: [
        'All Premium features',
        'Unlimited CV scans',
        'Interview simulation',
        'Skill gap analysis',
        'Career path planning',
        'Job match notifications',
        'Priority support'
      ],
      isActive: true,
      isPopular: false,
      scanLimit: 0, // 0 means unlimited
      createdAt: new Date(),
      updatedAt: new Date()
    });

    log('Default plans seeded successfully', 'db');
  } catch (error) {
    log(`Error seeding plans: ${error}`, 'db');
    throw error;
  }
}