/**
 * Run database migration to fix site_settings unique constraint
 * This fixes the issue where brand settings cannot be saved due to constraint mismatch
 */

import { executeMultiStatementSQL } from '../connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runFixMigration() {
  try {
    console.log('[migration] Starting fix-site-settings-unique-constraint migration...');
    
    // Read the SQL migration file
    const sqlFile = path.join(__dirname, 'fix-site-settings-unique-constraint.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the migration using the multi-statement executor
    await executeMultiStatementSQL(sql);
    
    console.log('[migration] ✓ Successfully applied fix-site-settings-unique-constraint migration');
    console.log('[migration] The site_settings table now has the correct COALESCE-based unique index');
    console.log('[migration] Brand settings should now save correctly for tenants');
    
  } catch (error) {
    console.error('[migration] ✗ Error running fix migration:', error);
    console.error('[migration] Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    });
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFixMigration()
    .then(() => {
      console.log('[migration] Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[migration] Migration failed:', error);
      process.exit(1);
    });
}

export default runFixMigration;

