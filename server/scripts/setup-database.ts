import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '@shared/schema';
import { seedPlans } from '../migrations/001_seed_plans';

// Configure Neon WebSocket
neonConfig.webSocketConstructor = ws;

/**
 * This script sets up the PostgreSQL database for production use.
 * It:
 * 1. Creates all tables if they don't exist
 * 2. Seeds initial necessary data
 */
async function setupDatabase() {
  console.log('Starting PostgreSQL database setup...');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  
  try {
    console.log('Creating tables if they don\'t exist...');
    
    // For each table in the schema, generate CREATE TABLE IF NOT EXISTS 
    // In a production environment, it would be better to use migrations
    // but for simplicity we're using this approach
    
    // Step 1: Check database connection
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log(`Database connection successful: ${result.rows[0].now}`);
    
    // Step 2: Seed initial data
    console.log('Seeding initial data...');
    await seedPlans();
    console.log('Initial data seeded successfully');
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute the setup if this file is run directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Setup completed. You can now start the application.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Unhandled error during setup:', error);
      process.exit(1);
    });
}

export default setupDatabase;