import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Database configuration - Use Replit PostgreSQL database
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/hiremzansi';

// Log connection attempt for debugging
console.log('Database connection string configured:', connectionString ? 'Connected' : 'Using fallback');

// Create PostgreSQL connection
const sql = postgres(connectionString, { max: 1 });

// Create Drizzle database instance
export const db = drizzle(sql, { schema });

// Export the connection for direct queries
export const pool = sql;

export const closeDbConnection = async () => {
  await sql.end();
};