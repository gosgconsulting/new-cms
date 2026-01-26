import 'dotenv/config';
import app from './app.js';
import { PORT } from './config/constants.js';
import { initializeDatabaseInBackground } from './utils/database.js';
import { syncThemesFromFileSystem } from '../sparti-cms/services/themeSync.js';

// Validate PORT
if (!PORT || isNaN(Number(PORT)) || Number(PORT) < 1 || Number(PORT) > 65535) {
  console.error(`[Server] ❌ Invalid PORT: ${PORT}`);
  console.error('[Server] PORT must be a number between 1 and 65535');
  console.error(`[Server] process.env.PORT: ${process.env.PORT || 'not set'}`);
  process.exit(1);
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
  console.log(`[Server] Attempting to start server on port ${PORT}...`);
  console.log(`[Server] NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`[Server] process.env.PORT: ${process.env.PORT || 'not set'}`);
  
  try {
    // Start listening immediately so health checks work
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] ✅ Server running on port ${PORT}`);
      console.log(`[Server] Health check available at http://0.0.0.0:${PORT}/health`);
      console.log(`[Server] Detailed health check available at http://0.0.0.0:${PORT}/health/detailed`);
      console.log(`[Server] Application available at http://0.0.0.0:${PORT}/`);
      console.log(`[Server] API endpoints available at http://0.0.0.0:${PORT}/api/`);
      console.log('[Server] Server started, initializing database in background...');
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('[Server] ❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`[Server] Port ${PORT} is already in use`);
        console.error('[Server] This might indicate another instance is running');
      } else if (error.code === 'EACCES') {
        console.error(`[Server] Permission denied to bind to port ${PORT}`);
        console.error('[Server] Try running with elevated permissions or use a different port');
      } else {
        console.error('[Server] Unexpected server error:', error.message);
        console.error('[Server] Error code:', error.code);
        console.error('[Server] Error stack:', error.stack);
      }
      // Don't exit immediately - let Railway see the error
      setTimeout(() => {
        console.error('[Server] Exiting due to server error...');
        process.exit(1);
      }, 5000);
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
    }).catch((error) => {
      console.error('[Server] Database initialization error (non-fatal):', error);
      // Don't exit - server can still serve health checks
    });
  } catch (error) {
    console.error('[Server] ❌ Fatal error starting server:', error);
    console.error('[Server] Error message:', error.message);
    console.error('[Server] Error stack:', error.stack);
    // Give a moment for logs to flush
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  }
}

// Start the server
startServer();

export default app;

