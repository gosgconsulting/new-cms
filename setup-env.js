#!/usr/bin/env node

/**
 * Environment Setup Script
 *
 * Creates a .env file from a Vercel-oriented template.
 * For production, set variables in the Vercel dashboard.
 * Run with: node setup-env.js
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const envContent = `# Database (REQUIRED) - Set in Vercel or .env for local dev
DATABASE_URL="postgresql://user:password@host:5432/database"

# Server
PORT=4173
NODE_ENV=development
JWT_SECRET=change-in-production
SECRET=change-in-production
REFRESH_SECRET=change-in-production

# Frontend API (Vercel sets VERCEL_URL automatically; override if needed)
VITE_API_BASE_URL="http://localhost:4173"

# Email (Resend) - required for contact forms
RESEND_API_KEY=""
SMTP_FROM_EMAIL="noreply@example.com"

# Optional: per-tenant storage (e.g. STORAGE_TENANT_ACATR=storage-name)
# Set in Vercel for production

# Optional: Vercel Blob for file uploads (set BLOB_READ_WRITE_TOKEN in Vercel)
`;

const envPath = resolve('.env');

try {
  if (existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Creating backup...');
    const backupPath = resolve('.env.backup');
    writeFileSync(backupPath, readFileSync(envPath));
    console.log('✅ Backup created at .env.backup');
  }

  writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('');
  console.log('🔧 Next steps:');
  console.log('   1. Edit .env and set DATABASE_URL (and RESEND_API_KEY if needed)');
  console.log('   2. For production: set all variables in the Vercel dashboard');
  console.log('   3. Run locally: npm run dev');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}
