const fs = require('fs');
const { Pool } = require('pg');

// Read the new layout JSON
const newLayout = JSON.parse(fs.readFileSync('new_homepage_layout.json', 'utf8'));

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@mainline.proxy.rlwy.net:37013/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateHomepageContent() {
  try {
    console.log('Connecting to database...');
    
    // Update the homepage layout
    const result = await pool.query(
      'UPDATE page_layouts SET layout_json = $1 WHERE page_id = 6 RETURNING id, page_id',
      [JSON.stringify(newLayout)]
    );
    
    console.log('Homepage content updated successfully!');
    console.log('Updated layout ID:', result.rows[0].id);
    console.log('Page ID:', result.rows[0].page_id);
    
  } catch (error) {
    console.error('Error updating homepage content:', error);
  } finally {
    await pool.end();
  }
}

updateHomepageContent();

