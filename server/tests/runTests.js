/**
 * Test Runner
 * Runs all test suites
 */

import 'dotenv/config';
import { runAuthServiceTests } from './authService.test.js';
import { runRepositoryTests } from './repositories.test.js';

async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   CMS REFACTOR TEST SUITE              ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('\n');

  const results = [];

  // Run auth service tests
  try {
    const authResults = await runAuthServiceTests();
    results.push({ suite: 'Auth Service', ...authResults });
  } catch (error) {
    console.error('[Test Runner] Auth service tests failed:', error);
    results.push({ suite: 'Auth Service', success: false, error: error.message });
  }

  // Run repository tests
  try {
    const repoResults = await runRepositoryTests();
    results.push({ suite: 'Repositories', ...repoResults });
  } catch (error) {
    console.error('[Test Runner] Repository tests failed:', error);
    results.push({ suite: 'Repositories', success: false, error: error.message });
  }

  // Summary
  console.log('\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   OVERALL TEST SUMMARY                 ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('\n');

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  for (const result of results) {
    console.log(`${result.suite}:`);
    console.log(`  Total: ${result.total || 0}`);
    console.log(`  Passed: ${result.passed || 0}`);
    console.log(`  Failed: ${result.failed || 0}`);
    console.log(`  Status: ${result.success ? '✓ PASS' : '✗ FAIL'}`);
    console.log('');

    totalTests += result.total || 0;
    totalPassed += result.passed || 0;
    totalFailed += result.failed || 0;
  }

  console.log('Overall:');
  console.log(`  Total: ${totalTests}`);
  console.log(`  Passed: ${totalPassed}`);
  console.log(`  Failed: ${totalFailed}`);
  console.log(`  Success Rate: ${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%`);
  console.log('\n');

  const allPassed = totalFailed === 0;
  process.exit(allPassed ? 0 : 1);
}

runAllTests().catch((error) => {
  console.error('[Test Runner] Fatal error:', error);
  process.exit(1);
});
