import { query } from './postgres.js';

// ===== CONTENT MANAGEMENT SYSTEM FUNCTIONS =====

// Initialize content management tables
export async function initializeContentManagementTables() {
  try {
    console.log('[testing] Creating content management tables...');

    // 1. Posts table (WordPress wp_posts equivalent)
    await query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT,
        excerpt TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        post_type VARCHAR(50) DEFAULT 'post',
        author_id INTEGER,
        parent_id INTEGER REFERENCES posts(id),
        menu_order INTEGER DEFAULT 0,
        featured_image_id INTEGER,
        
        -- SEO Fields
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords TEXT,
        canonical_url VARCHAR(500),
        robots_meta VARCHAR(100) DEFAULT 'index,follow',
        
        -- Social Media
        og_title VARCHAR(255),
        og_description TEXT,
        og_image VARCHAR(500),
        twitter_title VARCHAR(255),
        twitter_description TEXT,
        twitter_image VARCHAR(500),
        
        -- Analytics & Performance
        view_count INTEGER DEFAULT 0,
        last_viewed_at TIMESTAMP,
        
        -- Timestamps
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 2. Terms table (Categories & Tags)
    await query(`
      CREATE TABLE IF NOT EXISTS terms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE NOT NULL,
        description TEXT,
        parent_id INTEGER REFERENCES terms(id),
        count INTEGER DEFAULT 0,
        
        -- SEO Fields for taxonomy pages
        meta_title VARCHAR(255),
        meta_description TEXT,
        canonical_url VARCHAR(500),
        robots_meta VARCHAR(100) DEFAULT 'index,follow',
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 3. Term Taxonomy table
    await query(`
      CREATE TABLE IF NOT EXISTS term_taxonomy (
        id SERIAL PRIMARY KEY,
        term_id INTEGER REFERENCES terms(id) ON DELETE CASCADE,
        taxonomy VARCHAR(32) NOT NULL,
        description TEXT,
        parent_id INTEGER,
        count INTEGER DEFAULT 0
      )
    `);

    // 4. Term Relationships table
    await query(`
      CREATE TABLE IF NOT EXISTS term_relationships (
        id SERIAL PRIMARY KEY,
        object_id INTEGER NOT NULL,
        term_taxonomy_id INTEGER REFERENCES term_taxonomy(id) ON DELETE CASCADE,
        term_order INTEGER DEFAULT 0
      )
    `);

    // 5. Breadcrumbs table
    await query(`
      CREATE TABLE IF NOT EXISTS breadcrumbs (
        id SERIAL PRIMARY KEY,
        object_id INTEGER NOT NULL,
        object_type VARCHAR(50) NOT NULL,
        breadcrumb_path JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        auto_generated BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await query(`CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_terms_slug ON terms(slug)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_breadcrumbs_object ON breadcrumbs(object_id, object_type)`);

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
      // Insert term
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
        // Insert taxonomy
        await query(`
          INSERT INTO term_taxonomy (term_id, taxonomy, description)
          VALUES ($1, 'category', $2)
          ON CONFLICT DO NOTHING
        `, [termResult.rows[0].id, category.description]);
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
      
      // Insert term
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
        // Insert taxonomy
        await query(`
          INSERT INTO term_taxonomy (term_id, taxonomy, description)
          VALUES ($1, 'post_tag', $2)
          ON CONFLICT DO NOTHING
        `, [termResult.rows[0].id, `Tag for ${tagName} content`]);
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
    // Insert term
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

    // Insert taxonomy
    await query(`
      INSERT INTO term_taxonomy (term_id, taxonomy, description, parent_id)
      VALUES ($1, $2, $3, $4)
    `, [
      termResult.rows[0].id,
      termData.taxonomy, // 'category' or 'post_tag'
      termData.description || '',
      termData.parent_id || null
    ]);
    
    console.log('[testing] Term created:', termResult.rows[0].id);
    return termResult.rows[0];
  } catch (error) {
    console.error('[testing] Error creating term:', error);
    throw error;
  }
}

export async function getTerms(taxonomy = null) {
  try {
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
