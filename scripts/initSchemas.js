#!/usr/bin/env node

import { initAllTenantBrandingSchemas } from '../sparti-cms/db/initBrandingSchema.js';

async function main() {
  try {
    console.log('Starting schema initialization...');
    const result = await initAllTenantBrandingSchemas();
    console.log('✅ Schema initialization complete:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema initialization failed:', error);
    process.exit(1);
  }
}

main();