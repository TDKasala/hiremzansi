/**
 * Simple migration script to run the WhatsApp integration migration
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

dotenv.config();

// Make sure we have a database URL
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  console.log('Starting migration...');
  
  // Read the migration file
  const migrationPath = path.join(__dirname, 'migrations', '001_add_whatsapp_fields.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  
  // Connect to the database
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    // Run the migration
    console.log('Executing migration SQL...');
    await client.query(migrationSql);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Release the client
    client.release();
  }
}

// Run the migration and handle errors
runMigration()
  .then(() => {
    console.log('Migration process completed');
    pool.end().catch(console.error);
  })
  .catch((error) => {
    console.error('Migration process failed:', error);
    pool.end().catch(console.error);
    process.exit(1);
  });