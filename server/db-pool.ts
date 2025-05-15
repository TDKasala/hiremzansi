import { Pool, PoolConfig, neonConfig } from '@neondatabase/serverless';
import { log } from './vite';
import ws from 'ws';
import os from 'os';

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
  const isProduction = !isDev && !isTest;
  
  // Determine appropriate pool size based on environment
  // For production, set max connections to a reasonable value based on expected load
  // Default formula: num_cpu * 2 + 1 (but capped to avoid DB connection limits)
  const cpuCount = os.cpus().length;
  const maxPoolSize = isProduction ? Math.min(cpuCount * 2 + 1, 20) : (isDev ? 10 : 5);
  
  // Basic pool configuration
  const baseConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: maxPoolSize,
    idleTimeoutMillis: isProduction ? 60000 : 30000, // 1 minute in production, 30 seconds in dev
    connectionTimeoutMillis: isProduction ? 10000 : 5000, // Connection timeout (10s prod, 5s dev)
    ssl: isProduction || process.env.DATABASE_SSL === 'true', // Always use SSL in production
    application_name: 'atsboost_app', // Identify application in PostgreSQL logs
  };
  
  // Log the environment-specific configuration
  const envType = isDev ? 'development' : (isTest ? 'test' : 'production');
  log(`Setting up PostgreSQL connection pool (${envType} mode, max=${maxPoolSize} connections)`, 'postgres');
  
  // Special settings for different environments
  if (isDev) {
    return baseConfig;
  } else if (isTest) {
    return {
      ...baseConfig,
      max: 5, // Fewer connections for testing
      idleTimeoutMillis: 10000, // Shorter idle timeout for testing
      statement_timeout: 5000, // Shorter timeout for tests
    };
  } else {
    // Production settings
    return {
      ...baseConfig,
      // Production-specific timeouts
      statement_timeout: 15000, // Statement timeout (15 seconds)
      query_timeout: 20000, // Query timeout (20 seconds)
      // Connection pool maintenance
      max: maxPoolSize,
      min: 2, // Keep at least 2 connections open
      // Prevent connection leaks
      allowExitOnIdle: true,
      // Handle SSL properly
      ssl: process.env.DATABASE_DISABLE_SSL === 'true' ? false : true
    };
  }
};

// Connection check interval (in milliseconds)
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
let healthCheckInterval: NodeJS.Timeout | null = null;
let lastHealthCheckTime: number = Date.now();
let consecutiveErrors: number = 0;
const MAX_CONSECUTIVE_ERRORS = 3;

/**
 * Get a connection pool instance (singleton pattern)
 * This ensures we only create one pool for the entire application
 */
export function getPool(): Pool {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Create the pool with the appropriate configuration
    createPool();
    
    // Start pool health monitoring for production
    if (process.env.NODE_ENV === 'production') {
      startPoolHealthCheck();
    }
  }
  
  return _pool!;
}

/**
 * Create a new connection pool with current configuration
 */
function createPool(): void {
  try {
    _pool = new Pool(getPoolConfig());
    
    // Add connection event handlers
    _pool.on('connect', () => {
      log('New client connected to PostgreSQL', 'postgres');
    });
    
    _pool.on('error', (err) => {
      log(`PostgreSQL pool error: ${err.message}`, 'postgres');
      
      // In production, handle critical errors that might indicate we should recreate the pool
      if (process.env.NODE_ENV === 'production') {
        const criticalErrors = [
          'connection terminated unexpectedly',
          'connection terminated',
          'terminating connection due to administrator command',
          'too many clients already'
        ];
        
        if (criticalErrors.some(errMsg => err.message.includes(errMsg))) {
          consecutiveErrors++;
          log(`Critical database error detected (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS})`, 'postgres');
          
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            log('Too many consecutive errors, attempting to recreate pool', 'postgres');
            resetPool();
          }
        }
      }
    });
    
    // Reset consecutive errors counter on successful pool creation
    consecutiveErrors = 0;
    log('PostgreSQL connection pool created successfully', 'postgres');
  }
  catch (err) {
    console.error('Failed to create PostgreSQL connection pool:', err);
    throw err;
  }
}

/**
 * Reset the connection pool
 * This is used when we detect critical errors and need to reconnect
 */
async function resetPool(): Promise<void> {
  try {
    // Stop the health check before resetting pool
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = null;
    }
    
    // Close existing pool if it exists
    if (_pool) {
      log('Closing existing connection pool before reset', 'postgres');
      try {
        await _pool.end();
      } catch (err) {
        // Just log the error, don't throw
        console.error('Error closing pool during reset:', err);
      }
      _pool = null;
    }
    
    // Create a new pool
    log('Creating new connection pool after reset', 'postgres');
    createPool();
    
    // Restart health check
    if (process.env.NODE_ENV === 'production') {
      startPoolHealthCheck();
    }
    
    log('PostgreSQL connection pool reset completed', 'postgres');
  } catch (err) {
    console.error('Failed to reset PostgreSQL connection pool:', err);
    // Don't throw, as this might be called from a background process
    // We'll try again on the next health check
  }
}

/**
 * Starts a periodic health check for the connection pool
 */
function startPoolHealthCheck(): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  healthCheckInterval = setInterval(async () => {
    try {
      // Skip if another health check is in progress
      if (Date.now() - lastHealthCheckTime < HEALTH_CHECK_INTERVAL * 0.8) {
        return;
      }
      
      lastHealthCheckTime = Date.now();
      log('Running database connection health check', 'postgres');
      
      if (!_pool) {
        log('Pool does not exist during health check, recreating...', 'postgres');
        createPool();
        return;
      }
      
      // Simple query to verify connection is working
      const result = await _pool.query('SELECT 1 as connection_test');
      if (result.rows[0].connection_test === 1) {
        // Health check passed
        consecutiveErrors = 0;
      } else {
        // Unexpected result
        throw new Error('Unexpected result from health check query');
      }
    } catch (err) {
      console.error('Database health check failed:', err);
      consecutiveErrors++;
      
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        log(`Health check failed ${consecutiveErrors} times, resetting pool`, 'postgres');
        await resetPool();
      }
    }
  }, HEALTH_CHECK_INTERVAL);
  
  log('Started PostgreSQL connection health monitoring', 'postgres');
}

/**
 * Close the connection pool and clean up resources
 * Call this when shutting down the application or when the pool
 * needs to be completely reset
 */
export async function closePool(): Promise<void> {
  // First, stop the health check if running
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    log('PostgreSQL health check stopped', 'postgres');
  }
  
  // Close the connection pool
  if (_pool) {
    try {
      // Use drain to allow existing queries to complete
      // before closing the pool
      if (process.env.NODE_ENV === 'production') {
        log('Draining PostgreSQL connection pool...', 'postgres');
        // Implement a timeout for the drain operation
        const drainTimeout = setTimeout(() => {
          log('Pool drain timeout reached, forcing close', 'postgres');
          _pool?.end().catch(err => {
            console.error('Error ending pool after drain timeout:', err);
          });
        }, 5000); // 5 second timeout
        
        // Try to drain connections gracefully
        await _pool.end();
        clearTimeout(drainTimeout);
      } else {
        // In dev/test, close immediately
        await _pool.end();
      }
      
      _pool = null;
      log('PostgreSQL connection pool closed successfully', 'postgres');
    } catch (err) {
      console.error('Error closing PostgreSQL connection pool:', err);
      // Force reset the pool reference even if there was an error
      _pool = null;
      throw err;
    }
  } else {
    log('No active PostgreSQL connection pool to close', 'postgres');
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