/**
 * Create Master Header and Footer Pages
 * 
 * This script creates master Header and Footer pages (tenant_id = NULL)
 * that are shared across all tenants. These pages are empty by default
 * and can be customized by tenants if needed.
 */

import { query } from '../index.js';
import { createPage } from '../modules/pages.js';

export async function createMasterHeaderFooterPages() {
  console.log('[testing] Creating master Header and Footer pages...');
  
  try {
    // Check if master Header page exists
    const headerCheck = await query(`
      SELECT id FROM pages WHERE tenant_id IS NULL AND page_type = 'header'
    `);
    
    if (headerCheck.rows.length === 0) {
      await createPage({
        page_name: 'Header',
        slug: '/header',
        page_type: 'header',
        status: 'published',
        seo_index: false,
        tenant_id: null, // Master page
        meta_title: 'Header',
        meta_description: 'Site header configuration'
      });
      console.log('[testing] Created master Header page');
    } else {
      console.log('[testing] Master Header page already exists');
    }
    
    // Check if master Footer page exists
    const footerCheck = await query(`
      SELECT id FROM pages WHERE tenant_id IS NULL AND page_type = 'footer'
    `);
    
    if (footerCheck.rows.length === 0) {
      await createPage({
        page_name: 'Footer',
        slug: '/footer',
        page_type: 'footer',
        status: 'published',
        seo_index: false,
        tenant_id: null, // Master page
        meta_title: 'Footer',
        meta_description: 'Site footer configuration'
      });
      console.log('[testing] Created master Footer page');
    } else {
      console.log('[testing] Master Footer page already exists');
    }
    
    // Create empty layout JSON for master Header
    const headerResult = await query(`
      SELECT id FROM pages WHERE tenant_id IS NULL AND page_type = 'header'
    `);
    
    if (headerResult.rows.length > 0) {
      const headerId = headerResult.rows[0].id;
      const headerLayoutCheck = await query(`
        SELECT id FROM page_layouts WHERE page_id = $1 AND language = 'default'
      `, [headerId]);
      
      if (headerLayoutCheck.rows.length === 0) {
        await query(`
          INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
          VALUES ($1, 'default', $2::jsonb, 1, NOW())
        `, [headerId, JSON.stringify({ components: [] })]);
        console.log('[testing] Created empty layout for master Header page');
      }
    }
    
    // Create empty layout JSON for master Footer
    const footerResult = await query(`
      SELECT id FROM pages WHERE tenant_id IS NULL AND page_type = 'footer'
    `);
    
    if (footerResult.rows.length > 0) {
      const footerId = footerResult.rows[0].id;
      const footerLayoutCheck = await query(`
        SELECT id FROM page_layouts WHERE page_id = $1 AND language = 'default'
      `, [footerId]);
      
      if (footerLayoutCheck.rows.length === 0) {
        await query(`
          INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
          VALUES ($1, 'default', $2::jsonb, 1, NOW())
        `, [footerId, JSON.stringify({ components: [] })]);
        console.log('[testing] Created empty layout for master Footer page');
      }
    }
    
    console.log('[testing] Master Header and Footer pages setup complete');
    return true;
  } catch (error) {
    console.error('[testing] Error creating master Header/Footer pages:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createMasterHeaderFooterPages()
    .then(() => {
      console.log('[testing] Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[testing] Script failed:', error);
      process.exit(1);
    });
}

