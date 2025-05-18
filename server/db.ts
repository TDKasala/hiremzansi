import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@shared/schema';
import { getPool, closePool } from './db-pool';
import { log } from './vite';

// Export the global pool
export const pool = getPool();

// Initialize drizzle with our schema
export const db = drizzle(pool, { schema });

// Close database connection
export const closeDbConnection = async () => {
  log('Closing database connection...', 'db');
  
  try {
    await closePool();
    log('Database connection closed successfully', 'db');
  } catch (error) {
    log(`Error closing database connection: ${error}`, 'db');
  }
};