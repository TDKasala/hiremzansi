import { Pool } from '@neondatabase/serverless';
import { getPool } from './db-pool';
import { log } from './vite';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensures the migrations table exists in the database
 */
async function ensureMigrationsTable() {
  const pool = getPool();
  
  try {
    log('Checking migrations table...', 'db');
    
    // Check if migrations table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'migrations'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      log('Creating migrations table...', 'db');
      
      // Create migrations table
      await pool.query(`
        CREATE TABLE migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      log('Migrations table created successfully', 'db');
    } else {
      log('Migrations table already exists', 'db');
    }
  } catch (error) {
    log(`Error ensuring migrations table: ${error}`, 'db');
    throw error;
  }
}

/**
 * Gets the list of already applied migrations
 */
async function getAppliedMigrations(): Promise<string[]> {
  const pool = getPool();
  
  try {
    const result = await pool.query(`
      SELECT name FROM migrations
      ORDER BY applied_at
    `);
    
    return result.rows.map(row => row.name);
  } catch (error) {
    log(`Error getting applied migrations: ${error}`, 'db');
    throw error;
  }
}

/**
 * Gets the list of migration files from the migrations directory
 */
function getMigrationFiles(): string[] {
  const migrationsDir = path.join(process.cwd(), 'server', 'migrations');
  
  try {
    if (!fs.existsSync(migrationsDir)) {
      log('Migrations directory does not exist, creating...', 'db');
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Get all .js and .ts files from the migrations directory
    const files = fs.readdirSync(migrationsDir).filter(file => 
      (file.endsWith('.js') || file.endsWith('.ts')) && 
      !file.includes('test') && 
      file !== 'index.js' &&
      file !== 'index.ts'
    );
    
    // Sort to ensure consistent order
    return files.sort();
  } catch (error) {
    log(`Error getting migration files: ${error}`, 'db');
    throw error;
  }
}

/**
 * Applies a single migration
 */
async function applyMigration(migration: string): Promise<void> {
  const pool = getPool();
  const migrationsDir = path.join(process.cwd(), 'server', 'migrations');
  const migrationPath = path.join(migrationsDir, migration);
  
  try {
    log(`Applying migration: ${migration}`, 'db');
    
    // Import the migration file
    const migrationModule = require(migrationPath);
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Run the migration
      if (typeof migrationModule.up === 'function') {
        await migrationModule.up(client);
      } else if (typeof migrationModule.default === 'function') {
        await migrationModule.default(client);
      } else {
        // Look for any exported function
        const exportedFunction = Object.values(migrationModule).find(
          val => typeof val === 'function'
        );
        
        if (exportedFunction) {
          await exportedFunction(client);
        } else {
          throw new Error(`No migration function found in ${migration}`);
        }
      }
      
      // Record the migration
      await client.query(
        'INSERT INTO migrations (name) VALUES ($1)',
        [migration]
      );
      
      await client.query('COMMIT');
      log(`Migration ${migration} applied successfully`, 'db');
    } catch (error) {
      await client.query('ROLLBACK');
      log(`Error in migration ${migration}: ${error}`, 'db');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    log(`Failed to apply migration ${migration}: ${error}`, 'db');
    throw error;
  }
}

/**
 * Migration options interface
 */
interface MigrationOptions {
  dryRun?: boolean;       // Just check which migrations would be applied, but don't run them
  force?: boolean;        // Force migration even in production (normally requires confirmation)
  silent?: boolean;       // Reduce logging output
  timeout?: number;       // Timeout in ms for each migration (default 30s)
  backupBefore?: boolean; // Create database backup before migration (production only)
  lockTable?: boolean;    // Lock migration table during migration process
  maxLockTime?: number;   // Maximum time to wait for lock acquisition (ms)
  failFast?: boolean;     // Fail immediately on first error instead of rolling back
  validateOnly?: boolean; // Only validate SQL syntax without executing (if supported by DB)
}

const DEFAULT_MIGRATION_OPTIONS: MigrationOptions = {
  dryRun: false,
  force: false,
  silent: false,
  timeout: 30000,
  backupBefore: false,
  lockTable: true,
  maxLockTime: 5000,
  failFast: false,
  validateOnly: false
};

/**
 * Runs all pending migrations
 * @param options Migration options
 * @returns List of applied migrations
 */
export async function runMigrations(options?: MigrationOptions): Promise<string[]> {
  const opts = { ...DEFAULT_MIGRATION_OPTIONS, ...options };
  const pool = getPool();
  
  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    
    // Get all migration files
    const migrationFiles = getMigrationFiles();
    
    // Filter out already applied migrations
    const pendingMigrations = migrationFiles.filter(
      migration => !appliedMigrations.includes(migration)
    );
    
    // Check if there are any pending migrations
    if (pendingMigrations.length === 0) {
      log('No pending migrations', 'db');
      return [];
    }
    
    log(`Found ${pendingMigrations.length} pending migrations: ${pendingMigrations.join(', ')}`, 'db');
    
    // If dry run, just return the list of pending migrations
    if (opts.dryRun) {
      log('Dry run mode - no migrations applied', 'db');
      return pendingMigrations;
    }
    
    // Apply migrations
    const appliedMigrationsList: string[] = [];
    for (const migration of pendingMigrations) {
      await applyMigration(migration);
      appliedMigrationsList.push(migration);
    }
    
    log(`Applied ${appliedMigrationsList.length} migrations successfully`, 'db');
    return appliedMigrationsList;
  } catch (error) {
    log(`Migration failed: ${error}`, 'db');
    throw error;
  }
}

/**
 * Creates a new migration file
 * @param name Name of the migration
 * @returns Path to the created migration file
 */
export function createMigration(name: string): string {
  const migrationsDir = path.join(process.cwd(), 'server', 'migrations');
  
  try {
    if (!fs.existsSync(migrationsDir)) {
      log('Migrations directory does not exist, creating...', 'db');
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Format name: YYYYMMDD_HHMMSS_name.ts
    const timestamp = new Date().toISOString()
      .replace(/[T:-]/g, '')
      .replace(/\..+/, '');
    
    const safeName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    const fileName = `${timestamp}_${safeName}.ts`;
    const filePath = path.join(migrationsDir, fileName);
    
    // Create migration template
    const template = `/**
 * Migration: ${name}
 * Created at: ${new Date().toISOString()}
 */
import { PoolClient } from '@neondatabase/serverless';

export async function up(client: PoolClient) {
  // Write your migration here
  await client.query(\`
    -- Your SQL migration here
  \`);
}

export async function down(client: PoolClient) {
  // Write your rollback here (optional)
  await client.query(\`
    -- Your rollback SQL here
  \`);
}
`;
    
    fs.writeFileSync(filePath, template, 'utf8');
    log(`Created migration: ${fileName}`, 'db');
    
    return filePath;
  } catch (error) {
    log(`Error creating migration: ${error}`, 'db');
    throw error;
  }
}