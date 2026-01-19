import 'dotenv/config';

// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.js:1',message:'Starting server/index.js imports',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
// #endregion

// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.js:5',message:'About to import app.js',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
// #endregion
import app from './app.js';
// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.js:8',message:'app.js imported successfully',data:{hasApp:!!app},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
// #endregion

// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.js:11',message:'About to import constants.js',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion
import { PORT } from './config/constants.js';
// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.js:13',message:'constants.js imported successfully',data:{port:PORT},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.js:16',message:'About to import database.js',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
// #endregion
import { initializeDatabaseInBackground } from './utils/database.js';
// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.js:18',message:'database.js imported successfully',data:{hasInitFn:!!initializeDatabaseInBackground},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
// #endregion

// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.js:21',message:'About to import themeSync.js',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
// #endregion
import { syncThemesFromFileSystem } from '../sparti-cms/services/themeSync.js';
// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.js:23',message:'themeSync.js imported successfully',data:{hasSyncFn:!!syncThemesFromFileSystem},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
// #endregion

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

