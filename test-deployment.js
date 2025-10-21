#!/usr/bin/env node

import fetch from 'node-fetch';

async function testDeployment() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:4173';
  
  console.log(`[testing] Testing deployment at ${baseUrl}`);
  
  const tests = [
    { name: 'Health Check', url: '/health', expectedStatus: 200 },
    { name: 'Homepage SSR', url: '/r/', expectedStatus: 200 },
    { name: 'API Health', url: '/api/branding', expectedStatus: 200 },
    { name: 'Static Files', url: '/', expectedStatus: 200 }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`[testing] Testing ${test.name}...`);
      const response = await fetch(`${baseUrl}${test.url}`);
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: ${response.status}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: Expected ${test.expectedStatus}, got ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n[testing] Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('✅ All deployment tests passed');
    process.exit(0);
  } else {
    console.log('❌ Some deployment tests failed');
    process.exit(1);
  }
}

testDeployment().catch(error => {
  console.error('[testing] Deployment test failed:', error);
  process.exit(1);
});
