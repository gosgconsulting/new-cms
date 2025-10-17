/**
 * Simple Test Script for SEO Pages Database Tables
 * Direct database connection test without MCP layer
 */

import { Pool } from 'pg';

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_PUBLIC_URL || 
                   process.env.DATABASE_URL || 
                   'postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@trolley.proxy.rlwy.net:58867/railway',
  ssl: { rejectUnauthorized: false },
};

const pool = new Pool(dbConfig);

async function testConnection() {
  try {
    console.log('[testing] Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function createTables() {
  try {
    console.log('[testing] Creating SEO pages tables...');
    
    // Create pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        meta_title VARCHAR(255),
        meta_description TEXT,
        seo_index BOOLEAN DEFAULT true,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create landing pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS landing_pages (
        id SERIAL PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        meta_title VARCHAR(255),
        meta_description TEXT,
        seo_index BOOLEAN DEFAULT true,
        campaign_source VARCHAR(100),
        conversion_goal VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create legal pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS legal_pages (
        id SERIAL PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        meta_title VARCHAR(255),
        meta_description TEXT,
        seo_index BOOLEAN DEFAULT false,
        legal_type VARCHAR(100),
        last_reviewed_date DATE,
        version VARCHAR(20) DEFAULT '1.0',
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    console.log('✅ SEO pages tables created successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to create tables:', error.message);
    return false;
  }
}

async function insertSampleData() {
  try {
    console.log('[testing] Inserting sample data...');

    // Insert sample pages
    await pool.query(`
      INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status) VALUES
      ('Homepage', '/', 'GO SG - Professional SEO Services Singapore', 'Leading SEO agency in Singapore providing comprehensive digital marketing solutions to boost your online presence and drive organic traffic.', true, 'published'),
      ('About Us', '/about', 'About GO SG - Your Trusted SEO Partner in Singapore', 'Learn about GO SG, Singapore''s premier SEO agency. Discover our mission, team, and commitment to delivering exceptional digital marketing results.', true, 'published')
      ON CONFLICT (slug) DO NOTHING
    `);

    // Insert sample landing pages
    await pool.query(`
      INSERT INTO landing_pages (page_name, slug, meta_title, meta_description, seo_index, campaign_source, conversion_goal, status) VALUES
      ('SEO Services Landing', '/seo-services', 'Professional SEO Services Singapore - Boost Your Rankings', 'Transform your online presence with our expert SEO services. Increase organic traffic, improve search rankings, and grow your business in Singapore.', true, 'google-ads', 'Lead Generation', 'published')
      ON CONFLICT (slug) DO NOTHING
    `);

    // Insert sample legal pages
    await pool.query(`
      INSERT INTO legal_pages (page_name, slug, meta_title, meta_description, seo_index, legal_type, last_reviewed_date, version, status) VALUES
      ('Privacy Policy', '/privacy-policy', 'Privacy Policy - GO SG', 'Learn how GO SG collects, uses, and protects your personal information. Our comprehensive privacy policy ensures your data security and transparency.', false, 'privacy-policy', CURRENT_DATE, '1.0', 'published')
      ON CONFLICT (slug) DO NOTHING
    `);

    console.log('✅ Sample data inserted successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to insert sample data:', error.message);
    return false;
  }
}

async function testQueries() {
  try {
    console.log('[testing] Testing queries...');

    // Test pages query
    const pagesResult = await pool.query('SELECT COUNT(*) as count FROM pages');
    console.log(`✅ Pages table: ${pagesResult.rows[0].count} records`);

    // Test landing pages query
    const landingResult = await pool.query('SELECT COUNT(*) as count FROM landing_pages');
    console.log(`✅ Landing pages table: ${landingResult.rows[0].count} records`);

    // Test legal pages query
    const legalResult = await pool.query('SELECT COUNT(*) as count FROM legal_pages');
    console.log(`✅ Legal pages table: ${legalResult.rows[0].count} records`);

    // Test unified view
    const unifiedResult = await pool.query(`
      SELECT 
        page_name,
        slug,
        meta_title,
        seo_index,
        'page' as page_type
      FROM pages
      UNION ALL
      SELECT 
        page_name,
        slug,
        meta_title,
        seo_index,
        'landing' as page_type
      FROM landing_pages
      UNION ALL
      SELECT 
        page_name,
        slug,
        meta_title,
        seo_index,
        'legal' as page_type
      FROM legal_pages
      ORDER BY page_type, page_name
    `);

    console.log('\n📋 All Pages Summary:');
    unifiedResult.rows.forEach(row => {
      const indexStatus = row.seo_index ? 'INDEX' : 'NOINDEX';
      console.log(`  ${row.page_type.toUpperCase()}: ${row.page_name} (${row.slug}) - ${indexStatus}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to test queries:', error.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Starting SEO Pages Database Test\n');

  try {
    // Test connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      throw new Error('Database connection failed');
    }

    // Create tables
    const tablesOk = await createTables();
    if (!tablesOk) {
      throw new Error('Table creation failed');
    }

    // Insert sample data
    const dataOk = await insertSampleData();
    if (!dataOk) {
      throw new Error('Sample data insertion failed');
    }

    // Test queries
    const queriesOk = await testQueries();
    if (!queriesOk) {
      throw new Error('Query testing failed');
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📊 Database Schema Summary:');
    console.log('  ✓ pages - Regular website pages with SEO metadata');
    console.log('  ✓ landing_pages - Marketing landing pages with campaign tracking');
    console.log('  ✓ legal_pages - Legal documents with version control');
    console.log('\n🔑 Key Features:');
    console.log('  • SEO metadata (meta_title, meta_description, seo_index)');
    console.log('  • Status management (draft, published, archived)');
    console.log('  • Campaign tracking for landing pages');
    console.log('  • Version control for legal pages');
    console.log('  • Unified view across all page types');

    return { success: true };

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run the test
runTest()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
