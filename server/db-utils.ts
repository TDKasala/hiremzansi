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
    let schema = '-- ATSBoost Database Schema\n-- Generated on ' + new Date().toISOString() + '\n\n';
    
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

// Check database health and connection status
export async function checkDatabaseHealth() {
  try {
    console.log('Checking database health...');
    
    // Basic connectivity test
    const result = await pool.query('SELECT 1 as connection_test');
    
    if (result.rows[0].connection_test === 1) {
      console.log('✓ Database connection is healthy');
    }
    
    // Check PostgreSQL version
    const versionResult = await pool.query('SELECT version()');
    console.log(`✓ PostgreSQL version: ${versionResult.rows[0].version}`);
    
    // Get database size
    const sizeQuery = `
      SELECT pg_size_pretty(pg_database_size(current_database())) as db_size;
    `;
    const sizeResult = await pool.query(sizeQuery);
    console.log(`✓ Current database size: ${sizeResult.rows[0].db_size}`);
    
    // Count records in main tables
    const tables = ['users', 'cvs', 'ats_scores', 'sa_profiles'];
    
    for (const table of tables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✓ Table ${table}: ${countResult.rows[0].count} records`);
      } catch (err) {
        console.log(`✗ Table ${table}: Error getting count`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
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