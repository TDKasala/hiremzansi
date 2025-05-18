// Setup PostgreSQL database
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { sql } = require('drizzle-orm');
const ws = require('ws');

// Import our migrations
const { seedPlans } = require('../migrations/001_seed_plans');

// Set WebSocket for Neon database
require('@neondatabase/serverless').neonConfig.webSocketConstructor = ws;

/**
 * This script sets up the PostgreSQL database and seeds initial data
 */
async function setupDatabase() {
  console.log('Setting up PostgreSQL database...');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable not set');
    process.exit(1);
  }
  
  // Create database connection
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log(`Database connection successful: ${result.rows[0].now}`);
    
    // Create drizzle instance
    const db = drizzle(pool);
    
    // Check if plans table exists (as a proxy for schema existence)
    console.log('Checking if schema exists...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'plans'
      )
    `);
    
    // If schema doesn't exist, create it using drizzle push
    if (!tableCheck.rows[0].exists) {
      console.log('Schema does not exist. Running db:push...');
      // For simplicity, we'll use the npm script which uses drizzle-kit
      const { exec } = require('child_process');
      
      // Run the drizzle-kit push command to create schema
      await new Promise((resolve, reject) => {
        exec('npx drizzle-kit push:pg', (error, stdout, stderr) => {
          if (error) {
            console.error(`Schema push error: ${error.message}`);
            reject(error);
            return;
          }
          
          console.log('Schema push output:');
          console.log(stdout);
          
          if (stderr) {
            console.error(`Schema push stderr: ${stderr}`);
          }
          
          resolve();
        });
      });
      
      console.log('Schema created successfully');
    } else {
      console.log('Schema already exists, skipping creation');
    }
    
    // Seed initial data
    console.log('Seeding initial data...');
    await seedPlans();
    console.log('Data seeding completed');
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Setup completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}