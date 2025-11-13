// Script to create an admin user in the database
// Run with: node create-admin-user.js

import { query } from '../../sparti-cms/db/index.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Check if users table exists
    try {
      await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);
    } catch (error) {
      console.log('Creating users table...');
      
      // Create users table if it doesn't exist
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log('Users table created.');
    }
    
    // Check if admin user already exists
    const existingUser = await query(`
      SELECT * FROM users WHERE email = 'admin';
    `);
    
    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists. Updating password...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin', 10);
      
      // Update existing admin user
      await query(`
        UPDATE users
        SET password = $1, updated_at = NOW()
        WHERE email = 'admin';
      `, [hashedPassword]);
      
      console.log('Admin user password updated successfully.');
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin', 10);
      
      // Create admin user
      await query(`
        INSERT INTO users (first_name, last_name, email, password, role)
        VALUES ($1, $2, $3, $4, $5);
      `, ['Admin', 'User', 'admin', hashedPassword, 'admin']);
      
      console.log('Admin user created successfully.');
    }
    
    console.log('Admin credentials:');
    console.log('Username: admin');
    console.log('Password: admin');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit();
  }
}

createAdminUser();
