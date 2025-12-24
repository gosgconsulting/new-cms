/**
 * Migration script to migrate GO SG Consulting branding styles to settings database
 * 
 * This script extracts branding information from the gosgconsulting theme:
 * - Logo: assets/go-sg-logo-official.png
 * - Favicon: /favicon.png
 * - Typography: Font families, sizes, weights from theme.css
 * - Colors: Primary, secondary, accent colors from theme.css
 * 
 * Usage: node scripts/migrations/migrate-gosgconsulting-branding.js
 */

import { query } from '../../sparti-cms/db/connection.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tenant ID for GO SG Consulting
const TENANT_ID = 'tenant-gosg';
const THEME_ID = 'gosgconsulting'; // Theme slug

// Branding settings extracted from theme.css
const BRANDING_SETTINGS = {
  // Logo and Favicon
  site_logo: {
    value: '/theme/gosgconsulting/assets/go-sg-logo-official.png',
    type: 'media',
    category: 'branding',
    is_public: true
  },
  site_favicon: {
    value: '/favicon.png',
    type: 'media',
    category: 'branding',
    is_public: true
  },
  
  // Typography Settings (from theme.css CSS variables)
  typography_heading_font: {
    value: 'Inter',
    type: 'text',
    category: 'branding',
    is_public: true
  },
  typography_body_font: {
    value: 'Inter',
    type: 'text',
    category: 'branding',
    is_public: true
  },
  typography_base_font_size: {
    value: '16px',
    type: 'text',
    category: 'branding',
    is_public: true
  },
  typography_heading_weight: {
    value: '700',
    type: 'text',
    category: 'branding',
    is_public: true
  },
  typography_body_weight: {
    value: '400',
    type: 'text',
    category: 'branding',
    is_public: true
  },
  typography_line_height: {
    value: '1.5',
    type: 'text',
    category: 'branding',
    is_public: true
  },
  
  // Color Settings (from theme.css CSS variables)
  // Primary brand colors
  color_primary: {
    value: '#9b87f5',
    type: 'color',
    category: 'branding',
    is_public: true
  },
  color_secondary: {
    value: '#7E69AB',
    type: 'color',
    category: 'branding',
    is_public: true
  },
  color_accent: {
    value: '#F94E40',
    type: 'color',
    category: 'branding',
    is_public: true
  },
  color_background: {
    value: '#FFFFFF',
    type: 'color',
    category: 'branding',
    is_public: true
  },
  color_text: {
    value: '#333333',
    type: 'color',
    category: 'branding',
    is_public: true
  },
  
  // Additional brand colors
  color_brand_teal: {
    value: 'hsl(174, 80%, 45%)',
    type: 'color',
    category: 'branding',
    is_public: true
  },
  color_brand_blue: {
    value: 'hsl(210, 100%, 50%)',
    type: 'color',
    category: 'branding',
    is_public: true
  },
  color_brand_gold: {
    value: 'hsl(36, 100%, 65%)',
    type: 'color',
    category: 'branding',
    is_public: true
  },
  color_brand_purple: {
    value: '#9b87f5',
    type: 'color',
    category: 'branding',
    is_public: true
  },
  color_coral: {
    value: '#F94E40',
    type: 'color',
    category: 'branding',
    is_public: true
  },
  
  // Gradient colors
  color_gradient_start: {
    value: '#9b87f5',
    type: 'color',
    category: 'branding',
    is_public: true
  },
  color_gradient_end: {
    value: '#7E69AB',
    type: 'color',
    category: 'branding',
    is_public: true
  }
};

/**
 * Ensure site_settings table has all required columns
 */
async function ensureTableStructure() {
  console.log('[testing] Ensuring site_settings table structure...');
  
  try {
    // Check if theme_id column exists
    const columnCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'site_settings' 
      AND column_name = 'theme_id'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('[testing] Adding theme_id column to site_settings...');
      await query(`
        ALTER TABLE site_settings 
        ADD COLUMN theme_id VARCHAR(255)
      `);
      console.log('[testing] ✓ Added theme_id column');
    } else {
      console.log('[testing] ✓ theme_id column already exists');
    }
    
    // Ensure setting_category has default
    await query(`
      ALTER TABLE site_settings 
      ALTER COLUMN setting_category SET DEFAULT 'general'
    `).catch(() => {
      // Column might not exist, that's okay
    });
    
    // Ensure is_public has default
    await query(`
      ALTER TABLE site_settings 
      ALTER COLUMN is_public SET DEFAULT false
    `).catch(() => {
      // Column might not exist, that's okay
    });
    
    console.log('[testing] ✓ Table structure verified');
  } catch (error) {
    console.error('[testing] Error ensuring table structure:', error);
    throw error;
  }
}

/**
 * Migrate a single branding setting
 */
async function migrateSetting(key, config) {
  try {
    // Check if setting already exists
    const existing = await query(`
      SELECT id FROM site_settings 
      WHERE setting_key = $1 
      AND tenant_id = $2 
      AND (theme_id = $3 OR (theme_id IS NULL AND $3 IS NULL))
      LIMIT 1
    `, [key, TENANT_ID, THEME_ID]);
    
    if (existing.rows.length > 0) {
      // Update existing setting
      await query(`
        UPDATE site_settings 
        SET setting_value = $1,
            setting_type = $2,
            setting_category = $3,
            is_public = $4,
            theme_id = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
      `, [
        config.value,
        config.type,
        config.category,
        config.is_public,
        THEME_ID,
        existing.rows[0].id
      ]);
      console.log(`[testing] ✓ Updated setting: ${key}`);
    } else {
      // Insert new setting
      await query(`
        INSERT INTO site_settings (
          setting_key, 
          setting_value, 
          setting_type, 
          setting_category, 
          is_public, 
          tenant_id, 
          theme_id,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        key,
        config.value,
        config.type,
        config.category,
        config.is_public,
        TENANT_ID,
        THEME_ID
      ]);
      console.log(`[testing] ✓ Created setting: ${key}`);
    }
  } catch (error) {
    console.error(`[testing] ✗ Error migrating setting ${key}:`, error);
    throw error;
  }
}

/**
 * Verify logo and favicon files exist
 */
function verifyAssets() {
  console.log('[testing] Verifying asset files...');
  
  // Check logo
  const logoPath = join(__dirname, '../../sparti-cms/theme/gosgconsulting/assets/go-sg-logo-official.png');
  if (existsSync(logoPath)) {
    console.log(`[testing] ✓ Logo found: ${logoPath}`);
  } else {
    console.warn(`[testing] ⚠ Logo not found at: ${logoPath}`);
  }
  
  // Check favicon
  const faviconPath = join(__dirname, '../../public/favicon.png');
  if (existsSync(faviconPath)) {
    console.log(`[testing] ✓ Favicon found: ${faviconPath}`);
  } else {
    console.warn(`[testing] ⚠ Favicon not found at: ${faviconPath}`);
  }
}

/**
 * Main migration function
 */
async function migrateBrandingStyles() {
  console.log('[testing] ============================================');
  console.log('[testing] GO SG Consulting Branding Migration');
  console.log('[testing] ============================================');
  console.log(`[testing] Tenant ID: ${TENANT_ID}`);
  console.log(`[testing] Theme ID: ${THEME_ID}`);
  console.log('[testing] ============================================');
  
  try {
    // Verify assets
    verifyAssets();
    
    // Ensure table structure
    await ensureTableStructure();
    
    // Migrate all branding settings
    console.log('[testing] Migrating branding settings...');
    const settingsCount = Object.keys(BRANDING_SETTINGS).length;
    let migratedCount = 0;
    
    for (const [key, config] of Object.entries(BRANDING_SETTINGS)) {
      await migrateSetting(key, config);
      migratedCount++;
    }
    
    console.log('[testing] ============================================');
    console.log(`[testing] ✓ Migration completed successfully!`);
    console.log(`[testing] ✓ Migrated ${migratedCount} settings`);
    console.log('[testing] ============================================');
    
    // Display summary
    console.log('[testing] Summary of migrated settings:');
    console.log('[testing] - Logo: /theme/gosgconsulting/assets/go-sg-logo-official.png');
    console.log('[testing] - Favicon: /favicon.png');
    console.log('[testing] - Typography: Inter font family, 16px base size');
    console.log('[testing] - Colors: Primary (#9b87f5), Secondary (#7E69AB), Accent (#F94E40)');
    console.log('[testing] ============================================');
    
  } catch (error) {
    console.error('[testing] ============================================');
    console.error('[testing] ✗ Migration failed!');
    console.error('[testing] ============================================');
    console.error('[testing] Error:', error);
    throw error;
  }
}

// Run migration if script is executed directly
// Check if this module is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || process.argv[1]?.includes('migrate-gosgconsulting-branding')) {
  migrateBrandingStyles()
    .then(() => {
      console.log('[testing] Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[testing] Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateBrandingStyles, BRANDING_SETTINGS, TENANT_ID, THEME_ID };

