import 'dotenv/config';
import app from './app.js';
import { PORT } from './config/constants.js';
import { initializeDatabaseInBackground } from './utils/database.js';
import { syncThemesFromFileSystem } from '../sparti-cms/services/themeSync.js';

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
    console.log('[Server] Server started, initializing database in background...');
  });
  
  // Initialize database in the background (non-blocking)
  initializeDatabaseInBackground().then(() => {
    // After database is initialized, sync themes from file system
    console.log('[Server] Database initialized, syncing themes...');
    syncThemesFromFileSystem().then((result) => {
      if (result.success) {
        console.log(`[Server] Theme sync completed: ${result.message}`);
      } else {
        console.error(`[Server] Theme sync failed: ${result.message}`);
      }
    }).catch((error) => {
      console.error('[Server] Error syncing themes:', error);
    });
  });
}

// Start the server
startServer();

export default app;

