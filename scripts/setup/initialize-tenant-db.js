import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, initializeDatabase } from '../../sparti-cms/db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeTenantDatabase() {
  try {
    console.log('Initializing database connection...');
    await initializeDatabase();
    
    console.log('Reading tenant migrations SQL file...');
    const sqlFilePath = path.join(__dirname, 'sparti-cms/db/tenants-migrations.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Executing tenant migrations...');
    await query(sql);
    
    console.log('Tenant database initialization completed successfully!');
    console.log('Default tenant "GO SG CONSULTING" has been created.');
    
    // Verify tenant was created
    const result = await query('SELECT id, name, created_at FROM tenants');
    console.log('Current tenants:');
    console.table(result.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing tenant database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeTenantDatabase();
