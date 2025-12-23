import dotenv from 'dotenv';
import { query } from '../../sparti-cms/db/index.js';
import { syncThemesFromFileSystem } from '../../sparti-cms/services/themeSync.js';

// Load environment variables
dotenv.config();

/**
 * Script to register the landingpage theme in the database
 * This ensures the theme exists and is properly linked to the folder
 */
async function registerLandingPageTheme() {
  console.log('Starting landingpage theme registration...');
  
  try {
    // First, sync all themes from file system
    console.log('Syncing themes from file system...');
    const syncResult = await syncThemesFromFileSystem();
    
    if (syncResult.success) {
      console.log(`✅ Theme sync completed: ${syncResult.message}`);
      console.log(`   Synced ${syncResult.synced} theme(s) out of ${syncResult.total} found`);
      
      if (syncResult.results && syncResult.results.length > 0) {
        console.log('\n📋 Sync Results:');
        syncResult.results.forEach(result => {
          console.log(`   - ${result.slug}: ${result.action} (${result.name})`);
        });
      }
      
      // Verify landingpage theme exists
      const landingPageTheme = await query(`
        SELECT id, name, slug, description, is_active, created_at
        FROM themes
        WHERE slug = 'landingpage' OR id = 'landingpage'
        LIMIT 1
      `);
      
      if (landingPageTheme.rows.length > 0) {
        const theme = landingPageTheme.rows[0];
        console.log('\n✅ Landing Page theme is registered:');
        console.log(`   ID: ${theme.id}`);
        console.log(`   Name: ${theme.name}`);
        console.log(`   Slug: ${theme.slug}`);
        console.log(`   Active: ${theme.is_active}`);
        console.log(`   Created: ${theme.created_at}`);
        
        // Update name and description to ensure they're correct
        await query(`
          UPDATE themes
          SET name = 'Landing Page',
              description = 'A professional landing page theme with hero section, features, and CTA',
              updated_at = NOW()
          WHERE slug = 'landingpage' OR id = 'landingpage'
        `);
        
        console.log('✅ Landing Page theme updated with correct name and description');
      } else {
        console.log('\n⚠️  Warning: Landing Page theme was not found after sync');
        console.log('   Attempting to create it manually...');
        
        // Manually create the theme
        await query(`
          INSERT INTO themes (id, name, slug, description, created_at, updated_at, is_active)
          VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
          ON CONFLICT (id) DO UPDATE
          SET name = EXCLUDED.name,
              slug = EXCLUDED.slug,
              description = EXCLUDED.description,
              updated_at = NOW(),
              is_active = EXCLUDED.is_active
        `, [
          'landingpage',
          'Landing Page',
          'landingpage',
          'A professional landing page theme with hero section, features, and CTA',
          true
        ]);
        
        console.log('✅ Landing Page theme created manually');
      }
    } else {
      console.error('❌ Theme sync failed:', syncResult.error);
      throw new Error(syncResult.error || 'Sync failed');
    }
    
    console.log('\n✅ Script completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the script
registerLandingPageTheme()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

