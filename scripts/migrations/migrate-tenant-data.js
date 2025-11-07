import { query } from '../../sparti-cms/db/postgres.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Script to create a new tenant and migrate data from an existing tenant
 */
async function migrateTenantData() {
  console.log('Starting tenant data migration...');
  
  try {
    // Step 1: Check if tenants table exists, if not create it
    console.log('Checking if tenants table exists...');
    const tablesResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tenants'
      );
    `);
    
    const tenantsTableExists = tablesResult.rows[0].exists;
    
    if (!tenantsTableExists) {
      console.log('Creating tenants table...');
      // Execute the tenants migration SQL
      await query(`
        -- Create tenants table
        CREATE TABLE IF NOT EXISTS tenants (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            database_url TEXT,
            api_key VARCHAR(255)
        );
        
        -- Create function to update the updated_at timestamp
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Create trigger to update updated_at on tenants table
        DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
        CREATE TRIGGER update_tenants_updated_at
        BEFORE UPDATE ON tenants
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        
        -- Create tenant_databases table to store database connection info
        CREATE TABLE IF NOT EXISTS tenant_databases (
            tenant_id VARCHAR(255) PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
            host VARCHAR(255) NOT NULL,
            port INTEGER NOT NULL DEFAULT 5432,
            database_name VARCHAR(255) NOT NULL,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            ssl BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create trigger to update updated_at on tenant_databases table
        DROP TRIGGER IF EXISTS update_tenant_databases_updated_at ON tenant_databases;
        CREATE TRIGGER update_tenant_databases_updated_at
        BEFORE UPDATE ON tenant_databases
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        
        -- Create tenant_api_keys table to store API keys
        CREATE TABLE IF NOT EXISTS tenant_api_keys (
            id SERIAL PRIMARY KEY,
            tenant_id VARCHAR(255) REFERENCES tenants(id) ON DELETE CASCADE,
            api_key VARCHAR(255) NOT NULL,
            description VARCHAR(255),
            expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create trigger to update updated_at on tenant_api_keys table
        DROP TRIGGER IF EXISTS update_tenant_api_keys_updated_at ON tenant_api_keys;
        CREATE TRIGGER update_tenant_api_keys_updated_at
        BEFORE UPDATE ON tenant_api_keys
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        
        -- Create index on tenant_api_keys for faster lookups
        CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_tenant_id ON tenant_api_keys(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_api_key ON tenant_api_keys(api_key);
      `);
    }
    
    // Step 2: Delete dummy tenants
    console.log('Deleting dummy tenants...');
    await query(`
      DELETE FROM tenants 
      WHERE id IN ('tenant-1', 'tenant-2', 'tenant-3', 'tenant-4');
    `);
    
    // Step 3: Create GO SG CONSULTING tenant
    console.log('Creating GO SG CONSULTING tenant...');
    const tenantId = `tenant-${uuidv4().split('-')[0]}`;
    
    await query(`
      INSERT INTO tenants (id, name, created_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (id) DO NOTHING;
    `, [tenantId, 'GO SG CONSULTING']);
    
    // Step 4: Set up database connection for the new tenant
    console.log('Setting up database connection for the new tenant...');
    
    // Get database connection details from environment variables
    const dbHost = process.env.DATABASE_HOST || 'localhost';
    const dbPort = process.env.DATABASE_PORT || 5432;
    const dbName = process.env.DATABASE_NAME || 'sparti_cms';
    const dbUser = process.env.DATABASE_USER || 'postgres';
    const dbPassword = process.env.DATABASE_PASSWORD || 'postgres';
    
    // Create database URL
    const dbUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
    
    // Update tenant with database URL
    await query(`
      UPDATE tenants
      SET database_url = $1
      WHERE id = $2;
    `, [dbUrl, tenantId]);
    
    // Insert database details into tenant_databases table
    await query(`
      INSERT INTO tenant_databases (tenant_id, host, port, database_name, username, password, ssl)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (tenant_id) DO UPDATE
      SET host = EXCLUDED.host,
          port = EXCLUDED.port,
          database_name = EXCLUDED.database_name,
          username = EXCLUDED.username,
          password = EXCLUDED.password,
          ssl = EXCLUDED.ssl,
          updated_at = NOW();
    `, [tenantId, dbHost, dbPort, dbName, dbUser, dbPassword, true]);
    
    // Step 5: Generate API key for the new tenant
    console.log('Generating API key for the new tenant...');
    const apiKey = `tenant_${tenantId}_${uuidv4().replace(/-/g, '')}`;
    
    await query(`
      INSERT INTO tenant_api_keys (tenant_id, api_key, description)
      VALUES ($1, $2, $3);
    `, [tenantId, apiKey, 'Default API Key']);
    
    // Update tenant with API key
    await query(`
      UPDATE tenants
      SET api_key = $1
      WHERE id = $2;
    `, [apiKey, tenantId]);
    
    console.log('Migration completed successfully!');
    console.log(`New tenant created: GO SG CONSULTING (ID: ${tenantId})`);
    console.log(`API Key: ${apiKey}`);
    
    // Get the tenant details to verify
    const tenantResult = await query(`
      SELECT t.id, t.name, t.database_url, t.api_key, t.created_at, t.updated_at,
             td.host, td.port, td.database_name, td.username
      FROM tenants t
      LEFT JOIN tenant_databases td ON t.id = td.tenant_id
      WHERE t.id = $1;
    `, [tenantId]);
    
    if (tenantResult.rows.length > 0) {
      const tenant = tenantResult.rows[0];
      console.log('Tenant details:');
      console.log(JSON.stringify(tenant, null, 2));
    }
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the migration
migrateTenantData();
