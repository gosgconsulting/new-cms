import { query } from '../../sparti-cms/db/index.js';

async function initializeTenantDatabase() {
  try {
    console.log('Note: Database migrations should be run via Sequelize CLI:');
    console.log('  npm run sequelize:migrate');
    console.log('');
    console.log('Checking for default tenant...');
    
    // Verify tenant was created
    const result = await query('SELECT id, name, created_at FROM tenants');
    
    if (result.rows.length === 0) {
      console.log('No tenants found. Creating default tenant...');
      await query(`
        INSERT INTO tenants (id, name, created_at)
        VALUES ('tenant-gosg', 'GO SG CONSULTING', NOW())
        ON CONFLICT (id) DO NOTHING
      `);
      console.log('Default tenant "GO SG CONSULTING" created.');
    } else {
      console.log('Current tenants:');
      console.table(result.rows);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Make sure migrations are run first: npm run sequelize:migrate');
    process.exit(1);
  }
}

// Run the initialization
initializeTenantDatabase();
