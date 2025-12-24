// Script to apply the shared campaign fix migration
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  // Get Supabase credentials from environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    process.exit(1);
  }

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250812030000_fix_shared_campaign_functions.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('Applying shared campaign fix migration...');
  
  try {
    // Execute the SQL directly
    const { error } = await supabase.rpc('pgtle_install_sql', { 
      sql_string: migrationSql 
    });
    
    if (error) {
      console.error('Error applying migration:', error);
      process.exit(1);
    }
    
    console.log('Migration applied successfully!');
    console.log('The shared campaign links should now display blog articles correctly.');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

applyMigration().catch(console.error);
