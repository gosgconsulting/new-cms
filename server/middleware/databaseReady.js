import { getDatabaseState } from '../utils/database.js';

// Middleware to check if database is initialized before processing requests
export const requireDatabaseReady = (req, res, next) => {
  const { dbInitialized, dbInitializationError } = getDatabaseState();
  
  if (!dbInitialized) {
    if (dbInitializationError) {
      return res.status(503).json({
        success: false,
        error: 'Database initialization failed',
        message: 'Please try again later'
      });
    }
    return res.status(503).json({
      success: false,
      error: 'Database is initializing',
      message: 'Please try again in a moment'
    });
  }
  next();
};

