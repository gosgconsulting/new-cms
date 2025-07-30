import { migrateReactPagesToWordPress } from './wordpress-migration';

// Function to test WordPress connection
export const testWordPressConnection = async () => {
  console.log('Testing WordPress connection...');
  
  try {
    const username = 'admin';
    const password = '1n5q WknY lU1C hGXI 3Yzm 8dah';
    const credentials = btoa(`${username}:${password}`);
    
    // Test with a GET request first
    const response = await fetch(`https://gosgconsulting.com/cms/wp-json/wp/v2/pages?per_page=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });
    
    if (response.ok) {
      const pages = await response.json();
      console.log('✅ WordPress connection successful!');
      console.log(`Found ${pages.length} existing pages`);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ WordPress connection failed:', response.status, errorText);
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
    const username = 'admin';
    const password = '1n5q WknY lU1C hGXI 3Yzm 8dah';
    const credentials = btoa(`${username}:${password}`);
    
    const testPageData = {
      title: 'Test Page - Delete Me',
      content: '<p>This is a test page created to verify permissions.</p>',
      status: 'draft',
      slug: 'test-page-delete-me'
    };
    
    const response = await fetch(`https://gosgconsulting.com/cms/wp-json/wp/v2/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify(testPageData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Page creation successful!');
      console.log('Created test page:', result.title.rendered);
      console.log('You can delete this test page from WordPress admin');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Page creation failed:');
      console.error(`Status: ${response.status}`);
      console.error(`Error details:`, errorText);
      
      // Parse JSON error if possible
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error:', errorJson);
      } catch (e) {
        // Error text is not JSON
      }
      
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