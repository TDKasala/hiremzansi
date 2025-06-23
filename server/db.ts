import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Database configuration - Use Neon PostgreSQL database
// Prioritize individual environment variables over DATABASE_URL to ensure Neon connection
const connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

if (!process.env.PGHOST || !process.env.PGUSER || !process.env.PGPASSWORD || !process.env.PGDATABASE) {
  throw new Error('PostgreSQL environment variables (PGHOST, PGUSER, PGPASSWORD, PGDATABASE) are required for database connection');
}

// Log connection attempt for debugging
console.log('Database connection configured for Neon PostgreSQL:', process.env.PGHOST ? 'Connected' : 'Missing host');

// Create PostgreSQL connection with proper configuration for Neon
const sql = postgres(connectionString, { 
  max: 10,
  idle_timeout: 20,
  connect_timeout: 60,
  ssl: 'require' // Always require SSL for Neon
});

// Create Drizzle database instance
export const db = drizzle(sql, { schema });

// Export the connection for direct queries
export const pool = sql;

export const closeDbConnection = async () => {
  await sql.end();
};