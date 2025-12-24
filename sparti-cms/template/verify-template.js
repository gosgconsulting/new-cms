#!/usr/bin/env node

/**
 * Template Verification Script
 * 
 * This script verifies that a theme template has all mandatory files
 * and provides guidance for theme creation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mandatory files for any theme
const MANDATORY_FILES = [
  'index.tsx',
  'theme.json', 
  'pages.json'
];

// Recommended files for production themes
const RECOMMENDED_FILES = [
  'theme.css',
  'README.md'
];

function verifyTemplate(templatePath) {
  console.log('🔍 Verifying template structure...\n');
  
  let allGood = true;
  
  // Check mandatory files
  console.log('📋 Checking mandatory files:');
  for (const file of MANDATORY_FILES) {
    const filePath = path.join(templatePath, file);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} - MISSING (REQUIRED)`);
      allGood = false;
    }
  }
  
  console.log('\n📝 Checking recommended files:');
  for (const file of RECOMMENDED_FILES) {
    const filePath = path.join(templatePath, file);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ⚠️  ${file} - Missing (recommended)`);
    }
  }
  
  // Check theme.json content
  console.log('\n🔧 Checking theme.json content:');
  const themeJsonPath = path.join(templatePath, 'theme.json');
  if (fs.existsSync(themeJsonPath)) {
    try {
      const themeJson = JSON.parse(fs.readFileSync(themeJsonPath, 'utf8'));
      const requiredFields = ['name', 'description', 'version', 'author', 'is_active'];
      
      for (const field of requiredFields) {
        if (themeJson[field] !== undefined) {
          console.log(`  ✅ ${field}: "${themeJson[field]}"`);
        } else {
          console.log(`  ❌ ${field} - Missing required field`);
          allGood = false;
        }
      }
    } catch (error) {
      console.log(`  ❌ Invalid JSON format: ${error.message}`);
      allGood = false;
    }
  }
  
  // Check pages.json content
  console.log('\n📄 Checking pages.json content:');
  const pagesJsonPath = path.join(templatePath, 'pages.json');
  if (fs.existsSync(pagesJsonPath)) {
    try {
      const pagesJson = JSON.parse(fs.readFileSync(pagesJsonPath, 'utf8'));
      if (pagesJson.pages && Array.isArray(pagesJson.pages) && pagesJson.pages.length > 0) {
        console.log(`  ✅ Found ${pagesJson.pages.length} page(s) defined`);
        
        const firstPage = pagesJson.pages[0];
        const requiredPageFields = ['page_name', 'slug', 'meta_title', 'meta_description'];
        
        for (const field of requiredPageFields) {
          if (firstPage[field] !== undefined) {
            console.log(`  ✅ ${field}: "${firstPage[field]}"`);
          } else {
            console.log(`  ❌ ${field} - Missing in first page`);
            allGood = false;
          }
        }
      } else {
        console.log(`  ❌ No pages defined or invalid structure`);
        allGood = false;
      }
    } catch (error) {
      console.log(`  ❌ Invalid JSON format: ${error.message}`);
      allGood = false;
    }
  }
  
  // Final result
  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('🎉 Template verification PASSED!');
    console.log('✅ This template has all mandatory files and is ready to use.');
    console.log('\n📖 Next steps:');
    console.log('1. Copy this template to create a new theme:');
    console.log('   cp -r sparti-cms/template/landingpage sparti-cms/theme/your-theme-name');
    console.log('2. Update theme.json with your theme information');
    console.log('3. Update pages.json with your SEO metadata');
    console.log('4. Customize index.tsx with your content');
  } else {
    console.log('❌ Template verification FAILED!');
    console.log('⚠️  This template is missing required files or has invalid configuration.');
    console.log('📋 Please fix the issues above before using this template.');
  }
  console.log('='.repeat(50));
  
  return allGood;
}

// Run verification
const templatePath = process.argv[2] || path.join(__dirname, 'landingpage');

if (!fs.existsSync(templatePath)) {
  console.error(`❌ Template path does not exist: ${templatePath}`);
  process.exit(1);
}

const success = verifyTemplate(templatePath);
process.exit(success ? 0 : 1);
