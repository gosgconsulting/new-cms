#!/usr/bin/env node

/**
 * Environment Setup Script for Railway Integration
 * 
 * This script creates a .env file with the correct Railway PostgreSQL configuration
 * Run with: node setup-env.js
 */

import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envContent = `# Railway PostgreSQL Database Configuration
# These values are from your Railway dashboard environment variables
# For local development, these connect to your Railway PostgreSQL instance

# Primary database connections (REQUIRED)
# DATABASE_PUBLIC_URL is used for external connections (local development)
# DATABASE_URL is used for internal Railway connections (production)
DATABASE_PUBLIC_URL="postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@mainline.proxy.rlwy.net:37013/railway"
DATABASE_URL="postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@postgres-33yu.railway.internal:5432/railway"

# Individual PostgreSQL configuration (used by Railway)
PGDATA="/var/lib/postgresql/data/pgdata"
PGDATABASE="railway"
PGHOST="postgres-33yu.railway.internal"
PGPASSWORD="bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG"
PGPORT="5432"
PGUSER="postgres"
POSTGRES_DB="railway"
POSTGRES_PASSWORD="bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG"
POSTGRES_USER="postgres"

# Server Configuration
PORT=4173
NODE_ENV=development
JWT_SECRET=sparti-demo-secret-key-change-in-production

# Frontend API Configuration (for Vite)
VITE_API_BASE_URL="https://cms.sparti.ai"

# Email Configuration (Resend) - REQUIRED for contact forms
RESEND_API_KEY="re_2ap5qM9k_96jEVym5P34qtcJctKycM1ai"
SMTP_HOST="smtp.resend.com"
SMTP_PORT="465"
SMTP_USER="resend"
SMTP_FROM_EMAIL="noreply@gosg.com"

# Google Cloud Translation API
GOOGLE_CLOUD_TRANSLATION_API_KEY="AIzaSyBsMa_Lt6QDUdy5we4OpZ5fVp2wv5ir5hk"

# API Keys for integrations
GOOGLE_API_KEY="AIzaSyBN_I1rWGaUqN_wtWMnaFM-BGWoJ7xUh7A"
OPENROUTER_API_KEY="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"
ANTHROPIC_API_KEY="your-anthropic-api-key-here"

# Railway Deployment Configuration
RAILWAY_DEPLOYMENT_DRAINING_SECONDS="60"
RAILWAY_HEALTHCHECK_TIMEOUT_SEC="120"
SSL_CERT_DAYS="820"

# Frontend environment variables (VITE_ prefix required for browser access)
VITE_RESEND_API_KEY="re_2ap5qM9k_96jEVym5P34qtcJctKycM1ai"
VITE_GOOGLE_API_KEY="AIzaSyBN_I1rWGaUqN_wtWMnaFM-BGWoJ7xUh7A"
VITE_OPENROUTER_API_KEY="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"
VITE_ANTHROPIC_API_KEY="your-anthropic-api-key-here"
VITE_SMTP_FROM_EMAIL="noreply@gosg.com"
`;

const envPath = resolve('.env');

try {
  if (existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Creating backup...');
    const backupPath = resolve('.env.backup');
    const { readFileSync } = await import('fs');
    writeFileSync(backupPath, readFileSync(envPath));
    console.log('✅ Backup created at .env.backup');
  }

  writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('');
  console.log('🔧 Configuration Summary:');
  console.log('   - Database: Railway PostgreSQL');
  console.log('   - Environment: Development (local)');
  console.log('   - API Base URL: https://cms.sparti.ai');
  console.log('   - Email Provider: Resend');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Access your app at: http://localhost:8082');
  console.log('   3. Database will connect to Railway PostgreSQL');
  console.log('');
  console.log('📝 Note: This .env file is configured for both local development');
  console.log('   and Railway deployment. The DATABASE_PUBLIC_URL will be used');
  console.log('   locally, while DATABASE_URL will be used in production.');

} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}
