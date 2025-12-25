import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { corsMiddleware } from '../middleware/cors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
export const app = express();

// CORS middleware (must be first, before any other middleware)
app.use(corsMiddleware);

// Basic middleware
app.use(express.json({ limit: '50mb' }));

// Export app directory for static file serving
export const appDir = __dirname;

