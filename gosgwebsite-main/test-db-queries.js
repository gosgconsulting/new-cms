import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
});

async function testDatabaseQueries() {
  try {
    console.log('=== Testing Database Queries ===');
    
    // Get tenant ID from environment variable
    const tenantId = process.env.CMS_TENANT;
    console.log('Using tenant ID:', tenantId || 'Not set');
    
    if (!tenantId) {
      console.log('CMS_TENANT environment variable not set. Will try direct queries without tenant_id.')
    }
    
    // Test database connection
    const connectionResult = await pool.query('SELECT NOW()');
    console.log('Database connected successfully:', connectionResult.rows[0].now);
    
    // Query pages table for Homepage
    console.log('\n1. Testing query for Homepage:');
    let homepageResult;
    
    if (tenantId) {
      console.log('Querying with tenant_id and page_name:');
      homepageResult = await pool.query(
        'SELECT id, page_name, slug FROM pages WHERE tenant_id = $1 AND page_name = $2',
        [tenantId, 'Homepage']
      );
    } else {
      console.log('Querying by ID directly:');
      homepageResult = await pool.query(
        'SELECT id, page_name, slug FROM pages WHERE id = $1',
        [5] // Using ID 5 as seen in the database screenshot
      );
    }
    
    if (homepageResult.rows.length === 0) {
      console.log('No Homepage found for tenant', tenantId);
    } else {
      console.log('Homepage found:', homepageResult.rows[0]);
      const pageId = homepageResult.rows[0].id;

      // Query page_layouts table for the found page_id
      console.log('\n2. Testing query for page layout with page_id:', pageId);
      const layoutResult = await pool.query(
        'SELECT id, page_id FROM page_layouts WHERE page_id = $1',
        [pageId]
      );

      if (layoutResult.rows.length === 0) {
        console.log('No layout found for page ID:', pageId);
      } else {
        console.log('Layout found:', layoutResult.rows[0]);
      }

      // Query layout_json content
      console.log('\n3. Testing query for layout_json:');
      const layoutJsonResult = await pool.query(
        'SELECT layout_json FROM page_layouts WHERE page_id = $1',
        [pageId]
      );

      if (layoutJsonResult.rows.length > 0) {
        const layoutJson = layoutJsonResult.rows[0].layout_json;
        console.log('Layout JSON type:', typeof layoutJson);
        if (typeof layoutJson === 'string') {
          try {
            const parsedJson = JSON.parse(layoutJson);
            console.log('Layout JSON is a string, successfully parsed to object with keys:', Object.keys(parsedJson));
          } catch (e) {
            console.error('Error parsing layout JSON string:', e);
          }
        } else {
          console.log('Layout JSON is an object with keys:', Object.keys(layoutJson));
        }
      } else {
        console.log('No layout_json found for page ID:', pageId);
      }
    }

    // Query all pages for the tenant
    console.log('\n4. Testing query for all pages with tenant_id:');
    const allPagesResult = await pool.query(
      'SELECT id, page_name, slug FROM pages WHERE tenant_id = $1',
      [tenantId]
    );
    if (allPagesResult.rows.length === 0) {
      console.log('Found 0 pages for tenant', tenantId);
    } else {
      console.log(`Found ${allPagesResult.rows.length} pages for tenant ${tenantId}:`);
      allPagesResult.rows.forEach(page => console.log(`- ID: ${page.id}, Name: ${page.page_name}, Slug: ${page.slug}`));
    }

    // Query all page_layouts
    console.log('\n5. Testing query for all page layouts:');
    const allLayoutsResult = await pool.query('SELECT id, page_id FROM page_layouts');
    if (allLayoutsResult.rows.length === 0) {
      console.log('Found 0 page layouts.');
    } else {
      console.log(`Found ${allLayoutsResult.rows.length} page layouts:`);
      allLayoutsResult.rows.forEach(layout => console.log(`- Layout ID: ${layout.id}, Page ID: ${layout.page_id}`));
    }

  } catch (error) {
    console.error('Error during database query tests:', error);
  } finally {
    await pool.end();
    console.log('\n=== Database Query Tests Completed ===');
  }
}

testDatabaseQueries();