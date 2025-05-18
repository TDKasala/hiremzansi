import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import { log } from '../vite';

/**
 * Push the database schema to PostgreSQL
 * This script is used in development and initial deployment to push schema changes
 */
async function pushSchema() {
  log('Starting database schema push...', 'db');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  // Create a dedicated connection for migration
  // We use postgres.js directly instead of the pool to ensure a clean connection
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient, { schema });

  try {
    // Apply the schema to the database
    log('Pushing schema changes to database...', 'db');
    
    // Direct schema push for development (not recommended for production)
    // In a real production environment, you would use proper migrations
    // Instead of calling create() which isn't available, we'll use raw SQL
    
    // Run the drizzle-kit push command to create schema
    const { exec } = require('child_process');
    
    log('Running drizzle-kit push to create database schema...', 'db');
    await new Promise((resolve, reject) => {
      exec('npx drizzle-kit push:pg', (error, stdout, stderr) => {
        if (error) {
          log(`Schema push error: ${error.message}`, 'db');
          reject(error);
          return;
        }
        
        log('Schema push output:', 'db');
        log(stdout, 'db');
        
        if (stderr) {
          log(`Schema push stderr: ${stderr}`, 'db');
        }
        
        resolve(stdout);
      });
    });
    
    log('Schema push completed successfully', 'db');
  } catch (error) {
    log(`Schema push failed: ${error}`, 'db');
    console.error('Error pushing schema:', error);
    process.exit(1);
  } finally {
    // Close the migration client
    await migrationClient.end();
  }
}

// If this file is run directly, execute the schema push
if (require.main === module) {
  pushSchema()
    .then(() => {
      log('Schema push script completed', 'db');
      process.exit(0);
    })
    .catch(error => {
      log(`Schema push script failed: ${error}`, 'db');
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

export default pushSchema;