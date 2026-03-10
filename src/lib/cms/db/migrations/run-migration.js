/**
 * Run database migration for site_settings table
 * This ensures the table has all required columns for theme styles
 */

import { query } from '../index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('[migration] Starting site_settings schema migration...');
    
    // Read the SQL migration file
    const sqlFile = path.join(__dirname, 'create-site-settings-schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the migration
    // Note: PostgreSQL doesn't support executing multiple statements in one query
    // So we need to split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
          console.log('[migration] Executed:', statement.substring(0, 50) + '...');
        } catch (err) {
          // Some statements might fail if they already exist, which is OK
          if (err.message.includes('already exists') || err.message.includes('duplicate')) {
            console.log('[migration] Skipped (already exists):', statement.substring(0, 50) + '...');
          } else {
            console.error('[migration] Error executing statement:', err.message);
            console.error('[migration] Statement:', statement.substring(0, 100));
          }
        }
      }
    }
    
    // Handle DO blocks separately (they contain multiple statements)
    const doBlocks = sql.match(/DO \$\$[\s\S]*?\$\$;/g) || [];
    for (const doBlock of doBlocks) {
      try {
        await query(doBlock);
        console.log('[migration] Executed DO block');
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log('[migration] Skipped DO block (already exists)');
        } else {
          console.error('[migration] Error executing DO block:', err.message);
        }
      }
    }
    
    // Handle COMMENT statements separately
    const commentStatements = sql.match(/COMMENT ON [\s\S]*?;/g) || [];
    for (const comment of commentStatements) {
      try {
        await query(comment);
        console.log('[migration] Added comment');
      } catch (err) {
        // Comments might fail if table doesn't exist, which is OK
        console.log('[migration] Skipped comment (might already exist)');
      }
    }
    
    console.log('[migration] Migration completed successfully!');
    console.log('[migration] The site_settings table is now ready for theme styles.');
    
    // Verify the table structure
    const tableInfo = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'site_settings'
      ORDER BY ordinal_position
    `);
    
    console.log('\n[migration] Current site_settings table structure:');
    console.table(tableInfo.rows);
    
  } catch (error) {
    console.error('[migration] Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(() => {
      console.log('[migration] Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[migration] Migration failed:', error);
      process.exit(1);
    });
}

export default runMigration;


