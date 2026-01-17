/**
 * Add Tags Column to Themes Table via MCP/Direct Database Connection
 * 
 * This script adds the tags column to the themes table and syncs tags from theme.json files.
 * Can be run directly or via MCP.
 * 
 * Usage:
 *   node scripts/mcp/add-theme-tags-column.js
 */

import { query } from '../../sparti-cms/db/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Add tags column to themes table if it doesn't exist
 */
async function addTagsColumn() {
  try {
    console.log('[MCP] Checking if tags column exists in themes table...');
    
    // Check if column exists
    const checkResult = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'themes' AND column_name = 'tags'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Tags column already exists');
      return true;
    }
    
    console.log('[MCP] Adding tags column to themes table...');
    
    // Add tags column as TEXT[] (PostgreSQL array type)
    await query(`
      ALTER TABLE themes 
      ADD COLUMN tags TEXT[] DEFAULT '{}'
    `);
    
    console.log('✅ Tags column added successfully');
    return true;
  } catch (error) {
    console.error('[MCP] Error adding tags column:', error.message);
    
    // Check if it's a different error (not just column exists)
    if (error.message?.includes('already exists') || error.code === '42701') {
      console.log('✅ Tags column already exists (detected via error)');
      return true;
    }
    
    throw error;
  }
}

/**
 * Sync tags from theme.json files to database
 */
async function syncTagsFromFiles() {
  try {
    console.log('[MCP] Syncing tags from theme.json files to database...');
    
    const themesDir = path.join(__dirname, '../../sparti-cms/theme');
    
    if (!fs.existsSync(themesDir)) {
      console.error('❌ Themes directory not found:', themesDir);
      return;
    }
    
    const themeFolders = fs.readdirSync(themesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(slug => !['template', 'migrations', 'masterastrowind'].includes(slug));
    
    console.log(`[MCP] Found ${themeFolders.length} theme folder(s)`);
    
    let syncedCount = 0;
    let skippedCount = 0;
    
    for (const themeSlug of themeFolders) {
      try {
        const themePath = path.join(themesDir, themeSlug);
        const configPath = path.join(themePath, 'theme.json');
        
        if (!fs.existsSync(configPath)) {
          console.log(`⚠️  No theme.json found for ${themeSlug}`);
          skippedCount++;
          continue;
        }
        
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        if (!config.tags || !Array.isArray(config.tags)) {
          console.log(`⚠️  No tags array in theme.json for ${themeSlug}`);
          skippedCount++;
          continue;
        }
        
        // Check if theme exists in database
        const themeCheck = await query(`
          SELECT id, slug FROM themes WHERE slug = $1 OR id = $1 LIMIT 1
        `, [themeSlug]);
        
        if (themeCheck.rows.length === 0) {
          console.log(`⚠️  Theme ${themeSlug} not found in database, skipping`);
          skippedCount++;
          continue;
        }
        
        // Update theme tags in database
        await query(`
          UPDATE themes
          SET tags = $1, updated_at = NOW()
          WHERE slug = $2 OR id = $2
        `, [config.tags, themeSlug]);
        
        console.log(`✅ Synced tags for ${themeSlug}: [${config.tags.join(', ')}]`);
        syncedCount++;
      } catch (error) {
        console.error(`❌ Error syncing tags for ${themeSlug}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`\n[MCP] Sync Summary:`);
    console.log(`  ✅ Synced: ${syncedCount} theme(s)`);
    console.log(`  ⚠️  Skipped: ${skippedCount} theme(s)`);
    console.log(`  📊 Total: ${themeFolders.length} theme(s)`);
  } catch (error) {
    console.error('[MCP] Error syncing tags:', error.message);
    throw error;
  }
}

/**
 * Verify tags column and show current state
 */
async function verifyAndShowState() {
  try {
    console.log('[MCP] Verifying tags column and showing current state...\n');
    
    // Check column
    const columnCheck = await query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'themes' AND column_name = 'tags'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('❌ Tags column does not exist');
      return false;
    }
    
    console.log('✅ Tags column exists:');
    console.log('   Column:', columnCheck.rows[0].column_name);
    console.log('   Type:', columnCheck.rows[0].data_type);
    console.log('   Default:', columnCheck.rows[0].column_default || 'none');
    console.log('');
    
    // Show themes with tags
    const themesResult = await query(`
      SELECT id, name, slug, tags, is_active
      FROM themes
      ORDER BY name ASC
    `);
    
    if (themesResult.rows.length === 0) {
      console.log('No themes found in database');
      return true;
    }
    
    console.log('Themes with Tags:');
    console.log('─'.repeat(80));
    
    let withTags = 0;
    let withoutTags = 0;
    
    themesResult.rows.forEach(theme => {
      const tags = theme.tags || [];
      const tagsDisplay = tags.length > 0 
        ? tags.map(t => `[${t}]`).join(' ')
        : '(no tags)';
      const status = theme.is_active ? '✅' : '❌';
      
      if (tags.length > 0) {
        withTags++;
      } else {
        withoutTags++;
      }
      
      console.log(`${status} ${theme.name} (${theme.slug})`);
      console.log(`   Tags: ${tagsDisplay}`);
    });
    
    console.log('─'.repeat(80));
    console.log(`Total: ${themesResult.rows.length} theme(s)`);
    console.log(`  With tags: ${withTags}`);
    console.log(`  Without tags: ${withoutTags}`);
    
    return true;
  } catch (error) {
    console.error('[MCP] Error verifying state:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Theme Tags Database Migration via MCP');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Step 1: Add tags column
    const columnAdded = await addTagsColumn();
    if (!columnAdded) {
      console.error('❌ Failed to add tags column');
      process.exit(1);
    }
    
    console.log('');
    
    // Step 2: Sync tags from files
    await syncTagsFromFiles();
    
    console.log('');
    
    // Step 3: Verify and show final state
    await verifyAndShowState();
    
    console.log('\n✅ Migration complete!');
    console.log('═══════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

main();
