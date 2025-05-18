import { Pool } from '@neondatabase/serverless';
import { getPool } from './db-pool';
import { log } from './vite';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate documentation for the database schema
 * Useful for documenting the data model for development purposes
 */
export async function generateSchemaDocs() {
  try {
    const pool = getPool();
    
    // Get list of tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    let documentation = '# ATSBoost Database Schema Documentation\n\n';
    documentation += `Generated on ${new Date().toISOString()}\n\n`;
    
    // For each table, get columns, constraints, and indexes
    for (const tableName of tables) {
      documentation += `## Table: ${tableName}\n\n`;
      
      // Get columns
      const columnsResult = await pool.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      // Add column information
      documentation += '### Columns\n\n';
      documentation += '| Name | Type | Nullable | Default |\n';
      documentation += '| ---- | ---- | -------- | ------- |\n';
      
      for (const column of columnsResult.rows) {
        documentation += `| ${column.column_name} | ${column.data_type} | ${column.is_nullable} | ${column.column_default || ''} |\n`;
      }
      
      documentation += '\n';
      
      // Get primary keys
      const pkResult = await pool.query(`
        SELECT 
          c.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage AS ccu
          USING (constraint_schema, constraint_name)
        JOIN information_schema.columns AS c
          ON c.table_schema = tc.constraint_schema
          AND tc.table_name = c.table_name 
          AND ccu.column_name = c.column_name
        WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = $1
      `, [tableName]);
      
      if (pkResult.rows.length > 0) {
        documentation += '### Primary Key\n\n';
        documentation += pkResult.rows.map(row => row.column_name).join(', ') + '\n\n';
      }
      
      // Get foreign keys
      const fkResult = await pool.query(`
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1
      `, [tableName]);
      
      if (fkResult.rows.length > 0) {
        documentation += '### Foreign Keys\n\n';
        documentation += '| Column | References |\n';
        documentation += '| ------ | ---------- |\n';
        
        for (const fk of fkResult.rows) {
          documentation += `| ${fk.column_name} | ${fk.foreign_table_name}.${fk.foreign_column_name} |\n`;
        }
        
        documentation += '\n';
      }
      
      // Add a separator between tables
      documentation += '---\n\n';
    }
    
    // Write documentation to file
    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(docsDir, 'db-schema.md'),
      documentation
    );
    
    log('Database schema documentation generated successfully', 'db');
    return true;
  } catch (error) {
    log(`Error generating schema docs: ${error}`, 'db');
    return false;
  }
}

interface HealthStatus {
  isHealthy: boolean;
  connectionOk: boolean;
  version: string | null;
  size: { formatted: string; bytes: number } | null;
  connectionCount: number | null;
  connectionUsage: number | null;
  tableStats: Record<string, number>;
  slowQueries: Array<{
    pid: number;
    duration: string;
    state: string;
    queryPreview: string;
  }>;
  issues: string[];
}

/**
 * Check database health and return detailed status information
 * @param detailed Set to true to include more detailed information (slower)
 */
export async function checkDatabaseHealth(detailed = true): Promise<HealthStatus> {
  try {
    const pool = getPool();
    let isHealthy = true;
    const issues: string[] = [];
    
    // Basic connection test
    let connectionOk = false;
    let version = null;
    
    try {
      const versionResult = await pool.query('SELECT version()');
      connectionOk = true;
      version = versionResult.rows[0].version;
    } catch (error) {
      isHealthy = false;
      issues.push(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    const healthStatus: HealthStatus = {
      isHealthy,
      connectionOk,
      version,
      size: null,
      connectionCount: null,
      connectionUsage: null,
      tableStats: {},
      slowQueries: [],
      issues
    };
    
    // If connection failed, return what we have
    if (!connectionOk) {
      return healthStatus;
    }
    
    if (detailed) {
      try {
        // Database size
        const sizeResult = await pool.query(`
          SELECT pg_size_pretty(pg_database_size(current_database())) as formatted,
                 pg_database_size(current_database()) as bytes
        `);
        healthStatus.size = {
          formatted: sizeResult.rows[0].formatted,
          bytes: parseInt(sizeResult.rows[0].bytes, 10)
        };
        
        // Connection stats
        const connResult = await pool.query(`
          SELECT count(*) as count, 
                 (count(*) * 100 / (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')) as usage_percent
          FROM pg_stat_activity
        `);
        healthStatus.connectionCount = parseInt(connResult.rows[0].count, 10);
        healthStatus.connectionUsage = parseFloat(connResult.rows[0].usage_percent);
        
        if (healthStatus.connectionUsage > 80) {
          isHealthy = false;
          issues.push(`High connection usage: ${healthStatus.connectionUsage.toFixed(2)}%`);
        }
        
        // Table stats
        const tableStats = await pool.query(`
          SELECT relname as table_name, n_live_tup as row_count
          FROM pg_stat_user_tables
          ORDER BY row_count DESC
        `);
        
        tableStats.rows.forEach((row: { table_name: string; row_count: string }) => {
          healthStatus.tableStats[row.table_name] = parseInt(row.row_count, 10);
        });
        
        // Find slow queries
        const slowQueriesResult = await pool.query(`
          SELECT pid, now() - query_start as duration, state, substr(query, 1, 100) as query_preview
          FROM pg_stat_activity
          WHERE state != 'idle' AND query_start < now() - interval '30 seconds'
          ORDER BY query_start
        `);
        
        healthStatus.slowQueries = slowQueriesResult.rows.map((row: any) => ({
          pid: row.pid,
          duration: row.duration,
          state: row.state,
          queryPreview: row.query_preview
        }));
        
        if (healthStatus.slowQueries.length > 0) {
          isHealthy = false;
          issues.push(`Found ${healthStatus.slowQueries.length} slow running queries`);
        }
      } catch (error) {
        log(`Error in detailed health check: ${error}`, 'db');
        issues.push(`Error running detailed checks: ${error instanceof Error ? error.message : String(error)}`);
        isHealthy = false;
      }
    }
    
    healthStatus.isHealthy = isHealthy;
    healthStatus.issues = issues;
    
    return healthStatus;
  } catch (error) {
    log(`Database health check failed: ${error}`, 'db');
    
    return {
      isHealthy: false,
      connectionOk: false,
      version: null,
      size: null,
      connectionCount: null,
      connectionUsage: null,
      tableStats: {},
      slowQueries: [],
      issues: [`Health check failed: ${error instanceof Error ? error.message : String(error)}`]
    };
  }
}