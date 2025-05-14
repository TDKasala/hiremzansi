import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure neon database to work with WebSockets (required for serverless environments)
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configuration for the connection pool
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  // Production optimization settings
  max: process.env.NODE_ENV === 'production' ? 20 : 10, // Max connections in pool
  idleTimeoutMillis: 30000, // Time a connection can be idle before being closed
  connectionTimeoutMillis: 5000, // Time to wait for a connection
  ssl: process.env.NODE_ENV === 'production', // Enable SSL in production
};

console.log(`Setting up PostgreSQL connection pool (${process.env.NODE_ENV} mode)`);

export const pool = new Pool(poolConfig);

// Set up event handlers for connection pool monitoring
pool.on('connect', () => {
  console.log('New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

// Initialize Drizzle ORM with our schema
export const db = drizzle(pool, { schema });

// Helper function to release pool on app shutdown
export const closeDbConnection = async () => {
  console.log('Closing PostgreSQL connection pool');
  await pool.end();
};