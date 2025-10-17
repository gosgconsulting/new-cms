import { spawn } from 'child_process';

// Set environment variables for Railway PostgreSQL
process.env.DATABASE_URL = 'postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@trolley.proxy.rlwy.net:58867/railway';
process.env.DATABASE_PUBLIC_URL = 'postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@trolley.proxy.rlwy.net:58867/railway';
process.env.NODE_ENV = 'development';

console.log('🚀 Starting development server with Railway PostgreSQL...');
console.log('📊 Database:', 'trolley.proxy.rlwy.net:58867/railway');
console.log('🔧 Environment: development');
console.log('');

// Start the development server
const devProcess = spawn('npm.cmd', ['run', 'dev'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

devProcess.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
});

devProcess.on('error', (error) => {
  console.error('Error starting development server:', error);
});
