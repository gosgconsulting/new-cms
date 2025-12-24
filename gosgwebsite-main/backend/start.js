import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting server...');

// Start the server
const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: process.env
});

// Handle server exit
server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Failed to start server:', err);
});
