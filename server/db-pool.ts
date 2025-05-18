import { Pool, PoolConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { log } from './vite';

// Set WebSocket for Neon database
require('@neondatabase/serverless').neonConfig.webSocketConstructor = ws;

// Global pool instance (singleton)
let globalPool: Pool | null = null;

// Connection pool health monitoring
let healthCheckInterval: NodeJS.Timeout | null = null;

const getPoolConfig = (): PoolConfig => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  const baseConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
    max: process.env.NODE_ENV === 'production' ? 20 : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
  
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
  const config = getPoolConfig();
  globalPool = new Pool(config);
  
  // Monitor pool health
  startPoolHealthCheck();
  
  // Setup event handlers
  globalPool.on('connect', (client) => {
    log(`Client connected to database`, 'db');
  });
  
  globalPool.on('error', (err: Error) => {
    log(`Pool error: ${err.message}`, 'db');
    
    // On catastrophic error, reset the pool
    if (err.message.includes('terminated abnormally') || 
        err.message.includes('database does not exist') || 
        err.message.includes('too many clients')) {
      resetPool();
    }
  });
}

/**
 * Reset the connection pool
 * This is used when we detect critical errors and need to reconnect
 */
async function resetPool(): Promise<void> {
  log('Resetting database connection pool...', 'db');
  
  try {
    if (globalPool) {
      // Clear health check
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
      }
      
      // Drain and end the pool
      await globalPool.end();
    }
  } catch (error) {
    log(`Error while closing pool: ${error}`, 'db');
  } finally {
    // Create a new pool
    globalPool = null;
    createPool();
    log('Database connection pool has been reset', 'db');
  }
}

/**
 * Starts a periodic health check for the connection pool
 */
function startPoolHealthCheck(): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  // Check pool health every 30 seconds
  healthCheckInterval = setInterval(async () => {
    if (!globalPool) return;
    
    try {
      // Simple query to check connection
      const result = await globalPool.query('SELECT 1');
      if (result.rows[0]) {
        log('Database connection health check: OK', 'db');
      }
    } catch (error) {
      log(`Database connection health check failed: ${error}`, 'db');
      // Reset pool on repeated failures
      resetPool();
    }
  }, 30000);
}

/**
 * Close the connection pool and clean up resources
 * Call this when shutting down the application or when the pool
 * needs to be completely reset
 */
export async function closePool(): Promise<void> {
  log('Closing database connection pool...', 'db');
  
  try {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = null;
    }
    
    if (globalPool) {
      await globalPool.end();
      globalPool = null;
    }
    
    log('Database connection pool closed', 'db');
  } catch (error) {
    log(`Error closing database pool: ${error}`, 'db');
    throw error;
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
  let lastError: Error | null = null;
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error as Error;
      attempt++;
      
      // Only retry on connection issues
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isConnectionError = 
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('terminated');
      
      if (!isConnectionError) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(100 * Math.pow(2, attempt), 2000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Query failed after retries');
}

export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT NOW()');
    return !!result.rows[0].now;
  } catch (error) {
    log(`Test connection failed: ${error}`, 'db');
    return false;
  }
}