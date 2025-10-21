#!/usr/bin/env node

import fetch from 'node-fetch';

async function testHealthCheck() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:4173';
  
  console.log(`[testing] Testing health check at ${baseUrl}/health`);
  
  try {
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();
    
    console.log(`[testing] Health check response:`, data);
    console.log(`[testing] Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Health check passed');
      return true;
    } else {
      console.log('❌ Health check failed');
      return false;
    }
  } catch (error) {
    console.error('[testing] Health check error:', error.message);
    return false;
  }
}

async function testDetailedHealthCheck() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:4173';
  
  console.log(`[testing] Testing detailed health check at ${baseUrl}/health/detailed`);
  
  try {
    const response = await fetch(`${baseUrl}/health/detailed`);
    const data = await response.json();
    
    console.log(`[testing] Detailed health check response:`, data);
    console.log(`[testing] Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Detailed health check passed');
      return true;
    } else {
      console.log('❌ Detailed health check failed');
      return false;
    }
  } catch (error) {
    console.error('[testing] Detailed health check error:', error.message);
    return false;
  }
}

async function main() {
  console.log('[testing] Starting health check tests...');
  
  const basicHealth = await testHealthCheck();
  const detailedHealth = await testDetailedHealthCheck();
  
  if (basicHealth && detailedHealth) {
    console.log('✅ All health checks passed');
    process.exit(0);
  } else {
    console.log('❌ Some health checks failed');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('[testing] Test failed:', error);
  process.exit(1);
});
