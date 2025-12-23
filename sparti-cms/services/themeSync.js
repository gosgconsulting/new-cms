import { query } from '../db/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert folder name to display name
 * e.g., "landingpage" -> "Landing Page"
 * Handles camelCase, kebab-case, snake_case, and compound words
 */
function formatThemeName(slug) {
  // Handle camelCase (e.g., "landingPage" -> "Landing Page")
  let formatted = slug.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Handle compound words without separators by detecting common word patterns
  // Common patterns: "landingpage", "homepage", "aboutpage", etc.
  const commonPatterns = {
    'landingpage': 'Landing Page',
    'homepage': 'Home Page',
    'aboutpage': 'About Page',
    'contactpage': 'Contact Page'
  };
  
  // Check if it matches a known pattern
  const lowerSlug = slug.toLowerCase();
  if (commonPatterns[lowerSlug]) {
    return commonPatterns[lowerSlug];
  }
  
  // For other compound words, try to split intelligently
  // This is a simple heuristic - can be improved
  formatted = formatted.replace(/([a-z])([a-z][A-Z])/g, '$1 $2');
  
  // Split by common separators and format
  return formatted
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Read theme.json config file from a theme folder
 * @param {string} slug - Theme slug (folder name)
 * @returns {Object|null} Parsed theme config or null if file doesn't exist or is invalid
 */
function readThemeConfig(slug) {
  try {
    const themesDir = path.join(__dirname, '../theme');
    const themePath = path.join(themesDir, slug);
    const configPath = path.join(themePath, 'theme.json');
    
    // Check if theme folder exists
    if (!fs.existsSync(themePath)) {
      console.log(`[testing] Theme folder does not exist: ${themePath}`);
      return null;
    }
    
    // Check if theme.json exists
    if (!fs.existsSync(configPath)) {
      console.log(`[testing] theme.json not found for theme: ${slug}`);
      return null;
    }
    
    // Read and parse JSON
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    // Validate that name field exists (required)
    if (!config.name) {
      console.warn(`[testing] theme.json for ${slug} is missing required 'name' field`);
      return null;
    }
    
    return config;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist - this is fine, we'll use fallback
      return null;
    }
    // JSON parse error or other error
    console.error(`[testing] Error reading theme.json for ${slug}:`, error.message);
    return null;
  }
}

/**
 * Write theme.json config file to a theme folder
 * @param {string} slug - Theme slug (folder name)
 * @param {Object} config - Theme configuration object
 * @returns {boolean} True if successful, false otherwise
 */
function writeThemeConfig(slug, config) {
  try {
    const themesDir = path.join(__dirname, '../theme');
    const themePath = path.join(themesDir, slug);
    const configPath = path.join(themePath, 'theme.json');
    
    // Ensure theme folder exists
    if (!fs.existsSync(themePath)) {
      fs.mkdirSync(themePath, { recursive: true });
    }
    
    // Ensure config has required fields
    if (!config.name) {
      throw new Error('Theme config must have a "name" field');
    }
    
    // Format JSON with proper indentation
    const jsonContent = JSON.stringify(config, null, 2);
    
    // Write to file
    fs.writeFileSync(configPath, jsonContent, 'utf8');
    console.log(`[testing] Created theme.json for theme: ${slug}`);
    
    return true;
  } catch (error) {
    console.error(`[testing] Error writing theme.json for ${slug}:`, error);
    return false;
  }
}

/**
 * Get themes from file system only (no database required)
 * Scans sparti-cms/theme/ directory and returns theme information
 * This is used as a fallback when database is not available
 */
export function getThemesFromFileSystem() {
  try {
    const themesDir = path.join(__dirname, '../theme');
    
    // Check if themes directory exists
    if (!fs.existsSync(themesDir)) {
      console.log('[testing] Themes directory does not exist:', themesDir);
      return [];
    }

    // Read theme folders
    const themeFolders = fs.readdirSync(themesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    if (themeFolders.length === 0) {
      console.log('[testing] No theme folders found in:', themesDir);
      return [];
    }

    // Read theme.json from each folder and format themes
    const themes = themeFolders.map(slug => {
      // Try to read theme.json
      const config = readThemeConfig(slug);
      
      if (config) {
        // Use metadata from theme.json
        return {
          id: slug,
          slug: slug,
          name: config.name,
          description: config.description || `Theme: ${config.name}`,
          version: config.version,
          author: config.author,
          is_active: config.is_active !== undefined ? config.is_active : true,
          from_filesystem: true
        };
      } else {
        // Fallback to folder name if theme.json doesn't exist
        const fallbackName = formatThemeName(slug);
        return {
          id: slug,
          slug: slug,
          name: fallbackName,
          description: `Theme: ${fallbackName}`,
          is_active: true,
          from_filesystem: true
        };
      }
    });

    return themes;
  } catch (error) {
    console.error('[testing] Error reading themes from file system:', error);
    return [];
  }
}

/**
 * Sync themes from file system to database
 * Scans sparti-cms/theme/ directory and creates/updates theme records
 */
export async function syncThemesFromFileSystem() {
  try {
    const themesDir = path.join(__dirname, '../theme');
    
    // Check if themes directory exists
    if (!fs.existsSync(themesDir)) {
      console.log('[testing] Themes directory does not exist:', themesDir);
      return { success: true, synced: 0, message: 'Themes directory not found' };
    }

    // Read theme folders
    const themeFolders = fs.readdirSync(themesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    if (themeFolders.length === 0) {
      console.log('[testing] No theme folders found in:', themesDir);
      return { success: true, synced: 0, message: 'No themes found' };
    }

    console.log(`[testing] Found ${themeFolders.length} theme folder(s):`, themeFolders);

    let syncedCount = 0;
    const results = [];

    for (const themeSlug of themeFolders) {
      try {
        // Check if theme exists in database
        let existingTheme;
        try {
          existingTheme = await query(`
            SELECT id, name, slug, updated_at
            FROM themes
            WHERE slug = $1 OR id = $1
          `, [themeSlug]);
        } catch (dbError) {
          // If database table doesn't exist, skip database operations
          if (dbError.code === '42P01' || dbError.message?.includes('does not exist')) {
            console.log(`[testing] Themes table doesn't exist, skipping database sync for ${themeSlug}`);
            results.push({
              slug: themeSlug,
              action: 'skipped',
              name: formatThemeName(themeSlug),
              reason: 'Database table does not exist'
            });
            continue;
          }
          throw dbError;
        }

        // Read theme.json for metadata
        const config = readThemeConfig(themeSlug);
        
        // Use metadata from theme.json if available, otherwise fallback to folder name
        const themeName = config?.name || formatThemeName(themeSlug);
        const themeDescription = config?.description || `Theme: ${themeName}`;
        const isActive = config?.is_active !== undefined ? config.is_active : true;
        const now = new Date().toISOString();

        if (existingTheme.rows.length > 0) {
          // Theme exists, update with metadata from theme.json
          await query(`
            UPDATE themes
            SET name = $1, description = $2, updated_at = $3, is_active = $4
            WHERE slug = $5 OR id = $5
          `, [themeName, themeDescription, now, isActive, themeSlug]);
          
          results.push({
            slug: themeSlug,
            action: 'updated',
            name: themeName
          });
          syncedCount++;
          console.log(`[testing] Updated theme: ${themeSlug} (${themeName})`);
        } else {
          // Theme doesn't exist, create new record with metadata from theme.json
          await query(`
            INSERT INTO themes (id, name, slug, description, created_at, updated_at, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            themeSlug,
            themeName,
            themeSlug,
            themeDescription,
            now,
            now,
            isActive
          ]);
          
          results.push({
            slug: themeSlug,
            action: 'created',
            name: themeName
          });
          syncedCount++;
          console.log(`[testing] Created theme: ${themeSlug} (${themeName})`);
        }
      } catch (error) {
        console.error(`[testing] Error syncing theme ${themeSlug}:`, error);
        results.push({
          slug: themeSlug,
          action: 'error',
          error: error.message
        });
      }
    }

    return {
      success: true,
      synced: syncedCount,
      total: themeFolders.length,
      results: results,
      message: `Synced ${syncedCount} theme(s)`
    };
  } catch (error) {
    console.error('[testing] Error in syncThemesFromFileSystem:', error);
    return {
      success: false,
      synced: 0,
      error: error.message,
      message: 'Failed to sync themes'
    };
  }
}

/**
 * Get all active themes from database
 * Falls back to file system if database is not available
 */
export async function getAllThemes() {
  try {
    const result = await query(`
      SELECT id, name, slug, description, created_at, updated_at, is_active
      FROM themes
      WHERE is_active = true
      ORDER BY name ASC
    `);
    
    return result.rows;
  } catch (error) {
    // If database query fails (e.g., table doesn't exist), fall back to file system
    console.error('[testing] Error getting themes from database, falling back to file system:', error.message);
    console.log('[testing] Using file system themes as fallback');
    return getThemesFromFileSystem();
  }
}

/**
 * Get theme by slug
 */
export async function getThemeBySlug(slug) {
  try {
    const result = await query(`
      SELECT id, name, slug, description, created_at, updated_at, is_active
      FROM themes
      WHERE slug = $1 OR id = $1
      LIMIT 1
    `, [slug]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error getting theme by slug:', error);
    throw error;
  }
}

/**
 * Create a new theme (both folder and database entry)
 * @param {string} slug - Theme slug (folder name)
 * @param {string} name - Display name (optional, will be formatted from slug if not provided)
 * @param {string} description - Theme description (optional)
 * @returns {Promise<Object>} Created theme object
 */
export async function createTheme(slug, name, description) {
  try {
    const themesDir = path.join(__dirname, '../theme');
    
    // Ensure themes directory exists
    if (!fs.existsSync(themesDir)) {
      fs.mkdirSync(themesDir, { recursive: true });
      console.log('[testing] Created themes directory:', themesDir);
    }
    
    // Validate slug (must be valid folder name)
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('Invalid slug. Slug must contain only lowercase letters, numbers, and hyphens.');
    }
    
    const themePath = path.join(themesDir, slug);
    
    // Check if folder already exists
    if (fs.existsSync(themePath)) {
      throw new Error(`Theme folder "${slug}" already exists`);
    }
    
    // Check if theme exists in database
    try {
      const existingTheme = await query(`
        SELECT id, slug FROM themes WHERE slug = $1 OR id = $1 LIMIT 1
      `, [slug]);
      
      if (existingTheme.rows.length > 0) {
        throw new Error(`Theme "${slug}" already exists in database`);
      }
    } catch (dbError) {
      // If database query fails (e.g., table doesn't exist), we'll still create the folder
      // and try to create the database entry
      if (dbError.message.includes('already exists')) {
        throw dbError;
      }
      console.log('[testing] Database check failed, will attempt to create theme anyway:', dbError.message);
    }
    
    // Create theme folder
    fs.mkdirSync(themePath, { recursive: true });
    console.log('[testing] Created theme folder:', themePath);
    
    // Create a basic index.tsx file in the theme folder
    const indexFile = path.join(themePath, 'index.tsx');
    const themeName = name || formatThemeName(slug);
    const themeComponent = `import React from 'react';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
}

/**
 * Theme: ${themeName}
 * This is a customizable theme component
 */
const TenantLanding: React.FC<TenantLandingProps> = ({ 
  tenantName = 'Theme', 
  tenantSlug = '${slug}' 
}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-6 px-4 md:px-8 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <a href={\`/theme/\${tenantSlug}\`} className="flex items-center z-10">
              <span className="h-12 inline-flex items-center font-bold text-xl">
                {tenantName}
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to {tenantName}</h1>
            <p className="text-muted-foreground text-lg">
              This is your new theme. Customize it to fit your needs.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {tenantName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default TenantLanding;
`;
    
    fs.writeFileSync(indexFile, themeComponent, 'utf8');
    console.log('[testing] Created theme index file:', indexFile);
    
    // Create theme.json config file
    const themeNameFormatted = name || formatThemeName(slug);
    const themeDescription = description || `Theme: ${themeNameFormatted}`;
    const themeConfig = {
      name: themeNameFormatted,
      description: themeDescription,
      version: '1.0.0',
      is_active: true
    };
    
    const configWritten = writeThemeConfig(slug, themeConfig);
    if (!configWritten) {
      console.warn(`[testing] Failed to create theme.json for ${slug}, but theme folder was created`);
    }
    
    // Create database entry
    const now = new Date().toISOString();
    
    try {
      const result = await query(`
        INSERT INTO themes (id, name, slug, description, created_at, updated_at, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name, slug, description, created_at, updated_at, is_active
      `, [slug, themeNameFormatted, slug, themeDescription, now, now, true]);
      
      console.log('[testing] Created theme in database:', result.rows[0]);
      return {
        ...result.rows[0],
        folder_created: true
      };
    } catch (dbError) {
      // If database insert fails, we still created the folder
      // Return a file-system-only theme object
      console.error('[testing] Failed to create theme in database, but folder was created:', dbError);
      return {
        id: slug,
        name: themeNameFormatted,
        slug: slug,
        description: themeDescription,
        is_active: true,
        folder_created: true,
        database_created: false,
        error: dbError.message
      };
    }
  } catch (error) {
    console.error('[testing] Error creating theme:', error);
    throw error;
  }
}

