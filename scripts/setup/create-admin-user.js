// Script to create an admin user in the database
// Run with: node scripts/setup/create-admin-user.js

import 'dotenv/config';
import { query } from '../../sparti-cms/db/index.js';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    console.log('[testing] Creating admin user...');
    
    // Check if users table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('[testing] ❌ Users table does not exist. Please run migrations first:');
      console.error('[testing]    npm run sequelize:migrate');
      process.exit(1);
    }
    
    // Check if admin user already exists
    const existingUser = await query(`
      SELECT id, email, is_active, is_super_admin FROM users WHERE email = $1 OR email = $2
    `, ['admin', 'admin@gosg.com.sg']);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      console.log('[testing] Admin user already exists. Updating password and permissions...');
      
      // Update existing admin user with correct schema
      await query(`
        UPDATE users
        SET password_hash = $1,
            is_active = true,
            status = 'active',
            is_super_admin = true,
            tenant_id = NULL,
            role = 'admin',
            updated_at = NOW()
        WHERE id = $2
      `, [hashedPassword, user.id]);
      
      console.log('[testing] ✅ Admin user updated successfully.');
    } else {
      // Create new admin user with correct schema
      await query(`
        INSERT INTO users (
          first_name, last_name, email, password_hash, 
          role, status, is_active, is_super_admin, tenant_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, email, role, is_active, is_super_admin
      `, [
        'Admin', 
        'User', 
        'admin@gosg.com.sg', 
        hashedPassword, 
        'admin', 
        'active', 
        true, 
        true, 
        null
      ]);
      
      console.log('[testing] ✅ Admin user created successfully.');
    }
    
    // Verify the admin user
    const verifyUser = await query(`
      SELECT id, email, role, is_active, is_super_admin, tenant_id
      FROM users 
      WHERE email = $1 OR email = $2
    `, ['admin@gosg.com.sg', 'admin']);
    
    if (verifyUser.rows.length > 0) {
      const user = verifyUser.rows[0];
      console.log('[testing]');
      console.log('[testing] ============================================');
      console.log('[testing] Admin User Credentials:');
      console.log('[testing] ============================================');
      console.log('[testing] Email:', user.email);
      console.log('[testing] Password: admin');
      console.log('[testing] Role:', user.role);
      console.log('[testing] Super Admin:', user.is_super_admin);
      console.log('[testing] Active:', user.is_active);
      console.log('[testing] ============================================');
      console.log('[testing]');
      console.log('[testing] You can now login at: /admin or /dashboard');
    }
    
  } catch (error) {
    console.error('[testing] ❌ Error creating admin user:', error.message);
    console.error('[testing] Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('[testing]');
      console.error('[testing] Database connection failed. Please check:');
      console.error('[testing] 1. DATABASE_URL is set in .env');
      console.error('[testing] 2. Database server is running');
      console.error('[testing] 3. Network connectivity');
    }
    
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
