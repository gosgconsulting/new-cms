#!/usr/bin/env node

/**
 * Test script for Stripe Connect integration
 * Verifies all components are properly configured
 */

import { query } from '../../sparti-cms/db/index.js';
import Stripe from 'stripe';

const REQUIRED_ENV_VARS = [
  'STRIPE_SECRET_KEY',
  'FRONTEND_URL'
];

const OPTIONAL_ENV_VARS = [
  'STRIPE_WEBHOOK_SECRET'
];

async function testStripeConnect() {
  console.log('🧪 Testing Stripe Connect Integration\n');
  console.log('=' .repeat(60));
  
  let allTestsPassed = true;
  const warnings = [];

  // Test 1: Environment Variables
  console.log('\n📋 Test 1: Environment Variables');
  console.log('-'.repeat(60));
  
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar];
    if (!value) {
      console.log(`❌ ${envVar}: NOT SET (REQUIRED)`);
      allTestsPassed = false;
    } else if (value.includes('your_') || value.includes('_here')) {
      console.log(`⚠️  ${envVar}: Set but contains placeholder value`);
      warnings.push(`${envVar} needs to be replaced with actual value`);
    } else {
      console.log(`✓ ${envVar}: Set`);
    }
  }

  for (const envVar of OPTIONAL_ENV_VARS) {
    const value = process.env[envVar];
    if (!value) {
      console.log(`⚠️  ${envVar}: Not set (optional but recommended)`);
      warnings.push(`${envVar} not set - webhook events won't be verified`);
    } else if (value.includes('your_') || value.includes('_here')) {
      console.log(`⚠️  ${envVar}: Set but contains placeholder value`);
      warnings.push(`${envVar} needs to be replaced with actual value`);
    } else {
      console.log(`✓ ${envVar}: Set`);
    }
  }

  // Test 2: Stripe API Connection
  console.log('\n📋 Test 2: Stripe API Connection');
  console.log('-'.repeat(60));
  
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey.includes('your_')) {
    console.log('❌ Cannot test Stripe API - key not configured');
    allTestsPassed = false;
  } else {
    try {
      const stripe = new Stripe(stripeKey, {
        apiVersion: '2024-11-20.acacia',
      });
      
      // Test API by retrieving balance (lightweight call)
      const balance = await stripe.balance.retrieve();
      console.log('✓ Stripe API connection successful');
      console.log(`  Mode: ${stripeKey.startsWith('sk_test_') ? 'TEST' : 'LIVE'}`);
      console.log(`  Available balance: ${balance.available[0]?.amount || 0} ${balance.available[0]?.currency || 'usd'}`);
    } catch (error) {
      console.log(`❌ Stripe API connection failed: ${error.message}`);
      allTestsPassed = false;
    }
  }

  // Test 3: Database Schema
  console.log('\n📋 Test 3: Database Schema');
  console.log('-'.repeat(60));
  
  try {
    const result = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'tenants'
        AND column_name IN ('stripe_connect_account_id', 'stripe_connect_onboarding_completed')
      ORDER BY column_name;
    `);

    if (result.rows.length === 2) {
      console.log('✓ Stripe Connect columns exist in tenants table');
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });
    } else if (result.rows.length === 0) {
      console.log('❌ Stripe Connect columns NOT found in tenants table');
      console.log('   Run: npm run sequelize:migrate');
      allTestsPassed = false;
    } else {
      console.log(`⚠️  Only ${result.rows.length}/2 columns found`);
      warnings.push('Database schema incomplete');
    }
  } catch (error) {
    console.log(`⚠️  Could not verify database schema: ${error.message}`);
    warnings.push('Database connection issue - verify manually');
  }

  // Test 4: API Endpoints
  console.log('\n📋 Test 4: API Endpoints');
  console.log('-'.repeat(60));
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const backendUrl = process.env.VITE_API_BASE_URL || 'http://localhost:4173';
  
  console.log(`Frontend URL: ${frontendUrl}`);
  console.log(`Backend URL: ${backendUrl}`);
  
  // Check if URLs are properly formatted
  if (!frontendUrl.startsWith('http')) {
    console.log('❌ FRONTEND_URL must start with http:// or https://');
    allTestsPassed = false;
  } else {
    console.log('✓ FRONTEND_URL format is valid');
  }

  // Test 5: File Existence
  console.log('\n📋 Test 5: Required Files');
  console.log('-'.repeat(60));
  
  const requiredFiles = [
    'sparti-cms/components/admin/ShopSettingsManager.tsx',
    'server/routes/shop.js',
    'sparti-cms/db/sequelize/migrations/20241226000001-create-ecommerce-tables.js'
  ];

  const fs = await import('fs');
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✓ ${file}`);
    } else {
      console.log(`❌ ${file} - NOT FOUND`);
      allTestsPassed = false;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  if (allTestsPassed && warnings.length === 0) {
    console.log('\n✅ All tests passed! Stripe Connect is ready to use.');
    console.log('\n📝 Next steps:');
    console.log('1. Log in to CMS admin');
    console.log('2. Navigate to Shop → Settings → General');
    console.log('3. Click "Connect Stripe Account"');
    console.log('4. Complete Stripe onboarding');
  } else {
    if (!allTestsPassed) {
      console.log('\n❌ Some tests failed. Please fix the issues above.');
    }
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    console.log('\n📝 Action required:');
    console.log('1. Fix any failed tests');
    console.log('2. Replace placeholder values in .env');
    console.log('3. Restart your server');
    console.log('4. Run this test again');
  }

  console.log('\n📚 Documentation:');
  console.log('   - Quick Start: STRIPE_SETUP_QUICK_START.md');
  console.log('   - Full Guide: docs/setup/STRIPE_CONNECT_SETUP.md');
  console.log('');

  process.exit(allTestsPassed ? 0 : 1);
}

// Run tests
testStripeConnect().catch(error => {
  console.error('\n❌ Test script error:', error);
  process.exit(1);
});
