#!/usr/bin/env node
/**
 * Environment Setup Verification Script
 * 
 * This script checks if the environment is properly configured for development
 * Run with: node scripts/verify-env-setup.js
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const envPath = resolve(rootDir, '.env');

console.log('==========================================');
console.log('Environment Setup Verification');
console.log('==========================================\n');

// Check if .env file exists
console.log('1. Checking .env file...');
if (existsSync(envPath)) {
  console.log('   ✅ .env file exists');
  
  // Read and check key variables
  const envContent = readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  
  const requiredVars = {
    'PORT': 'Backend server port (should be 4173)',
    'NODE_ENV': 'Environment mode (should be development)',
    'VITE_API_BASE_URL': 'Frontend API URL (empty for dev, uses Vite proxy)',
  };
  
  const optionalVars = {
    'DATABASE_URL': 'Database connection string',
    'JWT_SECRET': 'JWT secret for authentication',
    'RESEND_API_KEY': 'Resend API key for emails',
  };
  
  console.log('\n2. Checking required environment variables...');
  let allRequiredPresent = true;
  
  for (const [varName, description] of Object.entries(requiredVars)) {
    const found = envLines.some(line => line.trim().startsWith(`${varName}=`));
    if (found) {
      const line = envLines.find(l => l.trim().startsWith(`${varName}=`));
      const value = line?.split('=')[1]?.trim().replace(/^["']|["']$/g, '') || '';
      console.log(`   ✅ ${varName}: ${value || '(empty)'} - ${description}`);
      
      // Validate PORT
      if (varName === 'PORT' && value && value !== '4173') {
        console.log(`   ⚠️  WARNING: PORT is ${value}, but backend should run on 4173`);
      }
      
      // Validate VITE_API_BASE_URL for dev
      if (varName === 'VITE_API_BASE_URL' && value && !value.includes('localhost')) {
        console.log(`   ⚠️  INFO: VITE_API_BASE_URL is set to ${value}`);
        console.log(`      For local dev, this should be empty to use Vite proxy`);
      }
    } else {
      console.log(`   ⚠️  ${varName}: NOT SET - ${description}`);
      if (varName === 'PORT') {
        console.log(`      Default will be 4173`);
      }
      if (varName === 'VITE_API_BASE_URL') {
        console.log(`      Will use Vite proxy (recommended for dev)`);
      }
    }
  }
  
  console.log('\n3. Checking optional environment variables...');
  for (const [varName, description] of Object.entries(optionalVars)) {
    const found = envLines.some(line => line.trim().startsWith(`${varName}=`));
    if (found) {
      const line = envLines.find(l => l.trim().startsWith(`${varName}=`));
      const value = line?.split('=')[1]?.trim().replace(/^["']|["']$/g, '') || '';
      const masked = value.length > 10 ? value.substring(0, 10) + '...' : value;
      console.log(`   ✅ ${varName}: ${masked || '(empty)'} - ${description}`);
    } else {
      console.log(`   ⚠️  ${varName}: NOT SET - ${description} (optional)`);
    }
  }
  
} else {
  console.log('   ❌ .env file NOT FOUND');
  console.log('   📝 Create .env file in project root');
  console.log('   📝 You can use setup-env.js or copy from .env.example');
}

// Check backend server
console.log('\n4. Backend Server Status...');
console.log('   ℹ️  To check if backend is running:');
console.log('      - Run: npm run dev:backend');
console.log('      - Or: node server.js');
console.log('      - Then test: http://localhost:4173/health');

// Check Vite configuration
console.log('\n5. Vite Configuration...');
const viteConfigPath = resolve(rootDir, 'vite.config.ts');
if (existsSync(viteConfigPath)) {
  console.log('   ✅ vite.config.ts exists');
  const viteConfig = readFileSync(viteConfigPath, 'utf-8');
  
  if (viteConfig.includes('hmr:')) {
    console.log('   ✅ HMR configuration found');
  } else {
    console.log('   ⚠️  HMR configuration may need updating');
  }
  
  if (viteConfig.includes('ws: true')) {
    console.log('   ✅ WebSocket proxy enabled');
  } else {
    console.log('   ⚠️  WebSocket proxy may need enabling');
  }
} else {
  console.log('   ❌ vite.config.ts NOT FOUND');
}

// Service worker check
console.log('\n6. Service Worker Check...');
console.log('   ℹ️  Service workers are automatically unregistered in development');
console.log('   ℹ️  Check browser DevTools → Application → Service Workers');
console.log('   ℹ️  If you see active service workers, unregister them manually');

console.log('\n==========================================');
console.log('Verification Complete');
console.log('==========================================\n');

console.log('Next Steps:');
console.log('1. Ensure .env file has correct values');
console.log('2. Start backend: npm run dev:backend');
console.log('3. Start frontend: npm run dev');
console.log('4. Check browser console for any remaining errors');
console.log('5. Unregister any active service workers in DevTools\n');
