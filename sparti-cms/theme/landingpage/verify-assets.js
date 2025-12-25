/**
 * Asset Verification Script for ACATR Landing Page Theme
 * Verifies that all theme assets are properly accessible
 */

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define all assets used in the theme
const requiredAssets = [
  // Logos
  '752d249c-df1b-46fb-b5e2-fb20a9bb88d8.png',
  'acatr-logo.png',
  
  // Hero section
  'hero-business.jpg',
  
  // Services
  'incorporation-services.jpg',
  'accounting-dashboard.jpg',
  'corporate-secretarial.jpg',
  
  // Testimonials
  'testimonial-1.jpg',
  'testimonial-2.jpg',
  
  // Fallback
  'placeholder.svg'
];

// Check assets in theme directory
console.log('🔍 Verifying theme assets...\n');

const themeAssetsDir = join(__dirname, 'assets');
const publicAssetsDir = join(__dirname, '..', '..', '..', 'public', 'theme', 'landingpage', 'assets');

let allAssetsFound = true;

requiredAssets.forEach(asset => {
  const themeAssetPath = join(themeAssetsDir, asset);
  const publicAssetPath = join(publicAssetsDir, asset);
  
  const themeExists = existsSync(themeAssetPath);
  const publicExists = existsSync(publicAssetPath);
  
  console.log(`📄 ${asset}:`);
  console.log(`   Theme: ${themeExists ? '✅' : '❌'} ${themeAssetPath}`);
  console.log(`   Public: ${publicExists ? '✅' : '❌'} ${publicAssetPath}`);
  
  if (!themeExists || !publicExists) {
    allAssetsFound = false;
  }
  console.log('');
});

// Summary
console.log('📊 Summary:');
if (allAssetsFound) {
  console.log('✅ All required assets are available in both locations');
  console.log('🌐 Assets should be accessible via:');
  console.log('   - /theme/landingpage/assets/{filename}');
  console.log('   - Direct static serving from public directory');
} else {
  console.log('❌ Some assets are missing');
  console.log('🔧 Run the following to copy missing assets:');
  console.log('   npm run copy-theme-assets');
}

console.log('\n🎯 Asset URLs in production:');
requiredAssets.forEach(asset => {
  console.log(`   /theme/landingpage/assets/${asset}`);
});

export default { requiredAssets, allAssetsFound };

