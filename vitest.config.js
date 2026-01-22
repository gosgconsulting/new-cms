import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'server/tests/**/*.test.js', 
      'server/tests/**/*.test.ts',
      // Frontend tests excluded until @testing-library/react and jsdom are installed
      // 'sparti-cms/components/**/__tests__/**/*.test.tsx',
      // 'sparti-cms/components/**/__tests__/**/*.test.ts'
    ],
    exclude: [
      'node_modules', 
      'dist',
      'server/tests/authService.test.js', // Old test format, not Vitest
      'server/tests/repositories.test.js', // Old test format, not Vitest
      // Exclude frontend tests until dependencies are installed
      'sparti-cms/components/**/__tests__/**/*.test.tsx',
      'sparti-cms/components/**/__tests__/**/*.test.ts',
    ],
    testTimeout: 10000,
    hookTimeout: 10000,
    // Setup test database connection
    setupFiles: ['./server/tests/setup.js'],
    // For React component tests, use jsdom environment
    // Uncomment and install @testing-library/react and jsdom to enable:
    // environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '~': resolve(__dirname, './'),
    },
  },
});
