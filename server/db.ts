import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@shared/schema';
import { getPool, closePool } from './db-pool';
import { initializeDatabase } from './db-init';
import { log } from './vite';

// Create drizzle instance with the pool
export const pool = getPool();
export const db = drizzle(pool, { schema });

// Initialize database and run migrations if needed
export const initializeDb = async (skipInit = false): Promise<boolean> => {
  try {
    // Check if database is connected
    try {
      await pool.query('SELECT 1');
      log('Database connection successful', 'db');
    } catch (error) {
      log(`Database connection failed: ${error}`, 'db');
      return false;
    }
    
    // Initialize database with essential data
    if (!skipInit) {
      const initialized = await initializeDatabase();
      if (!initialized) {
        log('Database initialization failed', 'db');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    log(`Database setup failed: ${error}`, 'db');
    return false;
  }
};

// Close database connection
export const closeDbConnection = async () => {
  try {
    await closePool();
    log('Database connection closed successfully', 'db');
  } catch (error) {
    log(`Error closing database connection: ${error}`, 'db');
  }
};