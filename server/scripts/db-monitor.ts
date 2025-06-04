/**
 * Database monitoring script for production environments
 * 
 * Run with: npm run db:monitor
 * 
 * This script provides detailed information about the database status,
 * including connection health, query performance, and table statistics.
 */

import { checkDatabaseHealth } from '../db-utils';
import { getPool, executeWithRetry } from '../db-pool';
import { log } from '../vite';

// Get the database pool
const pool = getPool();

async function monitorDatabase() {
  console.log('===== Hire Mzansi Database Monitor =====');
  console.log('Time:', new Date().toISOString());
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  try {
    // Basic health check
    console.log('\n----- Database Health Check -----');
    const healthStatus = await checkDatabaseHealth(true);
    
    if (healthStatus.isHealthy) {
      console.log('✅ Database is healthy');
    } else {
      console.log('⚠️ Database health issues detected:');
      for (const issue of healthStatus.issues) {
        console.log(`  - ${issue}`);
      }
    }
    
    // Only continue if we can connect to the database
    if (!healthStatus.connectionOk) {
      console.error('Cannot connect to database. Aborting monitoring.');
      process.exit(1);
    }
    
    // Query performance statistics
    console.log('\n----- Query Performance -----');
    const slowQueriesQuery = `
      SELECT pid, 
             now() - query_start as duration, 
             state, 
             substring(query, 1, 120) as query_preview
      FROM pg_stat_activity 
      WHERE state != 'idle' 
        AND query_start < now() - interval '5 seconds'
      ORDER BY duration DESC
      LIMIT 5;
    `;
    
    const slowQueriesResult = await executeWithRetry(() => pool.query(slowQueriesQuery));
    
    if (!slowQueriesResult.rows || slowQueriesResult.rows.length === 0) {
      console.log('No slow queries currently running.');
    } else {
      console.log('Top 5 longest running queries:');
      for (const query of slowQueriesResult.rows) {
        console.log(`  - [${query.pid}] ${query.duration} - ${query.query_preview}...`);
      }
    }
    
    // Database size information
    console.log('\n----- Database Size Information -----');
    const sizeQuery = `
      SELECT
        pg_database.datname as database_name,
        pg_size_pretty(pg_database_size(pg_database.datname)) as size,
        pg_database_size(pg_database.datname) as size_bytes
      FROM pg_database
      WHERE datname = current_database();
    `;
    
    const sizeResult = await executeWithRetry(() => pool.query(sizeQuery));
    if (sizeResult.rows && sizeResult.rows.length > 0 && 'size' in sizeResult.rows[0]) {
      console.log(`Database size: ${sizeResult.rows[0].size}`);
    } else {
      console.log('Database size information not available');
    }
    
    // Table size information
    console.log('\n----- Table Sizes -----');
    const tableSizeQuery = `
      SELECT
        relname as table_name,
        pg_size_pretty(pg_total_relation_size(relid)) as total_size,
        pg_size_pretty(pg_relation_size(relid)) as table_size,
        pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as index_size
      FROM pg_catalog.pg_statio_user_tables
      ORDER BY pg_total_relation_size(relid) DESC
      LIMIT 10;
    `;
    
    const tableSizeResult = await executeWithRetry(() => pool.query(tableSizeQuery));
    console.log('Top 10 tables by size:');
    console.log('| Table Name | Total Size | Table Size | Index Size |');
    console.log('|------------|------------|------------|------------|');
    
    if (tableSizeResult.rows && tableSizeResult.rows.length > 0) {
      for (const table of tableSizeResult.rows) {
        // Safely access properties with type checking
        const tableName = typeof table.table_name === 'string' ? table.table_name : 'unknown';
        const totalSize = typeof table.total_size === 'string' ? table.total_size : 'unknown';
        const tableSize = typeof table.table_size === 'string' ? table.table_size : 'unknown';
        const indexSize = typeof table.index_size === 'string' ? table.index_size : 'unknown';
        
        console.log(`| ${tableName.padEnd(10)} | ${totalSize.padEnd(10)} | ${tableSize.padEnd(10)} | ${indexSize.padEnd(10)} |`);
      }
    } else {
      console.log('| No table information available |');
    }

    // Connection information
    console.log('\n----- Connection Information -----');
    const connectionQuery = `
      SELECT
        max_conn,
        used,
        res_for_super,
        max_conn - used - res_for_super as available
      FROM
        (SELECT count(*) as used FROM pg_stat_activity) t1,
        (SELECT setting::int as max_conn FROM pg_settings WHERE name = 'max_connections') t2,
        (SELECT setting::int as res_for_super FROM pg_settings WHERE name = 'superuser_reserved_connections') t3;
    `;
    
    const connectionResult = await executeWithRetry(() => pool.query(connectionQuery));
    const connInfo = connectionResult.rows[0];
    const usagePercent = Math.round((connInfo.used / connInfo.max_conn) * 100);
    
    console.log(`Current connections: ${connInfo.used}/${connInfo.max_conn} (${usagePercent}% used)`);
    console.log(`Available connections: ${connInfo.available}`);
    console.log(`Reserved for superuser: ${connInfo.res_for_super}`);
    
    // Add warning if connection usage is high
    if (usagePercent > 70) {
      console.log(`⚠️ High connection usage (${usagePercent}%)! Consider investigating connection leaks.`);
    }
    
    // Cache hit ratio
    console.log('\n----- Cache Performance -----');
    const cacheQuery = `
      SELECT
        sum(heap_blks_read) as heap_read,
        sum(heap_blks_hit) as heap_hit,
        sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
      FROM pg_statio_user_tables;
    `;
    
    const cacheResult = await executeWithRetry(() => pool.query(cacheQuery));
    const cacheInfo = cacheResult.rows[0];
    const cacheHitPercent = Math.round(parseFloat(cacheInfo.cache_hit_ratio) * 100);
    
    console.log(`Cache hit ratio: ${cacheHitPercent}%`);
    if (cacheHitPercent < 90) {
      console.log('⚠️ Low cache hit ratio! Consider increasing shared_buffers in PostgreSQL config.');
    }
    
    // Index usage
    console.log('\n----- Index Usage -----');
    const indexQuery = `
      SELECT
        relname as table_name,
        100 * idx_scan / (seq_scan + idx_scan) as index_use_percent,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      WHERE seq_scan + idx_scan > 0
      ORDER BY n_live_tup DESC
      LIMIT 5;
    `;
    
    try {
      const indexResult = await executeWithRetry(() => pool.query(indexQuery));
      console.log('Index usage for top 5 tables (by row count):');
      console.log('| Table Name | Row Count | Index Usage % |');
      console.log('|------------|-----------|---------------|');
      for (const table of indexResult.rows) {
        // Handle null or undefined index_use_percent
        const indexUsePercent = table.index_use_percent 
          ? Math.round(parseFloat(table.index_use_percent)) + '%' 
          : 'N/A';
        console.log(`| ${table.table_name.padEnd(10)} | ${String(table.row_count).padEnd(9)} | ${String(indexUsePercent).padEnd(13)} |`);
      }
    } catch (err) {
      console.log('Could not fetch index usage information');
    }
    
    console.log('\n===== Monitoring Complete =====');
  } catch (error) {
    console.error('Database monitoring failed:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the monitoring if this script is executed directly
if (import.meta.url.endsWith('db-monitor.ts')) {
  monitorDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error during database monitoring:', err);
      process.exit(1);
    });
}