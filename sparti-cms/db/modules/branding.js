import { query } from '../connection.js';
import pool from '../connection.js';

// Branding-specific functions
export async function getBrandingSettings(tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      SELECT setting_key, setting_value, setting_type, setting_category, is_public, tenant_id
      FROM site_settings
      WHERE setting_category IN ('branding', 'seo', 'localization') 
        AND is_public = true
        AND tenant_id = $1
      ORDER BY setting_category, setting_key
    `, [tenantId]);
    
    // Convert to object format grouped by category
    const settings = {
      branding: {},
      seo: {},
      localization: {}
    };
    
    result.rows.forEach((row) => {
      const category = row.setting_category || 'branding';
      if (!settings[category]) settings[category] = {};
      settings[category][row.setting_key] = row.setting_value;
    });
    
    return settings;
  } catch (error) {
    console.error(`Error fetching branding settings for tenant ${tenantId}:`, error);
    throw error;
  }
}

export async function getPublicSEOSettings(tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      SELECT setting_key, setting_value, setting_type
      FROM site_settings
      WHERE is_public = true 
        AND (setting_category = 'seo' OR setting_key IN ('site_name', 'site_tagline', 'site_description', 'site_logo', 'site_favicon'))
        AND tenant_id = $1
      ORDER BY setting_key
    `, [tenantId]);
    
    // Convert to flat object format for easy access
    const settings = {};
    result.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });
    
    return settings;
  } catch (error) {
    console.error(`Error fetching public SEO settings for tenant ${tenantId}:`, error);
    throw error;
  }
}

export async function updateBrandingSetting(key, value, tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at, tenant_id)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
      ON CONFLICT (setting_key, tenant_id) 
      DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      key, 
      value, 
      key.includes('logo') || key.includes('favicon') || key.includes('image') ? 'media' : 'text',
      tenantId
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating branding setting for tenant ${tenantId}:`, error);
    throw error;
  }
}

// Site Schema functions
export async function getSiteSchema(schemaKey, tenantId) {
  try {
    const result = await query(`
      SELECT schema_value
      FROM site_schemas
      WHERE schema_key = $1 AND tenant_id = $2
    `, [schemaKey, tenantId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Parse the JSON schema_value
    const schemaValue = result.rows[0].schema_value;
    return typeof schemaValue === 'string' ? JSON.parse(schemaValue) : schemaValue;
  } catch (error) {
    console.error('Error fetching site schema:', error);
    throw error;
  }
}

export async function updateSiteSchema(schemaKey, schemaValue, tenantId) {
  try {
    const result = await query(`
      INSERT INTO site_schemas (schema_key, schema_value, tenant_id, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (schema_key, tenant_id)
      DO UPDATE SET 
        schema_value = EXCLUDED.schema_value,
        updated_at = NOW()
      RETURNING *
    `, [schemaKey, JSON.stringify(schemaValue), tenantId]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating site schema:', error);
    throw error;
  }
}

export async function updateMultipleBrandingSettings(settings, tenantId = 'tenant-gosg') {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const [key, value] of Object.entries(settings)) {
      const settingType = key.includes('logo') || key.includes('favicon') || key.includes('image') ? 'media' : 
                         key.includes('description') ? 'textarea' : 'text';
      
      await client.query(`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at, tenant_id)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
        ON CONFLICT (setting_key, tenant_id) 
        DO UPDATE SET 
          setting_value = EXCLUDED.setting_value,
          updated_at = CURRENT_TIMESTAMP
      `, [key, value, settingType, tenantId]);
    }
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error updating multiple branding settings for tenant ${tenantId}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getsitesettingsbytenant(tenantId) {
  try {
    const result = await query(`
      SELECT * FROM site_settings WHERE tenant_id = $1
    `, [tenantId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching site settings by tenant:', error);
    throw error;
  }
}

// Site Settings functions
export async function getSiteSettingByKey(key, tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      SELECT setting_key, setting_value, setting_type, setting_category, is_public, tenant_id
      FROM site_settings
      WHERE setting_key = $1 AND tenant_id = $2
      LIMIT 1
    `, [key, tenantId]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Error fetching site setting for key ${key} and tenant ${tenantId}:`, error);
    throw error;
  }
}

export async function updateSiteSettingByKey(key, value, type = 'text', category = 'general', tenantId = 'tenant-gosg') {
  try {
    const result = await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, updated_at, tenant_id)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
      ON CONFLICT (setting_key, tenant_id) 
      DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        setting_type = COALESCE(EXCLUDED.setting_type, site_settings.setting_type),
        setting_category = COALESCE(EXCLUDED.setting_category, site_settings.setting_category),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [key, value, type, category, tenantId]);
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating site setting for key ${key} and tenant ${tenantId}:`, error);
    throw error;
  }
}

// SEO-specific functions
export async function updateSEOSettings(seoData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const seoSettings = {
      meta_title: seoData.meta_title,
      meta_description: seoData.meta_description,
      meta_keywords: seoData.meta_keywords,
      meta_author: seoData.meta_author,
      og_title: seoData.og_title,
      og_description: seoData.og_description,
      og_image: seoData.og_image,
      og_type: seoData.og_type,
      twitter_card: seoData.twitter_card,
      twitter_site: seoData.twitter_site,
      twitter_image: seoData.twitter_image
    };
    
    for (const [key, value] of Object.entries(seoSettings)) {
      if (value !== undefined) {
        const settingType = key.includes('image') ? 'media' : 
                           key.includes('description') ? 'textarea' : 'text';
        
        await client.query(`
          INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, is_public, updated_at)
          VALUES ($1, $2, $3, 'seo', true, CURRENT_TIMESTAMP)
          ON CONFLICT (setting_key) 
          DO UPDATE SET 
            setting_value = EXCLUDED.setting_value,
            updated_at = CURRENT_TIMESTAMP
        `, [key, value, settingType]);
      }
    }
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating SEO settings:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Media migration functions (these depend on createMediaItem which may be in another module)
export async function migrateLogoToDatabase(logoPath, altText = 'Site Logo') {
  try {
    // Try to import createMediaItem if it exists
    const { createMediaItem } = await import('../media-management.js').catch(() => ({}));
    if (!createMediaItem) {
      throw new Error('createMediaItem function not found');
    }
    
    // Create media item for logo
    const logoMediaData = {
      filename: 'site-logo.png',
      original_filename: 'go-sg-logo-official.png',
      alt_text: altText,
      title: 'Site Logo',
      description: 'Main site logo',
      url: logoPath,
      relative_path: logoPath,
      mime_type: 'image/png',
      file_extension: 'png',
      file_size: 50000, // Estimated size
      media_type: 'image',
      folder_id: null, // Will be assigned to logos folder
      is_featured: true,
      seo_optimized: true
    };
    
    const logoMedia = await createMediaItem(logoMediaData);
    
    // Update site_logo setting with media ID
    await updateBrandingSetting('site_logo', logoMedia.id.toString());
    
    console.log('Logo migrated to database:', logoMedia.id);
    return logoMedia;
  } catch (error) {
    console.error('Error migrating logo to database:', error);
    throw error;
  }
}

export async function migrateFaviconToDatabase(faviconPath) {
  try {
    // Try to import createMediaItem if it exists
    const { createMediaItem } = await import('../media-management.js').catch(() => ({}));
    if (!createMediaItem) {
      throw new Error('createMediaItem function not found');
    }
    
    // Create media item for favicon
    const faviconMediaData = {
      filename: 'favicon.png',
      original_filename: 'favicon.png',
      alt_text: 'Site Favicon',
      title: 'Site Favicon',
      description: 'Site favicon icon',
      url: faviconPath,
      relative_path: faviconPath,
      mime_type: 'image/png',
      file_extension: 'png',
      file_size: 5000, // Estimated size
      width: 32,
      height: 32,
      media_type: 'image',
      folder_id: null,
      is_featured: true,
      seo_optimized: true
    };
    
    const faviconMedia = await createMediaItem(faviconMediaData);
    
    // Update site_favicon setting with media ID
    await updateBrandingSetting('site_favicon', faviconMedia.id.toString());
    
    console.log('Favicon migrated to database:', faviconMedia.id);
    return faviconMedia;
  } catch (error) {
    console.error('Error migrating favicon to database:', error);
    throw error;
  }
}

