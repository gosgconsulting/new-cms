import { query } from './index.js';
import { getSiteSettingByKey } from './modules/branding.js';

// ===== SEO MANAGEMENT SYSTEM FUNCTIONS =====

// Initialize SEO management tables using Sequelize migrations
export async function initializeSEOManagementTables() {
  try {
    console.log('[testing] Creating SEO management tables...');

    // Run SEO tables migration
    const { runMigrations } = await import('../sequelize/run-migrations.js');
    await runMigrations(['20241202000005-create-seo-tables.js']);

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

export async function generateRobotsTxt(tenantId = 'tenant-gosg') {
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
    
    // Get site URL from settings
    let siteUrl = 'https://cms.sparti.ai'; // Default fallback
    try {
      const siteUrlSetting = await getSiteSettingByKey('site_url', tenantId);
      if (siteUrlSetting && siteUrlSetting.setting_value) {
        siteUrl = siteUrlSetting.setting_value.replace(/\/$/, ''); // Remove trailing slash
      }
    } catch (err) {
      console.warn('[testing] Could not load site_url setting, using default:', err);
    }
    
    // Add sitemap reference
    robotsTxt += '\n# Sitemap\n';
    robotsTxt += `Sitemap: ${siteUrl}/sitemap.xml\n`;
    
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

export async function generateSitemapXML(tenantId = 'tenant-gosg') {
  try {
    const entries = await getSitemapEntries();
    
    // Get site URL from settings
    let siteUrl = 'https://cms.sparti.ai'; // Default fallback
    try {
      const siteUrlSetting = await getSiteSettingByKey('site_url', tenantId);
      if (siteUrlSetting && siteUrlSetting.setting_value) {
        siteUrl = siteUrlSetting.setting_value.replace(/\/$/, ''); // Remove trailing slash
      }
    } catch (err) {
      console.warn('[testing] Could not load site_url setting, using default:', err);
    }
    
    let sitemapXML = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXML += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    sitemapXML += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
    sitemapXML += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
    sitemapXML += '        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"\n';
    sitemapXML += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
    sitemapXML += '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n\n';
    
    for (const entry of entries) {
      sitemapXML += '  <url>\n';
      sitemapXML += `    <loc>${siteUrl}${entry.url}</loc>\n`;
      
      // Handle lastmod - it might be a Date object or a string
      let lastmodDate;
      if (entry.lastmod instanceof Date) {
        lastmodDate = entry.lastmod.toISOString().split('T')[0];
      } else if (typeof entry.lastmod === 'string') {
        // Parse string date and format it
        const date = new Date(entry.lastmod);
        lastmodDate = date.toISOString().split('T')[0];
      } else {
        // Fallback to current date if lastmod is invalid
        lastmodDate = new Date().toISOString().split('T')[0];
      }
      sitemapXML += `    <lastmod>${lastmodDate}</lastmod>\n`;
      
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
