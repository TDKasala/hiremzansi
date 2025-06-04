import fs from 'fs';
import path from 'path';
import { pool } from './db';

/**
 * Utility functions for database operations, particularly useful for development
 * and documentation purposes.
 */

// Create a directory if it doesn't exist
const ensureDirectoryExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Generate a SQL dump of the current schema for documentation
export async function generateSchemaDocs() {
  const docsDir = path.join(process.cwd(), 'docs');
  const schemaFile = path.join(docsDir, 'db-schema.sql');
  
  ensureDirectoryExists(docsDir);
  
  try {
    console.log('Generating schema documentation...');
    
    // Query to get all tables
    const tableQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
      AND table_type='BASE TABLE';
    `;
    
    const tableResult = await pool.query(tableQuery);
    let schema = '-- Hire Mzansi Database Schema\n-- Generated on ' + new Date().toISOString() + '\n\n';
    
    for (const row of tableResult.rows) {
      const tableName = row.table_name;
      
      // Get table structure
      const tableStructureQuery = `
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default
        FROM 
          information_schema.columns
        WHERE 
          table_name = $1
        ORDER BY 
          ordinal_position;
      `;
      
      const columnResult = await pool.query(tableStructureQuery, [tableName]);
      
      schema += `-- Table: ${tableName}\n`;
      schema += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      
      const columns = columnResult.rows.map(col => {
        let column = `  ${col.column_name} ${col.data_type}`;
        if (col.is_nullable === 'NO') {
          column += ' NOT NULL';
        }
        if (col.column_default) {
          column += ` DEFAULT ${col.column_default}`;
        }
        return column;
      });
      
      schema += columns.join(',\n');
      
      // Get primary key
      const pkQuery = `
        SELECT 
          c.column_name
        FROM 
          information_schema.table_constraints tc
        JOIN 
          information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name)
        JOIN 
          information_schema.columns AS c ON c.table_schema = tc.constraint_schema
          AND tc.table_name = c.table_name
          AND ccu.column_name = c.column_name
        WHERE 
          tc.constraint_type = 'PRIMARY KEY' 
          AND tc.table_name = $1;
      `;
      
      const pkResult = await pool.query(pkQuery, [tableName]);
      if (pkResult.rows.length > 0) {
        schema += `,\n  PRIMARY KEY (${pkResult.rows.map(row => row.column_name).join(', ')})`;
      }
      
      schema += '\n);\n\n';
      
      // Get foreign keys
      const fkQuery = `
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM
          information_schema.table_constraints AS tc
        JOIN
          information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
        JOIN
          information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
        WHERE
          tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = $1;
      `;
      
      const fkResult = await pool.query(fkQuery, [tableName]);
      
      for (const fk of fkResult.rows) {
        schema += `-- Foreign Key: ${fk.constraint_name}\n`;
        schema += `ALTER TABLE ${tableName} ADD CONSTRAINT ${fk.constraint_name} ` +
                  `FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name});\n\n`;
      }
      
      // Add indexes
      const indexQuery = `
        SELECT
          indexname,
          indexdef
        FROM
          pg_indexes
        WHERE
          tablename = $1
          AND schemaname = 'public';
      `;
      
      const indexResult = await pool.query(indexQuery, [tableName]);
      
      for (const idx of indexResult.rows) {
        // Skip primary key indexes as they're already defined above
        if (!idx.indexname.endsWith('_pkey')) {
          schema += `-- Index: ${idx.indexname}\n`;
          schema += `${idx.indexdef};\n\n`;
        }
      }
    }
    
    fs.writeFileSync(schemaFile, schema);
    console.log(`Schema documentation generated at ${schemaFile}`);
    return schemaFile;
  } catch (error) {
    console.error('Error generating schema documentation:', error);
    throw error;
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

// Check database health and connection status
export async function checkDatabaseHealth(detailed = true): Promise<HealthStatus> {
  try {
    console.log('Checking database health...');
    const healthStatus: HealthStatus = {
      isHealthy: false,
      connectionOk: false,
      version: null,
      size: null,
      connectionCount: null,
      connectionUsage: null,
      tableStats: {},
      slowQueries: [],
      issues: [],
    };
    
    // Basic connectivity test
    const result = await pool.query('SELECT 1 as connection_test');
    
    if (result.rows[0].connection_test === 1) {
      console.log('✓ Database connection is healthy');
      healthStatus.connectionOk = true;
    } else {
      healthStatus.issues.push('Failed basic connection test');
    }
    
    // Skip further checks if connection failed
    if (!healthStatus.connectionOk) {
      return healthStatus;
    }
    
    try {
      // Check PostgreSQL version
      const versionResult = await pool.query('SELECT version()');
      const version = versionResult.rows[0].version;
      console.log(`✓ PostgreSQL version: ${version}`);
      healthStatus.version = version;
      
      // Get database size
      const sizeQuery = `
        SELECT pg_size_pretty(pg_database_size(current_database())) as db_size,
               pg_database_size(current_database()) as db_size_bytes;
      `;
      const sizeResult = await pool.query(sizeQuery);
      console.log(`✓ Current database size: ${sizeResult.rows[0].db_size}`);
      healthStatus.size = {
        formatted: sizeResult.rows[0].db_size,
        bytes: parseInt(sizeResult.rows[0].db_size_bytes, 10)
      };
      
      // Additional detailed checks for production environments
      if (detailed && process.env.NODE_ENV === 'production') {
        // Check active connections
        const connectionsQuery = `
          SELECT count(*) as active_connections,
                (SELECT setting::integer FROM pg_settings WHERE name = 'max_connections') as max_connections
          FROM pg_stat_activity 
          WHERE datname = current_database();
        `;
        const connectionsResult = await pool.query(connectionsQuery);
        const activeConnections = parseInt(connectionsResult.rows[0].active_connections, 10);
        const maxConnections = parseInt(connectionsResult.rows[0].max_connections, 10);
        const connectionPercent = Math.round((activeConnections / maxConnections) * 100);
        
        console.log(`✓ Database connections: ${activeConnections}/${maxConnections} (${connectionPercent}%)`);
        healthStatus.connectionCount = activeConnections;
        healthStatus.connectionUsage = connectionPercent;
        
        // Warning if connection usage is high
        if (connectionPercent > 80) {
          console.log(`⚠️ High connection usage: ${connectionPercent}%`);
          healthStatus.issues.push(`High connection usage: ${connectionPercent}%`);
        }
        
        // Check for long-running queries (potential issues)
        const longQueriesQuery = `
          SELECT pid, 
                 now() - query_start as duration, 
                 state, 
                 substring(query, 1, 100) as query_preview
          FROM pg_stat_activity 
          WHERE state != 'idle' 
            AND query_start < now() - interval '30 seconds'
            AND datname = current_database()
          ORDER BY duration DESC;
        `;
        const longQueriesResult = await pool.query(longQueriesQuery);
        
        if (longQueriesResult.rows.length > 0) {
          console.log(`⚠️ Found ${longQueriesResult.rows.length} long-running queries`);
          healthStatus.slowQueries = longQueriesResult.rows.map(q => ({
            pid: q.pid,
            duration: q.duration,
            state: q.state,
            queryPreview: q.query_preview
          }));
          
          healthStatus.issues.push(`${longQueriesResult.rows.length} long-running queries detected`);
        }
      }
      
      // Count records in main tables
      const tables = ['users', 'cvs', 'ats_scores', 'sa_profiles'];
      healthStatus.tableStats = {};
      
      for (const table of tables) {
        try {
          const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
          const count = parseInt(countResult.rows[0].count, 10);
          console.log(`✓ Table ${table}: ${count} records`);
          healthStatus.tableStats[table] = count;
        } catch (err) {
          console.log(`✗ Table ${table}: Error getting count`);
          healthStatus.issues.push(`Could not query table ${table}`);
        }
      }
    } catch (err) {
      console.error('Error during detailed health checks:', err);
      healthStatus.issues.push('Failed during detailed health checks');
    }
    
    // Overall health assessment
    healthStatus.isHealthy = healthStatus.connectionOk && healthStatus.issues.length === 0;
    
    return healthStatus;
  } catch (error) {
    console.error('Database health check failed:', error);
    // Create empty health status with error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      isHealthy: false, 
      connectionOk: false,
      version: null,
      size: null,
      connectionCount: null,
      connectionUsage: null,
      tableStats: {},
      slowQueries: [],
      issues: ['Database health check failed with error: ' + errorMessage]
    };
  }
}

// If this script is run directly, perform all checks
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  Promise.all([
    checkDatabaseHealth(),
    generateSchemaDocs()
  ])
  .then(() => {
    console.log('Database utilities completed successfully');
    pool.end();
  })
  .catch((err) => {
    console.error('Database utilities failed:', err);
    pool.end();
    process.exit(1);
  });
}