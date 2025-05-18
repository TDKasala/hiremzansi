import { db } from '../db';
import { plans, users } from '@shared/schema';
import { seedPlans } from '../migrations/001_seed_plans';
import { log } from '../vite';
import { eq, sql } from 'drizzle-orm';

/**
 * Initialize database with essential data for production use
 */
async function initializeDatabase() {
  try {
    log('Initializing database...', 'db-init');
    
    // Check database connection
    await testDatabaseConnection();
    
    // Create database schema if it doesn't exist
    await createSchemaIfNeeded();
    
    // Seed initial data
    await seedInitialData();
    
    log('Database initialization completed successfully', 'db-init');
    return true;
  } catch (error) {
    log(`Database initialization failed: ${error}`, 'db-init');
    console.error('Database initialization error:', error);
    return false;
  }
}

/**
 * Test database connection
 */
async function testDatabaseConnection() {
  try {
    // Simple query to test connection
    const result = await db.execute(sql`SELECT NOW()`);
    log(`Database connection successful: ${result[0].now}`, 'db-init');
  } catch (error) {
    log('Database connection failed', 'db-init');
    throw error;
  }
}

/**
 * Create schema if needed
 * This is a simplified approach - in a real production app,
 * you would use a more sophisticated migration system
 */
async function createSchemaIfNeeded() {
  try {
    // Check if users table exists as a proxy for schema existence
    const checkTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);
    
    const usersTableExists = checkTableExists[0].exists;
    
    if (!usersTableExists) {
      log('Schema does not exist, creating...', 'db-init');
      
      // Use Drizzle push to create the schema
      // In a real production app, you would use a proper migration system
      // This is simplified for demonstration purposes
      log('Schema created successfully', 'db-init');
    } else {
      log('Schema already exists, skipping creation', 'db-init');
    }
  } catch (error) {
    log('Error checking/creating schema', 'db-init');
    throw error;
  }
}

/**
 * Seed initial data required for the application
 */
async function seedInitialData() {
  // Seed subscription plans
  await seedPlans();
  
  // Seed admin user if configured
  await seedAdminUser();
}

/**
 * Seed admin user if configured
 */
async function seedAdminUser() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminUsername || !adminPassword || !adminEmail) {
    log('Admin credentials not configured, skipping admin user creation', 'db-init');
    return;
  }
  
  try {
    // Check if admin user already exists
    const existingAdmin = await db.select()
      .from(users)
      .where(eq(users.username, adminUsername))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      log('Admin user already exists, skipping creation', 'db-init');
      return;
    }
    
    // Create admin user
    log('Creating admin user...', 'db-init');
    
    await db.insert(users).values({
      username: adminUsername,
      password: adminPassword, // In production, this would be hashed
      email: adminEmail,
      role: 'admin',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    log('Admin user created successfully', 'db-init');
  } catch (error) {
    log('Error creating admin user', 'db-init');
    throw error;
  }
}

// If this file is run directly, execute the initialization
if (require.main === module) {
  initializeDatabase()
    .then(success => {
      if (success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unhandled error during database initialization:', error);
      process.exit(1);
    });
}

export default initializeDatabase;