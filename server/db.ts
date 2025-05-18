import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";
import { getPool, closePool } from './db-pool';

// Get the managed connection pool from our pool manager
export const pool = getPool();

// Initialize Drizzle ORM with our schema
export const db = drizzle(pool, { schema });

// Helper function to release pool on app shutdown
export const closeDbConnection = async () => {
  await closePool();
};