/**
 * Initialize Header and Footer Pages for All Tenants
 * 
 * This script creates Header and Footer pages for all existing tenants
 * that don't already have them.
 */

import { query } from '../../sparti-cms/db/index.js';
import { createPage } from '../../sparti-cms/db/modules/pages.js';

async function initializeHeaderFooterPages() {
  console.log('Starting Header/Footer pages initialization...');
  
  try {
    // Get all tenants
    const tenantsResult = await query(`SELECT id, name FROM tenants`);
    const tenants = tenantsResult.rows;
    
    if (tenants.length === 0) {
      console.log('No tenants found. Exiting.');
      process.exit(0);
    }
    
    console.log(`Found ${tenants.length} tenant(s)`);
    
    let headerCreated = 0;
    let footerCreated = 0;
    let headerSkipped = 0;
    let footerSkipped = 0;
    
    for (const tenant of tenants) {
      console.log(`\nProcessing tenant: ${tenant.name} (${tenant.id})`);
      
      // Check and create Header page
      const headerCheck = await query(`
        SELECT id FROM pages WHERE tenant_id = $1 AND page_type = 'header'
      `, [tenant.id]);
      
      if (headerCheck.rows.length === 0) {
        try {
          await createPage({
            page_name: 'Header',
            slug: '/header',
            page_type: 'header',
            status: 'published',
            seo_index: false,
            tenant_id: tenant.id,
            meta_title: 'Header',
            meta_description: 'Site header configuration'
          });
          headerCreated++;
          console.log(`  ✓ Created Header page`);
        } catch (error) {
          console.error(`  ✗ Error creating Header page:`, error.message);
        }
      } else {
        headerSkipped++;
        console.log(`  - Header page already exists`);
      }
      
      // Check and create Footer page
      const footerCheck = await query(`
        SELECT id FROM pages WHERE tenant_id = $1 AND page_type = 'footer'
      `, [tenant.id]);
      
      if (footerCheck.rows.length === 0) {
        try {
          await createPage({
            page_name: 'Footer',
            slug: '/footer',
            page_type: 'footer',
            status: 'published',
            seo_index: false,
            tenant_id: tenant.id,
            meta_title: 'Footer',
            meta_description: 'Site footer configuration'
          });
          footerCreated++;
          console.log(`  ✓ Created Footer page`);
        } catch (error) {
          console.error(`  ✗ Error creating Footer page:`, error.message);
        }
      } else {
        footerSkipped++;
        console.log(`  - Footer page already exists`);
      }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Header pages: ${headerCreated} created, ${headerSkipped} skipped`);
    console.log(`Footer pages: ${footerCreated} created, ${footerSkipped} skipped`);
    console.log(`\nInitialization complete!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing Header/Footer pages:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeHeaderFooterPages();

