/**
 * Authentication Service Tests
 * Tests for the authentication service layer
 */

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  validatePasswordStrength,
  revokeRefreshToken,
  revokeAllUserTokens
} from '../services/authService.js';

/**
 * Test token generation
 */
export async function testTokenGeneration() {
  console.log('[Test] Testing token generation...');

  const userData = {
    id: 'test-user-1',
    email: 'test@example.com',
    role: 'admin'
  };

  try {
    const accessToken = generateAccessToken(userData);
    console.log('[Test] ✓ Access token generated');

    const refreshToken = generateRefreshToken(userData);
    console.log('[Test] ✓ Refresh token generated');

    // Verify tokens
    const decodedAccess = verifyAccessToken(accessToken);
    console.log('[Test] ✓ Access token verified');

    const decodedRefresh = verifyRefreshToken(refreshToken);
    console.log('[Test] ✓ Refresh token verified');

    return { success: true };
  } catch (error) {
    console.error('[Test] ✗ Token generation failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test password validation
 */
export async function testPasswordValidation() {
  console.log('[Test] Testing password validation...');

  const testCases = [
    { password: 'weak', shouldPass: false },
    { password: 'StrongP@ss123', shouldPass: true },
    { password: '12345678', shouldPass: false },
    { password: 'NoNumbers!', shouldPass: false }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const result = validatePasswordStrength(testCase.password);
    const actualPass = result.isValid;

    if (actualPass === testCase.shouldPass) {
      console.log(`[Test] ✓ Password "${testCase.password}" validation correct`);
      passed++;
    } else {
      console.error(`[Test] ✗ Password "${testCase.password}" validation incorrect`);
      failed++;
    }
  }

  return { success: failed === 0, passed, failed };
}

/**
 * Test token revocation
 */
export async function testTokenRevocation() {
  console.log('[Test] Testing token revocation...');

  const userData = {
    id: 'test-user-2',
    email: 'test2@example.com',
    role: 'editor'
  };

  try {
    const refreshToken = generateRefreshToken(userData);
    console.log('[Test] ✓ Refresh token generated');

    // Verify it works
    verifyRefreshToken(refreshToken);
    console.log('[Test] ✓ Refresh token verified');

    // Revoke it
    revokeRefreshToken(refreshToken);
    console.log('[Test] ✓ Refresh token revoked');

    // Try to verify again (should fail)
    try {
      verifyRefreshToken(refreshToken);
      console.error('[Test] ✗ Revoked token still valid');
      return { success: false };
    } catch (error) {
      console.log('[Test] ✓ Revoked token correctly rejected');
      return { success: true };
    }
  } catch (error) {
    console.error('[Test] ✗ Token revocation test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Run all tests
 */
export async function runAuthServiceTests() {
  console.log('\n========== AUTH SERVICE TESTS ==========\n');

  const results = [];

  results.push(await testTokenGeneration());
  results.push(await testPasswordValidation());
  results.push(await testTokenRevocation());

  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;

  console.log('\n========== TEST RESULTS ==========');
  console.log(`Total: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log('===================================\n');

  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    success: failedTests === 0
  };
}
