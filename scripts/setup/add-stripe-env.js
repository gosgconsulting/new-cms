#!/usr/bin/env node

/**
 * Script to add Stripe configuration to .env file
 * This adds the required environment variables for Stripe Connect integration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '..', '.env');

// Configuration to add
const stripeConfig = `
# Stripe Configuration (REQUIRED for shop payments)
# Get these from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret_here"

# Frontend URL (REQUIRED for Stripe Connect redirects)
FRONTEND_URL="https://cms.sparti.ai"
`;

try {
  // Read current .env file
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Check if Stripe configuration already exists
  if (envContent.includes('STRIPE_SECRET_KEY')) {
    console.log('✓ Stripe configuration already exists in .env file');
    console.log('\nCurrent Stripe configuration:');
    const stripeLines = envContent.split('\n').filter(line => 
      line.includes('STRIPE_') || line.includes('FRONTEND_URL')
    );
    stripeLines.forEach(line => console.log('  ' + line));
    console.log('\nIf you need to update these values, please edit .env file manually.');
    process.exit(0);
  }

  // Find the best place to insert (after Google Cloud Translation API)
  const insertAfter = 'GOOGLE_CLOUD_TRANSLATION_API_KEY';
  const lines = envContent.split('\n');
  const insertIndex = lines.findIndex(line => line.includes(insertAfter));

  if (insertIndex !== -1) {
    // Insert after the Google Cloud Translation API line
    lines.splice(insertIndex + 1, 0, stripeConfig);
    envContent = lines.join('\n');
  } else {
    // Append to end if marker not found
    envContent += '\n' + stripeConfig;
  }

  // Write back to .env file
  fs.writeFileSync(envPath, envContent, 'utf8');

  console.log('✓ Successfully added Stripe configuration to .env file');
  console.log('\n📝 Next steps:');
  console.log('1. Get your Stripe API keys from: https://dashboard.stripe.com/test/apikeys');
  console.log('2. Replace "sk_test_your_stripe_secret_key_here" with your actual Stripe Secret Key');
  console.log('3. (Optional) Set up webhook and replace "whsec_your_stripe_webhook_secret_here"');
  console.log('4. Verify FRONTEND_URL matches your deployment URL');
  console.log('5. Restart your server for changes to take effect');

} catch (error) {
  console.error('❌ Error updating .env file:', error.message);
  process.exit(1);
}
