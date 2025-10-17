import { query } from './postgres.js';

// ===== SEO MANAGEMENT SYSTEM FUNCTIONS =====

// Initialize SEO management tables
export async function initializeSEOManagementTables() {
  try {
    console.log('[testing] Creating SEO management tables...');

    // 1. URL Redirects Management Table
    await query(`
      CREATE TABLE IF NOT EXISTS redirects (
        id SERIAL PRIMARY KEY,
        old_url VARCHAR(500) NOT NULL UNIQUE,
        new_url VARCHAR(500) NOT NULL,
        redirect_type INTEGER DEFAULT 301,
        status VARCHAR(20) DEFAULT 'active',
        hits INTEGER DEFAULT 0,
        last_hit TIMESTAMP,
        notes TEXT,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 2. Advanced SEO Meta Table
    await query(`
      CREATE TABLE IF NOT EXISTS seo_meta (
        id SERIAL PRIMARY KEY,
        object_id INTEGER NOT NULL,
        object_type VARCHAR(50) NOT NULL, -- 'post', 'page', 'category', 'tag'
        
        -- Focus Keywords
        focus_keyword VARCHAR(255),
        secondary_keywords TEXT[], -- Array of secondary keywords
        keyword_density DECIMAL(5,2),
        
        -- Readability & Content Analysis
        readability_score INTEGER,
        content_length INTEGER,
        word_count INTEGER,
        sentence_count INTEGER,
        paragraph_count INTEGER,
        
        -- Social Media Optimization
        facebook_title VARCHAR(255),
        facebook_description TEXT,
        facebook_image VARCHAR(500),
        twitter_title VARCHAR(255),
        twitter_description TEXT,
        twitter_image VARCHAR(500),
        
        -- Advanced SEO Controls
        breadcrumb_title VARCHAR(255),
        redirect_url VARCHAR(500),
        redirect_type INTEGER, -- 301, 302, etc.
        noindex BOOLEAN DEFAULT FALSE,
        nofollow BOOLEAN DEFAULT FALSE,
        noarchive BOOLEAN DEFAULT FALSE,
        nosnippet BOOLEAN DEFAULT FALSE,
        noimageindex BOOLEAN DEFAULT FALSE,
        
        -- Schema.org structured data
        schema_type VARCHAR(100),
        schema_data JSONB,
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        UNIQUE(object_id, object_type)
      )
    `);

    // 3. Dynamic Sitemap Entries Table
    await query(`
      CREATE TABLE IF NOT EXISTS sitemap_entries (
        id SERIAL PRIMARY KEY,
        url VARCHAR(500) NOT NULL UNIQUE,
        changefreq VARCHAR(20) DEFAULT 'weekly', -- always, hourly, daily, weekly, monthly, yearly, never
        priority DECIMAL(2,1) DEFAULT 0.5, -- 0.0 to 1.0
        lastmod TIMESTAMP DEFAULT NOW(),
        sitemap_type VARCHAR(50) DEFAULT 'main', -- main, images, videos, news
        is_active BOOLEAN DEFAULT TRUE,
        
        -- Additional metadata
        object_id INTEGER,
        object_type VARCHAR(50), -- post, page, category, etc.
        
        -- SEO metadata
        title VARCHAR(255),
        description TEXT,
        image_url VARCHAR(500),
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 4. Robots.txt Management Table
    await query(`
      CREATE TABLE IF NOT EXISTS robots_config (
        id SERIAL PRIMARY KEY,
        user_agent VARCHAR(100) NOT NULL,
        directive VARCHAR(20) NOT NULL, -- Allow, Disallow
        path VARCHAR(500) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 5. SEO Analytics Table
    await query(`
      CREATE TABLE IF NOT EXISTS seo_analytics (
        id SERIAL PRIMARY KEY,
        url VARCHAR(500) NOT NULL,
        page_title VARCHAR(255),
        meta_description TEXT,
        
        -- Performance Metrics
        page_views INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        bounce_rate DECIMAL(5,2),
        avg_time_on_page INTEGER, -- seconds
        
        -- SEO Metrics
        organic_clicks INTEGER DEFAULT 0,
        organic_impressions INTEGER DEFAULT 0,
        avg_position DECIMAL(5,2),
        ctr DECIMAL(5,2), -- Click-through rate
        
        -- Keywords tracking
        top_keywords JSONB,
        
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        
        UNIQUE(url, date)
      )
    `);

    // Create indexes for performance
    await query(`CREATE INDEX IF NOT EXISTS idx_redirects_old_url ON redirects(old_url)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_redirects_status ON redirects(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_redirects_hits ON redirects(hits DESC)`);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_seo_meta_object ON seo_meta(object_id, object_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_seo_meta_focus_keyword ON seo_meta(focus_keyword)`);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_sitemap_entries_type ON sitemap_entries(sitemap_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_sitemap_entries_active ON sitemap_entries(is_active)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_sitemap_entries_lastmod ON sitemap_entries(lastmod DESC)`);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_robots_config_user_agent ON robots_config(user_agent)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_robots_config_active ON robots_config(is_active)`);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_seo_analytics_url ON seo_analytics(url)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_seo_analytics_date ON seo_analytics(date DESC)`);

    // Insert default robots.txt configuration
    console.log('[testing] Inserting default robots.txt configuration...');
    
    const defaultRobotsRules = [
      { user_agent: 'Googlebot', directive: 'Allow', path: '/' },
      { user_agent: 'Bingbot', directive: 'Allow', path: '/' },
      { user_agent: 'Twitterbot', directive: 'Allow', path: '/' },
      { user_agent: 'facebookexternalhit', directive: 'Allow', path: '/' },
      { user_agent: '*', directive: 'Allow', path: '/' },
      { user_agent: '*', directive: 'Disallow', path: '/admin' },
      { user_agent: '*', directive: 'Disallow', path: '/api' },
      { user_agent: '*', directive: 'Disallow', path: '/*.json' }
    ];

    for (const rule of defaultRobotsRules) {
      await query(`
        INSERT INTO robots_config (user_agent, directive, path, notes)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [
        rule.user_agent,
        rule.directive,
        rule.path,
        `Default ${rule.directive.toLowerCase()} rule for ${rule.user_agent}`
      ]);
    }

    // Insert default sitemap entries for existing content
    console.log('[testing] Creating default sitemap entries...');
    
    const defaultSitemapEntries = [
      { 
        url: '/', 
        changefreq: 'weekly', 
        priority: 1.0, 
        title: 'Home - GO SG Digital Marketing',
        description: 'GO SG Digital Marketing Agency - SEO and Digital Marketing Services'
      },
      { 
        url: '/blog', 
        changefreq: 'daily', 
        priority: 0.8,
        title: 'Blog - GO SG Digital Marketing',
        description: 'Latest insights and tips on SEO and digital marketing'
      },
      { 
        url: '/contact', 
        changefreq: 'monthly', 
        priority: 0.7,
        title: 'Contact - GO SG Digital Marketing',
        description: 'Get in touch with our digital marketing experts'
      }
    ];

    for (const entry of defaultSitemapEntries) {
      await query(`
        INSERT INTO sitemap_entries (url, changefreq, priority, title, description, sitemap_type)
        VALUES ($1, $2, $3, $4, $5, 'main')
        ON CONFLICT (url) DO NOTHING
      `, [entry.url, entry.changefreq, entry.priority, entry.title, entry.description]);
    }

    console.log('[testing] SEO management tables created successfully!');
    console.log('[testing] Default robots.txt and sitemap entries inserted!');
    
    return true;
  } catch (error) {
    console.error('[testing] Error creating SEO management tables:', error);
    throw error;
  }
}

// ===== REDIRECTS MANAGEMENT =====

export async function createRedirect(redirectData) {
  try {
    const result = await query(`
      INSERT INTO redirects (old_url, new_url, redirect_type, status, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      redirectData.old_url,
      redirectData.new_url,
      redirectData.redirect_type || 301,
      redirectData.status || 'active',
      redirectData.notes || '',
      redirectData.created_by || 'admin'
    ]);
    
    console.log('[testing] Redirect created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating redirect:', error);
    throw error;
  }
}

export async function getRedirects(filters = {}) {
  try {
    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramCount = 0;

    if (filters.status) {
      whereClause += ` AND status = $${++paramCount}`;
      params.push(filters.status);
    }

    if (filters.search) {
      whereClause += ` AND (old_url ILIKE $${++paramCount} OR new_url ILIKE $${++paramCount})`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
      paramCount++;
    }

    const result = await query(`
      SELECT * FROM redirects
      ${whereClause}
      ORDER BY hits DESC, created_at DESC
    `, params);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching redirects:', error);
    throw error;
  }
}

export async function updateRedirect(redirectId, redirectData) {
  try {
    const result = await query(`
      UPDATE redirects 
      SET old_url = $1, new_url = $2, redirect_type = $3, status = $4, 
          notes = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [
      redirectData.old_url,
      redirectData.new_url,
      redirectData.redirect_type,
      redirectData.status,
      redirectData.notes,
      redirectId
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error updating redirect:', error);
    throw error;
  }
}

export async function deleteRedirect(redirectId) {
  try {
    const result = await query(`
      DELETE FROM redirects WHERE id = $1 RETURNING *
    `, [redirectId]);
    
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error deleting redirect:', error);
    throw error;
  }
}

export async function trackRedirectHit(oldUrl) {
  try {
    await query(`
      UPDATE redirects 
      SET hits = hits + 1, last_hit = NOW()
      WHERE old_url = $1 AND status = 'active'
    `, [oldUrl]);
  } catch (error) {
    console.error('[testing] Error tracking redirect hit:', error);
  }
}

// ===== ROBOTS.TXT MANAGEMENT =====

export async function getRobotsConfig() {
  try {
    const result = await query(`
      SELECT * FROM robots_config
      WHERE is_active = true
      ORDER BY user_agent, directive, path
    `);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching robots config:', error);
    throw error;
  }
}

export async function updateRobotsConfig(rules) {
  try {
    // Deactivate all existing rules
    await query(`UPDATE robots_config SET is_active = false`);
    
    // Insert new rules
    for (const rule of rules) {
      await query(`
        INSERT INTO robots_config (user_agent, directive, path, notes, is_active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT DO NOTHING
      `, [rule.user_agent, rule.directive, rule.path, rule.notes || '']);
    }
    
    console.log('[testing] Robots.txt configuration updated');
    return true;
  } catch (error) {
    console.error('[testing] Error updating robots config:', error);
    throw error;
  }
}

export async function generateRobotsTxt() {
  try {
    const rules = await getRobotsConfig();
    
    let robotsTxt = '';
    let currentUserAgent = '';
    
    for (const rule of rules) {
      if (rule.user_agent !== currentUserAgent) {
        robotsTxt += `User-agent: ${rule.user_agent}\n`;
        currentUserAgent = rule.user_agent;
      }
      robotsTxt += `${rule.directive}: ${rule.path}\n`;
    }
    
    // Add sitemap reference
    robotsTxt += '\n# Sitemap\n';
    robotsTxt += 'Sitemap: https://gosgconsulting.com/sitemap.xml\n';
    
    return robotsTxt;
  } catch (error) {
    console.error('[testing] Error generating robots.txt:', error);
    throw error;
  }
}

// ===== SITEMAP MANAGEMENT =====

export async function getSitemapEntries(type = null) {
  try {
    let whereClause = 'WHERE is_active = true';
    let params = [];
    
    if (type) {
      whereClause += ' AND sitemap_type = $1';
      params = [type];
    }
    
    const result = await query(`
      SELECT * FROM sitemap_entries
      ${whereClause}
      ORDER BY priority DESC, lastmod DESC
    `, params);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching sitemap entries:', error);
    throw error;
  }
}

export async function createSitemapEntry(entryData) {
  try {
    const result = await query(`
      INSERT INTO sitemap_entries 
        (url, changefreq, priority, sitemap_type, title, description, object_id, object_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (url) DO UPDATE SET
        changefreq = EXCLUDED.changefreq,
        priority = EXCLUDED.priority,
        lastmod = NOW(),
        updated_at = NOW()
      RETURNING *
    `, [
      entryData.url,
      entryData.changefreq || 'weekly',
      entryData.priority || 0.5,
      entryData.sitemap_type || 'main',
      entryData.title || '',
      entryData.description || '',
      entryData.object_id || null,
      entryData.object_type || null
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating sitemap entry:', error);
    throw error;
  }
}

export async function generateSitemapXML() {
  try {
    const entries = await getSitemapEntries();
    
    let sitemapXML = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXML += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    sitemapXML += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
    sitemapXML += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
    sitemapXML += '        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"\n';
    sitemapXML += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
    sitemapXML += '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n\n';
    
    for (const entry of entries) {
      sitemapXML += '  <url>\n';
      sitemapXML += `    <loc>https://gosgconsulting.com${entry.url}</loc>\n`;
      sitemapXML += `    <lastmod>${entry.lastmod.toISOString().split('T')[0]}</lastmod>\n`;
      sitemapXML += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      sitemapXML += `    <priority>${entry.priority}</priority>\n`;
      sitemapXML += '  </url>\n';
    }
    
    sitemapXML += '</urlset>';
    
    return sitemapXML;
  } catch (error) {
    console.error('[testing] Error generating sitemap XML:', error);
    throw error;
  }
}

// ===== SEO META MANAGEMENT =====

export async function createSEOMeta(metaData) {
  try {
    const result = await query(`
      INSERT INTO seo_meta 
        (object_id, object_type, focus_keyword, secondary_keywords, readability_score, 
         content_length, facebook_title, facebook_description, twitter_title, twitter_description,
         noindex, nofollow, schema_type, schema_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (object_id, object_type) DO UPDATE SET
        focus_keyword = EXCLUDED.focus_keyword,
        secondary_keywords = EXCLUDED.secondary_keywords,
        readability_score = EXCLUDED.readability_score,
        content_length = EXCLUDED.content_length,
        facebook_title = EXCLUDED.facebook_title,
        facebook_description = EXCLUDED.facebook_description,
        twitter_title = EXCLUDED.twitter_title,
        twitter_description = EXCLUDED.twitter_description,
        noindex = EXCLUDED.noindex,
        nofollow = EXCLUDED.nofollow,
        schema_type = EXCLUDED.schema_type,
        schema_data = EXCLUDED.schema_data,
        updated_at = NOW()
      RETURNING *
    `, [
      metaData.object_id,
      metaData.object_type,
      metaData.focus_keyword || null,
      metaData.secondary_keywords || [],
      metaData.readability_score || null,
      metaData.content_length || null,
      metaData.facebook_title || null,
      metaData.facebook_description || null,
      metaData.twitter_title || null,
      metaData.twitter_description || null,
      metaData.noindex || false,
      metaData.nofollow || false,
      metaData.schema_type || null,
      metaData.schema_data || null
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error creating SEO meta:', error);
    throw error;
  }
}

export async function getSEOMeta(objectId, objectType) {
  try {
    const result = await query(`
      SELECT * FROM seo_meta
      WHERE object_id = $1 AND object_type = $2
    `, [objectId, objectType]);
    
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error fetching SEO meta:', error);
    throw error;
  }
}
