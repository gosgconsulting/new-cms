import { query, executeMultiStatementSQL } from './index.js'
import { createCategory } from './modules/categories.js';
import { createTag } from './modules/tags.js';

// ===== CONTENT MANAGEMENT SYSTEM FUNCTIONS =====

// Initialize content management tables using Sequelize migrations
export async function initializeContentManagementTables() {
  try {
    console.log('[testing] Creating content management tables...');
    
    // Run content tables migration
    const { runMigrations } = await import('../sequelize/run-migrations.js');
    await runMigrations(['20241202000004-create-content-tables.js']);
    
    // Run categories and tags migration (if not already run)
    await runMigrations(['20241201000000-create-categories-and-tags.js']);

    // Insert default categories and tags
    console.log('[testing] Inserting default taxonomy terms...');
    
    // Default categories
    const defaultCategories = [
      { name: 'SEO', slug: 'seo', description: 'Search Engine Optimization content' },
      { name: 'Digital Marketing', slug: 'digital-marketing', description: 'Digital marketing strategies and tips' },
      { name: 'Web Design', slug: 'web-design', description: 'Website design and development' },
      { name: 'Case Studies', slug: 'case-studies', description: 'Client success stories and case studies' },
      { name: 'News', slug: 'news', description: 'Company news and updates' }
    ];

    for (const category of defaultCategories) {
      // Insert term (for backward compatibility)
      const termResult = await query(`
        INSERT INTO terms (name, slug, description, meta_title, meta_description)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `, [
        category.name, 
        category.slug, 
        category.description,
        `${category.name} - GO SG Digital Marketing`,
        category.description
      ]);

      if (termResult.rows.length > 0) {
        // Insert taxonomy (for backward compatibility)
        await query(`
          INSERT INTO term_taxonomy (term_id, taxonomy, description)
          VALUES ($1, 'category', $2)
          ON CONFLICT DO NOTHING
        `, [termResult.rows[0].id, category.description]);
        
        // Also create in new categories table
        try {
          await createCategory({
            name: category.name,
            slug: category.slug,
            description: category.description,
            meta_title: `${category.name} - GO SG Digital Marketing`,
            meta_description: category.description
          });
        } catch (err) {
          // Category might already exist, that's okay
          console.log('[testing] Category may already exist:', category.name);
        }
      }
    }

    // Default tags
    const defaultTags = [
      'SEO Tips', 'Google Rankings', 'Keyword Research', 'Content Marketing', 
      'Social Media', 'PPC Advertising', 'Analytics', 'Conversion Optimization',
      'Local SEO', 'Technical SEO', 'Link Building', 'Mobile Optimization'
    ];

    for (const tagName of defaultTags) {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-');
      
      // Insert term (for backward compatibility)
      const termResult = await query(`
        INSERT INTO terms (name, slug, description, meta_title, meta_description)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `, [
        tagName, 
        slug, 
        `Content related to ${tagName}`,
        `${tagName} - GO SG Digital Marketing`,
        `Learn about ${tagName} with GO SG's expert insights and strategies.`
      ]);

      if (termResult.rows.length > 0) {
        // Insert taxonomy (for backward compatibility)
        await query(`
          INSERT INTO term_taxonomy (term_id, taxonomy, description)
          VALUES ($1, 'post_tag', $2)
          ON CONFLICT DO NOTHING
        `, [termResult.rows[0].id, `Tag for ${tagName} content`]);
        
        // Also create in new tags table
        try {
          await createTag({
            name: tagName,
            slug: slug,
            description: `Content related to ${tagName}`,
            meta_title: `${tagName} - GO SG Digital Marketing`,
            meta_description: `Learn about ${tagName} with GO SG's expert insights and strategies.`
          });
        } catch (err) {
          // Tag might already exist, that's okay
          console.log('[testing] Tag may already exist:', tagName);
        }
      }
    }

    console.log('[testing] Content management tables created successfully!');
    console.log('[testing] Default categories and tags inserted!');
    
    return true;
  } catch (error) {
    console.error('[testing] Error creating content management tables:', error);
    throw error;
  }
}

// Posts CRUD operations
export async function createPost(postData) {
  try {
    const result = await query(`
      INSERT INTO posts 
        (title, slug, content, excerpt, status, post_type, author_id, meta_title, meta_description, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      postData.title,
      postData.slug,
      postData.content || '',
      postData.excerpt || '',
      postData.status || 'draft',
      postData.post_type || 'post',
      postData.author_id || 1,
      postData.meta_title || postData.title,
      postData.meta_description || postData.excerpt,
      postData.status === 'published' ? new Date() : null
    ]);
    
    console.log('[testing] Post created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating post:', error);
    throw error;
  }
}

export async function getPosts(filters = {}) {
  try {
    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramCount = 0;

    if (filters.status) {
      whereClause += ` AND status = $${++paramCount}`;
      params.push(filters.status);
    }

    if (filters.post_type) {
      whereClause += ` AND post_type = $${++paramCount}`;
      params.push(filters.post_type);
    }

    if (filters.author_id) {
      whereClause += ` AND author_id = $${++paramCount}`;
      params.push(filters.author_id);
    }

    const result = await query(`
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', t.id,
              'name', t.name,
              'slug', t.slug,
              'taxonomy', tt.taxonomy
            )
          )
          FROM term_relationships tr
          JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.id
          JOIN terms t ON tt.term_id = t.id
          WHERE tr.object_id = p.id), '[]'
        ) as terms
      FROM posts p
      ${whereClause}
      ORDER BY p.created_at DESC
    `, params);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching posts:', error);
    throw error;
  }
}

// Categories and Tags CRUD operations
export async function createTerm(termData) {
  try {
    // Insert term (for backward compatibility)
    const termResult = await query(`
      INSERT INTO terms (name, slug, description, meta_title, meta_description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      termData.name,
      termData.slug,
      termData.description || '',
      termData.meta_title || termData.name,
      termData.meta_description || termData.description
    ]);

    // Insert taxonomy (for backward compatibility)
    await query(`
      INSERT INTO term_taxonomy (term_id, taxonomy, description, parent_id)
      VALUES ($1, $2, $3, $4)
    `, [
      termResult.rows[0].id,
      termData.taxonomy, // 'category' or 'post_tag'
      termData.description || '',
      termData.parent_id || null
    ]);
    
    // Also create in new tables
    try {
      if (termData.taxonomy === 'category') {
        await createCategory({
          name: termData.name,
          slug: termData.slug,
          description: termData.description || '',
          parent_id: termData.parent_id || null,
          meta_title: termData.meta_title || termData.name,
          meta_description: termData.meta_description || termData.description
        });
      } else if (termData.taxonomy === 'post_tag') {
        await createTag({
          name: termData.name,
          slug: termData.slug,
          description: termData.description || '',
          meta_title: termData.meta_title || termData.name,
          meta_description: termData.meta_description || termData.description
        });
      }
    } catch (newTableError) {
      // If new table creation fails, log but don't fail the whole operation
      console.log('[testing] Note creating in new table:', newTableError.message);
    }
    
    console.log('[testing] Term created:', termResult.rows[0].id);
    return termResult.rows[0];
  } catch (error) {
    console.error('[testing] Error creating term:', error);
    throw error;
  }
}

export async function getTerms(taxonomy = null) {
  try {
    // If taxonomy is specified, try to use new tables first
    if (taxonomy === 'category') {
      try {
        const { getCategories } = await import('./modules/categories.js');
        const categories = await getCategories();
        // Transform to match old format for backward compatibility
        return categories.map(cat => ({
          ...cat,
          taxonomy: 'category',
          taxonomy_parent_id: cat.parent_id,
          parent_id: cat.parent_id
        }));
      } catch (err) {
        console.log('[testing] Could not fetch from categories table, falling back to terms:', err.message);
        // Fall through to old query
      }
    } else if (taxonomy === 'post_tag') {
      try {
        const { getTags } = await import('./modules/tags.js');
        const tags = await getTags();
        // Transform to match old format for backward compatibility
        return tags.map(tag => ({
          ...tag,
          taxonomy: 'post_tag',
          taxonomy_parent_id: null,
          parent_id: null
        }));
      } catch (err) {
        console.log('[testing] Could not fetch from tags table, falling back to terms:', err.message);
        // Fall through to old query
      }
    }
    
    // Fallback to old query for backward compatibility
    let whereClause = '';
    let params = [];
    
    if (taxonomy) {
      whereClause = 'WHERE tt.taxonomy = $1';
      params = [taxonomy];
    }
    
    const result = await query(`
      SELECT 
        t.*,
        tt.taxonomy,
        tt.parent_id as taxonomy_parent_id,
        tt.count as post_count
      FROM terms t
      JOIN term_taxonomy tt ON t.id = tt.term_id
      ${whereClause}
      ORDER BY t.name ASC
    `, params);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching terms:', error);
    throw error;
  }
}
