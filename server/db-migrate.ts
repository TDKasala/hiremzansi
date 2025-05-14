import { db, pool } from './db';
import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';
import { log } from './vite';

/**
 * Database migration manager for ATSBoost
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

// Run all pending migrations
export async function runMigrations(): Promise<string[]> {
  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    log(`Found ${appliedMigrations.length} previously applied migrations`, 'migrations');
    
    // Get all migration files
    const migrationFiles = getMigrationFiles();
    log(`Found ${migrationFiles.length} migration files`, 'migrations');
    
    // Determine pending migrations
    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrations.includes(file)
    );
    
    if (pendingMigrations.length === 0) {
      log('No pending migrations to apply', 'migrations');
      return [];
    }
    
    log(`Applying ${pendingMigrations.length} migrations...`, 'migrations');
    
    // Apply each pending migration
    for (const migration of pendingMigrations) {
      await applyMigration(migration);
    }
    
    log('All migrations applied successfully', 'migrations');
    return pendingMigrations;
  } catch (error) {
    console.error('Migration failed:', error);
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