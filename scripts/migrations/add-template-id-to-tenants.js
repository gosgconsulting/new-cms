import dotenv from 'dotenv';
import { query } from '../../sparti-cms/db/index.js';

// Load environment variables
dotenv.config();

/**
 * Script to add theme_id column to tenants table (renamed from template_id)
 * This ensures the column exists even if migrations haven't been run
 */
async function addThemeIdColumn() {
  console.log('Starting theme_id column addition...');
  
  try {
    // Check if theme_id column exists
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' AND column_name = 'theme_id'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ theme_id column already exists');
      
      // Check if index exists
      const checkIndex = await query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'tenants' AND indexname = 'idx_tenants_theme_id'
      `);
      
      if (checkIndex.rows.length === 0) {
        console.log('Creating index on theme_id...');
        await query(`
          CREATE INDEX idx_tenants_theme_id ON tenants(theme_id)
        `);
        console.log('✅ Index created');
      } else {
        console.log('✅ Index already exists');
      }
    } else {
      console.log('Adding theme_id column to tenants table...');
      
      // Add theme_id column
      await query(`
        ALTER TABLE tenants 
        ADD COLUMN IF NOT EXISTS theme_id VARCHAR(255)
      `);
      
      console.log('✅ theme_id column added');
      
      // Create index
      console.log('Creating index on theme_id...');
      await query(`
        CREATE INDEX IF NOT EXISTS idx_tenants_theme_id ON tenants(theme_id)
      `);
      
      console.log('✅ Index created');
    }
    
    // Verify the column exists and show current state
    const verifyColumn = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'tenants' AND column_name = 'theme_id'
    `);
    
    if (verifyColumn.rows.length > 0) {
      console.log('\n✅ Verification:');
      console.log('   Column:', verifyColumn.rows[0].column_name);
      console.log('   Type:', verifyColumn.rows[0].data_type);
      console.log('   Nullable:', verifyColumn.rows[0].is_nullable);
    }
    
    // Show current tenants and their theme_id values
    const tenants = await query(`
      SELECT id, name, theme_id 
      FROM tenants 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log('\n📊 Current tenants (showing first 10):');
    tenants.rows.forEach(tenant => {
      console.log(`   ${tenant.name} (${tenant.id}): theme_id = ${tenant.theme_id || 'NULL (custom)'}`);
    });
    
    console.log('\n✅ Script completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the script
addThemeIdColumn()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

