import { query } from '../db/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCLUDED_THEME_SLUGS = new Set([
  // Internal namespaces / removed legacy/base themes
  'template',  // Keep excluded - old namespace
  // 'master',  // Remove - now a normal theme
  'masterastrowind',
]);

/**
 * Resolve the theme root directory (sparti-cms/theme).
 * Uses process.cwd() so it works in both dev and when bundled (e.g. Vercel serverless).
 */
function getThemesDir() {
  return path.join(process.cwd(), 'sparti-cms', 'theme');
}

/**
 * Resolve the project public directory (public/).
 * Uses process.cwd() for consistency with getThemesDir when bundled.
 */
function getProjectPublicDir() {
  return path.join(process.cwd(), 'public');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);

  // Node 18+ supports fs.cpSync
  if (typeof fs.cpSync === 'function') {
    fs.cpSync(src, dest, { recursive: true });
    return;
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

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
    const themesDir = getThemesDir();
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
 * Read pages.json from a theme folder
 * @param {string} slug - Theme slug (folder name)
 * @returns {Array|null} Array of page objects or null if file doesn't exist or is invalid
 */
export function readThemePages(slug) {
  try {
    const themesDir = getThemesDir();
    const themePath = path.join(themesDir, slug);
    const pagesPath = path.join(themePath, 'pages.json');
    
    // Check if theme folder exists
    if (!fs.existsSync(themePath)) {
      console.log(`[testing] Theme folder does not exist: ${themePath}`);
      return null;
    }
    
    // Check if pages.json exists
    if (!fs.existsSync(pagesPath)) {
      console.log(`[testing] pages.json not found for theme: ${slug}`);
      return [];
    }
    
    // Read and parse JSON
    const pagesContent = fs.readFileSync(pagesPath, 'utf8');
    const pagesData = JSON.parse(pagesContent);
    
    // Validate structure
    if (!pagesData.pages || !Array.isArray(pagesData.pages)) {
      console.warn(`[testing] pages.json for ${slug} has invalid structure - expected 'pages' array`);
      return [];
    }
    
    // Validate each page has required fields
    const validPages = pagesData.pages.filter(page => {
      if (!page.page_name || !page.slug) {
        console.warn(`[testing] Page in ${slug} is missing required fields (page_name or slug)`);
        return false;
      }
      return true;
    });
    
    return validPages;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist - this is fine, return empty array
      return [];
    }
    // JSON parse error or other error
    console.error(`[testing] Error reading pages.json for ${slug}:`, error.message);
    return [];
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
    const themesDir = getThemesDir();
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
 * Get pages from a theme folder's pages.json file (no database required)
 * Formats pages to match PageItem interface for frontend consumption
 * @param {string} themeSlug - Theme slug (folder name)
 * @returns {Array} Array of formatted page objects
 */
export function getThemePagesFromFileSystem(themeSlug) {
  try {
    // Read raw pages from pages.json
    const rawPages = readThemePages(themeSlug);
    
    if (!rawPages || rawPages.length === 0) {
      return [];
    }
    
    // Format pages to match PageItem interface
    const now = new Date().toISOString();
    const formattedPages = rawPages.map(page => {
      // Generate unique ID from slug
      let pageId = page.slug;
      // Remove leading/trailing slashes and replace remaining slashes with hyphens
      pageId = pageId.replace(/^\/+|\/+$/g, '').replace(/\//g, '-');
      // If slug is empty or just "/", use "homepage"
      if (!pageId || pageId === '') {
        pageId = 'homepage';
      }
      const fullId = `theme-${themeSlug}-${pageId}`;
      
      return {
      id: fullId,
      page_name: page.page_name,
      slug: page.slug,
      status: page.status || 'published',
      page_type: page.page_type || 'page',
      meta_title: page.meta_title || null,
      meta_description: page.meta_description || null,
      seo_index: page.seo_index !== undefined ? page.seo_index : true,
      campaign_source: page.campaign_source || null,
      conversion_goal: page.conversion_goal || null,
      legal_type: page.legal_type || null,
      version: page.version || null,
      theme_id: themeSlug, // Include theme_id to identify which theme this page belongs to
      created_at: now,
      updated_at: now,
      from_filesystem: true // Flag to indicate this came from file system
      };
    });
    
    return formattedPages;
  } catch (error) {
    console.error(`[testing] Error getting theme pages from file system for ${themeSlug}:`, error);
    return [];
  }
}

/**
 * Get themes from file system only (no database required)
 * Scans sparti-cms/theme/ directory and returns theme information
 * This is used as a fallback when database is not available
 */
export function getThemesFromFileSystem() {
  try {
    const themesDir = getThemesDir();

    // Check if themes directory exists
    if (!fs.existsSync(themesDir)) {
      console.log('[testing] Themes directory does not exist:', themesDir);
      return [];
    }

    // Read theme folders
    const themeFolders = fs.readdirSync(themesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(slug => !EXCLUDED_THEME_SLUGS.has(slug));

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
          tags: config.tags || [],
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
    const themesDir = getThemesDir();

    // Check if themes directory exists
    if (!fs.existsSync(themesDir)) {
      console.log('[testing] Themes directory does not exist:', themesDir);
      return { success: true, synced: 0, message: 'Themes directory not found' };
    }

    // Read theme folders
    const themeFolders = fs.readdirSync(themesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(slug => !EXCLUDED_THEME_SLUGS.has(slug));

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
        const themeTags = config?.tags || [];
        const isActive = config?.is_active !== undefined ? config.is_active : true;
        const now = new Date().toISOString();

        let themeDbId;
        
        if (existingTheme.rows.length > 0) {
          // Theme exists, update with metadata from theme.json
          themeDbId = existingTheme.rows[0].id;
          // Check if tags column exists in database
          const hasTagsColumn = existingTheme.rows[0].tags !== undefined;
          
          if (hasTagsColumn) {
            await query(`
              UPDATE themes
              SET name = $1, description = $2, updated_at = $3, is_active = $4, tags = $5
              WHERE slug = $6 OR id = $6
            `, [themeName, themeDescription, now, isActive, themeTags, themeSlug]);
          } else {
            await query(`
              UPDATE themes
              SET name = $1, description = $2, updated_at = $3, is_active = $4
              WHERE slug = $5 OR id = $5
            `, [themeName, themeDescription, now, isActive, themeSlug]);
          }
          
          results.push({
            slug: themeSlug,
            id: themeDbId,
            action: 'updated',
            name: themeName
          });
          syncedCount++;
          console.log(`[testing] Updated theme: ${themeSlug} (${themeName}) with ID: ${themeDbId}`);
        } else {
          // Theme doesn't exist, create new record with metadata from theme.json
          themeDbId = themeSlug; // Use slug as ID
          
          // Try to insert with tags column (if it exists)
          try {
            await query(`
              INSERT INTO themes (id, name, slug, description, created_at, updated_at, is_active, tags)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
              themeDbId,
              themeName,
              themeSlug,
              themeDescription,
              now,
              now,
              isActive,
              themeTags
            ]);
          } catch (tagsError) {
            // If tags column doesn't exist, insert without it
            if (tagsError.message?.includes('column "tags"') || tagsError.code === '42703') {
              await query(`
                INSERT INTO themes (id, name, slug, description, created_at, updated_at, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
              `, [
                themeDbId,
                themeName,
                themeSlug,
                themeDescription,
                now,
                now,
                isActive
              ]);
            } else {
              throw tagsError;
            }
          }
          
          results.push({
            slug: themeSlug,
            id: themeDbId,
            action: 'created',
            name: themeName
          });
          syncedCount++;
          console.log(`[testing] Created theme: ${themeSlug} (${themeName}) with ID: ${themeDbId}`);
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

    // After syncing all themes, sync theme settings for all tenants
    let settingsSyncedCount = 0;
    try {
      // Get all unique tenant IDs from site_settings
      const tenantsResult = await query(`
        SELECT DISTINCT tenant_id 
        FROM site_settings 
        WHERE tenant_id IS NOT NULL
      `);
      
      const tenantIds = tenantsResult.rows.map(row => row.tenant_id);
      console.log(`[testing] Found ${tenantIds.length} tenant(s) to sync settings for`);
      
      // For each theme that was synced, update settings for all tenants
      for (const themeResult of results) {
        if (themeResult.action === 'created' || themeResult.action === 'updated') {
          const themeDbId = themeResult.id || themeResult.slug;
          
          for (const tenantId of tenantIds) {
            try {
              // Update settings that reference this theme by slug to use the database ID
              const updated = await query(`
                UPDATE site_settings
                SET theme_id = $1, updated_at = CURRENT_TIMESTAMP
                WHERE tenant_id = $2
                  AND (theme_id = $3 OR theme_id IS NULL)
                  AND setting_key IN ('theme_styles', 'site_name', 'site_tagline', 'site_description', 'site_logo', 'site_favicon')
                  AND (theme_id != $1 OR theme_id IS NULL)
                RETURNING id, setting_key
              `, [themeDbId, tenantId, themeResult.slug]);
              
              if (updated.rows.length > 0) {
                settingsSyncedCount += updated.rows.length;
                console.log(`[testing] Synced ${updated.rows.length} setting(s) for tenant ${tenantId}, theme ${themeResult.slug} (ID: ${themeDbId})`);
              }
            } catch (tenantError) {
              console.log(`[testing] Note: Could not sync settings for tenant ${tenantId}, theme ${themeResult.slug}:`, tenantError.message);
            }
          }
        }
      }
    } catch (settingsError) {
      console.log(`[testing] Note: Could not sync theme settings:`, settingsError.message);
    }

    return {
      success: true,
      synced: syncedCount,
      total: themeFolders.length,
      results: results,
      settingsSynced: settingsSyncedCount,
      message: `Synced ${syncedCount} theme(s) and ${settingsSyncedCount} setting(s)`
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
    // Try to select with tags column first
    let result;
    try {
      result = await query(`
        SELECT id, name, slug, description, created_at, updated_at, is_active, tags
        FROM themes
        WHERE is_active = true
          AND slug NOT IN ('template', 'masterastrowind')
          AND id NOT IN ('template', 'masterastrowind')
        ORDER BY name ASC
      `);
    } catch (tagsError) {
      // If tags column doesn't exist, select without it
      if (tagsError.message?.includes('column "tags"') || tagsError.code === '42703') {
        result = await query(`
          SELECT id, name, slug, description, created_at, updated_at, is_active
          FROM themes
          WHERE is_active = true
            AND slug NOT IN ('template', 'masterastrowind')
            AND id NOT IN ('template', 'masterastrowind')
          ORDER BY name ASC
        `);
      } else {
        throw tagsError;
      }
    }
    
    return result.rows;
  } catch (error) {
    // If database query fails (e.g., table doesn't exist), fall back to file system
    console.error('[testing] Error getting themes from database, falling back to file system:', error.message);
    console.log('[testing] Using file system themes as fallback');
    return getThemesFromFileSystem();
  }
}

/**
 * Get default layout structure for a theme based on its component structure
 * @param {string} themeSlug - Theme slug
 * @returns {Object} Default layout JSON structure
 */
/**
 * Get default layout structure for a theme based on its component structure
 * @param {string} themeSlug - Theme slug
 * @returns {Object} Default layout JSON structure
 */
export function getDefaultLayoutForTheme(themeSlug) {
  // Map theme components to CMS component registry IDs with default props
  // Default props are extracted from component registry definitions
  const themeComponentMap = {
    'landingpage': {
      components: [
        {
          id: 'header-1',
          type: 'header-main',
          props: {
            logo: {
              src: '/assets/go-sg-logo-official.png',
              alt: 'GO SG Digital Marketing Agency'
            },
            ctaText: 'Contact Us',
            showCTA: true,
            isFixed: true
          }
        },
        {
          id: 'hero-1',
          type: 'hero-main',
          props: {
            badgeText: 'Results in 3 months or less',
            showBadge: true,
            headingLine1: 'We Boost Your SEO',
            headingLine2: 'In 3 Months',
            description: 'We help businesses dominate search results through proven SEO strategies that increase organic traffic, boost rankings, and drive qualified leads to your website.',
            ctaButtonText: 'Get a Quote',
            showClientLogos: true,
            clientLogos: [
              { src: '/assets/logos/art-in-bloom.png', alt: 'Art in Bloom' },
              { src: '/assets/logos/selenightco.png', alt: 'Selenightco' },
              { src: '/assets/logos/smooy.png', alt: 'Smooy' },
              { src: '/assets/logos/solstice.png', alt: 'Solstice' },
              { src: '/assets/logos/grub.png', alt: 'Grub' },
              { src: '/assets/logos/nail-queen.png', alt: 'Nail Queen' },
              { src: '/assets/logos/caro-patisserie.png', alt: 'Caro Pâtisserie' },
              { src: '/assets/logos/spirit-stretch.png', alt: 'Spirit Stretch' }
            ],
            backgroundType: 'gradient',
            backgroundColor: '#ffffff'
          }
        },
        {
          id: 'services-1',
          type: 'services-showcase-section',
          props: {
            services: [
              {
                id: 'keywords-research',
                title: 'Rank on keywords with',
                highlight: 'search volume',
                description: 'Discover high-volume keywords with precise search data and user intent analysis. Find the perfect keywords to target for maximum organic traffic growth.',
                buttonText: 'Learn More',
                images: [
                  '/src/assets/seo/keyword-research-1.png',
                  '/src/assets/seo/keyword-research-2.png'
                ]
              },
              {
                id: 'content-strategy',
                title: 'Find topics based on',
                highlight: 'real google search results',
                description: 'Discover content opportunities by analyzing actual Google search results and user behavior. Get real insights from search data to create content that ranks and converts.',
                buttonText: 'View Analytics',
                images: [
                  '/src/assets/seo/content-strategy-1.png',
                  '/src/assets/seo/content-strategy-2.png'
                ]
              },
              {
                id: 'link-building',
                title: 'Build authority with',
                highlight: 'high-quality backlinks',
                description: 'Strengthen your website\'s authority through strategic link building campaigns. Acquire high-quality backlinks from reputable sources to boost your domain authority and rankings.',
                buttonText: 'Try Link Builder',
                images: [
                  '/src/assets/seo/link-building-1.png',
                  '/src/assets/seo/link-building-2.png'
                ]
              }
            ],
            backgroundColor: '#ffffff'
          }
        },
        {
          id: 'testimonials-1',
          type: 'testimonials-section',
          props: {
            sectionTitle: 'What our clients say',
            sectionSubtitle: 'See what our customers have to say about our SEO services and results.',
            testimonials: [
              {
                text: 'GoSG\'s SEO strategies boosted our organic traffic by 400% in just 3 months. Our website now ranks #1 for our main keywords.',
                image: 'https://randomuser.me/api/portraits/women/1.jpg',
                name: 'Sarah Chen',
                role: 'Marketing Director'
              },
              {
                text: 'Their technical SEO audit revealed critical issues we didn\'t know existed. After fixes, our search rankings improved dramatically.',
                image: 'https://randomuser.me/api/portraits/men/2.jpg',
                name: 'Marcus Tan',
                role: 'Business Owner'
              },
              {
                text: 'GoSG\'s local SEO expertise helped us dominate Singapore search results. We\'re now the top choice in our area.',
                image: 'https://randomuser.me/api/portraits/women/3.jpg',
                name: 'Priya Sharma',
                role: 'E-commerce Manager'
              },
              {
                text: 'From page 5 to page 1 in Google in just 4 months. GoSG\'s SEO approach delivered exactly what they promised.',
                image: 'https://randomuser.me/api/portraits/men/4.jpg',
                name: 'David Lim',
                role: 'CEO'
              },
              {
                text: 'Their SEO content strategy doubled our organic leads. Every blog post now ranks and brings qualified traffic.',
                image: 'https://randomuser.me/api/portraits/women/5.jpg',
                name: 'Jennifer Wong',
                role: 'Operations Manager'
              }
            ],
            backgroundColor: '#f9fafb'
          }
        },
        {
          id: 'faq-1',
          type: 'faq-section',
          props: {
            title: 'Frequently Asked Questions',
            subtitle: 'Everything you need to know about our SEO services',
            items: [
              {
                question: 'How long does it take to see results from SEO?',
                answer: 'Most clients start seeing initial improvements within 1-2 months, with significant results typically appearing around the 3-4 month mark. SEO is a long-term strategy, and results continue to compound over time.'
              },
              {
                question: 'What services are included in your SEO packages?',
                answer: 'Our comprehensive SEO packages include keyword research, technical SEO audits, on-page optimization, content creation, link building, local SEO, and detailed monthly reporting with actionable insights.'
              },
              {
                question: 'How do you measure SEO success?',
                answer: 'We track multiple metrics including organic traffic growth, keyword rankings, conversion rates, backlink quality and quantity, page load speed, and ultimately, your return on investment from organic search.'
              }
            ]
          }
        },
        {
          id: 'footer-1',
          type: 'footer-main',
          props: {
            ctaHeading: 'Get Your SEO Strategy',
            ctaDescription: 'Ready to dominate search results? Let\'s discuss how we can help your business grow.',
            ctaButtonText: 'Start Your Journey',
            contactLinks: [
              { text: 'WhatsApp', url: 'https://wa.me/1234567890' },
              { text: 'Book a Meeting', url: 'https://calendly.com' }
            ],
            legalLinks: [
              { text: 'Privacy Policy', url: '/privacy-policy' },
              { text: 'Terms of Service', url: '/terms-of-service' },
              { text: 'Blog', url: '/blog' }
            ],
            copyrightText: 'GO SG CONSULTING. All rights reserved.',
            backgroundColor: '#0f172a'
          }
        }
      ]
    }
  };
  
  // Return theme-specific layout or default empty layout
  return themeComponentMap[themeSlug] || { components: [] };
}

/**
 * Sync pages from a theme folder to the database
 * @param {string} themeSlug - Theme slug
 * @returns {Promise<Object>} Sync result with created/updated counts
 */
export async function syncThemePages(themeSlug) {
  try {
    // Read pages from theme folder
    const pages = readThemePages(themeSlug);
    
    if (!pages || pages.length === 0) {
      return {
        success: true,
        synced: 0,
        total: 0,
        message: `No pages found in theme ${themeSlug}`
      };
    }
    
    let syncedCount = 0;
    const results = [];
    
    for (const pageData of pages) {
      try {
        // Check if page exists (by slug and theme_id)
        const existingPage = await query(`
          SELECT id, page_name, slug, theme_id
          FROM pages
          WHERE slug = $1 AND theme_id = $2
          LIMIT 1
        `, [pageData.slug, themeSlug]);
        
        const now = new Date().toISOString();
        
        let pageId;
        
        if (existingPage.rows.length > 0) {
          // Page exists, update it
          pageId = existingPage.rows[0].id;
          await query(`
            UPDATE pages
            SET page_name = $1,
                meta_title = $2,
                meta_description = $3,
                seo_index = $4,
                status = $5,
                page_type = $6,
                updated_at = $7
            WHERE id = $8
          `, [
            pageData.page_name,
            pageData.meta_title || null,
            pageData.meta_description || null,
            pageData.seo_index !== undefined ? pageData.seo_index : true,
            pageData.status || 'published',
            pageData.page_type || 'page',
            now,
            pageId
          ]);
          
          results.push({
            slug: pageData.slug,
            action: 'updated',
            name: pageData.page_name
          });
          syncedCount++;
        } else {
          // Page doesn't exist, create it
          // Use null for tenant_id - these are template pages that belong to the theme
          // When a tenant uses this theme, they can copy these pages to their tenant_id
          const insertResult = await query(`
            INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status, page_type, theme_id, tenant_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
          `, [
            pageData.page_name,
            pageData.slug,
            pageData.meta_title || null,
            pageData.meta_description || null,
            pageData.seo_index !== undefined ? pageData.seo_index : true,
            pageData.status || 'published',
            pageData.page_type || 'page',
            themeSlug,
            null, // null tenant_id for theme template pages - they use the same pages table
            now,
            now
          ]);
          
          pageId = insertResult.rows[0].id;
          
          results.push({
            slug: pageData.slug,
            action: 'created',
            name: pageData.page_name
          });
          syncedCount++;
        }
        
        // Ensure a default layout exists for this page
        // Check if layout already exists
        const layoutCheck = await query(`
          SELECT id FROM page_layouts 
          WHERE page_id = $1 AND language = 'default'
        `, [pageId]);
        
        if (layoutCheck.rows.length === 0) {
          // Get default layout structure for this theme
          // For homepage (slug = '/'), use theme's default component structure
          // For other pages, use empty layout (can be customized later)
          let defaultLayout;
          if (pageData.slug === '/' || pageData.slug === '/home' || pageData.slug === '/index') {
            // Homepage: use theme's default component structure
            defaultLayout = getDefaultLayoutForTheme(themeSlug);
            console.log(`[testing] Creating default theme layout for homepage: ${themeSlug}`);
          } else {
            // Other pages: start with empty layout
            defaultLayout = { components: [] };
            console.log(`[testing] Creating empty layout for page: ${pageData.page_name}`);
          }
          
          await query(`
            INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
            VALUES ($1, 'default', $2, 1, NOW())
            ON CONFLICT (page_id, language) DO NOTHING
          `, [pageId, JSON.stringify(defaultLayout)]);
          
          console.log(`[testing] Created layout for page ${pageData.page_name} (ID: ${pageId}) with ${defaultLayout.components?.length || 0} components`);
        }
      } catch (error) {
        console.error(`[testing] Error syncing page ${pageData.slug} for theme ${themeSlug}:`, error);
        results.push({
          slug: pageData.slug,
          action: 'error',
          error: error.message
        });
      }
    }
    
    // Also ensure demo tenant has pages for this theme
    try {
      await ensureDemoTenantHasThemePages(themeSlug, pages);
    } catch (demoError) {
      console.error(`[testing] Error ensuring demo tenant has pages for theme ${themeSlug}:`, demoError);
    }
    
    return {
      success: true,
      synced: syncedCount,
      total: pages.length,
      results: results,
      message: `Synced ${syncedCount} page(s) for theme ${themeSlug}`
    };
  } catch (error) {
    console.error(`[testing] Error syncing pages for theme ${themeSlug}:`, error);
    return {
      success: false,
      synced: 0,
      error: error.message,
      message: `Failed to sync pages for theme ${themeSlug}`
    };
  }
}

/**
 * Ensure demo tenant has pages for a specific theme
 * Creates pages for demo tenant if they don't exist
 */
export async function ensureDemoTenantHasThemePages(themeSlug, pages) {
  const demoTenantId = 'demo';
  
  // Check if demo tenant exists
  const demoTenantCheck = await query(`
    SELECT id FROM tenants WHERE id = $1
  `, [demoTenantId]);
  
  if (demoTenantCheck.rows.length === 0) {
    console.log(`[testing] Demo tenant does not exist, skipping page creation`);
    return;
  }
  
  let createdCount = 0;
  
  for (const pageData of pages) {
    try {
      // Check if page exists for demo tenant + theme combination
      const existingPage = await query(`
        SELECT id, page_name, slug
        FROM pages
        WHERE slug = $1 AND theme_id = $2 AND tenant_id = $3
        LIMIT 1
      `, [pageData.slug, themeSlug, demoTenantId]);
      
      const now = new Date().toISOString();
      
      if (existingPage.rows.length === 0) {
        // Page doesn't exist for demo tenant, create it
        const insertResult = await query(`
          INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status, page_type, theme_id, tenant_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id
        `, [
          pageData.page_name,
          pageData.slug,
          pageData.meta_title || null,
          pageData.meta_description || null,
          pageData.seo_index !== undefined ? pageData.seo_index : true,
          pageData.status || 'published',
          pageData.page_type || 'page',
          themeSlug,
          demoTenantId,
          now,
          now
        ]);
        
        const pageId = insertResult.rows[0].id;
        
        // Create default layout for demo tenant page
        let defaultLayout;
        if (pageData.slug === '/' || pageData.slug === '/home' || pageData.slug === '/index') {
          defaultLayout = getDefaultLayoutForTheme(themeSlug);
        } else {
          defaultLayout = { components: [] };
        }
        
        await query(`
          INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
          VALUES ($1, 'default', $2, 1, NOW())
          ON CONFLICT (page_id, language) DO NOTHING
        `, [pageId, JSON.stringify(defaultLayout)]);
        
        createdCount++;
        console.log(`[testing] Created page "${pageData.page_name}" (${pageData.slug}) for demo tenant with theme ${themeSlug}`);
      }
    } catch (error) {
      console.error(`[testing] Error creating page ${pageData.slug} for demo tenant:`, error);
    }
  }
  
  if (createdCount > 0) {
    console.log(`[testing] Created ${createdCount} page(s) for demo tenant with theme ${themeSlug}`);
  }
}

/**
 * Sync all theme pages from file system to database for demo tenant
 * This ensures demo tenant has pages available even if database is empty
 * @param {string|null} themeSlug - Optional theme slug to sync only one theme, or null to sync all themes
 * @returns {Object} Result object with success status and counts
 */
export async function syncDemoTenantPagesFromFileSystem(themeSlug = null) {
  const demoTenantId = 'demo';
  
  try {
    // Check if demo tenant exists
    const demoTenantCheck = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [demoTenantId]);
    
    if (demoTenantCheck.rows.length === 0) {
      console.log(`[testing] Demo tenant does not exist, creating it...`);
      // Create demo tenant if it doesn't exist
      try {
        await query(`
          INSERT INTO tenants (id, name, domain, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, [demoTenantId, 'Demo Tenant', 'demo.sparti.ai', true]);
        console.log(`[testing] Created demo tenant`);
      } catch (tenantError) {
        console.error(`[testing] Error creating demo tenant:`, tenantError);
        return {
          success: false,
          error: 'Failed to create demo tenant',
          message: tenantError.message
        };
      }
    }
    
    let totalCreated = 0;
    const themes = themeSlug
      ? [{ slug: themeSlug }]
      : getThemesFromFileSystem().filter(t => !EXCLUDED_THEME_SLUGS.has(t.slug));
    
    console.log(`[testing] Syncing pages for demo tenant from ${themes.length} theme(s)`);
    
    for (const theme of themes) {
      try {
        const themePages = getThemePagesFromFileSystem(theme.slug);
        
        if (themePages.length === 0) {
          console.log(`[testing] No pages found for theme ${theme.slug}`);
          continue;
        }
        
        // Use existing function to ensure pages exist
        await ensureDemoTenantHasThemePages(theme.slug, themePages);
        
        // Count how many were actually created
        const createdResult = await query(`
          SELECT COUNT(*) as count
          FROM pages
          WHERE tenant_id = $1 AND theme_id = $2
        `, [demoTenantId, theme.slug]);
        
        const count = parseInt(createdResult.rows[0].count, 10);
        totalCreated += count;
        console.log(`[testing] Synced ${count} page(s) for theme ${theme.slug}`);
      } catch (themeError) {
        console.error(`[testing] Error syncing pages for theme ${theme.slug}:`, themeError);
      }
    }
    
    return {
      success: true,
      totalCreated: totalCreated,
      themesProcessed: themes.length,
      message: `Synced ${totalCreated} page(s) for demo tenant from ${themes.length} theme(s)`
    };
  } catch (error) {
    console.error('[testing] Error syncing demo tenant pages from file system:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to sync demo tenant pages'
    };
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
    const themesDir = getThemesDir();

    // Ensure themes directory exists
    if (!fs.existsSync(themesDir)) {
      fs.mkdirSync(themesDir, { recursive: true });
      console.log('[testing] Created themes directory:', themesDir);
    }
    
    // Validate slug (must be valid folder name)
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('Invalid slug. Slug must contain only lowercase letters, numbers, and hyphens.');
    }

    if (EXCLUDED_THEME_SLUGS.has(slug)) {
      throw new Error(`Theme slug "${slug}" is reserved.`);
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

    // Ensure a public asset folder exists for the theme.
    // Convention: /public/theme/<themeSlug>/assets
    // This makes it easy to hardcode asset paths during early development and carry assets when duplicating the master theme.
    const projectPublicDir = getProjectPublicDir();
    const themePublicDir = path.join(projectPublicDir, 'theme', slug);
    const themeAssetsDir = path.join(themePublicDir, 'assets');
    ensureDir(themeAssetsDir);

    // If master public assets exist and the new theme doesn't have any yet, copy them as a starter.
    const masterPublicDir = path.join(projectPublicDir, 'theme', 'master');
    if (fs.existsSync(masterPublicDir)) {
      // Copy into /public/theme/<slug>
      copyDirRecursive(masterPublicDir, themePublicDir);
    }

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
 * This is a customizable theme component.
 *
 * Asset convention:
 * - Put assets in /public/theme/${slug}/assets
 * - Refer to them with: /theme/${slug}/assets/<file>
 */
const TenantLanding: React.FC<TenantLandingProps> = ({ 
  tenantName = 'Theme', 
  tenantSlug = '${slug}' 
}) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-6 px-4 md:px-8 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <a href={\`/theme/\${tenantSlug}\`} className="flex items-center z-10">
              <span className="h-12 inline-flex items-center font-bold text-xl">{tenantName}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to {tenantName}</h1>
            <p className="text-muted-foreground text-lg">
              Theme scaffold created. Add assets under <code className="bg-muted px-1 rounded">/public/theme/${slug}/assets</code>.
            </p>
          </div>
        </div>
      </main>

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
      is_active: true,
      preview_image: 'assets/preview.svg',
      demo_url: `/theme/${slug}`
    };
    
    const configWritten = writeThemeConfig(slug, themeConfig);
    if (!configWritten) {
      console.warn(`[testing] Failed to create theme.json for ${slug}, but theme folder was created`);
    }

    // Create pages.json file with default homepage
    const pagesConfig = {
      pages: [
        {
          page_name: 'Homepage',
          slug: '/',
          meta_title: themeNameFormatted,
          meta_description: themeDescription,
          seo_index: true,
          status: 'published',
          page_type: 'page'
        }
      ]
    };

    try {
      const pagesPath = path.join(themePath, 'pages.json');
      const pagesContent = JSON.stringify(pagesConfig, null, 2);
      fs.writeFileSync(pagesPath, pagesContent, 'utf8');
      console.log(`[testing] Created pages.json for theme: ${slug}`);
    } catch (error) {
      console.warn(`[testing] Failed to create pages.json for ${slug}:`, error);
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