/**
 * Vitest Setup File
 * 
 * Configures test environment, database connections, and test utilities
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import 'dotenv/config';

// Set test environment variables
process.env.NODE_ENV = 'test';

// Use test database if specified, otherwise use mock mode
if (!process.env.TEST_DATABASE_URL && !process.env.DATABASE_URL) {
  process.env.MOCK_DATABASE = 'true';
  console.log('[Test Setup] Using mock database mode for tests');
} else {
  const testDbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  process.env.DATABASE_URL = testDbUrl;
  console.log('[Test Setup] Using test database:', testDbUrl?.replace(/:[^:@]+@/, ':****@'));
}

// Global test setup
beforeAll(async () => {
  // Any global setup before all tests
});

// Global test teardown
afterAll(async () => {
  // Any global cleanup after all tests
});

// Setup before each test
beforeEach(async () => {
  // Reset any test state if needed
});

// Cleanup after each test
afterEach(async () => {
  // Clean up test data if needed
});
