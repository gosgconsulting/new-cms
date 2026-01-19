#!/usr/bin/env node

/**
 * Script to add Stripe configuration to .env.example file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envExamplePath = path.join(__dirname, '..', '..', '.env.example');

// Configuration to add
const stripeConfig = `
# Stripe Configuration (REQUIRED for shop payments and Stripe Connect)
# Get your API keys from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Frontend URL (REQUIRED for Stripe Connect redirects)
# Set this to your actual frontend URL (e.g., https://yourdomain.com or http://localhost:5173)
FRONTEND_URL=http://localhost:5173
`;

try {
  // Read current .env.example file
  let envContent = '';
  if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
  }

  // Check if Stripe configuration already exists
  if (envContent.includes('STRIPE_SECRET_KEY')) {
    console.log('✓ Stripe configuration already exists in .env.example file');
    process.exit(0);
  }

  // Append to end of file
  envContent += '\n' + stripeConfig;

  // Write back to .env.example file
  fs.writeFileSync(envExamplePath, envContent, 'utf8');

  console.log('✓ Successfully added Stripe configuration to .env.example file');
  console.log('\n📝 Added configuration:');
  console.log('  - STRIPE_SECRET_KEY');
  console.log('  - STRIPE_WEBHOOK_SECRET');
  console.log('  - FRONTEND_URL');

} catch (error) {
  console.error('❌ Error updating .env.example file:', error.message);
  process.exit(1);
}
