import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import { getDatabaseState } from '../utils/database.js';
import { PORT } from '../config/constants.js';

const router = express.Router();

// Simple health check endpoint for Railway
router.get('/health', (req, res) => {
  const { dbInitialized } = getDatabaseState();
  // Always return 200 for basic health check - server is up
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT,
    database: dbInitialized ? 'ready' : 'initializing'
  });
});

// Detailed health check with database connectivity
router.get('/health/detailed', async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
    if (!dbInitialized) {
      if (dbInitializationError) {
        return res.status(503).json({ 
          status: 'unhealthy', 
          timestamp: new Date().toISOString(),
          port: PORT,
          database: 'initialization_failed',
          error: dbInitializationError.message
        });
      }
      return res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        port: PORT,
        database: 'initializing'
      });
    }
    
    // Check database connectivity
    await query('SELECT 1');
    
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      port: PORT,
      database: 'connected'
    });
  } catch (error) {
    console.error('[testing] Detailed health check failed:', error);
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      port: PORT,
      database: 'disconnected',
      error: error.message
    });
  }
});

export default router;

