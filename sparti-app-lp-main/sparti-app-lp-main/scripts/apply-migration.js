// Script to apply the backfill migration directly to Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = "https://fkemumodynkaeojrrkbj.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZW11bW9keW5rYWVvanJya2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzAzNjI5NywiZXhwIjoyMDYyNjEyMjk3fQ.example";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...');
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250811120000_backfill_blog_posts_into_seo_campaigns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Applying migration to Supabase...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration applied successfully!');
    console.log('📊 Result:', data);
    
    // Test the unified view
    console.log('🔍 Testing unified campaigns view...');
    const { data: campaigns, error: viewError } = await supabase
      .from('v_brand_all_campaigns')
      .select('*')
      .limit(5);
    
    if (viewError) {
      console.error('❌ View test failed:', viewError);
    } else {
      console.log('✅ Unified view working! Found', campaigns?.length || 0, 'campaigns');
    }
    
  } catch (err) {
    console.error('❌ Script error:', err);
    process.exit(1);
  }
}

applyMigration();

