// Start server with tenants support
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting server with tenants support...');

// Run the server with tenants support
const serverProcess = spawn('node', [join(__dirname, 'server-with-tenants.js')], {
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Received SIGINT. Stopping server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Stopping server...');
  serverProcess.kill('SIGTERM');
});
