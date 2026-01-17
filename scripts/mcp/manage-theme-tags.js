/**
 * MCP Theme Tags Management Script
 * 
 * This script uses MCP (Model Context Protocol) to manage theme tags in the database.
 * It can be used to:
 * - Verify tags column exists
 * - Add/update tags for themes
 * - Sync tags from theme.json files to database
 * 
 * Usage:
 *   node scripts/mcp/manage-theme-tags.js verify
 *   node scripts/mcp/manage-theme-tags.js sync
 *   node scripts/mcp/manage-theme-tags.js update <theme-slug> <tag1> <tag2>
 */

import { query } from '../../sparti-cms/db/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const command = process.argv[2];
const args = process.argv.slice(3);

/**
 * Verify tags column exists in themes table
 */
async function verifyTagsColumn() {
  try {
    console.log('[MCP] Verifying tags column in themes table...');
    
    // Check if tags column exists
    const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'themes' AND column_name = 'tags'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Tags column exists:', result.rows[0]);
      return true;
    } else {
      console.log('❌ Tags column does not exist. Run migration first:');
      console.log('   npm run sequelize:migrate');
      return false;
    }
  } catch (error) {
    console.error('[MCP] Error verifying tags column:', error.message);
    return false;
  }
}

/**
 * Sync tags from theme.json files to database
 */
async function syncTagsFromFiles() {
  try {
    console.log('[MCP] Syncing tags from theme.json files to database...');
    
    const themesDir = path.join(__dirname, '../../sparti-cms/theme');
    const themeFolders = fs.readdirSync(themesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(slug => !['template', 'migrations', 'masterastrowind'].includes(slug));
    
    let syncedCount = 0;
    
    for (const themeSlug of themeFolders) {
      try {
        // Read theme.json directly
        const themePath = path.join(themesDir, themeSlug);
        const configPath = path.join(themePath, 'theme.json');
        
        if (!fs.existsSync(configPath)) {
          console.log(`⚠️  No theme.json found for ${themeSlug}`);
          continue;
        }
        
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        if (config && config.tags && Array.isArray(config.tags)) {
          // Check if tags column exists
          const hasTagsColumn = await verifyTagsColumn();
          if (!hasTagsColumn) {
            console.log('⚠️  Skipping sync - tags column does not exist');
            return;
          }
          
          // Update theme tags in database
          await query(`
            UPDATE themes
            SET tags = $1, updated_at = NOW()
            WHERE slug = $2 OR id = $2
          `, [config.tags, themeSlug]);
          
          console.log(`✅ Synced tags for ${themeSlug}:`, config.tags);
          syncedCount++;
        } else {
          console.log(`⚠️  No tags found in theme.json for ${themeSlug}`);
        }
      } catch (error) {
        console.error(`❌ Error syncing tags for ${themeSlug}:`, error.message);
      }
    }
    
    console.log(`\n[MCP] Sync complete: ${syncedCount} theme(s) updated`);
  } catch (error) {
    console.error('[MCP] Error syncing tags:', error.message);
  }
}

/**
 * Update tags for a specific theme
 */
async function updateThemeTags(themeSlug, tags) {
  try {
    console.log(`[MCP] Updating tags for theme: ${themeSlug}`);
    
    const hasTagsColumn = await verifyTagsColumn();
    if (!hasTagsColumn) {
      console.log('❌ Cannot update - tags column does not exist');
      return;
    }
    
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    
    await query(`
      UPDATE themes
      SET tags = $1, updated_at = NOW()
      WHERE slug = $2 OR id = $2
      RETURNING id, name, slug, tags
    `, [tagsArray, themeSlug]);
    
    console.log(`✅ Updated tags for ${themeSlug}:`, tagsArray);
  } catch (error) {
    console.error('[MCP] Error updating tags:', error.message);
  }
}

/**
 * List all themes with their tags
 */
async function listThemesWithTags() {
  try {
    console.log('[MCP] Listing all themes with tags...\n');
    
    const hasTagsColumn = await verifyTagsColumn();
    if (!hasTagsColumn) {
      console.log('❌ Cannot list - tags column does not exist');
      return;
    }
    
    const result = await query(`
      SELECT id, name, slug, tags, is_active
      FROM themes
      ORDER BY name ASC
    `);
    
    if (result.rows.length === 0) {
      console.log('No themes found in database');
      return;
    }
    
    console.log('Themes:');
    console.log('─'.repeat(80));
    result.rows.forEach(theme => {
      const tags = theme.tags || [];
      const tagsDisplay = tags.length > 0 
        ? tags.map(t => `[${t}]`).join(' ')
        : '(no tags)';
      const status = theme.is_active ? '✅' : '❌';
      console.log(`${status} ${theme.name} (${theme.slug})`);
      console.log(`   Tags: ${tagsDisplay}`);
    });
    console.log('─'.repeat(80));
    console.log(`Total: ${result.rows.length} theme(s)`);
  } catch (error) {
    console.error('[MCP] Error listing themes:', error.message);
  }
}

// Main command handler
async function main() {
  switch (command) {
    case 'verify':
      await verifyTagsColumn();
      break;
    case 'sync':
      await syncTagsFromFiles();
      break;
    case 'update':
      if (args.length < 2) {
        console.log('Usage: node scripts/mcp/manage-theme-tags.js update <theme-slug> <tag1> [tag2] ...');
        process.exit(1);
      }
      const [themeSlug, ...tags] = args;
      await updateThemeTags(themeSlug, tags);
      break;
    case 'list':
      await listThemesWithTags();
      break;
    default:
      console.log('MCP Theme Tags Management');
      console.log('');
      console.log('Usage:');
      console.log('  node scripts/mcp/manage-theme-tags.js verify     - Verify tags column exists');
      console.log('  node scripts/mcp/manage-theme-tags.js sync        - Sync tags from theme.json files');
      console.log('  node scripts/mcp/manage-theme-tags.js list        - List all themes with tags');
      console.log('  node scripts/mcp/manage-theme-tags.js update <slug> <tag1> [tag2] ... - Update tags for a theme');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/mcp/manage-theme-tags.js verify');
      console.log('  node scripts/mcp/manage-theme-tags.js sync');
      console.log('  node scripts/mcp/manage-theme-tags.js update master template');
      console.log('  node scripts/mcp/manage-theme-tags.js update landingpage custom business');
      process.exit(1);
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('[MCP] Fatal error:', error);
  process.exit(1);
});
