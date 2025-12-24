import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to keep in the root directory
const filesToKeep = [
  '.env',
  '.env.example',
  '.eslintrc.json',
  '.git',
  '.gitignore',
  'backend',
  'bun.lockb',
  'cleanup-files.js',
  'components.json',
  'dist',
  'docs',
  'eslint.config.js',
  'index.html',
  'node_modules',
  'package-lock.json',
  'package.json',
  'postcss.config.js',
  'public',
  'README.md',
  'sparti-cms',
  'src',
  'supabase',
  'tailwind.config.ts',
  'tsconfig.app.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
];

// Files to delete (server files that have been moved to backend)
const filesToDelete = [
  'server.js',
  'server-fixed.js',
  'server-working.js',
  'simple-server.js',
  'simple-server-updated.js',
  'simple-working-server.js',
  'minimal-test-server.js',
  'start-dev-with-db.js',
  'start-with-db.js',
  'start-server-with-db.bat',
  'start-server-with-db.ps1',
  'db-setup.js',
  'migrate-railway-db.js',
  'check-mcp-status.js',
  'check-component-types.js',
  'check-db-schema.js',
  'check-services-component.js',
  'test-api-endpoint.js',
  'test-api-endpoints.js',
  'test-cms-db-connection.js',
  'test-cms-integration.js',
  'test-contact-form.js',
  'test-db-queries.js',
  'test-direct-db-query.js',
  'test-form-submission.js',
  'test-google-api-simple.js',
  'test-leads-api.html',
  'test-mcp-connection.js',
  'test-minimal-server.js',
  'test-server-fixed.js',
  'test-server-js.js',
  'test-server-working.js',
  'test-simple-working-server.js',
  'fix-database-viewer.js',
  'FIX-DATABASE-VIEWER.bat',
  'start-mcp-direct.js',
  'start-mcp-fixed.bat',
  'start-mcp-postgres.bat',
  'start-mcp-postgres.js',
  'start-mcp-postgres.ps1',
  'start-mcp-postgres-persistent.js',
  'start-railway-postgres-mcp.js',
  'cleanup-temp-files.js',
  'cleanup-temp-server-files.js',
];

console.log('Starting cleanup...');

// Delete files
filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${file}`);
    } catch (err) {
      console.error(`Error deleting ${file}:`, err);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('Cleanup completed!');
