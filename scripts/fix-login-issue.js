#!/usr/bin/env node

/**
 * Fix Login Issue Script
 * 
 * This script:
 * 1. Verifies database connection
 * 2. Runs migrations if needed
 * 3. Creates admin user if missing
 * 4. Tests login functionality
 */

import 'dotenv/config';
import { query } from '../sparti-cms/db/index.js';
import bcrypt from 'bcrypt';

async function fixLoginIssue() {
  try {
    console.log('[testing] Starting login issue fix...\n');

    // Step 1: Test database connection
    console.log('[testing] Step 1: Testing database connection...');
    try {
      await query('SELECT 1');
      console.log('[testing] ✅ Database connection successful\n');
    } catch (error) {
      console.error('[testing] ❌ Database connection failed:', error.message);
      console.error('[testing] Please check your DATABASE_URL or DATABASE_PUBLIC_URL in .env file');
      process.exit(1);
    }

    // Step 2: Check if users table exists
    console.log('[testing] Step 2: Checking if users table exists...');
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('[testing] ⚠️  Users table does not exist');
      console.log('[testing] Running migrations...');
      
      // Try to run migrations using Sequelize
      try {
        const { execSync } = await import('child_process');
        execSync('npm run sequelize:migrate', { stdio: 'inherit' });
        console.log('[testing] ✅ Migrations completed\n');
      } catch (migrationError) {
        console.error('[testing] ❌ Migration failed:', migrationError.message);
        console.error('[testing] Please run: npm run sequelize:migrate');
        process.exit(1);
      }
    } else {
      console.log('[testing] ✅ Users table exists\n');
    }

    // Step 3: Check users table schema
    console.log('[testing] Step 3: Verifying users table schema...');
    const columns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    const requiredColumns = ['id', 'email', 'password_hash', 'role', 'is_active'];
    const existingColumns = columns.rows.map(row => row.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length > 0) {
      console.log('[testing] ⚠️  Missing required columns:', missingColumns.join(', '));
      console.log('[testing] Running migrations to add missing columns...');
      try {
        const { execSync } = await import('child_process');
        execSync('npm run sequelize:migrate', { stdio: 'inherit' });
        console.log('[testing] ✅ Schema updated\n');
      } catch (migrationError) {
        console.error('[testing] ❌ Migration failed:', migrationError.message);
        process.exit(1);
      }
    } else {
      console.log('[testing] ✅ All required columns exist\n');
    }

    // Step 4: Check if admin user exists
    console.log('[testing] Step 4: Checking for admin user...');
    const adminUsers = await query(`
      SELECT id, email, role, is_active 
      FROM users 
      WHERE email = 'admin@gosg.com' OR role = 'admin'
      LIMIT 1;
    `);

    if (adminUsers.rows.length === 0) {
      console.log('[testing] ⚠️  No admin user found. Creating admin user...');
      
      // Create admin user
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      // Check if password_salt column exists
      const hasPasswordSalt = existingColumns.includes('password_salt');
      
      if (hasPasswordSalt) {
        await query(`
          INSERT INTO users (
            first_name, last_name, email, password_hash, password_salt,
            role, status, is_active, email_verified, is_super_admin
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (email) DO UPDATE SET
            password_hash = EXCLUDED.password_hash,
            password_salt = EXCLUDED.password_salt,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
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
          true
        ]);
      } else {
        // Fallback for older schema without password_salt
        await query(`
          INSERT INTO users (
            first_name, last_name, email, password_hash,
            role, status, is_active, email_verified, is_super_admin
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (email) DO UPDATE SET
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
        `, [
          'System',
          'Administrator',
          'admin@gosg.com',
          passwordHash,
          'admin',
          'active',
          true,
          true,
          true
        ]);
      }

      console.log('[testing] ✅ Admin user created');
      console.log('[testing]   Email: admin@gosg.com');
      console.log('[testing]   Password: ' + adminPassword);
      console.log('[testing]   (You can change this password after logging in)\n');
    } else {
      const adminUser = adminUsers.rows[0];
      console.log('[testing] ✅ Admin user exists');
      console.log(`[testing]   Email: ${adminUser.email}`);
      console.log(`[testing]   Role: ${adminUser.role}`);
      console.log(`[testing]   Active: ${adminUser.is_active}\n`);
      
      // Reset admin password if requested
      if (process.env.RESET_ADMIN_PASSWORD === 'true') {
        console.log('[testing] Resetting admin password...');
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);
        
        const hasPasswordSalt = existingColumns.includes('password_salt');
        if (hasPasswordSalt) {
          await query(`
            UPDATE users 
            SET password_hash = $1, password_salt = $2, updated_at = NOW()
            WHERE id = $3;
          `, [passwordHash, salt, adminUser.id]);
        } else {
          await query(`
            UPDATE users 
            SET password_hash = $1, updated_at = NOW()
            WHERE id = $2;
          `, [passwordHash, adminUser.id]);
        }
        
        console.log('[testing] ✅ Admin password reset');
        console.log('[testing]   New Password: ' + adminPassword + '\n');
      }
    }

    // Step 5: Test login query
    console.log('[testing] Step 5: Testing login query...');
    const testUser = await query(`
      SELECT id, first_name, last_name, email, password_hash, role, is_active, tenant_id, is_super_admin 
      FROM users 
      WHERE email = 'admin@gosg.com' AND is_active = true
      LIMIT 1;
    `);

    if (testUser.rows.length === 0) {
      console.error('[testing] ❌ Cannot find active admin user');
      process.exit(1);
    }

    const user = testUser.rows[0];
    console.log('[testing] ✅ Login query successful');
    console.log(`[testing]   User ID: ${user.id}`);
    console.log(`[testing]   Name: ${user.first_name} ${user.last_name}`);
    console.log(`[testing]   Email: ${user.email}`);
    console.log(`[testing]   Role: ${user.role}`);
    console.log(`[testing]   Super Admin: ${user.is_super_admin || false}\n`);

    console.log('[testing] ✅ Login issue fixed successfully!');
    console.log('[testing]');
    console.log('[testing] You can now login with:');
    console.log('[testing]   Email: admin@gosg.com');
    console.log('[testing]   Password: ' + (process.env.ADMIN_PASSWORD || 'admin123'));
    console.log('[testing]');
    console.log('[testing] To reset the admin password, run:');
    console.log('[testing]   RESET_ADMIN_PASSWORD=true ADMIN_PASSWORD=yourpassword node scripts/fix-login-issue.js');

  } catch (error) {
    console.error('[testing] ❌ Error fixing login issue:', error);
    console.error('[testing] Error details:', error.message);
    if (error.stack) {
      console.error('[testing] Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

fixLoginIssue();


