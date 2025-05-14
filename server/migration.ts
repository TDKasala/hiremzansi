import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db, pool } from './db';
import { fileURLToPath } from 'url';
import path from 'path';
import { log } from './vite';

// Main migration function
export async function runMigrations() {
  log('Starting database migrations...', 'drizzle');
  
  try {
    // This will automatically run needed migrations
    await migrate(db, { migrationsFolder: './migrations' });
    log('Migrations completed successfully', 'drizzle');
  } catch (error) {
    log(`Migration failed: ${error}`, 'drizzle');
    throw error;
  }
}

// Run migrations immediately (ES modules compatible)
// Check if this module is being run directly 
if (import.meta.url.endsWith('migration.ts')) {
  runMigrations()
    .then(() => {
      log('Migration script completed.', 'drizzle');
      // Only close pool if this file is executed directly via command line
      if (process.argv[1]?.endsWith('migration.ts')) {
        pool.end();
      }
    })
    .catch((err) => {
      log(`Migration script failed: ${err}`, 'drizzle');
      // Only close pool if this file is executed directly via command line
      if (process.argv[1]?.endsWith('migration.ts')) {
        pool.end();
      }
      process.exit(1);
    });
}