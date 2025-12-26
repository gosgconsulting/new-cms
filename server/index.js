import 'dotenv/config';
import app from './app.js';
import { PORT } from './config/constants.js';
import { initializeDatabaseInBackground } from './utils/database.js';
import { syncThemesFromFileSystem } from '../sparti-cms/services/themeSync.js';

// Verify dotenv loaded correctly
if (process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL) {
  console.log('[testing] dotenv loaded successfully - DATABASE_URL is set');
} else {
  console.log('[testing] WARNING: dotenv loaded but DATABASE_URL is not set');
}

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Graceful shutdown...');
  process.exit(0);
});

// Start server immediately, initialize database in background
function startServer() {
  // Start listening immediately so health checks work
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://0.0.0.0:${PORT}/health`);
    console.log(`Detailed health check available at http://0.0.0.0:${PORT}/health/detailed`);
    console.log(`Application available at http://0.0.0.0:${PORT}/`);
    console.log(`API endpoints available at http://0.0.0.0:${PORT}/api/`);
    console.log('[testing] Server started, initializing database in background...');
  });
  
  // Initialize database in the background (non-blocking)
  initializeDatabaseInBackground().then(() => {
    // After database is initialized, sync themes from file system
    console.log('[testing] Database initialized, syncing themes...');
    syncThemesFromFileSystem().then((result) => {
      if (result.success) {
        console.log(`[testing] Theme sync completed: ${result.message}`);
      } else {
        console.error(`[testing] Theme sync failed: ${result.message}`);
      }
    }).catch((error) => {
      console.error('[testing] Error syncing themes:', error);
    });
  });
}

// Start the server
startServer();

export default app;

