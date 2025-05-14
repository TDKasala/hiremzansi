import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db, pool } from './db';
import { fileURLToPath } from 'url';
import path from 'path';

// Main migration function
export async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    // This will automatically run needed migrations
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migrations immediately (ES modules compatible)
// Get the file path in ESM
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runMigrations()
    .then(() => {
      console.log('Migration script completed.');
      pool.end();
    })
    .catch((err) => {
      console.error('Migration script failed:', err);
      pool.end();
      process.exit(1);
    });
}