import { Pool, PoolConfig, neonConfig } from '@neondatabase/serverless';
import { log } from './vite';
import ws from 'ws';

// Configure Neon WebSocket
neonConfig.webSocketConstructor = ws;

/**
 * Database connection pool manager
 * Handles connection pooling for production and development environments
 */

// Connection pool singleton
let _pool: Pool | null = null;

// Pool settings for different environments
const getPoolConfig = (): PoolConfig => {
  const isDev = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  
  // Basic pool configuration
  const baseConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: isDev ? 10 : 20, // Maximum connections: 10 for dev, 20 for production
    idleTimeoutMillis: 30000, // How long a connection can be idle (30 seconds)
    connectionTimeoutMillis: 5000, // Connection timeout (5 seconds)
    ssl: !isDev // Use SSL in production, not in development
  };
  
  // Special settings for different environments
  if (isDev) {
    log(`Setting up PostgreSQL connection pool (development mode)`, 'postgres');
    return baseConfig;
  } else if (isTest) {
    log(`Setting up PostgreSQL connection pool (test mode)`, 'postgres');
    return {
      ...baseConfig,
      max: 5, // Fewer connections for testing
      idleTimeoutMillis: 10000 // Shorter idle timeout for testing
    };
  } else {
    log(`Setting up PostgreSQL connection pool (production mode)`, 'postgres');
    return {
      ...baseConfig,
      max: 20, // More connections for production
      statement_timeout: 10000, // Statement timeout (10 seconds)
      query_timeout: 15000, // Query timeout (15 seconds)
      connectionTimeoutMillis: 10000 // Longer connection timeout for production
    };
  }
};

/**
 * Get a connection pool instance (singleton pattern)
 * This ensures we only create one pool for the entire application
 */
export function getPool(): Pool {
  if (!_pool) {
    // Configure Neon WebSocket - already done through imports
    // We'll use neonConfig from our imports instead of require
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Create the pool with the appropriate configuration
    _pool = new Pool(getPoolConfig());
    
    // Add connection event handlers
    _pool.on('connect', () => {
      log('New client connected to PostgreSQL', 'postgres');
    });
    
    _pool.on('error', (err) => {
      log(`PostgreSQL pool error: ${err.message}`, 'postgres');
    });
  }
  
  return _pool;
}

/**
 * Close the connection pool
 */
export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
    log('PostgreSQL connection pool closed', 'postgres');
  }
}

/**
 * Get a client from the pool for transaction operations
 * Make sure to release the client when done
 */
export async function getClient() {
  const pool = getPool();
  const client = await pool.connect();
  return client;
}

/**
 * Execute a query with automatic retry on certain errors
 * @param queryFn Function that executes the query
 * @param retries Number of retries (default: 3)
 */
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>, 
  retries = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await queryFn();
    } catch (err: any) {
      lastError = err;
      
      // Only retry on connection-related errors
      const isRetryable = err.code === 'ECONNRESET' || 
                          err.code === 'ECONNREFUSED' ||
                          err.code === '08006' ||  // Connection failure
                          err.code === '08001';    // Unable to connect
      
      if (!isRetryable || attempt >= retries) {
        throw err;
      }
      
      // Wait before retrying, with exponential backoff
      const delay = Math.min(100 * Math.pow(2, attempt), 2000);
      log(`Retrying database query after error: ${err.message} (attempt ${attempt}/${retries})`, 'postgres');
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never happen due to the throw in the loop
  throw lastError || new Error('Unknown error during query execution');
}

// Test connection function that can be called directly without closing pool
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT NOW() as time');
    console.log('PostgreSQL connection successful:', result.rows[0].time);
    return true;
  } catch (err) {
    console.error('PostgreSQL connection failed:', err);
    return false;
  }
}

// Only run test if this file is directly executed (not when imported)
if (import.meta.url.endsWith('db-pool.ts')) {
  (async () => {
    const success = await testConnection();
    if (!success) {
      process.exit(1);
    }
  })();
}