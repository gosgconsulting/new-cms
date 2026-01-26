import 'dotenv/config';
import app from './app.js';
import { PORT } from './config/constants.js';
import { initializeDatabaseInBackground } from './utils/database.js';
import { syncThemesFromFileSystem } from '../sparti-cms/services/themeSync.js';

// Validate PORT
if (!PORT || isNaN(Number(PORT)) || Number(PORT) < 1 || Number(PORT) > 65535) {
  console.error(`Invalid PORT: ${PORT}. PORT must be a number between 1 and 65535`);
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
  try {
    // Start listening immediately so health checks work
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at http://0.0.0.0:${PORT}/health`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error.message);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else if (error.code === 'EACCES') {
        console.error(`Permission denied to bind to port ${PORT}`);
      }
      setTimeout(() => {
        process.exit(1);
      }, 5000);
    });
    
    // Initialize database in the background (non-blocking)
    initializeDatabaseInBackground().then(() => {
      // After database is initialized, sync themes from file system
      syncThemesFromFileSystem().then((result) => {
        if (!result.success) {
          console.error(`Theme sync failed: ${result.message}`);
        }
      }).catch((error) => {
        console.error('Error syncing themes:', error.message);
      });
    }).catch((error) => {
      console.error('Database initialization error (non-fatal):', error.message);
      // Don't exit - server can still serve health checks
    });
  } catch (error) {
    console.error('Fatal error starting server:', error.message);
    console.error('Error stack:', error.stack);
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  }
}

// Start the server
startServer();

export default app;

