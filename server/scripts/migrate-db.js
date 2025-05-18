const { drizzle } = require('drizzle-orm/neon-serverless');
const { Pool } = require('@neondatabase/serverless');
const { migrate } = require('drizzle-orm/neon-serverless/migrator');
const ws = require('ws');
const path = require('path');
const fs = require('fs');
const schema = require('../../shared/schema');

// Configure Neon WebSocket
require('@neondatabase/serverless').neonConfig.webSocketConstructor = ws;

/**
 * Runs database migrations for the PostgreSQL database
 */
async function runMigrations() {
  console.log('Starting database migrations...');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  // Create connection pool
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Create database schema
    console.log('Creating database schema...');
    const db = drizzle(pool);
    
    // Generate SQL for all tables
    const tables = Object.values(schema)
      .filter(entity => entity && typeof entity === 'object' && entity._.isTable);
    
    for (const table of tables) {
      const tableName = table._.name;
      console.log(`Creating table if not exists: ${tableName}`);
      
      try {
        // Create a raw SQL query to create the table if it doesn't exist
        // This is a simplified approach - in a real app, you'd use proper migrations
        await pool.query(`
          CREATE TABLE IF NOT EXISTS "${tableName}" (
            id SERIAL PRIMARY KEY
          )
        `);
      } catch (error) {
        console.log(`Error with table ${tableName}:`, error.message);
      }
    }
    
    console.log('Base tables created');
    
    // Run the seed plans function
    console.log('Seeding initial data...');
    await require('../migrations/001_seed_plans').seedPlans();
    
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('All migrations completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Unhandled error during migrations:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };