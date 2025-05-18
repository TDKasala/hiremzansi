import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '@shared/schema';
import { getPool } from './db-pool';
import { eq } from 'drizzle-orm';
import { log } from './vite';
// We'll need to create a simple password hashing utility since we don't have access to auth
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Database initialization options
 */
interface InitOptions {
  skipAdminUser?: boolean;     // Skip creating admin user
  skipPlans?: boolean;         // Skip creating default plans
  retryOnFailure?: boolean;    // Retry initialization if it fails
  maxRetries?: number;         // Maximum number of retries
}

const DEFAULT_INIT_OPTIONS: InitOptions = {
  skipAdminUser: false,
  skipPlans: false,
  retryOnFailure: true,
  maxRetries: 3
};

/**
 * Initializes the database with essential data if not already present.
 * This ensures that when the application starts in production, the database
 * will have the necessary data to function properly.
 * 
 * @param options Initialization options
 * @returns Promise resolving to true if initialization succeeded, false otherwise
 */
export async function initializeDatabase(options?: InitOptions): Promise<boolean> {
  const opts = { ...DEFAULT_INIT_OPTIONS, ...options };
  log('Initializing database...', 'db');
  
  try {
    const pool = getPool();
    const db = drizzle(pool, { schema });
    
    // Basic connection test
    await pool.query('SELECT 1');
    
    // Check if plans table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'plans'
      )
    `);
    
    // If schema doesn't exist, run drizzle push
    if (!tableCheck.rows[0].exists) {
      log('Schema does not exist. Running schema push...', 'db');
      
      // Create schema through the script
      const { exec } = require('child_process');
      await new Promise((resolve, reject) => {
        exec('npx drizzle-kit push:pg', (error: any, stdout: string, stderr: string) => {
          if (error) {
            log(`Schema push failed: ${error.message}`, 'db');
            reject(error);
            return;
          }
          log('Schema created successfully', 'db');
          resolve(stdout);
        });
      });
    }
    
    // Run production optimizations
    await optimizeForProduction();
    
    // Seed essential data
    if (!opts.skipPlans) {
      await checkPlans();
    }
    
    if (!opts.skipAdminUser) {
      await checkAdminUser();
    }
    
    log('Database initialization completed successfully', 'db');
    return true;
  } catch (error) {
    log(`Database initialization failed: ${error}`, 'db');
    
    if (opts.retryOnFailure && opts.maxRetries && opts.maxRetries > 0) {
      log(`Retrying database initialization (${opts.maxRetries} retries left)...`, 'db');
      return initializeDatabase({
        ...opts,
        maxRetries: opts.maxRetries - 1
      });
    }
    
    return false;
  }
}

/**
 * Apply production-specific database optimizations
 */
async function optimizeForProduction(): Promise<void> {
  if (process.env.NODE_ENV !== 'production') return;
  
  try {
    const pool = getPool();
    
    // Set reasonable work_mem for better query performance
    await pool.query('SET work_mem = \'16MB\'');
    
    // Set statement timeout to prevent long-running queries
    await pool.query('SET statement_timeout = \'30s\'');
    
    log('Applied production database optimizations', 'db');
  } catch (error) {
    log(`Failed to apply production optimizations: ${error}`, 'db');
    // Non-critical error, continue with initialization
  }
}

async function checkAdminUser() {
  try {
    const pool = getPool();
    const db = drizzle(pool, { schema });
    
    // Check if admin user exists
    const adminUser = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, 'admin@atsboost.co.za'))
      .limit(1);
    
    if (adminUser.length === 0) {
      await createAdminUser();
    } else {
      log('Admin user already exists, skipping creation', 'db');
    }
  } catch (error) {
    log(`Error checking admin user: ${error}`, 'db');
    throw error;
  }
}

async function createAdminUser() {
  try {
    const pool = getPool();
    const db = drizzle(pool, { schema });
    
    // Create admin user with hashed password
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ATSboost@2025!';
    const hashedPassword = await hashPassword(adminPassword);
    
    const [admin] = await db.insert(schema.users)
      .values({
        email: 'admin@atsboost.co.za',
        username: 'admin',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    log('Admin user created successfully', 'db');
  } catch (error) {
    log(`Error creating admin user: ${error}`, 'db');
    throw error;
  }
}

async function checkPlans() {
  try {
    const pool = getPool();
    const db = drizzle(pool, { schema });
    
    // Check if plans exist
    const existingPlans = await db.select().from(schema.plans);
    
    if (existingPlans.length === 0) {
      await createDefaultPlans();
    } else {
      log(`Found ${existingPlans.length} existing plans, skipping creation`, 'db');
    }
  } catch (error) {
    log(`Error checking plans: ${error}`, 'db');
    throw error;
  }
}

async function createDefaultPlans() {
  try {
    // Import and run the seed plans function
    const { seedPlans } = require('./migrations/001_seed_plans');
    await seedPlans();
    log('Default plans created successfully', 'db');
  } catch (error) {
    log(`Error creating default plans: ${error}`, 'db');
    throw error;
  }
}