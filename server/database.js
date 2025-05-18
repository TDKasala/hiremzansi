const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const fs = require('fs');
const path = require('path');
const ws = require('ws');

// Configure WebSocket for Neon database
require('@neondatabase/serverless').neonConfig.webSocketConstructor = ws;

// Initialize the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

// Initialize drizzle ORM
const db = drizzle(pool);

// Test database connection
async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log(`Database connection successful at: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Initialize the database with required tables
async function initializeDatabase() {
  console.log('Initializing database...');
  
  try {
    // Check if we need to run migrations (create tables)
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      console.log('Tables do not exist. Creating schema...');
      await createSchema();
    } else {
      console.log('Database tables already exist.');
    }
    
    // Seed initial data
    await seedInitialData();
    
    console.log('Database initialization completed successfully.');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

// Check if tables already exist
async function checkTablesExist() {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'plans'
      )
    `);
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking tables existence:', error);
    return false;
  }
}

// Create database schema by running drizzle-kit push
async function createSchema() {
  try {
    console.log('Running drizzle-kit push...');
    // Using drizzle-kit from npx to create schema
    const { exec } = require('child_process');
    
    return new Promise((resolve, reject) => {
      exec('npx drizzle-kit push:pg', (error, stdout, stderr) => {
        if (error) {
          console.error(`Schema push failed: ${error.message}`);
          reject(error);
          return;
        }
        
        console.log('Schema push output:');
        console.log(stdout);
        
        if (stderr) {
          console.error(`Schema push warnings: ${stderr}`);
        }
        
        console.log('Schema created successfully');
        resolve();
      });
    });
  } catch (error) {
    console.error('Error creating schema:', error);
    throw error;
  }
}

// Seed initial data (plans, etc.)
async function seedInitialData() {
  try {
    const { seedPlans } = require('./migrations/001_seed_plans');
    await seedPlans();
    console.log('Initial data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

// Close the database connection
async function closeConnection() {
  try {
    await pool.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Export the database utilities
module.exports = {
  db,
  pool,
  testConnection,
  initializeDatabase,
  closeConnection
};

// Run database initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database setup completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}