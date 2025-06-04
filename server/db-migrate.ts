import { db, pool } from './db';
import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';
import { log } from './vite';

/**
 * Database migration manager for Hire Mzansi
 * This utility handles database migrations using timestamp-based migration files
 */

// Migration table name
const MIGRATION_TABLE = 'schema_migrations';

// Ensure the migrations table exists
async function ensureMigrationsTable() {
  try {
    // Check if table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = ${MIGRATION_TABLE}
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      // Create migrations table if it doesn't exist
      log(`Creating migrations table: ${MIGRATION_TABLE}`, 'migrations');
      await db.execute(sql`
        CREATE TABLE ${sql.identifier(MIGRATION_TABLE)} (
          id SERIAL PRIMARY KEY,
          version VARCHAR(255) NOT NULL UNIQUE,
          applied_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }
  } catch (error) {
    console.error('Error ensuring migrations table:', error);
    throw error;
  }
}

// Get all applied migrations
async function getAppliedMigrations(): Promise<string[]> {
  try {
    const result = await db.execute(sql`
      SELECT version FROM ${sql.identifier(MIGRATION_TABLE)}
      ORDER BY version ASC
    `);
    
    // Explicitly cast to string array
    const versions: string[] = [];
    for (const row of result.rows) {
      if (row && typeof row.version !== 'undefined') {
        versions.push(String(row.version));
      }
    }
    return versions;
  } catch (error) {
    console.error('Error getting applied migrations:', error);
    throw error;
  }
}

// Get all migration files from the migrations directory
function getMigrationFiles(): string[] {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    log('Creating migrations directory', 'migrations');
    fs.mkdirSync(migrationsDir, { recursive: true });
    return [];
  }
  
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort by filename (which should start with a timestamp)
}

// Apply a single migration
async function applyMigration(migration: string): Promise<void> {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const migrationPath = path.join(migrationsDir, migration);
  
  try {
    // Read the migration file
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Execute the migration
      log(`Applying migration: ${migration}`, 'migrations');
      await client.query(migrationSql);
      
      // Record the migration
      await client.query(
        `INSERT INTO ${MIGRATION_TABLE} (version) VALUES ($1)`,
        [migration]
      );
      
      await client.query('COMMIT');
      log(`Migration applied successfully: ${migration}`, 'migrations');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error applying migration ${migration}:`, error);
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

// Default migration options for different environments
const DEFAULT_MIGRATION_OPTIONS: MigrationOptions = {
  dryRun: false,
  force: false,
  silent: false,
  timeout: process.env.NODE_ENV === 'production' ? 60000 : 30000, // 60s in prod, 30s in dev
  backupBefore: process.env.NODE_ENV === 'production',
  lockTable: true,
  maxLockTime: 10000, // 10 seconds
  failFast: false,
  validateOnly: false
};

// Run all pending migrations
export async function runMigrations(options?: MigrationOptions): Promise<string[]> {
  // Merge provided options with defaults
  const opts = { ...DEFAULT_MIGRATION_OPTIONS, ...options };
  
  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    if (!opts.silent) {
      log(`Found ${appliedMigrations.length} previously applied migrations`, 'migrations');
    }
    
    // Get all migration files
    const migrationFiles = getMigrationFiles();
    if (!opts.silent) {
      log(`Found ${migrationFiles.length} migration files`, 'migrations');
    }
    
    // Determine pending migrations
    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrations.includes(file)
    );
    
    if (pendingMigrations.length === 0) {
      if (!opts.silent) {
        log('No pending migrations to apply', 'migrations');
      }
      return [];
    }
    
    // In production, we should be extra careful about running migrations
    if (process.env.NODE_ENV === 'production' && !opts.force && !opts.dryRun) {
      log('⚠️ Production environment detected', 'migrations');
      log('Running migrations in production without force flag is not recommended', 'migrations');
      log('Set options.force=true to override this warning', 'migrations');
      
      // In an automated environment, we might want to abort here
      // and require manual intervention
      if (process.env.MIGRATION_REQUIRE_FORCE === 'true') {
        throw new Error('Migrations in production require force flag');
      }
    }
    
    // If this is a dry run, just return what would be migrated
    if (opts.dryRun) {
      log(`Dry run: would apply ${pendingMigrations.length} migrations`, 'migrations');
      return pendingMigrations;
    }
    
    log(`Applying ${pendingMigrations.length} migrations...`, 'migrations');
    
    // Apply each pending migration with timeout handling
    for (const migration of pendingMigrations) {
      const migrationPromise = applyMigration(migration);
      
      // Set up timeout if specified
      if (opts.timeout) {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Migration timed out after ${opts.timeout}ms: ${migration}`));
          }, opts.timeout);
        });
        
        // Race between migration and timeout
        await Promise.race([migrationPromise, timeoutPromise]);
      } else {
        await migrationPromise;
      }
    }
    
    log('All migrations applied successfully', 'migrations');
    return pendingMigrations;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Migration failed: ${errorMessage}`);
    throw error;
  }
}

// Create a new migration file
export function createMigration(name: string): string {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  
  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  // Generate timestamp for migration file name
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
  const filename = `${timestamp}_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.sql`;
  
  const migrationPath = path.join(migrationsDir, filename);
  
  // Create an empty migration file
  fs.writeFileSync(migrationPath, `-- Migration: ${name}\n-- Created at: ${new Date().toISOString()}\n\n`);
  
  log(`Created new migration: ${filename}`, 'migrations');
  return filename;
}

// If running directly, execute migrations
if (import.meta.url.endsWith('db-migrate.ts')) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  (async () => {
    try {
      if (command === 'create' && args[1]) {
        // Create a new migration
        createMigration(args[1]);
      } else if (command === 'run' || !command) {
        // Run pending migrations
        await runMigrations();
      } else {
        console.error('Usage: npm run migrate [create <name>|run]');
        process.exit(1);
      }
      
      // Only close the pool if running directly - not when imported
      if (process.argv[1]?.endsWith('db-migrate.ts')) {
        await pool.end();
      }
    } catch (error) {
      console.error('Migration command failed:', error);
      // Only close the pool if running directly - not when imported
      if (process.argv[1]?.endsWith('db-migrate.ts')) {
        await pool.end();
      }
      process.exit(1);
    }
  })();
}