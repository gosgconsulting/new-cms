import { query } from './sparti-cms/db/postgres.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Script to check the current tenants in the database
 */
async function checkTenants() {
  console.log('Checking tenants in the database...');
  
  try {
    // Check if tenants table exists
    const tablesResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tenants'
      );
    `);
    
    const tenantsTableExists = tablesResult.rows[0].exists;
    
    if (!tenantsTableExists) {
      console.log('Tenants table does not exist. Please run the migration script first.');
      return;
    }
    
    // Get all tenants
    const tenantsResult = await query(`
      SELECT t.id, t.name, t.database_url, t.api_key, t.created_at, t.updated_at
      FROM tenants t
      ORDER BY t.created_at DESC;
    `);
    
    if (tenantsResult.rows.length === 0) {
      console.log('No tenants found in the database.');
      return;
    }
    
    console.log(`Found ${tenantsResult.rows.length} tenant(s):`);
    
    for (const tenant of tenantsResult.rows) {
      console.log(`\n--- Tenant: ${tenant.name} ---`);
      console.log(`ID: ${tenant.id}`);
      console.log(`Created: ${tenant.created_at}`);
      console.log(`Updated: ${tenant.updated_at}`);
      console.log(`Database URL: ${tenant.database_url}`);
      console.log(`API Key: ${tenant.api_key}`);
      
      // Get database details
      const dbResult = await query(`
        SELECT host, port, database_name, username
        FROM tenant_databases
        WHERE tenant_id = $1;
      `, [tenant.id]);
      
      if (dbResult.rows.length > 0) {
        const db = dbResult.rows[0];
        console.log('\nDatabase Details:');
        console.log(`Host: ${db.host}`);
        console.log(`Port: ${db.port}`);
        console.log(`Database: ${db.database_name}`);
        console.log(`Username: ${db.username}`);
      }
      
      // Get API keys
      const apiKeysResult = await query(`
        SELECT id, api_key, description, created_at
        FROM tenant_api_keys
        WHERE tenant_id = $1
        ORDER BY created_at DESC;
      `, [tenant.id]);
      
      if (apiKeysResult.rows.length > 0) {
        console.log('\nAPI Keys:');
        for (const key of apiKeysResult.rows) {
          console.log(`- ${key.description}: ${key.api_key} (Created: ${key.created_at})`);
        }
      }
      
      console.log('------------------------');
    }
    
  } catch (error) {
    console.error('Error checking tenants:', error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the check
checkTenants();
