import { query } from '../../sparti-cms/db/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Script to create a demo tenant account for theme testing
 * Creates a tenant with ID 'demo' and name 'Demo Account'
 */
async function createDemoTenant() {
  try {
    console.log('Creating demo tenant account...');
    
    // Check if demo tenant already exists
    const existingTenant = await query(`
      SELECT id, name, theme_id 
      FROM tenants 
      WHERE id = 'demo'
    `);
    
    if (existingTenant.rows.length > 0) {
      console.log('✅ Demo tenant already exists:');
      console.log(`   ID: ${existingTenant.rows[0].id}`);
      console.log(`   Name: ${existingTenant.rows[0].name}`);
      console.log(`   Theme ID: ${existingTenant.rows[0].theme_id || 'None'}`);
      console.log('\nTo update the demo tenant, use the admin interface or update it manually.');
      process.exit(0);
    }
    
    // Create demo tenant
    await query(`
      INSERT INTO tenants (id, name, created_at, updated_at)
      VALUES ('demo', 'Demo Account', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    
    console.log('✅ Demo tenant created successfully!');
    console.log('   ID: demo');
    console.log('   Name: Demo Account');
    console.log('\nYou can now activate themes for this tenant using the "Activate" button in the Themes page.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo tenant:', error.message);
    console.error('\nMake sure:');
    console.error('  1. Database migrations are run: npm run sequelize:migrate');
    console.error('  2. Database connection is configured in .env file');
    console.error('  3. Database is accessible');
    process.exit(1);
  }
}

// Run the script
createDemoTenant();


