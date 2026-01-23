import dotenv from 'dotenv';
import { query } from '../sparti-cms/db/index.js';

dotenv.config();

async function addStripePublishableKey() {
  try {
    // Check if column exists
    const checkResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' 
      AND column_name = 'stripe_publishable_key'
    `);

    if (checkResult.rows.length === 0) {
      // Add the column
      await query(`
        ALTER TABLE tenants 
        ADD COLUMN stripe_publishable_key TEXT;
      `);
      console.log('[migration] ✅ Added stripe_publishable_key column to tenants');
    } else {
      console.log('[migration] ℹ️  stripe_publishable_key column already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('[migration] ❌ Error:', error.message);
    process.exit(1);
  }
}

addStripePublishableKey();
