import 'dotenv/config';
import { spawn } from 'child_process';

// Use DATABASE_URL from .env (or Vercel). Set in .env for local dev.
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to .env for local development or use Vercel env in production.');
  process.exit(1);
}
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (process.env.DATABASE_URL && !process.env.DATABASE_PUBLIC_URL) {
  process.env.DATABASE_PUBLIC_URL = process.env.DATABASE_URL;
}

console.log('🚀 Starting development server with database...');
console.log('📊 Database: configured via DATABASE_URL');
console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('');

// Start the development server
const devProcess = spawn('npm', ['run', 'dev'], {
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
