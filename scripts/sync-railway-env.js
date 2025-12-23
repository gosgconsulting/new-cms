#!/usr/bin/env node

/**
 * Railway Environment Variables Sync Script
 * 
 * This script syncs environment variables from Railway to your local .env file
 * Requires Railway CLI to be installed and authenticated
 * 
 * Installation:
 *   npm install -g @railway/cli
 *   railway login
 * 
 * Usage:
 *   node scripts/sync-railway-env.js
 *   OR
 *   npm run env:sync
 */

import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const envPath = resolve('.env');
const envLocalPath = resolve('.env.local');

// Check if Railway CLI is available
function checkRailwayCLI() {
  try {
    execSync('railway --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Get variables from Railway
function getRailwayVariables() {
  try {
    console.log('🔄 Fetching variables from Railway...');
    
    // Try to get variables as JSON first
    try {
      const jsonOutput = execSync('railway variables --json', { encoding: 'utf-8' });
      const vars = JSON.parse(jsonOutput);
      return vars;
    } catch (jsonError) {
      // Fallback to plain text output
      const output = execSync('railway variables', { encoding: 'utf-8' });
      return parseRailwayVariables(output);
    }
  } catch (error) {
    console.error('❌ Error fetching Railway variables:', error.message);
    console.log('\n💡 Make sure you are:');
    console.log('   1. Logged in: railway login');
    console.log('   2. In the correct project: railway link');
    console.log('   3. Railway CLI is installed: npm install -g @railway/cli');
    return null;
  }
}

// Parse Railway CLI plain text output
function parseRailwayVariables(output) {
  const vars = {};
  const lines = output.split('\n');
  
  for (const line of lines) {
    // Handle both KEY=value and KEY = value formats
    const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*[=:]\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes if present and trim
      vars[key] = value.trim().replace(/^["']|["']$/g, '');
    }
  }
  
  return vars;
}

// Generate .env content from Railway variables
function generateEnvContent(vars) {
  return `# Environment Variables - Synced from Railway
# This file is auto-generated. Do not commit to git.
# To sync: npm run env:sync
# Last synced: ${new Date().toISOString()}

# PostgreSQL Database Configuration
DATABASE_PUBLIC_URL="${vars.DATABASE_PUBLIC_URL || ''}"
DATABASE_URL="${vars.DATABASE_URL || ''}"
PGDATA="${vars.PGDATA || '/var/lib/postgresql/data/pgdata'}"
PGDATABASE="${vars.PGDATABASE || vars.POSTGRES_DB || ''}"
PGHOST="${vars.PGHOST || ''}"
PGPASSWORD="${vars.PGPASSWORD || vars.POSTGRES_PASSWORD || ''}"
PGPORT="${vars.PGPORT || '5432'}"
PGUSER="${vars.PGUSER || vars.POSTGRES_USER || 'postgres'}"
POSTGRES_DB="${vars.POSTGRES_DB || ''}"
POSTGRES_PASSWORD="${vars.POSTGRES_PASSWORD || ''}"
POSTGRES_USER="${vars.POSTGRES_USER || ''}"

# Server Configuration
PORT="${vars.PORT || '4173'}"
NODE_ENV="${vars.NODE_ENV || 'development'}"

# Frontend API Configuration
VITE_API_BASE_URL="${vars.VITE_API_BASE_URL || 'https://cms.sparti.ai'}"

# Email Configuration (Resend)
RESEND_API_KEY="${vars.RESEND_API_KEY || ''}"
SMTP_HOST="${vars.SMTP_HOST || 'smtp.resend.com'}"
SMTP_PORT="${vars.SMTP_PORT || '465'}"
SMTP_USER="${vars.SMTP_USER || 'resend'}"
SMTP_FROM_EMAIL="${vars.SMTP_FROM_EMAIL || 'noreply@gosg.com'}"

# Google Cloud Translation API
GOOGLE_CLOUD_TRANSLATION_API_KEY="${vars.GOOGLE_CLOUD_TRANSLATION_API_KEY || ''}"

# API Keys for integrations
GOOGLE_API_KEY="${vars.GOOGLE_API_KEY || ''}"
OPENROUTER_API_KEY="${vars.OPENROUTER_API_KEY || ''}"
ANTHROPIC_API_KEY="${vars.ANTHROPIC_API_KEY || ''}"
VITE_PERPLEXITY_API_KEY="${vars.VITE_PERPLEXITY_API_KEY || ''}"

# Railway Deployment Configuration
RAILWAY_DEPLOYMENT_DRAINING_SECONDS="${vars.RAILWAY_DEPLOYMENT_DRAINING_SECONDS || '60'}"
RAILWAY_HEALTHCHECK_TIMEOUT_SEC="${vars.RAILWAY_HEALTHCHECK_TIMEOUT_SEC || '120'}"
SSL_CERT_DAYS="${vars.SSL_CERT_DAYS || '820'}"

# Frontend environment variables (VITE_ prefix required for browser access)
VITE_RESEND_API_KEY="${vars.VITE_RESEND_API_KEY || ''}"
VITE_GOOGLE_API_KEY="${vars.VITE_GOOGLE_API_KEY || ''}"
VITE_OPENROUTER_API_KEY="${vars.VITE_OPENROUTER_API_KEY || ''}"
VITE_ANTHROPIC_API_KEY="${vars.VITE_ANTHROPIC_API_KEY || ''}"
VITE_SMTP_FROM_EMAIL="${vars.VITE_SMTP_FROM_EMAIL || 'noreply@gosg.com'}"
`;
}

// Main function
async function main() {
  console.log('🚀 Railway Environment Variables Sync\n');

  // Check if Railway CLI is available
  if (!checkRailwayCLI()) {
    console.error('❌ Railway CLI not found!');
    console.log('\n📦 Install it with:');
    console.log('   npm install -g @railway/cli');
    console.log('   railway login');
    console.log('\n💡 Alternatively, create a .env.local file manually');
    process.exit(1);
  }

  // Check if .env.local exists (manual override)
  if (existsSync(envLocalPath)) {
    console.log('⚠️  .env.local found - using local variables instead');
    console.log('   To sync from Railway, remove .env.local first');
    process.exit(0);
  }

  // Get variables from Railway
  const vars = getRailwayVariables();
  if (!vars || Object.keys(vars).length === 0) {
    console.error('\n❌ No variables found from Railway');
    console.log('\n💡 Make sure you have:');
    console.log('   1. Set up variables in Railway dashboard');
    console.log('   2. Linked your project: railway link');
    console.log('   3. Or create .env.local manually');
    process.exit(1);
  }

  // Backup existing .env if it exists
  if (existsSync(envPath)) {
    const backupPath = resolve('.env.backup');
    const { readFileSync } = await import('fs');
    writeFileSync(backupPath, readFileSync(envPath));
    console.log('✅ Backed up existing .env to .env.backup');
  }

  // Generate and write .env file
  const envContent = generateEnvContent(vars);
  writeFileSync(envPath, envContent);

  console.log('✅ .env file synced from Railway!');
  console.log(`   ${Object.keys(vars).length} variables loaded`);
  console.log('\n🔒 All secrets are stored securely on Railway');
  console.log('   No secrets are committed to git');
  console.log('\n🚀 Next steps:');
  console.log('   npm run dev');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

