import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { app } from './config/app.js';
import { corsMiddleware } from './middleware/cors.js';
import { ensureUploadsDir } from './utils/uploads.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
ensureUploadsDir();

// CORS middleware (must be first)
app.use(corsMiddleware);


// Routes (includes access key authentication middleware)
app.use(routes);

// Serve static files from the 'public' directory
app.use(express.static(join(__dirname, '..', 'public')));

// Serve static files from the dist directory - MUST come after API routes
app.use(express.static(join(__dirname, '..', 'dist')));

// Handle all other routes by serving the React app - MUST be last
app.use((req, res) => {
  const indexPath = join(__dirname, '..', 'dist', 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ 
      status: 'healthy', 
      message: 'Server is running but app not built',
      timestamp: new Date().toISOString() 
    });
  }
});

export default app;

