import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
export const app = express();

// Basic middleware
app.use(express.json());

// Export app directory for static file serving
export const appDir = __dirname;

