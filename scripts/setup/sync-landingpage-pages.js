import dotenv from 'dotenv';
import { syncThemePages } from '../../sparti-cms/services/themeSync.js';

// Load environment variables
dotenv.config();

/**
 * Script to sync pages from landingpage theme to database
 * This registers the Homepage in the database for the Landing Page theme
 */
async function syncLandingPagePages() {
  console.log('Starting landingpage pages sync...');
  
  try {
    const result = await syncThemePages('landingpage');
    
    if (result.success) {
      console.log(`✅ Pages sync completed: ${result.message}`);
      console.log(`   Synced ${result.synced} page(s) out of ${result.total} found`);
      
      if (result.results && result.results.length > 0) {
        console.log('\n📋 Sync Results:');
        result.results.forEach(pageResult => {
          console.log(`   - ${pageResult.slug}: ${pageResult.action} (${pageResult.name})`);
        });
      }
      
      // Verify pages exist in database
      const { query } = await import('../../sparti-cms/db/index.js');
      const pagesCheck = await query(`
        SELECT id, page_name, slug, theme_id, status
        FROM pages
        WHERE theme_id = 'landingpage'
        ORDER BY page_name ASC
      `);
      
      if (pagesCheck.rows.length > 0) {
        console.log('\n✅ Pages registered in database:');
        pagesCheck.rows.forEach(page => {
          console.log(`   - ${page.page_name} (${page.slug}) - Status: ${page.status}`);
        });
      } else {
        console.log('\n⚠️  Warning: No pages found in database for landingpage theme');
      }
    } else {
      console.error('❌ Pages sync failed:', result.error);
      throw new Error(result.error || 'Sync failed');
    }
    
    console.log('\n✅ Script completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the script
syncLandingPagePages()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });


