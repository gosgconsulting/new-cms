/**
 * Repository Tests
 * Tests for repository pattern implementation
 */

import UserRepository from '../repositories/UserRepository.js';
import PostRepository from '../repositories/PostRepository.js';
import MediaRepository from '../repositories/MediaRepository.js';

/**
 * Test UserRepository
 */
export async function testUserRepository() {
  console.log('[Test] Testing UserRepository...');

  try {
    // Test finding all users
    const users = await UserRepository.findAllSafe({}, { limit: 5 });
    console.log(`[Test] ✓ Found ${users.length} users`);

    // Verify no passwords in results
    const hasPassword = users.some(u => u.password);
    if (hasPassword) {
      console.error('[Test] ✗ Password field found in safe query');
      return { success: false };
    }
    console.log('[Test] ✓ No passwords in safe query results');

    // Test stats
    const stats = await UserRepository.getStats();
    console.log(`[Test] ✓ User stats: ${stats.total} total, ${stats.active} active`);

    return { success: true };
  } catch (error) {
    console.error('[Test] ✗ UserRepository test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test PostRepository
 */
export async function testPostRepository() {
  console.log('[Test] Testing PostRepository...');

  try {
    // Test finding published posts
    const posts = await PostRepository.findPublished(null, { limit: 5 });
    console.log(`[Test] ✓ Found ${posts.length} published posts`);

    // Test stats
    const stats = await PostRepository.getStats();
    console.log(`[Test] ✓ Post stats: ${stats.total} total, ${stats.published} published`);

    return { success: true };
  } catch (error) {
    console.error('[Test] ✗ PostRepository test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test MediaRepository
 */
export async function testMediaRepository() {
  console.log('[Test] Testing MediaRepository...');

  try {
    // Test finding all media
    const media = await MediaRepository.findAll({}, { limit: 5 });
    console.log(`[Test] ✓ Found ${media.length} media files`);

    // Test stats
    const stats = await MediaRepository.getStats();
    console.log(`[Test] ✓ Media stats: ${stats.total} total, ${stats.images} images`);

    return { success: true };
  } catch (error) {
    console.error('[Test] ✗ MediaRepository test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Run all repository tests
 */
export async function runRepositoryTests() {
  console.log('\n========== REPOSITORY TESTS ==========\n');

  const results = [];

  results.push(await testUserRepository());
  results.push(await testPostRepository());
  results.push(await testMediaRepository());

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
