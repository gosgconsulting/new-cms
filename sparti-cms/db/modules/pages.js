import { query } from '../connection.js';
import pool from '../connection.js';
import { translateText } from '../../services/googleTranslationService.js';
import models from '../sequelize/models/index.js';
import { Op } from 'sequelize';

const { Page } = models;

export async function initializeSEOPagesTables() {
  try {
    console.log('Initializing unified pages table...');
    
    // Run page tables migration
    const { runMigrations } = await import('../sequelize/run-migrations.js');
    await runMigrations(['20241202000003-create-page-tables.js']);

    // Create master Header and Footer pages (tenant_id = NULL)
    const { createMasterHeaderFooterPages } = await import('../scripts/create-master-header-footer-pages.js');
    await createMasterHeaderFooterPages();

    // Seed a default homepage and layout if not present (tenant-specific)
    const homePageRes = await query(`SELECT id FROM pages WHERE slug = '/' AND tenant_id = 'tenant-gosg'`);
    let homePageId = homePageRes.rows[0]?.id;
    if (!homePageId) {
      const created = await query(`
        INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status, tenant_id)
        VALUES ('Homepage', '/', 'GO SG - Professional SEO Services Singapore', 'Leading SEO agency in Singapore providing comprehensive digital marketing solutions to boost your online presence and drive organic traffic.', true, 'published', 'tenant-gosg')
        RETURNING id
      `);
      homePageId = created.rows[0].id;
    }

    const layoutCheck = await query(`SELECT 1 FROM page_layouts WHERE page_id = $1 AND language = 'default'`, [homePageId]);
    if (layoutCheck.rows.length === 0) {
      const defaultLayout = {
        components: [
          { key: 'Header', props: {} },
          { key: 'HeroSection', props: { headline: 'Rank #1 on Google' } },
          { key: 'SEOResultsSection', props: {} },
          { key: 'SEOServicesShowcase', props: {} },
          { key: 'NewTestimonials', props: {} },
          { key: 'FAQAccordion', props: { title: 'Frequently Asked Questions' } },
          { key: 'BlogSection', props: {} },
          { key: 'ContactForm', props: {} },
          { key: 'Footer', props: {} },
        ]
      };
      await query(`
        INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
        VALUES ($1, 'default', $2, 1, NOW())
        ON CONFLICT (page_id, language) DO NOTHING
      `, [homePageId, JSON.stringify(defaultLayout)]);
    }

    console.log('Unified pages table initialized successfully');
    return true;
  } catch (error) {
    console.error('Pages table initialization failed:', error);
    return false;
  }
}

// Unified Pages CRUD functions
export async function createPage(pageData) {
  try {
    const {
      page_type = 'page',
      campaign_source,
      conversion_goal,
      legal_type,
      last_reviewed_date,
      version,
      tenant_id = 'tenant-gosg',
      ...commonFields
    } = pageData;

    const page = await Page.create({
      page_name: commonFields.page_name,
      slug: commonFields.slug,
      meta_title: commonFields.meta_title || null,
      meta_description: commonFields.meta_description || null,
      seo_index: commonFields.seo_index !== undefined ? commonFields.seo_index : (page_type === 'legal' ? false : true),
      status: commonFields.status || 'draft',
      page_type: page_type,
      tenant_id: tenant_id,
      campaign_source: campaign_source || null,
      conversion_goal: conversion_goal || null,
      legal_type: legal_type || null,
      last_reviewed_date: last_reviewed_date || null,
      version: version || (page_type === 'legal' ? '1.0' : null)
    });
    
    return page.toJSON();
  } catch (error) {
    console.error('Error creating page:', error);
    throw error;
  }
}

export async function getPages(pageType = null, tenantId = 'tenant-gosg') {
  try {
    // Include master pages (tenant_id = NULL) and tenant-specific pages
    const whereClause = {
      [Op.or]: [
        { tenant_id: tenantId },
        { tenant_id: null }
      ]
    };
    
    if (pageType) {
      whereClause.page_type = pageType;
    }
    
    const pages = await Page.findAll({
      where: whereClause,
      order: [
        [Page.sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), 'ASC'],
        ['page_type', 'ASC'],
        ['created_at', 'DESC']
      ]
    });
    
    return pages.map(page => page.toJSON());
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
}

export async function getPage(pageId, tenantId = 'tenant-gosg') {
  try {
    // Include master pages (tenant_id = NULL) and tenant-specific pages
    // Prefer tenant-specific over master
    const page = await Page.findOne({
      where: {
        id: pageId,
        [Op.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      order: [
        [Page.sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), 'ASC']
      ]
    });
    
    return page ? page.toJSON() : null;
  } catch (error) {
    console.error('Error fetching page:', error);
    throw error;
  }
}

export async function getPageBySlug(slug, tenantId = 'tenant-gosg') {
  try {
    // Include master pages (tenant_id = NULL) and tenant-specific pages
    // Prefer tenant-specific over master
    const page = await Page.findOne({
      where: {
        slug: slug,
        [Op.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      order: [
        [Page.sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), 'ASC']
      ]
    });
    
    return page ? page.toJSON() : null;
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    throw error;
  }
}

export async function updatePage(pageId, pageData, tenantId = 'tenant-gosg') {
  try {
    // Check if it's a master page and prevent update
    const existingPage = await Page.findByPk(pageId);
    if (!existingPage) {
      throw new Error('Page not found');
    }
    if (!existingPage.tenant_id) {
      throw new Error('Cannot update master page. Master pages (tenant_id = NULL) are shared across all tenants.');
    }
    
    const {
      campaign_source,
      conversion_goal,
      legal_type,
      last_reviewed_date,
      version,
      ...commonFields
    } = pageData;

    // Build update object, only including defined fields
    const updateData = {};
    if (commonFields.page_name !== undefined) updateData.page_name = commonFields.page_name;
    if (commonFields.slug !== undefined) updateData.slug = commonFields.slug;
    if (commonFields.meta_title !== undefined) updateData.meta_title = commonFields.meta_title;
    if (commonFields.meta_description !== undefined) updateData.meta_description = commonFields.meta_description;
    if (commonFields.seo_index !== undefined) updateData.seo_index = commonFields.seo_index;
    if (commonFields.status !== undefined) updateData.status = commonFields.status;
    if (campaign_source !== undefined) updateData.campaign_source = campaign_source;
    if (conversion_goal !== undefined) updateData.conversion_goal = conversion_goal;
    if (legal_type !== undefined) updateData.legal_type = legal_type;
    if (last_reviewed_date !== undefined) updateData.last_reviewed_date = last_reviewed_date;
    if (version !== undefined) updateData.version = version;
    
    const [updatedCount] = await Page.update(updateData, {
      where: {
        id: pageId,
        tenant_id: tenantId
      }
    });
    
    if (updatedCount === 0) {
      throw new Error('Page not found or is a master page (cannot update master pages)');
    }
    
    // Fetch and return updated page
    const updatedPage = await Page.findByPk(pageId);
    return updatedPage.toJSON();
  } catch (error) {
    console.error('Error updating page:', error);
    throw error;
  }
}

export async function deletePage(pageId, tenantId = 'tenant-gosg') {
  try {
    // Check if it's a master page and prevent deletion
    const existingPage = await Page.findByPk(pageId);
    if (!existingPage) {
      throw new Error('Page not found');
    }
    if (!existingPage.tenant_id) {
      throw new Error('Cannot delete master page. Master pages (tenant_id = NULL) are shared across all tenants.');
    }
    
    const deletedCount = await Page.destroy({
      where: {
        id: pageId,
        tenant_id: tenantId
      }
    });
    
    if (deletedCount === 0) {
      throw new Error('Page not found or is a master page (cannot delete master pages)');
    }
    
    return deletedCount > 0;
  } catch (error) {
    console.error('Error deleting page:', error);
    throw error;
  }
}

// Note: Separate CRUD functions for landing and legal pages have been removed.
// Use the unified createPage, getPages, updatePage, deletePage functions with page_type parameter.

// Utility function to get all pages with their types
export async function getAllPagesWithTypes(tenantId = 'tenant-gosg', themeId = null) {
  try {
    console.log(`[testing] getAllPagesWithTypes: Called with tenantId=${tenantId}, themeId=${themeId || 'null'}`);
    
    // Include master pages (tenant_id = NULL) and tenant-specific pages
    let queryText = `
      SELECT 
        id,
        page_name,
        slug,
        meta_title,
        meta_description,
        seo_index,
        status,
        page_type,
        theme_id,
        tenant_id,
        created_at,
        updated_at,
        campaign_source,
        conversion_goal,
        legal_type,
        last_reviewed_date,
        version
      FROM pages
      WHERE (tenant_id = $1 OR tenant_id IS NULL)
    `;
    
    const params = [tenantId];
    
    // Filter by theme_id
    if (themeId === 'custom' || themeId === null) {
      // For 'custom' theme, show pages where theme_id IS NULL
      queryText += ` AND (theme_id IS NULL OR theme_id = 'custom')`;
      console.log(`[testing] getAllPagesWithTypes: Filtering for custom theme (theme_id IS NULL OR 'custom')`);
    } else if (themeId) {
      // For specific theme, show pages where theme_id matches
      queryText += ` AND theme_id = $2`;
      params.push(themeId);
      console.log(`[testing] getAllPagesWithTypes: Filtering for theme_id = ${themeId}`);
    }
    
    // Order by tenant-specific first, then master
    queryText += ` ORDER BY 
      CASE WHEN tenant_id = $1 THEN 0 ELSE 1 END,
      page_type, 
      created_at DESC`;
    
    console.log(`[testing] getAllPagesWithTypes: Executing query: ${queryText}`);
    console.log(`[testing] getAllPagesWithTypes: Query params:`, params);
    
    const result = await query(queryText, params);
    const dbPages = result.rows;
    console.log(`[testing] getAllPagesWithTypes: Database returned ${dbPages.length} page(s)`);
    
    // Log theme_ids of returned pages for debugging
    if (dbPages.length > 0) {
      const themeIds = dbPages.map(p => p.theme_id).filter((v, i, a) => a.indexOf(v) === i);
      console.log(`[testing] getAllPagesWithTypes: Theme IDs in database results: ${themeIds.join(', ')}`);
    }
    
    // Special handling for demo tenant: if database returns empty or no matching pages, get pages from file systems
    // Check if we have matching pages for the requested theme
    const hasMatchingPages = dbPages.length > 0 && (
      !themeId || 
      themeId === 'custom' || 
      dbPages.some(page => {
        if (themeId === 'custom' || themeId === null) {
          return !page.theme_id || page.theme_id === 'custom';
        }
        return page.theme_id === themeId;
      })
    );
    
    console.log(`[testing] getAllPagesWithTypes: tenantId === 'demo': ${tenantId === 'demo'}`);
    console.log(`[testing] getAllPagesWithTypes: dbPages.length === 0: ${dbPages.length === 0}`);
    console.log(`[testing] getAllPagesWithTypes: hasMatchingPages: ${hasMatchingPages}`);
    
    if (tenantId === 'demo' && (!hasMatchingPages || dbPages.length === 0)) {
      console.log(`[testing] Demo tenant: No matching pages in database, fetching from file system (theme: ${themeId || 'all'})`);
      
      try {
        // Import theme sync functions
        const { getThemesFromFileSystem, getThemePagesFromFileSystem, syncDemoTenantPagesFromFileSystem } = await import('../../services/themeSync.js');
        
        const allThemePages = [];
        
        // If a specific theme is selected (not 'custom' or null), only get pages from that theme
        if (themeId && themeId !== 'custom') {
          console.log(`[testing] Demo tenant: Fetching pages for specific theme: ${themeId}`);
          try {
            const themePages = getThemePagesFromFileSystem(themeId);
            console.log(`[testing] Demo tenant: getThemePagesFromFileSystem returned:`, themePages ? `${themePages.length} page(s)` : 'null/undefined');
            
            if (themePages && Array.isArray(themePages) && themePages.length > 0) {
              // Validate and map pages
              const validPages = themePages.filter(page => {
                const isValid = page && page.page_name && page.slug;
                if (!isValid) {
                  console.warn(`[testing] Demo tenant: Skipping invalid page:`, page);
                }
                return isValid;
              });
              
              const pagesWithThemeId = validPages.map(page => ({
                ...page,
                theme_id: themeId,
                tenant_id: 'demo',
                from_filesystem: true,
                // Ensure required fields are present
                id: page.id || `theme-${themeId}-${page.slug.replace(/^\/+|\/+$/g, '').replace(/\//g, '-') || 'homepage'}`,
                page_type: page.page_type || 'page',
                status: page.status || 'published'
              }));
              allThemePages.push(...pagesWithThemeId);
              console.log(`[testing] Demo tenant: Found ${pagesWithThemeId.length} valid page(s) from theme ${themeId}`);
              
              // Optionally sync to database for future queries (non-blocking)
              syncDemoTenantPagesFromFileSystem(themeId).catch(syncError => {
                console.error(`[testing] Failed to sync pages to database (non-critical):`, syncError);
              });
            } else {
              console.warn(`[testing] Demo tenant: No pages found in file system for theme ${themeId} (result: ${themePages ? 'empty array' : 'null/undefined'})`);
            }
          } catch (themeError) {
            console.error(`[testing] Error getting pages for theme ${themeId}:`, themeError);
            console.error(`[testing] Error stack:`, themeError.stack);
          }
        } else {
          // If no specific theme or 'custom', get pages from all themes
          console.log('[testing] Demo tenant: Fetching pages from all themes');
          const themes = getThemesFromFileSystem();
          console.log(`[testing] Demo tenant: Found ${themes.length} theme(s) in file system`);
          
          for (const theme of themes) {
            try {
              const themePages = getThemePagesFromFileSystem(theme.slug);
              console.log(`[testing] Demo tenant: getThemePagesFromFileSystem for ${theme.slug} returned:`, themePages ? `${themePages.length} page(s)` : 'null/undefined');
              
              if (themePages && Array.isArray(themePages) && themePages.length > 0) {
                // Validate and map pages
                const validPages = themePages.filter(page => {
                  const isValid = page && page.page_name && page.slug;
                  if (!isValid) {
                    console.warn(`[testing] Demo tenant: Skipping invalid page from theme ${theme.slug}:`, page);
                  }
                  return isValid;
                });
                
                const pagesWithThemeId = validPages.map(page => ({
                  ...page,
                  theme_id: theme.slug,
                  tenant_id: 'demo',
                  from_filesystem: true,
                  // Ensure required fields are present
                  id: page.id || `theme-${theme.slug}-${page.slug.replace(/^\/+|\/+$/g, '').replace(/\//g, '-') || 'homepage'}`,
                  page_type: page.page_type || 'page',
                  status: page.status || 'published'
                }));
                allThemePages.push(...pagesWithThemeId);
                console.log(`[testing] Demo tenant: Found ${pagesWithThemeId.length} valid page(s) from theme ${theme.slug}`);
              } else {
                console.log(`[testing] Demo tenant: No pages found in file system for theme ${theme.slug} (result: ${themePages ? 'empty array' : 'null/undefined'})`);
              }
            } catch (themeError) {
              console.error(`[testing] Error getting pages for theme ${theme.slug}:`, themeError);
              console.error(`[testing] Error stack:`, themeError.stack);
              // Continue with other themes even if one fails
            }
          }
          
          // Optionally sync all themes to database for future queries (non-blocking)
          if (allThemePages.length > 0) {
            syncDemoTenantPagesFromFileSystem(null).catch(syncError => {
              console.error(`[testing] Failed to sync pages to database (non-critical):`, syncError);
            });
          }
        }
        
        console.log(`[testing] Demo tenant: Total ${allThemePages.length} page(s) from file system`);
        if (allThemePages.length === 0) {
          console.warn(`[testing] Demo tenant: No pages found in file system. Check if themes have pages.json files.`);
        }
        return allThemePages;
      } catch (fsError) {
        console.error('[testing] Error fetching pages from file system for demo tenant:', fsError);
        // Return empty array if file system fallback also fails
        return [];
      }
    }
    
    return dbPages;
  } catch (error) {
    console.error('[testing] Error fetching all pages with types:', error);
    
    // For demo tenant, try file system fallback even on database error
    if (tenantId === 'demo') {
      console.log(`[testing] Demo tenant: Database error, trying file system fallback (theme: ${themeId || 'all'})`);
      try {
        const { getThemesFromFileSystem, getThemePagesFromFileSystem, syncDemoTenantPagesFromFileSystem } = await import('../../services/themeSync.js');
        const allThemePages = [];
        
        // If a specific theme is selected (not 'custom' or null), only get pages from that theme
        if (themeId && themeId !== 'custom') {
          console.log(`[testing] Demo tenant: Fetching pages for specific theme: ${themeId}`);
          try {
            const themePages = getThemePagesFromFileSystem(themeId);
            console.log(`[testing] Demo tenant: getThemePagesFromFileSystem returned:`, themePages ? `${themePages.length} page(s)` : 'null/undefined');
            
            if (themePages && Array.isArray(themePages) && themePages.length > 0) {
              // Validate and map pages
              const validPages = themePages.filter(page => {
                const isValid = page && page.page_name && page.slug;
                if (!isValid) {
                  console.warn(`[testing] Demo tenant: Skipping invalid page:`, page);
                }
                return isValid;
              });
              
              const pagesWithThemeId = validPages.map(page => ({
                ...page,
                theme_id: themeId,
                tenant_id: 'demo',
                from_filesystem: true,
                // Ensure required fields are present
                id: page.id || `theme-${themeId}-${page.slug.replace(/^\/+|\/+$/g, '').replace(/\//g, '-') || 'homepage'}`,
                page_type: page.page_type || 'page',
                status: page.status || 'published'
              }));
              allThemePages.push(...pagesWithThemeId);
              console.log(`[testing] Demo tenant: Found ${pagesWithThemeId.length} valid page(s) from theme ${themeId}`);
              
              // Optionally sync to database for future queries (non-blocking)
              syncDemoTenantPagesFromFileSystem(themeId).catch(syncError => {
                console.error(`[testing] Failed to sync pages to database (non-critical):`, syncError);
              });
            }
          } catch (themeError) {
            console.error(`[testing] Error getting pages for theme ${themeId}:`, themeError);
            console.error(`[testing] Error stack:`, themeError.stack);
          }
        } else {
          // If no specific theme or 'custom', get pages from all themes
          console.log('[testing] Demo tenant: Fetching pages from all themes');
          const themes = getThemesFromFileSystem();
          console.log(`[testing] Demo tenant: Found ${themes.length} theme(s) in file system`);
          
          for (const theme of themes) {
            try {
              const themePages = getThemePagesFromFileSystem(theme.slug);
              console.log(`[testing] Demo tenant: getThemePagesFromFileSystem for ${theme.slug} returned:`, themePages ? `${themePages.length} page(s)` : 'null/undefined');
              
              if (themePages && Array.isArray(themePages) && themePages.length > 0) {
                // Validate and map pages
                const validPages = themePages.filter(page => {
                  const isValid = page && page.page_name && page.slug;
                  if (!isValid) {
                    console.warn(`[testing] Demo tenant: Skipping invalid page from theme ${theme.slug}:`, page);
                  }
                  return isValid;
                });
                
                const pagesWithThemeId = validPages.map(page => ({
                  ...page,
                  theme_id: theme.slug,
                  tenant_id: 'demo',
                  from_filesystem: true,
                  // Ensure required fields are present
                  id: page.id || `theme-${theme.slug}-${page.slug.replace(/^\/+|\/+$/g, '').replace(/\//g, '-') || 'homepage'}`,
                  page_type: page.page_type || 'page',
                  status: page.status || 'published'
                }));
                allThemePages.push(...pagesWithThemeId);
                console.log(`[testing] Demo tenant: Found ${pagesWithThemeId.length} valid page(s) from theme ${theme.slug}`);
              }
            } catch (themeError) {
              console.error(`[testing] Error getting pages for theme ${theme.slug}:`, themeError);
              console.error(`[testing] Error stack:`, themeError.stack);
            }
          }
          
          // Optionally sync all themes to database for future queries (non-blocking)
          if (allThemePages.length > 0) {
            syncDemoTenantPagesFromFileSystem(null).catch(syncError => {
              console.error(`[testing] Failed to sync pages to database (non-critical):`, syncError);
            });
          }
        }
        
        console.log(`[testing] Demo tenant: Fallback successful, returning ${allThemePages.length} page(s) from file system`);
        if (allThemePages.length === 0) {
          console.warn(`[testing] Demo tenant: No pages found in file system. Check if themes have pages.json files.`);
        }
        return allThemePages;
      } catch (fsError) {
        console.error('[testing] File system fallback also failed:', fsError);
        throw error; // Re-throw original database error
      }
    }
    
    throw error;
  }
}

// Slug management functions
export async function updatePageSlug(pageId, pageType, newSlug, oldSlug, tenantId = 'tenant-gosg') {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Validate slug format
    if (!newSlug.startsWith('/')) {
      newSlug = '/' + newSlug;
    }
    
    // Check if slug already exists for this tenant
    const existingSlug = await client.query(`
      SELECT slug FROM pages WHERE slug = $1 AND tenant_id = $2 AND id != $3
    `, [newSlug, tenantId, pageId]);
    
    if (existingSlug.rows.length > 0) {
      throw new Error(`Slug '${newSlug}' already exists`);
    }
    
    // Update the page slug
    const updateResult = await client.query(`
      UPDATE pages 
      SET slug = $1, updated_at = NOW() 
      WHERE id = $2 AND tenant_id = $3 AND page_type = $4
      RETURNING *
    `, [newSlug, pageId, tenantId, pageType]);
    
    if (updateResult.rows.length === 0) {
      throw new Error(`Page not found or page type mismatch`);
    }
    
    // If this is a blog page update, handle blog post slug adaptation
    if (oldSlug === '/blog' && newSlug !== '/blog') {
      console.log('Blog slug changed, blog post adaptation needed');
      // Note: Blog posts are currently hardcoded in frontend files
      // This would need to be implemented when blog posts are moved to database
      await logSlugChange(pageId, pageType, oldSlug, newSlug, 'Blog slug changed - manual blog post update required');
    }
    
    await client.query('COMMIT');
    return updateResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating slug:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to validate slug format
export function validateSlug(slug) {
  // Remove leading/trailing whitespace
  slug = slug.trim();
  
  // Add leading slash if missing
  if (!slug.startsWith('/')) {
    slug = '/' + slug;
  }
  
  // Validate slug format (alphanumeric, hyphens, slashes only)
  const slugRegex = /^\/[a-z0-9\-\/]*$/;
  if (!slugRegex.test(slug)) {
    throw new Error('Slug can only contain lowercase letters, numbers, hyphens, and slashes');
  }
  
  // Prevent double slashes
  if (slug.includes('//')) {
    throw new Error('Slug cannot contain double slashes');
  }
  
  // Prevent ending with slash (except root)
  if (slug.length > 1 && slug.endsWith('/')) {
    slug = slug.slice(0, -1);
  }
  
  return slug;
}

// Function to log slug changes for audit purposes
export async function logSlugChange(pageId, pageType, oldSlug, newSlug, notes = null) {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS slug_change_log (
        id SERIAL PRIMARY KEY,
        page_id INTEGER NOT NULL,
        page_type VARCHAR(20) NOT NULL,
        old_slug VARCHAR(255) NOT NULL,
        new_slug VARCHAR(255) NOT NULL,
        notes TEXT,
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    await query(`
      INSERT INTO slug_change_log (page_id, page_type, old_slug, new_slug, notes)
      VALUES ($1, $2, $3, $4, $5)
    `, [pageId, pageType, oldSlug, newSlug, notes]);
    
  } catch (error) {
    console.error('Error logging slug change:', error);
    // Don't throw error here as this is just for logging
  }
}

// Function to get slug change history
export async function getSlugChangeHistory(pageId = null, pageType = null) {
  try {
    let whereClause = '';
    let params = [];
    
    if (pageId && pageType) {
      whereClause = 'WHERE page_id = $1 AND page_type = $2';
      params = [pageId, pageType];
    } else if (pageType) {
      whereClause = 'WHERE page_type = $1';
      params = [pageType];
    }
    
    const result = await query(`
      SELECT * FROM slug_change_log 
      ${whereClause}
      ORDER BY changed_at DESC
    `, params);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching slug change history:', error);
    return [];
  }
}

// Update page name
export async function updatePageName(pageId, pageType, newName, tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      UPDATE pages 
      SET page_name = $1, updated_at = NOW() 
      WHERE id = $2 AND tenant_id = $3 AND page_type = $4
    `, [newName, pageId, tenantId, pageType]);
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error updating page name:', error);
    throw error;
  }
}

// Toggle SEO index
export async function toggleSEOIndex(pageId, pageType, currentIndex, tenantId = 'tenant-gosg') {
  try {
    const newIndex = !currentIndex;
    
    const result = await query(`
      UPDATE pages 
      SET seo_index = $1, updated_at = NOW() 
      WHERE id = $2 AND tenant_id = $3 AND page_type = $4
    `, [newIndex, pageId, tenantId, pageType]);
    
    return newIndex;
  } catch (error) {
    console.error('Error toggling SEO index:', error);
    throw error;
  }
}

// Get page with layout data
export async function getPageWithLayout(pageId, tenantId = 'tenant-gosg') {
  try {
    // First, get the page data - include master pages (tenant_id = NULL)
    // Prefer tenant-specific over master
    const pageResult = await query(`
      SELECT 
        id,
        page_name,
        slug,
        meta_title,
        meta_description,
        seo_index,
        status,
        page_type,
        tenant_id,
        created_at,
        updated_at
      FROM pages
      WHERE id = $1 AND (tenant_id = $2 OR tenant_id IS NULL)
      ORDER BY CASE WHEN tenant_id = $2 THEN 0 ELSE 1 END
      LIMIT 1
    `, [pageId, tenantId]);
    
    if (pageResult.rows.length === 0) {
      return null;
    }
    
    const page = pageResult.rows[0];
    
    // Get the layout data (default language)
    const layoutResult = await query(`
      SELECT layout_json, version, updated_at
      FROM page_layouts
      WHERE page_id = $1 AND language = 'default'
      ORDER BY version DESC
      LIMIT 1
    `, [pageId]);
    
    if (layoutResult.rows.length > 0) {
      page.layout = layoutResult.rows[0].layout_json;
    }
    
    return page;
  } catch (error) {
    console.error('Error fetching page with layout:', error);
    throw error;
  }
}

// Update page data
export async function updatePageData(pageId, pageName, metaTitle, metaDescription, seoIndex, tenantId = 'tenant-gosg') {
  try {
    // Check if it's a master page and prevent update
    const checkResult = await query(`SELECT tenant_id FROM pages WHERE id = $1`, [pageId]);
    if (checkResult.rows.length === 0) {
      console.log(`Page ${pageId} not found`);
      return false;
    }
    if (!checkResult.rows[0].tenant_id) {
      throw new Error('Cannot update master page. Master pages (tenant_id = NULL) are shared across all tenants.');
    }
    
    const result = await query(`
      UPDATE pages 
      SET page_name = $1, meta_title = $2, meta_description = $3, seo_index = $4, updated_at = NOW()
      WHERE id = $5 AND tenant_id = $6
    `, [pageName, metaTitle, metaDescription, seoIndex, pageId, tenantId]);
    
    if (result.rowCount > 0) {
      return true;
    }
    
    console.log(`Page ${pageId} not found for tenant ${tenantId}`);
    return false;
  } catch (error) {
    console.error('Error updating page data:', error);
    throw error;
  }
}

// Helper function to validate page exists
async function ensurePageExists(pageId, tenantId, themeId = null) {
  console.log('[testing] ========== ensurePageExists ==========');
  console.log('[testing] Parameters:', {
    pageId: pageId,
    pageIdType: typeof pageId,
    pageIdIsNumeric: /^\d+$/.test(String(pageId)),
    tenantId: tenantId,
    themeId: themeId
  });

  let pageCheck;
  
  if (themeId) {
    console.log('[testing] Checking page with theme_id...');
    // Check with theme_id when provided
    pageCheck = await query(`
      SELECT id FROM pages WHERE id::text = $1 AND tenant_id = $2 AND theme_id = $3
    `, [pageId, tenantId, themeId]);
    
    console.log('[testing] Query result (text match):', {
      rowsFound: pageCheck.rows.length,
      foundPageIds: pageCheck.rows.map(r => r.id)
    });
    
    // If not found and pageId is numeric, try as integer
    if (pageCheck.rows.length === 0 && /^\d+$/.test(String(pageId))) {
      console.log('[testing] Retrying with integer pageId...');
      pageCheck = await query(`
        SELECT id FROM pages WHERE id = $1 AND tenant_id = $2 AND theme_id = $3
      `, [parseInt(pageId), tenantId, themeId]);
      
      console.log('[testing] Query result (integer match):', {
        rowsFound: pageCheck.rows.length,
        foundPageIds: pageCheck.rows.map(r => r.id)
      });
    }
  } else {
    console.log('[testing] Checking page without theme_id...');
    // Check without theme_id (legacy behavior)
    pageCheck = await query(`
      SELECT id FROM pages WHERE id::text = $1 AND tenant_id = $2
    `, [pageId, tenantId]);
    
    console.log('[testing] Query result (text match, no theme):', {
      rowsFound: pageCheck.rows.length,
      foundPageIds: pageCheck.rows.map(r => r.id)
    });
    
    // If not found and pageId is numeric, try as integer
    if (pageCheck.rows.length === 0 && /^\d+$/.test(String(pageId))) {
      console.log('[testing] Retrying with integer pageId (no theme)...');
      pageCheck = await query(`
        SELECT id FROM pages WHERE id = $1 AND tenant_id = $2
      `, [parseInt(pageId), tenantId]);
      
      console.log('[testing] Query result (integer match, no theme):', {
        rowsFound: pageCheck.rows.length,
        foundPageIds: pageCheck.rows.map(r => r.id)
      });
    }
  }
  
  if (pageCheck.rows.length === 0) {
    console.error('[testing] Page not found:', {
      pageId: pageId,
      tenantId: tenantId,
      themeId: themeId
    });
    return false;
  }
  
  console.log('[testing] Page exists:', {
    pageId: pageCheck.rows[0].id,
    found: true
  });
  return true;
}

// Helper function to ensure language column exists (migration safety)
async function ensureLanguageColumnExists() {
  try {
    await query(`
      ALTER TABLE page_layouts 
      ADD COLUMN IF NOT EXISTS language VARCHAR(50) NOT NULL DEFAULT 'default'
    `);
  } catch (error) {
    // Column already exists, ignore
    if (error.code !== '42701' && !error.message.includes('already exists')) {
      console.log('[testing] Note: Could not ensure language column exists:', error.message);
    }
  }
}

// Helper function to cleanup duplicate layouts for a specific page and language
async function cleanupDuplicateLayouts(pageId, language) {
  await query(`
    WITH ranked_layouts AS (
      SELECT id, 
             ROW_NUMBER() OVER (PARTITION BY page_id, language ORDER BY updated_at DESC, id DESC) as rn
      FROM page_layouts
      WHERE page_id = $1 AND language = $2
    )
    DELETE FROM page_layouts
    WHERE page_id = $1 AND language = $2
    AND id IN (
      SELECT id FROM ranked_layouts WHERE rn > 1
    )
  `, [pageId, language]);
}

// Helper function to ensure composite unique constraint exists (migration safety)
async function ensureCompositeUniqueConstraintExists(language) {
  try {
    const constraintCheck = await query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'page_layouts' 
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'page_layouts_page_id_language_unique'
    `);
    
    if (constraintCheck.rows.length === 0) {
      // Try to add the constraint
      try {
        await query(`
          ALTER TABLE page_layouts 
          ADD CONSTRAINT page_layouts_page_id_language_unique UNIQUE (page_id, language)
        `);
        console.log('[testing] Added composite unique constraint at runtime');
      } catch (constraintError) {
        // If constraint creation fails due to duplicates, clean them up first
        if (constraintError.code === '23505') {
          console.log('[testing] Cleaning up duplicates before adding constraint...');
          const duplicates = await query(`
            SELECT page_id, COUNT(*) as count
            FROM page_layouts
            GROUP BY page_id, language
            HAVING COUNT(*) > 1
          `);
          
          for (const dup of duplicates.rows) {
            await cleanupDuplicateLayouts(dup.page_id, language);
          }
          
          // Try again after cleanup
          await query(`
            ALTER TABLE page_layouts 
            ADD CONSTRAINT page_layouts_page_id_language_unique UNIQUE (page_id, language)
          `);
        }
      }
    }
  } catch (error) {
    console.log('[testing] Note: Could not ensure composite unique constraint exists:', error.message);
  }
}

// Helper function to update existing layout
async function updateExistingLayout(pageId, layoutJson, language) {
  console.log('[testing] ========== updateExistingLayout ==========');
  console.log('[testing] Parameters:', {
    pageId: pageId,
    pageIdType: typeof pageId,
    language: language,
    layoutJsonType: typeof layoutJson,
    layoutJsonKeys: layoutJson ? Object.keys(layoutJson) : [],
    componentsCount: layoutJson?.components ? (Array.isArray(layoutJson.components) ? layoutJson.components.length : 'not array') : 'no components'
  });

  // Normalize pageId to integer if it's numeric (database expects INTEGER)
  let normalizedPageId = pageId;
  if (typeof pageId === 'string' && /^\d+$/.test(pageId)) {
    normalizedPageId = parseInt(pageId, 10);
    console.log('[testing] Normalized pageId from string to integer:', normalizedPageId);
  } else if (typeof pageId !== 'number') {
    console.warn('[testing] pageId is not a number or numeric string:', pageId);
  }

  // Ensure we have a complete JSON structure - replace entirely, don't merge
  const completeLayoutJson = layoutJson && typeof layoutJson === 'object' 
    ? layoutJson 
    : { components: [] };
  
  const jsonString = JSON.stringify(completeLayoutJson);
  console.log('[testing] JSON stringified length:', jsonString.length);
  console.log('[testing] JSON stringified preview (first 200 chars):', jsonString.substring(0, 200));

  // Explicitly cast to JSONB to ensure full replacement
  const updateResult = await query(`
    UPDATE page_layouts 
    SET 
      layout_json = $2::jsonb,
      version = version + 1,
      updated_at = NOW()
    WHERE page_id = $1 AND language = $3
  `, [normalizedPageId, jsonString, language]);
  
  console.log('[testing] UPDATE query result:', {
    rowCount: updateResult.rowCount,
    command: updateResult.command,
    rowsAffected: updateResult.rowCount > 0 ? 'YES' : 'NO',
    normalizedPageId: normalizedPageId
  });
  
  if (updateResult.rowCount === 0) {
    console.warn('[testing] UPDATE matched 0 rows - layout may not exist for this page_id and language');
    // Try with original pageId format as fallback
    if (normalizedPageId !== pageId) {
      console.log('[testing] Retrying UPDATE with original pageId format...');
      const retryResult = await query(`
        UPDATE page_layouts 
        SET 
          layout_json = $2::jsonb,
          version = version + 1,
          updated_at = NOW()
        WHERE page_id::text = $1 AND language = $3
      `, [String(pageId), jsonString, language]);
      console.log('[testing] Retry UPDATE result:', {
        rowCount: retryResult.rowCount,
        rowsAffected: retryResult.rowCount > 0 ? 'YES' : 'NO'
      });
      return retryResult.rowCount > 0;
    }
  }
  
  return updateResult.rowCount > 0;
}

// Helper function to insert new layout
async function insertNewLayout(pageId, layoutJson, language) {
  console.log('[testing] ========== insertNewLayout ==========');
  console.log('[testing] Parameters:', {
    pageId: pageId,
    pageIdType: typeof pageId,
    language: language,
    layoutJsonType: typeof layoutJson,
    layoutJsonKeys: layoutJson ? Object.keys(layoutJson) : [],
    componentsCount: layoutJson?.components ? (Array.isArray(layoutJson.components) ? layoutJson.components.length : 'not array') : 'no components'
  });

  // Normalize pageId to integer if it's numeric (database expects INTEGER)
  let normalizedPageId = pageId;
  if (typeof pageId === 'string' && /^\d+$/.test(pageId)) {
    normalizedPageId = parseInt(pageId, 10);
    console.log('[testing] Normalized pageId from string to integer:', normalizedPageId);
  } else if (typeof pageId !== 'number') {
    console.warn('[testing] pageId is not a number or numeric string:', pageId);
  }

  // Ensure we have a complete JSON structure
  const completeLayoutJson = layoutJson && typeof layoutJson === 'object' 
    ? layoutJson 
    : { components: [] };
  
  const jsonString = JSON.stringify(completeLayoutJson);
  console.log('[testing] JSON stringified length:', jsonString.length);
  console.log('[testing] JSON stringified preview (first 200 chars):', jsonString.substring(0, 200));

  try {
    // Explicitly cast to JSONB to ensure proper storage
    const insertResult = await query(`
      INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
      VALUES ($1, $2, $3::jsonb, 1, NOW())
      RETURNING id, page_id, language, version
    `, [normalizedPageId, language, jsonString]);
    
    console.log('[testing] INSERT query result:', {
      success: true,
      insertedId: insertResult.rows[0]?.id,
      pageId: insertResult.rows[0]?.page_id,
      language: insertResult.rows[0]?.language,
      version: insertResult.rows[0]?.version,
      normalizedPageId: normalizedPageId
    });
  } catch (insertError) {
    console.error('[testing] INSERT query failed:', {
      error: insertError.message,
      code: insertError.code,
      constraint: insertError.constraint,
      normalizedPageId: normalizedPageId
    });
    throw insertError;
  }
}

// Helper function to extract translatable text from layout JSON
// Returns a map of paths to text values for translation
function extractTranslatableText(obj, path = '', result = {}) {
  if (obj === null || obj === undefined) {
    return result;
  }
  
  // Skip non-translatable fields
  const skipFields = ['id', 'src', 'link', 'url', 'image', 'images', 'avatar', 'logo', 'phoneNumber', 'email', 'date', 'rating', 'version', 'sort_order', 'sortOrder', 'level', 'required', 'value', 'type', 'key'];
  
  if (typeof obj === 'string') {
    // Only extract non-empty strings that aren't URLs or IDs
    if (obj.trim().length > 0 && 
        !obj.startsWith('http') && 
        !obj.startsWith('/') && 
        !obj.match(/^[a-zA-Z0-9_-]+$/)) {
      result[path] = obj;
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      extractTranslatableText(item, path ? `${path}[${index}]` : `[${index}]`, result);
    });
  } else if (typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      // Skip certain fields that shouldn't be translated
      if (skipFields.includes(key.toLowerCase())) {
        return;
      }
      
      const newPath = path ? `${path}.${key}` : key;
      extractTranslatableText(obj[key], newPath, result);
    });
  }
  
  return result;
}

// Helper function to inject translated text back into layout JSON
function injectTranslatedText(obj, translations, path = '') {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    // If this path has a translation, use it
    if (translations[path] !== undefined) {
      return translations[path];
    }
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map((item, index) => {
      const itemPath = path ? `${path}[${index}]` : `[${index}]`;
      return injectTranslatedText(item, translations, itemPath);
    });
  } else if (typeof obj === 'object') {
    const result = {};
    Object.keys(obj).forEach(key => {
      const newPath = path ? `${path}.${key}` : key;
      result[key] = injectTranslatedText(obj[key], translations, newPath);
    });
    return result;
  }
  
  return obj;
}

// Helper function to get configured languages from site_settings
async function getConfiguredLanguages(tenantId) {
  const languagesResult = await query(`
    SELECT setting_value 
    FROM site_settings 
    WHERE setting_key = 'site_content_languages' 
    AND tenant_id = $1
  `, [tenantId]);
  
  if (languagesResult.rows.length === 0 || !languagesResult.rows[0].setting_value) {
    return [];
  }
  
  // Parse the comma-separated language list
  const rawValue = languagesResult.rows[0].setting_value;
  if (rawValue.includes(',')) {
    return rawValue.split(',').filter(lang => lang.trim() !== '');
  } else if (rawValue.trim() !== '') {
    return [rawValue.trim()];
  }
  
  return [];
}

// Helper function to get default language from site_settings
async function getDefaultLanguage(tenantId) {
  const defaultLanguageResult = await query(`
    SELECT setting_value 
    FROM site_settings 
    WHERE setting_key = 'site_language' 
    AND tenant_id = $1
  `, [tenantId]);
  
  return defaultLanguageResult.rows.length > 0 ? 
    defaultLanguageResult.rows[0].setting_value : 'default';
}

// Helper function to get target languages (excluding default)
async function getTargetLanguages(tenantId) {
  const allLanguages = await getConfiguredLanguages(tenantId);
  
  if (allLanguages.length === 0) {
    return [];
  }
  
  const defaultLanguage = await getDefaultLanguage(tenantId);
  
  // Filter out the default language (don't translate to itself)
  return allLanguages.filter(lang => lang !== defaultLanguage && lang !== 'default');
}

// Helper function to translate all text fields for a single language
async function translateTextFields(textMap, targetLanguage, defaultLanguage) {
  const translations = {};
  const textPaths = Object.keys(textMap);
  
  for (const textPath of textPaths) {
    const originalText = textMap[textPath];
    try {
      const translatedText = await translateText(originalText, targetLanguage, defaultLanguage);
      translations[textPath] = translatedText;
      console.log(`[testing] Translated ${textPath}: "${originalText.substring(0, 50)}..." -> "${translatedText.substring(0, 50)}..."`);
    } catch (error) {
      console.error(`[testing] Error translating text at path ${textPath}:`, error);
      // Use original text if translation fails
      translations[textPath] = originalText;
    }
  }
  
  return translations;
}

// Helper function to translate layout to a single target language
async function translateLayoutToLanguage(pageId, layoutJson, targetLanguage, defaultLanguage, textMap) {
  try {
    console.log(`[testing] Translating to ${targetLanguage}...`);
    
    // Translate all text fields
    const translations = await translateTextFields(textMap, targetLanguage, defaultLanguage);
    
    // Inject translated text back into layout
    const translatedLayout = injectTranslatedText(layoutJson, translations);
    
    // Upsert the translated layout
    await upsertPageLayout(pageId, translatedLayout, targetLanguage);
    
    console.log(`[testing] Successfully translated and saved layout for language ${targetLanguage}`);
  } catch (error) {
    console.error(`[testing] Error translating to ${targetLanguage}:`, error);
    throw error; // Re-throw to let caller handle
  }
}

// Helper function to translate layout to all configured languages
async function translateLayoutToAllLanguages(pageId, layoutJson, tenantId) {
  try {
    console.log(`[testing] Starting translation for page ${pageId} and tenant ${tenantId}`);
    
    // Get target languages
    const targetLanguages = await getTargetLanguages(tenantId);
    
    if (targetLanguages.length === 0) {
      console.log(`[testing] No target languages to translate to, skipping translation`);
      return;
    }
    
    console.log(`[testing] Translating to ${targetLanguages.length} languages: ${targetLanguages.join(', ')}`);
    
    // Extract translatable text from layout
    const textMap = extractTranslatableText(layoutJson);
    const textPaths = Object.keys(textMap);
    
    if (textPaths.length === 0) {
      console.log(`[testing] No translatable text found in layout, skipping translation`);
      return;
    }
    
    console.log(`[testing] Found ${textPaths.length} translatable text fields`);
    
    // Get default language for translation
    const defaultLanguage = await getDefaultLanguage(tenantId);
    
    // Translate to each target language
    for (const targetLanguage of targetLanguages) {
      try {
        await translateLayoutToLanguage(pageId, layoutJson, targetLanguage, defaultLanguage, textMap);
      } catch (error) {
        // Continue with other languages even if one fails
        console.error(`[testing] Failed to translate to ${targetLanguage}, continuing with other languages`);
      }
    }
    
    console.log(`[testing] Completed translation process for page ${pageId}`);
  } catch (error) {
    console.error(`[testing] Error in translateLayoutToAllLanguages:`, error);
    // Don't throw - this is a background process
  }
}

// Helper function to upsert page layout (update or insert)
async function upsertPageLayout(pageId, layoutJson, language, tenantId = null) {
  console.log('[testing] ========== upsertPageLayout ==========');
  console.log('[testing] Parameters:', {
    pageId: pageId,
    pageIdType: typeof pageId,
    language: language,
    tenantId: tenantId,
    layoutJsonType: typeof layoutJson,
    componentsCount: layoutJson?.components ? (Array.isArray(layoutJson.components) ? layoutJson.components.length : 'not array') : 'no components'
  });

  // Normalize pageId to integer if it's numeric (database expects INTEGER)
  let normalizedPageId = pageId;
  if (typeof pageId === 'string' && /^\d+$/.test(pageId)) {
    normalizedPageId = parseInt(pageId, 10);
    console.log('[testing] Normalized pageId from string to integer:', normalizedPageId);
  } else if (typeof pageId !== 'number') {
    console.warn('[testing] pageId is not a number or numeric string:', pageId);
  }

  let operationSuccessful = false;
  
  // Try to update existing layout first
  console.log('[testing] Step 1: Attempting to update existing layout...');
  const wasUpdated = await updateExistingLayout(normalizedPageId, layoutJson, language);
  
  if (wasUpdated) {
    console.log('[testing] Step 1: Update successful');
    operationSuccessful = true;
  } else {
    console.log('[testing] Step 1: Update failed, checking if layout exists...');
    // If no rows were updated, check if layout exists
    // Try both normalized and original pageId formats
    let existingCheck = await query(`
      SELECT id, page_id, language, version FROM page_layouts WHERE page_id = $1 AND language = $2
    `, [normalizedPageId, language]);
    
    // If not found with normalized, try with original format
    if (existingCheck.rows.length === 0 && normalizedPageId !== pageId) {
      console.log('[testing] Step 2: Retrying existing check with original pageId format...');
      existingCheck = await query(`
        SELECT id, page_id, language, version FROM page_layouts WHERE page_id::text = $1 AND language = $2
      `, [String(pageId), language]);
    }
    
    console.log('[testing] Step 2: Existing layout check:', {
      rowsFound: existingCheck.rows.length,
      existingLayouts: existingCheck.rows.map(r => ({
        id: r.id,
        page_id: r.page_id,
        language: r.language,
        version: r.version
      }))
    });
    
    if (existingCheck.rows.length === 0) {
      console.log('[testing] Step 2: No existing layout found, inserting new layout...');
      // Insert new layout
      await insertNewLayout(normalizedPageId, layoutJson, language);
      operationSuccessful = true;
      console.log('[testing] Step 2: Insert successful');
    } else {
      console.log('[testing] Step 2: Layout exists but update failed, retrying update...');
      // Layout exists but update didn't work, try update again with the actual page_id from DB
      const actualPageId = existingCheck.rows[0].page_id;
      console.log('[testing] Step 2: Using actual page_id from database:', actualPageId);
      const wasUpdatedRetry = await updateExistingLayout(actualPageId, layoutJson, language);
      operationSuccessful = wasUpdatedRetry;
      console.log('[testing] Step 2: Retry update result:', wasUpdatedRetry);
    }
  }
  
  console.log('[testing] upsertPageLayout result:', {
    operationSuccessful: operationSuccessful,
    pageId: pageId,
    normalizedPageId: normalizedPageId,
    language: language
  });
  
  // After successful operation on default language, trigger translation to other languages
  if (operationSuccessful && language === 'default' && tenantId) {
    console.log('[testing] Triggering translation to other languages...');
    // Call translation asynchronously (fire and forget) to avoid blocking
    translateLayoutToAllLanguages(normalizedPageId, layoutJson, tenantId).catch(error => {
      console.error(`[testing] Error in background translation for page ${normalizedPageId}:`, error);
    });
  }
  
  return operationSuccessful;
}

// Update page layout
export async function updatePageLayout(pageId, layoutJson, tenantId, language = 'default', themeId = null) {
  console.log('[testing] ========== updatePageLayout ==========');
  console.log('[testing] Parameters:', {
    pageId: pageId,
    pageIdType: typeof pageId,
    tenantId: tenantId,
    language: language,
    themeId: themeId,
    layoutJsonType: typeof layoutJson,
    componentsCount: layoutJson?.components ? (Array.isArray(layoutJson.components) ? layoutJson.components.length : 'not array') : 'no components'
  });

  // Validate tenant id
  if (!tenantId) {
    const error = new Error('Tenant ID is required');
    error.code = 'VALIDATION_ERROR';
    console.error('[testing] Validation failed: Tenant ID is required');
    throw error;
  }
    
  // Validate page exists (with theme_id if provided)
  console.log('[testing] Step 1: Validating page exists...');
  const pageExists = await ensurePageExists(pageId, tenantId, themeId);
  if (!pageExists) {
    console.error('[testing] Step 1: Page validation failed - page does not exist');
    return false;
  }
  console.log('[testing] Step 1: Page validation passed');
    
  try {
    // Ensure database schema is up to date (migration safety)
    console.log('[testing] Step 2: Ensuring database schema is up to date...');
    await ensureLanguageColumnExists();
    await ensureCompositeUniqueConstraintExists(language);
    console.log('[testing] Step 2: Database schema check complete');
    
    // Update or insert the layout (pass tenantId for translation support)
    console.log('[testing] Step 3: Upserting page layout...');
    const upsertResult = await upsertPageLayout(pageId, layoutJson, language, tenantId);
    console.log('[testing] Step 3: Upsert result:', upsertResult);
    
    if (!upsertResult) {
      console.error('[testing] Step 3: Upsert failed');
      return false;
    }
    
    // Verify the save by querying the database
    console.log('[testing] Step 4: Verifying save by querying database...');
    const verifyQuery = await query(`
      SELECT id, page_id, language, version, updated_at, 
             jsonb_typeof(layout_json) as json_type,
             jsonb_array_length(layout_json->'components') as components_count
      FROM page_layouts 
      WHERE page_id = $1 AND language = $2
    `, [pageId, language]);
    
    if (verifyQuery.rows.length > 0) {
      console.log('[testing] Step 4: Verification successful:', {
        layoutId: verifyQuery.rows[0].id,
        pageId: verifyQuery.rows[0].page_id,
        language: verifyQuery.rows[0].language,
        version: verifyQuery.rows[0].version,
        updatedAt: verifyQuery.rows[0].updated_at,
        jsonType: verifyQuery.rows[0].json_type,
        componentsCount: verifyQuery.rows[0].components_count
      });
    } else {
      console.error('[testing] Step 4: Verification failed - layout not found in database after save');
    }
    
    console.log('[testing] ========== updatePageLayout completed successfully ==========');
    return true;
  } catch (error) {
    console.error('[testing] ========== updatePageLayout error ==========');
    console.error('[testing] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}

/**
 * Save a page version to the page_versions table
 * @param {number} pageId - The page ID
 * @param {string} tenantId - The tenant ID
 * @param {object} pageData - The page data snapshot
 * @param {object} layoutJson - The layout JSON with components
 * @param {number} userId - Optional user ID who created this version
 * @param {string} comment - Optional comment for this version
 * @returns {Promise<object>} The saved version record
 */
export async function savePageVersion(pageId, tenantId, pageData, layoutJson, userId = null, comment = null) {
  try {
    // Get the next version number for this page
    const versionResult = await query(`
      SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
      FROM page_versions
      WHERE page_id = $1 AND tenant_id = $2
    `, [pageId, tenantId]);
    
    const nextVersion = parseInt(versionResult.rows[0]?.next_version || 1);
    
    // Insert the version
    const result = await query(`
      INSERT INTO page_versions (
        page_id, tenant_id, version_number,
        page_name, slug, meta_title, meta_description, seo_index, status, page_type,
        campaign_source, conversion_goal, legal_type, last_reviewed_date,
        layout_json, created_by, comment, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      RETURNING *
    `, [
      pageId,
      tenantId,
      nextVersion,
      pageData.page_name || '',
      pageData.slug || '',
      pageData.meta_title || null,
      pageData.meta_description || null,
      pageData.seo_index !== undefined ? pageData.seo_index : true,
      pageData.status || 'draft',
      pageData.page_type || 'page',
      pageData.campaign_source || null,
      pageData.conversion_goal || null,
      pageData.legal_type || null,
      pageData.last_reviewed_date || null,
      JSON.stringify(layoutJson),
      userId,
      comment
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error saving page version:', error);
    throw error;
  }
}

