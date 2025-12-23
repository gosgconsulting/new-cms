import { getThemesFromFileSystem } from '../../sparti-cms/services/themeSync.js';

/**
 * Test script to verify themes can be read from file system
 * without database connection
 */
async function testThemeFileSystemFallback() {
  console.log('Testing theme file system fallback...\n');
  
  try {
    const themes = getThemesFromFileSystem();
    
    console.log(`✅ Successfully read ${themes.length} theme(s) from file system:\n`);
    
    themes.forEach((theme, index) => {
      console.log(`${index + 1}. ${theme.name} (${theme.slug})`);
      console.log(`   ID: ${theme.id}`);
      console.log(`   Description: ${theme.description}`);
      console.log(`   Active: ${theme.is_active}`);
      console.log(`   From File System: ${theme.from_filesystem || false}`);
      console.log('');
    });
    
    if (themes.length === 0) {
      console.log('⚠️  No themes found in file system');
      console.log('   Make sure you have theme folders in: sparti-cms/theme/');
    } else {
      console.log('✅ File system fallback is working correctly!');
    }
    
  } catch (error) {
    console.error('❌ Error testing file system fallback:', error);
    throw error;
  }
}

// Run the test
testThemeFileSystemFallback()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

