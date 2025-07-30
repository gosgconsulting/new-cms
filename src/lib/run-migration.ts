import { migrateReactPagesToWordPress } from './wordpress-migration';

// Function to run the migration
export const runPageMigration = async () => {
  console.log('Starting WordPress page migration...');
  
  try {
    const results = await migrateReactPagesToWordPress();
    
    console.log('Migration completed!');
    console.log('Results:', results);
    
    // Show summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successfully migrated: ${successful} pages`);
    if (failed > 0) {
      console.log(`❌ Failed to migrate: ${failed} pages`);
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.page}: ${r.error}`);
      });
    }
    
    return results;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// For development/testing - you can call this function from browser console
if (typeof window !== 'undefined') {
  (window as any).runPageMigration = runPageMigration;
}