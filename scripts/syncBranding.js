#!/usr/bin/env node

import { 
  ensureAllTenantsHaveDefaults,
  syncAllTenantsFromMaster,
  getAllTenantsSyncStatus
} from '../sparti-cms/db/syncBrandingSettings.js';

const args = process.argv.slice(2);
const command = args[0];

async function showStatus() {
  console.log('📊 Checking branding sync status...\n');
  const status = await getAllTenantsSyncStatus();
  
  console.log(`Total Tenants: ${status.totalTenants}`);
  console.log(`✅ Complete: ${status.completeCount}`);
  console.log(`⚠️  Incomplete: ${status.incompleteCount}\n`);
  
  status.tenants.forEach(tenant => {
    const icon = tenant.isComplete ? '✅' : '⚠️';
    console.log(`${icon} ${tenant.tenantName} (${tenant.tenantId})`);
    console.log(`   ${tenant.existing}/${tenant.total} settings`);
    if (tenant.missing > 0) {
      console.log(`   Missing: ${tenant.missingKeys.slice(0, 3).join(', ')}${tenant.missingKeys.length > 3 ? '...' : ''}`);
    }
    console.log('');
  });
}

async function ensureDefaults() {
  console.log('🔧 Ensuring all tenants have default branding settings...\n');
  const result = await ensureAllTenantsHaveDefaults();
  
  console.log(`✅ Processed ${result.tenantsProcessed} tenants\n`);
  
  result.results.forEach(r => {
    if (r.added > 0) {
      console.log(`✅ ${r.tenantName}: Added ${r.added} settings`);
      console.log(`   Keys: ${r.keys.join(', ')}`);
    } else {
      console.log(`✓  ${r.tenantName}: Already complete`);
    }
  });
}

async function syncAll(masterTenantId) {
  console.log(`🔄 Syncing all tenants from master: ${masterTenantId || 'global'}...\n`);
  
  const result = await syncAllTenantsFromMaster(masterTenantId || null, {
    onlyMissing: true,
    overwrite: false
  });
  
  console.log(`✅ Processed ${result.tenantsProcessed} tenants\n`);
  
  result.results.forEach(r => {
    if (r.success) {
      console.log(`✅ ${r.tenantName}:`);
      console.log(`   Inserted: ${r.inserts}, Updated: ${r.updates}, Skipped: ${r.skipped}`);
    } else {
      console.log(`❌ ${r.tenantName}: ${r.error}`);
    }
  });
}

async function main() {
  try {
    switch (command) {
      case 'status':
        await showStatus();
        break;
      
      case 'ensure-defaults':
        await ensureDefaults();
        break;
      
      case 'sync-all':
        const masterTenantId = args[1];
        if (!masterTenantId) {
          console.error('❌ Error: Master tenant ID required');
          console.log('Usage: npm run sync-branding sync-all <master-tenant-id>');
          console.log('       Use "global" for null tenant_id');
          process.exit(1);
        }
        await syncAll(masterTenantId === 'global' ? null : masterTenantId);
        break;
      
      default:
        console.log('Branding Settings Sync Tool\n');
        console.log('Commands:');
        console.log('  status              - Show sync status for all tenants');
        console.log('  ensure-defaults     - Ensure all tenants have default settings');
        console.log('  sync-all <master>   - Sync all tenants from master tenant');
        console.log('\nExamples:');
        console.log('  npm run sync-branding status');
        console.log('  npm run sync-branding ensure-defaults');
        console.log('  npm run sync-branding sync-all tenant-gosg');
        console.log('  npm run sync-branding sync-all global');
        process.exit(0);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();