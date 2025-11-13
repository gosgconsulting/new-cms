#!/usr/bin/env node

import 'dotenv/config';
import { query } from '../../sparti-cms/db/index.js';

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
    
    // Check if site_settings table exists and has the right structure
    const siteSettingsCheck = await query(`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'site_settings'
      ORDER BY ordinal_position
    `);
    
    const siteSettingsColumns = siteSettingsCheck.rows.map(row => row.column_name);
    console.log('📝 Existing site_settings columns:', siteSettingsColumns);
    
    const hasTenantIdColumn = siteSettingsColumns.includes('tenant_id');
    
    // Check for UNIQUE constraint on setting_key and tenant_id
    const uniqueConstraintCheck = await query(`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints
      WHERE table_name = 'site_settings'
        AND constraint_type = 'UNIQUE'
    `);
    
    const hasUniqueConstraint = parseInt(uniqueConstraintCheck.rows[0].count) > 0;
    
    let needsRecreation = !hasUniqueConstraint || !hasTenantIdColumn;
    
    if (!hasTenantIdColumn) {
      console.log('⚠️  Missing tenant_id column in site_settings table');
    }
    
    if (!hasUniqueConstraint) {
      console.log('⚠️  Missing UNIQUE constraint on site_settings table');
    }
    
    if (needsRecreation) {
      // First, backup existing settings if any
      const existingSettings = await query(`SELECT * FROM site_settings`);
      
      // Drop and recreate the table with the UNIQUE constraint
      console.log('🗑️  Dropping existing site_settings table...');
      await query('DROP TABLE IF EXISTS site_settings CASCADE');
      
      console.log('🏗️  Creating new site_settings table with tenant_id and UNIQUE constraint...');
      
      // Restore settings after table creation if there were any
      if (existingSettings.rows.length > 0) {
        console.log(`💾 Will restore ${existingSettings.rows.length} existing settings after table creation`);
      }
    }
    
    // Create site_settings table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) NOT NULL,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'text',
        tenant_id VARCHAR(255) DEFAULT 'tenant-gosg',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(setting_key, tenant_id)
      )
    `);
    
    if (needsRecreation) {
      console.log('✅ site_settings table created successfully with tenant_id and UNIQUE constraint');
      
      // Restore settings if there were any
      if (existingSettings && existingSettings.rows.length > 0) {
        console.log(`🔄 Restoring ${existingSettings.rows.length} existing settings...`);
        
        for (const setting of existingSettings.rows) {
          await query(`
            INSERT INTO site_settings (setting_key, setting_value, setting_type, tenant_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (setting_key, tenant_id) DO NOTHING
          `, [
            setting.setting_key, 
            setting.setting_value, 
            setting.setting_type,
            setting.tenant_id || 'tenant-gosg'
          ]);
        }
        
        console.log('✅ Settings restored successfully');
      }
    }
    
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
      INSERT INTO site_settings (setting_key, setting_value, setting_type, tenant_id)
      VALUES 
        ('site_name', 'GO SG', 'text', 'tenant-gosg'),
        ('site_tagline', 'Digital Marketing Agency', 'text', 'tenant-gosg'),
        ('site_logo', '', 'file', 'tenant-gosg'),
        ('site_favicon', '', 'file', 'tenant-gosg')
      ON CONFLICT (setting_key, tenant_id) DO NOTHING
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
