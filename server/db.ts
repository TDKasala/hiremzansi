import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Database configuration
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/hiremzansi';

// Create PostgreSQL connection
const sql = postgres(connectionString, { max: 1 });

// Create Drizzle database instance
export const db = drizzle(sql, { schema });

export const closeDbConnection = async () => {
  await sql.end();
};