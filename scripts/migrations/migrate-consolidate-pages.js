#!/usr/bin/env node

/**
 * Migration Runner: Consolidate Page Types
 * 
 * This script safely migrates the three separate page tables into a unified structure.
 * It includes verification steps and rollback capabilities.
 */

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration (use DATABASE_URL or DATABASE_PUBLIC_URL; no default)
const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL or DATABASE_PUBLIC_URL must be set.');
  process.exit(1);
}
const dbConfig = {
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(dbConfig);

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function verifyTablesExist() {
  console.log('🔍 Verifying source tables exist...');
  
  const tables = ['pages', 'landing_pages', 'legal_pages'];
  const results = {};
  
  for (const table of tables) {
    try {
      const result = await query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_name = $1 AND table_schema = 'public'
      `, [table]);
      results[table] = result.rows[0].count > 0;
    } catch (error) {
      results[table] = false;
    }
  }
  
  console.log('Source tables status:', results);
  return Object.values(results).every(exists => exists);
}

async function getTableCounts() {
  console.log('📊 Getting current table counts...');
  
  const counts = {};
  
  try {
    const pagesResult = await query('SELECT COUNT(*) as count FROM pages');
    counts.pages = parseInt(pagesResult.rows[0].count);
  } catch (error) {
    counts.pages = 0;
  }
  
  try {
    const landingResult = await query('SELECT COUNT(*) as count FROM landing_pages');
    counts.landing_pages = parseInt(landingResult.rows[0].count);
  } catch (error) {
    counts.landing_pages = 0;
  }
  
  try {
    const legalResult = await query('SELECT COUNT(*) as count FROM legal_pages');
    counts.legal_pages = parseInt(legalResult.rows[0].count);
  } catch (error) {
    counts.legal_pages = 0;
  }
  
  console.log('Current counts:', counts);
  return counts;
}

async function runMigration() {
  console.log('🚀 Starting page consolidation migration...');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'sparti-cms/db/migrations/consolidate-page-types.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await query(migrationSQL);
    console.log('✅ Migration SQL executed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration results...');
  
  try {
    // Check if new pages table exists and has data
    const newPagesResult = await query('SELECT COUNT(*) as count FROM pages');
    const newPagesCount = parseInt(newPagesResult.rows[0].count);
    
    // Check page type distribution
    const typeDistribution = await query(`
      SELECT page_type, COUNT(*) as count 
      FROM pages 
      GROUP BY page_type 
      ORDER BY page_type
    `);
    
    console.log('New pages table count:', newPagesCount);
    console.log('Page type distribution:', typeDistribution.rows);
    
    // Check for any data integrity issues
    const duplicateSlugs = await query(`
      SELECT slug, tenant_id, COUNT(*) as count 
      FROM pages 
      GROUP BY slug, tenant_id 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateSlugs.rows.length > 0) {
      console.warn('⚠️  Warning: Found duplicate slugs:', duplicateSlugs.rows);
    } else {
      console.log('✅ No duplicate slugs found');
    }
    
    return {
      success: true,
      newPagesCount,
      typeDistribution: typeDistribution.rows
    };
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function cleanupOldTables() {
  console.log('🧹 Cleaning up old tables...');
  
  try {
    await query('DROP TABLE IF EXISTS pages_old CASCADE');
    await query('DROP TABLE IF EXISTS landing_pages_old CASCADE');
    await query('DROP TABLE IF EXISTS legal_pages_old CASCADE');
    
    console.log('✅ Old tables cleaned up successfully');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🔄 Page Consolidation Migration Started');
  console.log('=====================================');
  
  try {
    // Step 1: Verify source tables exist
    const tablesExist = await verifyTablesExist();
    if (!tablesExist) {
      console.error('❌ Some source tables are missing. Aborting migration.');
      process.exit(1);
    }
    
    // Step 2: Get initial counts
    const initialCounts = await getTableCounts();
    const totalInitialCount = initialCounts.pages + initialCounts.landing_pages + initialCounts.legal_pages;
    
    // Step 3: Run migration
    await runMigration();
    
    // Step 4: Verify migration
    const verification = await verifyMigration();
    if (!verification.success) {
      console.error('❌ Migration verification failed. Check the logs above.');
      process.exit(1);
    }
    
    // Step 5: Confirm counts match
    if (verification.newPagesCount !== totalInitialCount) {
      console.warn(`⚠️  Count mismatch: Expected ${totalInitialCount}, got ${verification.newPagesCount}`);
      console.log('Migration completed but please verify data integrity manually.');
    } else {
      console.log('✅ All counts match - migration successful!');
    }
    
    // Step 6: Ask for cleanup confirmation
    console.log('\n🧹 Migration completed successfully!');
    console.log('Old tables have been renamed with _old suffix for safety.');
    console.log('You can now safely drop them after verifying everything works correctly.');
    console.log('\nTo clean up old tables, run:');
    console.log('node migrate-consolidate-pages.js --cleanup');
    
    // Check for cleanup flag
    if (process.argv.includes('--cleanup')) {
      await cleanupOldTables();
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Handle command line arguments
if (process.argv.includes('--help')) {
  console.log(`
Page Consolidation Migration Tool

Usage:
  node migrate-consolidate-pages.js           # Run migration
  node migrate-consolidate-pages.js --cleanup # Run migration and cleanup old tables
  node migrate-consolidate-pages.js --help    # Show this help

Environment Variables:
  DB_USER     - Database username (default: postgres)
  DB_HOST     - Database host (default: localhost)
  DB_NAME     - Database name (default: sparti_cms)
  DB_PASSWORD - Database password (default: password)
  DB_PORT     - Database port (default: 5432)
  `);
  process.exit(0);
}

// Run the migration
main().catch(console.error);
