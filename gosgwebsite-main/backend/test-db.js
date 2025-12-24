import { testConnection, getHomePage, getPageLayout } from './db.js';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

async function testDatabase() {
  try {
    console.log('=== Testing Database Connection ===');
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to database');
      return;
    }
    
    // Get tenant ID from environment variable
    const tenantId = process.env.CMS_TENANT;
    console.log('Using tenant ID:', tenantId);
    
    // Get home page
    console.log('\n=== Testing Home Page Query ===');
    const homePage = await getHomePage(tenantId);
    if (!homePage) {
      console.error('Home page not found');
      return;
    }
    
    console.log('Home page found:', {
      id: homePage.id,
      page_name: homePage.page_name,
      slug: homePage.slug,
      meta_title: homePage.meta_title
    });
    
    // Get page layout
    console.log('\n=== Testing Page Layout Query ===');
    const pageLayout = await getPageLayout(homePage.id);
    if (!pageLayout) {
      console.error('Page layout not found');
      return;
    }
    
    console.log('Page layout found:', {
      layout_json_type: typeof pageLayout.layout_json,
      has_components: pageLayout.layout_json && typeof pageLayout.layout_json === 'object' && pageLayout.layout_json.components ? 'Yes' : 'No'
    });
    
    console.log('\n=== Database Tests Completed Successfully ===');
  } catch (error) {
    console.error('Error during database tests:', error);
  }
}

testDatabase();
