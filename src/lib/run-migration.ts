import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://eajxlakosmxdjyjczdwq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhanhsYWtvc214ZGp5amN6ZHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDY1MjAsImV4cCI6MjA2ODIyMjUyMH0.eTAy9aR6qD7OfnM-tM2w4XWGM4U0eMdog4rjyXnx76g'
)

// Function to call WordPress migration edge function
const callWordPressMigration = async (action: string, pageData?: any) => {
  const { data, error } = await supabase.functions.invoke('wordpress-migration', {
    body: { action, pageData }
  })

  if (error) {
    throw error
  }

  return data
}

// Function to test WordPress connection
export const testWordPressConnection = async () => {
  console.log('Testing WordPress connection...');
  
  try {
    const result = await callWordPressMigration('test-connection')
    
    if (result.success) {
      console.log('✅', result.message);
      return true;
    } else {
      console.error('❌ WordPress connection failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
};

// Function to test page creation permissions
export const testCreatePage = async () => {
  console.log('Testing WordPress page creation permissions...');
  
  try {
    const result = await callWordPressMigration('test-create')
    
    if (result.success) {
      console.log('✅', result.message);
      console.log('You can delete this test page from WordPress admin');
      return true;
    } else {
      console.error('❌ Page creation failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Page creation test failed:', error);
    return false;
  }
};

// Function to run the migration
export const runPageMigration = async () => {
  console.log('Starting WordPress page migration...');
  
  try {
    const result = await callWordPressMigration('migrate-all')
    
    if (result.success) {
      console.log('Migration completed!');
      console.log('Results:', result.results);
      
      // Show summary
      const successful = result.results.filter((r: any) => r.success).length;
      const failed = result.results.filter((r: any) => !r.success).length;
      
      console.log(`✅ Successfully migrated: ${successful} pages`);
      if (failed > 0) {
        console.log(`❌ Failed to migrate: ${failed} pages`);
        result.results.filter((r: any) => !r.success).forEach((r: any) => {
          console.log(`  - ${r.page}: ${r.error}`);
        });
      }
      
      return result.results;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};
// For development/testing - you can call this function from browser console
if (typeof window !== 'undefined') {
  (window as any).runPageMigration = runPageMigration;
  (window as any).testWordPressConnection = testWordPressConnection;
  (window as any).testCreatePage = testCreatePage;
}