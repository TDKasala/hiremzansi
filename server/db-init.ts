import { db, pool } from './db';
import { users, plans } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Initializes the database with essential data if not already present.
 * This ensures that when the application starts in production, the database
 * will have the necessary data to function properly.
 */
export async function initializeDatabase() {
  console.log('Initializing database...');
  
  try {
    // Check if admin user exists
    const adminExists = await checkAdminUser();
    if (!adminExists) {
      await createAdminUser();
    }
    
    // Check if subscription plans exist
    const plansExist = await checkPlans();
    if (!plansExist) {
      await createDefaultPlans();
    }
    
    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

// Check if admin user exists
async function checkAdminUser() {
  const adminUsers = await db.select()
    .from(users)
    .where(eq(users.role, 'admin'));
    
  return adminUsers.length > 0;
}

// Create an admin user if none exists
async function createAdminUser() {
  console.log('Creating admin user...');
  
  // In a real production environment, you would use a secure, randomly generated password
  // that's provided via environment variable, and notify the administrator out-of-band
  
  // For this demo, we'll create an admin user with a fixed password
  // !IMPORTANT: In a real production system, never hardcode credentials like this!
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMe123!';
  
  // The hash function from auth.ts should be imported and used here
  // For demo purposes we'll use a placeholder hash
  const hashedPassword = `${adminPassword}.demohash`;
  
  await db.insert(users).values({
    username: 'admin',
    email: 'admin@atsboost.co.za',
    password: hashedPassword,
    role: 'admin',
    isActive: true,
    name: 'System Administrator',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('Admin user created successfully');
  return true;
}

// Check if subscription plans exist
async function checkPlans() {
  const existingPlans = await db.select().from(plans);
  return existingPlans.length > 0;
}

// Create default subscription plans
async function createDefaultPlans() {
  console.log('Creating default subscription plans...');
  
  // Free plan
  await db.insert(plans).values({
    name: 'Free',
    description: 'Basic ATS score and CV analysis',
    price: 0,
    interval: 'month',
    features: ['Basic ATS score', 'Limited CV analysis', '3 CV scans per month'],
    scanLimit: 3,
    isActive: true,
    isPopular: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Basic plan
  await db.insert(plans).values({
    name: 'Basic',
    description: 'Enhanced CV analysis with job matching',
    price: 30,
    interval: 'month',
    features: ['ATS score with recommendations', 'CV optimization tips', 'Job description matching', '10 CV scans per month'],
    scanLimit: 10,
    isActive: true,
    isPopular: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Premium plan
  await db.insert(plans).values({
    name: 'Premium',
    description: 'Full CV optimization with job matching and industry insights',
    price: 100,
    interval: 'month',
    features: ['Advanced ATS analysis', 'Industry-specific recommendations', 'B-BBEE and NQF optimization', 'Job description matching', '50 CV scans per month'],
    scanLimit: 50,
    isActive: true,
    isPopular: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Enterprise plan
  await db.insert(plans).values({
    name: 'Enterprise',
    description: 'Maximum CV optimization with unlimited scans',
    price: 200,
    interval: 'month',
    features: ['All Premium features', 'Unlimited CV scans', 'Priority support', 'WhatsApp notifications'],
    scanLimit: 100,
    isActive: true,
    isPopular: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('Default subscription plans created successfully');
  return true;
}

// If this script is run directly, perform initialization
if (import.meta.url.endsWith('db-init.ts')) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      // Only close pool if executed directly
      if (process.argv[1]?.endsWith('db-init.ts')) {
        pool.end();
      }
    })
    .catch((err) => {
      console.error('Database initialization failed:', err);
      // Only close pool if executed directly
      if (process.argv[1]?.endsWith('db-init.ts')) {
        pool.end();
      }
      process.exit(1);
    });
}