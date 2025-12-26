/**
 * Fix Master Admin Accounts Script
 * 
 * This script ensures that existing admin users are properly configured as super admins
 * with tenant_id = NULL after the tenant-based database refactoring.
 */

import { query } from '../sparti-cms/db/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixMasterAdminAccounts() {
  try {
    console.log('[testing] ==========================================');
    console.log('[testing] Fixing master admin accounts...');
    console.log('[testing] ==========================================\n');

    // Check if users table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('[testing] ❌ Users table does not exist. Please run migrations first.');
      process.exit(1);
    }

    // Find all admin users (by role = 'admin' or email contains 'admin')
    const adminUsers = await query(`
      SELECT id, email, first_name, last_name, role, tenant_id, is_super_admin
      FROM users
      WHERE role = 'admin' 
         OR email LIKE '%admin%'
         OR is_super_admin = true
      ORDER BY id;
    `);

    console.log(`[testing] Found ${adminUsers.rows.length} admin user(s) to check:\n`);

    if (adminUsers.rows.length === 0) {
      console.log('[testing] ⚠️  No admin users found. Creating default admin user...');
      
      const bcrypt = await import('bcrypt');
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      // Check if password_salt column exists
      const columnsCheck = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_salt';
      `);
      
      const hasPasswordSalt = columnsCheck.rows.length > 0;
      
      if (hasPasswordSalt) {
        const salt = await bcrypt.genSalt(10);
        await query(`
          INSERT INTO users (
            first_name, last_name, email, password_hash, password_salt,
            role, status, is_active, is_super_admin, tenant_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          'System',
          'Administrator',
          'admin@gosg.com',
          passwordHash,
          salt,
          'admin',
          'active',
          true,
          true,
          null
        ]);
      } else {
        await query(`
          INSERT INTO users (
            first_name, last_name, email, password_hash,
            role, status, is_active, is_super_admin, tenant_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          'System',
          'Administrator',
          'admin@gosg.com',
          passwordHash,
          'admin',
          'active',
          true,
          true,
          null
        ]);
      }
      
      console.log('[testing] ✅ Default admin user created: admin@gosg.com / admin123');
      console.log('[testing] ✅ is_super_admin = true, tenant_id = NULL\n');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const adminUser of adminUsers.rows) {
      const needsUpdate = 
        !adminUser.is_super_admin || 
        adminUser.tenant_id !== null;

      if (needsUpdate) {
        console.log(`[testing] Updating admin user: ${adminUser.email}`);
        console.log(`[testing]   Current: is_super_admin = ${adminUser.is_super_admin}, tenant_id = ${adminUser.tenant_id}`);
        
        await query(`
          UPDATE users
          SET is_super_admin = true,
              tenant_id = NULL,
              updated_at = NOW()
          WHERE id = $1
        `, [adminUser.id]);
        
        console.log(`[testing]   Updated: is_super_admin = true, tenant_id = NULL`);
        updatedCount++;
      } else {
        console.log(`[testing] ✓ Admin user already configured correctly: ${adminUser.email}`);
        skippedCount++;
      }
      console.log('');
    }

    console.log('[testing] ==========================================');
    console.log(`[testing] Summary:`);
    console.log(`[testing]   Updated: ${updatedCount} user(s)`);
    console.log(`[testing]   Skipped: ${skippedCount} user(s) (already correct)`);
    console.log('[testing] ==========================================');
    console.log('[testing] ✅ Master admin accounts fixed successfully!\n');

  } catch (error) {
    console.error('[testing] ❌ Error fixing master admin accounts:', error);
    console.error('[testing] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Run the script
fixMasterAdminAccounts()
  .then(() => {
    console.log('[testing] Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[testing] Script failed:', error);
    process.exit(1);
  });

