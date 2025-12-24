#!/usr/bin/env node

import 'dotenv/config';
import { query } from '../sparti-cms/db/index.js';

async function activateAdminUser() {
  try {
    console.log('[testing] Activating admin user...');
    
    // Activate admin user
    await query(`
      UPDATE users 
      SET is_active = true, status = 'active' 
      WHERE email = 'admin@gosg.com' OR role = 'admin';
    `);
    
    // Verify
    const result = await query(`
      SELECT email, role, is_active, status 
      FROM users 
      WHERE email = 'admin@gosg.com';
    `);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('[testing] ✅ Admin user activated');
      console.log('[testing]   Email:', user.email);
      console.log('[testing]   Role:', user.role);
      console.log('[testing]   Active:', user.is_active);
      console.log('[testing]   Status:', user.status);
    } else {
      console.log('[testing] ⚠️  Admin user not found');
    }
  } catch (error) {
    console.error('[testing] ❌ Error:', error.message);
    process.exit(1);
  }
}

activateAdminUser();

