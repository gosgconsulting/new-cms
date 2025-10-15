#!/usr/bin/env node

import 'dotenv/config';
import { query } from './sparti-cms/db/postgres.js';

async function migrateDatabase() {
  try {
    console.log('🚀 Starting Railway database migration...');
    
    // Check if form_submissions table exists and has the right structure
    const checkTable = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'form_submissions' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Current form_submissions table structure:');
    console.log(checkTable.rows);
    
    const existingColumns = checkTable.rows.map(row => row.column_name);
    console.log('📝 Existing columns:', existingColumns);
    
    // Check if we need to add missing columns
    const requiredColumns = [
      'form_id', 'form_name', 'name', 'email', 'phone', 'message', 
      'submitted_at', 'ip_address', 'user_agent'
    ];
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('⚠️  Missing columns detected:', missingColumns);
      
      // Drop and recreate the table with correct structure
      console.log('🗑️  Dropping existing form_submissions table...');
      await query('DROP TABLE IF EXISTS form_submissions CASCADE');
      
      console.log('🏗️  Creating new form_submissions table...');
      await query(`
        CREATE TABLE form_submissions (
          id SERIAL PRIMARY KEY,
          form_id VARCHAR(255) NOT NULL,
          form_name VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          message TEXT,
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ip_address VARCHAR(50),
          user_agent TEXT
        )
      `);
      
      console.log('✅ form_submissions table created successfully');
    } else {
      console.log('✅ form_submissions table already has correct structure');
    }
    
    // Check contacts table
    const contactsCheck = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'contacts' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Current contacts table structure:');
    console.log(contactsCheck.rows);
    
    const contactsColumns = contactsCheck.rows.map(row => row.column_name);
    const requiredContactsColumns = [
      'id', 'first_name', 'last_name', 'email', 'phone', 'company',
      'source', 'notes', 'status', 'tags', 'created_at', 'updated_at'
    ];
    
    const missingContactsColumns = requiredContactsColumns.filter(col => !contactsColumns.includes(col));
    
    if (missingContactsColumns.length > 0) {
      console.log('⚠️  Missing columns in contacts table:', missingContactsColumns);
      
      console.log('🗑️  Dropping existing contacts table...');
      await query('DROP TABLE IF EXISTS contacts CASCADE');
      
      console.log('🏗️  Creating new contacts table...');
      await query(`
        CREATE TABLE contacts (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255),
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          company VARCHAR(255),
          source VARCHAR(100) DEFAULT 'form',
          notes TEXT,
          status VARCHAR(50) DEFAULT 'new',
          tags TEXT[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(email)
        )
      `);
      
      console.log('✅ contacts table created successfully');
    } else {
      console.log('✅ contacts table already has correct structure');
    }
    
    // Create other tables if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'text',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        category VARCHAR(100),
        priority VARCHAR(20) DEFAULT 'medium',
        start_date DATE,
        end_date DATE,
        progress INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS project_steps (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        step_order INTEGER DEFAULT 0,
        estimated_hours DECIMAL(5,2),
        actual_hours DECIMAL(5,2),
        assigned_to VARCHAR(255),
        due_date DATE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default site settings if they don't exist
    await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type)
      VALUES 
        ('site_name', 'GO SG', 'text'),
        ('site_tagline', 'Digital Marketing Agency', 'text'),
        ('site_logo', '', 'file'),
        ('site_favicon', '', 'file')
      ON CONFLICT (setting_key) DO NOTHING
    `);
    
    console.log('🎉 Railway database migration completed successfully!');
    
    // Show final table structure
    console.log('\n📊 Final database structure:');
    
    const tables = ['form_submissions', 'contacts', 'site_settings', 'projects', 'project_steps'];
    for (const table of tables) {
      const result = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [table]);
      
      console.log(`\n📋 ${table.toUpperCase()} table:`);
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateDatabase()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
