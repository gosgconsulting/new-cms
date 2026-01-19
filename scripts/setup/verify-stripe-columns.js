#!/usr/bin/env node

/**
 * Script to verify Stripe Connect columns exist in tenants table
 */

import { query } from '../../sparti-cms/db/index.js';

async function verifyStripeColumns() {
  try {
    console.log('Checking for Stripe Connect columns in tenants table...\n');

    // Query to check if columns exist
    const result = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'tenants'
        AND column_name IN ('stripe_connect_account_id', 'stripe_connect_onboarding_completed')
      ORDER BY column_name;
    `);

    if (result.rows.length === 0) {
      console.log('❌ Stripe Connect columns NOT found in tenants table');
      console.log('\n📝 Action required:');
      console.log('   Run migrations: npm run sequelize:migrate');
      process.exit(1);
    }

    console.log('✓ Found Stripe Connect columns:\n');
    result.rows.forEach(row => {
      console.log(`  Column: ${row.column_name}`);
      console.log(`    Type: ${row.data_type}`);
      console.log(`    Nullable: ${row.is_nullable}`);
      console.log(`    Default: ${row.column_default || 'none'}`);
      console.log('');
    });

    if (result.rows.length === 2) {
      console.log('✓ All required Stripe Connect columns are present');
      console.log('✓ Database is ready for Stripe Connect integration');
    } else {
      console.log(`⚠ Warning: Expected 2 columns, found ${result.rows.length}`);
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

verifyStripeColumns();
