import { query } from '../connection.js';
import pool from '../connection.js';

export async function initializeSEOPagesTables() {
  try {
    console.log('Initializing unified pages table...');
    
    // Create unified pages table with all page types
    await query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        meta_title VARCHAR(255),
        meta_description TEXT,
        seo_index BOOLEAN DEFAULT true,
        status VARCHAR(50) DEFAULT 'draft',
        page_type VARCHAR(50) NOT NULL DEFAULT 'page',
        tenant_id VARCHAR(255) NOT NULL DEFAULT 'tenant-gosg',
        
        -- Landing page specific fields (nullable)
        campaign_source VARCHAR(100),
        conversion_goal VARCHAR(255),
        
        -- Legal page specific fields (nullable)
        legal_type VARCHAR(100),
        last_reviewed_date DATE,
        version VARCHAR(20) DEFAULT '1.0',
        
        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Constraints
        CONSTRAINT unique_slug_per_tenant UNIQUE (slug, tenant_id),
        CONSTRAINT valid_page_type CHECK (page_type IN ('page', 'landing', 'legal'))
      )
    `);

    // Create indexes for performance
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_page_type ON pages(page_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_tenant_id ON pages(tenant_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_tenant_type ON pages(tenant_id, page_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pages_slug_tenant ON pages(slug, tenant_id)`);

    // Page layout tables for server-rendered pages
    await query(`
      CREATE TABLE IF NOT EXISTS page_layouts (
        id SERIAL PRIMARY KEY,
        page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        language VARCHAR(50) NOT NULL DEFAULT 'default',
        layout_json JSONB NOT NULL DEFAULT '{"components":[]}',
        version INTEGER NOT NULL DEFAULT 1,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(page_id, language)
      )
    `);
    
    // Migration: Add language column if it doesn't exist (for existing tables)
    try {
      await query(`
        ALTER TABLE page_layouts 
        ADD COLUMN IF NOT EXISTS language VARCHAR(50) NOT NULL DEFAULT 'default'
      `);
    } catch (error) {
      // Column might already exist, ignore
      if (!error.message.includes('already exists') && error.code !== '42701') {
        console.log('[testing] Note: Could not add language column:', error.message);
      }
    }
    
    // Migration: Drop old unique constraint on page_id if it exists
    try {
      // Check if constraint exists and drop it
      const constraintCheck = await query(`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'page_layouts' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%page_id%'
        AND constraint_name NOT LIKE '%language%'
      `);
      
      for (const constraint of constraintCheck.rows) {
        await query(`
          ALTER TABLE page_layouts 
          DROP CONSTRAINT IF EXISTS ${constraint.constraint_name}
        `);
        console.log(`[testing] Dropped old unique constraint: ${constraint.constraint_name}`);
      }
    } catch (error) {
      console.log('[testing] Note: Could not drop old constraint (may not exist):', error.message);
    }
    
    // Migration: Add composite unique constraint on (page_id, language) if it doesn't exist
    try {
      const constraintCheck = await query(`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'page_layouts' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name = 'page_layouts_page_id_language_unique'
      `);
      
      if (constraintCheck.rows.length === 0) {
        await query(`
          ALTER TABLE page_layouts 
          ADD CONSTRAINT page_layouts_page_id_language_unique UNIQUE (page_id, language)
        `);
        console.log('[testing] Composite unique constraint on (page_id, language) added successfully');
      } else {
        console.log('[testing] Composite unique constraint on (page_id, language) already exists');
      }
    } catch (error) {
      // Silently ignore if constraint already exists or any other error
      // No error message needed as we check existence first
    }

    await query(`
      CREATE TABLE IF NOT EXISTS page_components (
        id SERIAL PRIMARY KEY,
        page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        component_key VARCHAR(100) NOT NULL,
        props JSONB NOT NULL DEFAULT '{}',
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Seed a default homepage and layout if not present
    const homePageRes = await query(`SELECT id FROM pages WHERE slug = '/'`);
    let homePageId = homePageRes.rows[0]?.id;
    if (!homePageId) {
      const created = await query(`
        INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status)
        VALUES ('Homepage', '/', 'GO SG - Professional SEO Services Singapore', 'Leading SEO agency in Singapore providing comprehensive digital marketing solutions to boost your online presence and drive organic traffic.', true, 'published')
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

    const result = await query(`
      INSERT INTO pages (
        page_name, slug, meta_title, meta_description, seo_index, status,
        page_type, tenant_id, campaign_source, conversion_goal,
        legal_type, last_reviewed_date, version
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      commonFields.page_name,
      commonFields.slug,
      commonFields.meta_title || null,
      commonFields.meta_description || null,
      commonFields.seo_index !== undefined ? commonFields.seo_index : (page_type === 'legal' ? false : true),
      commonFields.status || 'draft',
      page_type,
      tenant_id,
      campaign_source || null,
      conversion_goal || null,
      legal_type || null,
      last_reviewed_date || null,
      version || (page_type === 'legal' ? '1.0' : null)
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating page:', error);
    throw error;
  }
}

export async function getPages(pageType = null, tenantId = 'tenant-gosg') {
  try {
    let whereClause = 'WHERE tenant_id = $1';
    let params = [tenantId];
    
    if (pageType) {
      whereClause += ' AND page_type = $2';
      params.push(pageType);
    }
    
    const result = await query(`
      SELECT * FROM pages 
      ${whereClause}
      ORDER BY page_type, created_at DESC
    `, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
}

export async function getPage(pageId, tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      SELECT * FROM pages WHERE id = $1 AND tenant_id = $2
    `, [pageId, tenantId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching page:', error);
    throw error;
  }
}

export async function updatePage(pageId, pageData, tenantId = 'tenant-gosg') {
  try {
    const {
      campaign_source,
      conversion_goal,
      legal_type,
      last_reviewed_date,
      version,
      ...commonFields
    } = pageData;

    const result = await query(`
      UPDATE pages 
      SET 
        page_name = COALESCE($2, page_name),
        slug = COALESCE($3, slug),
        meta_title = COALESCE($4, meta_title),
        meta_description = COALESCE($5, meta_description),
        seo_index = COALESCE($6, seo_index),
        status = COALESCE($7, status),
        campaign_source = COALESCE($8, campaign_source),
        conversion_goal = COALESCE($9, conversion_goal),
        legal_type = COALESCE($10, legal_type),
        last_reviewed_date = COALESCE($11, last_reviewed_date),
        version = COALESCE($12, version),
        updated_at = NOW()
      WHERE id = $1 AND tenant_id = $13
      RETURNING *
    `, [
      pageId,
      commonFields.page_name,
      commonFields.slug,
      commonFields.meta_title,
      commonFields.meta_description,
      commonFields.seo_index,
      commonFields.status,
      campaign_source,
      conversion_goal,
      legal_type,
      last_reviewed_date,
      version,
      tenantId
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating page:', error);
    throw error;
  }
}

export async function deletePage(pageId, tenantId = 'tenant-gosg') {
  try {
    const result = await query(`DELETE FROM pages WHERE id = $1 AND tenant_id = $2`, [pageId, tenantId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting page:', error);
    throw error;
  }
}

// Note: Separate CRUD functions for landing and legal pages have been removed.
// Use the unified createPage, getPages, updatePage, deletePage functions with page_type parameter.

// Utility function to get all pages with their types
export async function getAllPagesWithTypes(tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      SELECT 
        id,
        page_name,
        slug,
        meta_title,
        meta_description,
        seo_index,
        status,
        page_type,
        created_at,
        updated_at,
        campaign_source,
        conversion_goal,
        legal_type,
        last_reviewed_date,
        version
      FROM pages
      WHERE tenant_id = $1
      ORDER BY page_type, created_at DESC
    `, [tenantId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching all pages with types:', error);
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
    // First, get the page data
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
        created_at,
        updated_at
      FROM pages
      WHERE id = $1 AND tenant_id = $2
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

// Update page layout
export async function updatePageLayout(pageId, layoutJson, tenantId = 'tenant-gosg', language = 'default') {
  try {
    // Check if page exists
    const pageCheck = await query(`
      SELECT id FROM pages WHERE id = $1 AND tenant_id = $2
    `, [pageId, tenantId]);
    
    if (pageCheck.rows.length === 0) {
      console.log(`Page ${pageId} not found for tenant ${tenantId}`);
      return false;
    }
    
    // Ensure language column exists (migration safety)
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
    
    // Ensure composite unique constraint exists (migration safety)
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
              `, [dup.page_id, language]);
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
    
    // Try to update existing layout first
    const updateResult = await query(`
      UPDATE page_layouts 
      SET 
        layout_json = $2,
        version = version + 1,
        updated_at = NOW()
      WHERE page_id = $1 AND language = $3
    `, [pageId, JSON.stringify(layoutJson), language]);
    
    // If no rows were updated, insert a new layout
    if (updateResult.rowCount === 0) {
      // Check if layout already exists (to avoid constraint violation)
      const existingCheck = await query(`
        SELECT id FROM page_layouts WHERE page_id = $1 AND language = $2
      `, [pageId, language]);
      
      if (existingCheck.rows.length === 0) {
        await query(`
          INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
          VALUES ($1, $2, $3, 1, NOW())
        `, [pageId, language, JSON.stringify(layoutJson)]);
      } else {
        // Layout exists but update didn't work, try update again
        await query(`
          UPDATE page_layouts 
          SET 
            layout_json = $2,
            version = version + 1,
            updated_at = NOW()
          WHERE page_id = $1 AND language = $3
        `, [pageId, JSON.stringify(layoutJson), language]);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating page layout:', error);
    throw error;
  }
}

