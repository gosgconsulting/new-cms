// Load environment variables first, before any other imports
import 'dotenv/config';

// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:2',message:'dotenv/config imported',data:{nodeVersion:process.version},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// Verify dotenv loaded correctly
if (process.env.DATABASE_URL) {
  console.log('[testing] dotenv loaded successfully - DATABASE_URL is set');
} else {
  console.log('[testing] WARNING: dotenv loaded but DATABASE_URL is not set');
  console.log('[testing] Make sure .env file exists and contains DATABASE_URL');
}

// #region agent log
fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:13',message:'About to import server/index.js',data:{hasDbUrl:!!process.env.DATABASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion

// Main server entry point - delegates to modular server structure
import('./server/index.js').then(() => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:16',message:'server/index.js imported successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
}).catch((importError) => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/6c8a92dc-f11e-4f7a-84d0-9dfb6f553501',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:19',message:'server/index.js import FAILED',data:{error:importError.message,stack:importError.stack,name:importError.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  console.error('[testing] CRITICAL: Failed to import server/index.js:', importError);
  process.exit(1);
});
