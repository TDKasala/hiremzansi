import { Pool, PoolConfig } from '@neondatabase/serverless';

// Extend the pool config to include the webSocketConstructor property
interface NeonPoolConfig extends PoolConfig {
  webSocketConstructor?: any; // Using any for compatibility with ws package
}
import { log } from './vite';
import ws from 'ws';

// Global pool instance (singleton pattern)
let globalPool: Pool | null = null;

// Pool health check interval (in ms)
const HEALTH_CHECK_INTERVAL = 60000; // 1 minute

// Configure pool settings
const getPoolConfig = (): NeonPoolConfig => {
  // Check for required environment variables
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  // Base configuration for all environments
  const baseConfig: NeonPoolConfig = {
    connectionString: process.env.DATABASE_URL,
    // Enable WebSocket for Neon Serverless
    webSocketConstructor: ws,
    // Default max connections
    max: 10,
    // Connection timeout
    connectionTimeoutMillis: 5000,
    // Idle timeout
    idleTimeoutMillis: 30000
  };
  
  // Override settings based on environment
  if (process.env.NODE_ENV === 'production') {
    return {
      ...baseConfig,
      // More connections for production
      max: 20,
      // Keep connections alive longer in production
      idleTimeoutMillis: 60000
    };
  } else if (process.env.NODE_ENV === 'test') {
    return {
      ...baseConfig,
      // Fewer connections for test environment
      max: 5,
      // Shorter timeouts for test runs
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 10000
    };
  }
  
  return baseConfig;
};

/**
 * Get a connection pool instance (singleton pattern)
 * This ensures we only create one pool for the entire application
 */
export function getPool(): Pool {
  if (!globalPool) {
    createPool();
  }
  
  return globalPool!;
}

/**
 * Create a new connection pool with current configuration
 */
function createPool(): void {
  try {
    log('Creating new database connection pool', 'db');
    globalPool = new Pool(getPoolConfig());
    
    // Set up error handler
    globalPool.on('error', (err: Error) => {
      log(`Database pool error: ${err.message}`, 'db');
      
      // If the connection drops, attempt to reset the pool
      if (err.message.includes('Connection terminated unexpectedly') || 
          err.message.includes('Connection refused')) {
        log('Connection dropped, resetting pool...', 'db');
        resetPool();
      }
    });
    
    // Start health check
    startPoolHealthCheck();
    
    log('Database connection pool created successfully', 'db');
  } catch (error) {
    log(`Failed to create database connection pool: ${error}`, 'db');
    throw error;
  }
}

/**
 * Reset the connection pool
 * This is used when we detect critical errors and need to reconnect
 */
async function resetPool(): Promise<void> {
  try {
    if (globalPool) {
      // End all existing connections
      await globalPool.end();
    }
    
    // Create a new pool
    createPool();
    log('Database connection pool reset successfully', 'db');
  } catch (error) {
    log(`Failed to reset database connection pool: ${error}`, 'db');
    // Don't throw here as this is a recovery mechanism
  }
}

/**
 * Starts a periodic health check for the connection pool
 */
function startPoolHealthCheck(): void {
  // Only run in production to avoid unnecessary overhead in development
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  
  setInterval(async () => {
    if (!globalPool) return;
    
    try {
      // Simple query to check connection
      await globalPool.query('SELECT 1');
    } catch (error) {
      log(`Health check failed: ${error}`, 'db');
      resetPool();
    }
  }, HEALTH_CHECK_INTERVAL);
  
  log(`Database health check started (interval: ${HEALTH_CHECK_INTERVAL}ms)`, 'db');
}

/**
 * Close the connection pool and clean up resources
 * Call this when shutting down the application or when the pool
 * needs to be completely reset
 */
export async function closePool(): Promise<void> {
  if (globalPool) {
    log('Closing database connection pool', 'db');
    await globalPool.end();
    globalPool = null;
    log('Database connection pool closed successfully', 'db');
  }
}

/**
 * Get a client from the pool for transaction operations
 * Make sure to release the client when done
 */
export async function getClient() {
  const pool = getPool();
  return await pool.connect();
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
  try {
    return await queryFn();
  } catch (error: any) {
    if (
      retries > 0 &&
      (error.message.includes('Connection terminated') ||
        error.message.includes('Connection refused') ||
        error.message.includes('Connection timed out'))
    ) {
      log(`Retrying query, ${retries} attempts remaining...`, 'db');
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 500));
      return executeWithRetry(queryFn, retries - 1);
    }
    throw error;
  }
}

/**
 * Test the database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    log(`Database connection test failed: ${error}`, 'db');
    return false;
  }
}