import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import { getDatabaseState, getDatabaseDiagnostics, isMockDatabaseEnabled } from '../utils/database.js';
import { PORT } from '../config/constants.js';

const router = express.Router();

// Simple health check endpoint for Railway
router.get('/health', (req, res) => {
  const { dbInitialized } = getDatabaseState();
  const mock = isMockDatabaseEnabled();
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT,
    database: dbInitialized ? (mock ? 'mock' : 'ready') : 'initializing',
    mock: mock
  });
});

// Detailed health check with database connectivity
router.get('/health/detailed', async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    const mock = isMockDatabaseEnabled();
    
    if (!dbInitialized) {
      if (dbInitializationError) {
        return res.status(503).json({ 
          status: 'unhealthy', 
          timestamp: new Date().toISOString(),
          port: PORT,
          database: 'initialization_failed',
          error: dbInitializationError.message,
          mock
        });
      }
      return res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        port: PORT,
        database: 'initializing',
        mock
      });
    }
    
    if (mock) {
      // In mock mode, indicate connected (mock) without probing a real DB
      return res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        port: PORT,
        database: 'connected (mock)',
        mock: true
      });
    }

    // Check database connectivity
    await query('SELECT 1');
    
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      port: PORT,
      database: 'connected',
      mock: false
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

// Database diagnostic endpoint for troubleshooting login issues
router.get('/health/database', async (req, res) => {
  try {
    const diagnostics = await getDatabaseDiagnostics();
    
    // Determine overall status
    let status = 'healthy';
    let statusCode = 200;
    
    if (!diagnostics.connection.initialized) {
      status = 'unhealthy';
      statusCode = 503;
    } else if (!diagnostics.usersTable.exists) {
      status = 'unhealthy';
      statusCode = 503;
    } else if (diagnostics.sampleQuery && !diagnostics.sampleQuery.success) {
      status = 'unhealthy';
      statusCode = 503;
    }
    
    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      diagnostics,
      recommendations: getRecommendations(diagnostics)
    });
  } catch (error) {
    console.error('[testing] Database diagnostic endpoint failed:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      diagnostics: null
    });
  }
});

// Helper function to provide actionable recommendations
function getRecommendations(diagnostics) {
  const recommendations = [];
  
  if (!diagnostics.environment.hasDatabaseUrl && !diagnostics.environment.hasDatabasePublicUrl) {
    recommendations.push({
      issue: 'Missing database connection string',
      solution: 'Set DATABASE_URL or DATABASE_PUBLIC_URL environment variable',
      command: 'Check your .env file or environment variables'
    });
  }
  
  if (!diagnostics.connection.initialized) {
    if (diagnostics.connection.error) {
      if (diagnostics.connection.error.code === 'ECONNREFUSED' || 
          diagnostics.connection.error.code === 'ETIMEDOUT') {
        recommendations.push({
          issue: 'Database connection failed',
          solution: 'Check if database server is running and accessible',
          command: 'Verify DATABASE_URL points to a running PostgreSQL instance'
        });
      } else {
        recommendations.push({
          issue: 'Database initialization error',
          solution: 'Check database connection string and credentials',
          command: 'Verify DATABASE_URL format: postgresql://user:password@host:port/database'
        });
      }
    } else {
      recommendations.push({
        issue: 'Database is still initializing',
        solution: 'Wait a few moments and try again',
        command: 'Check server logs for initialization progress'
      });
    }
  }
  
  if (!diagnostics.usersTable.exists) {
    recommendations.push({
      issue: 'Users table does not exist',
      solution: 'Run database migrations to create required tables',
      command: 'npm run sequelize:migrate'
    });
  }
  
  if (diagnostics.sampleQuery && !diagnostics.sampleQuery.success) {
    recommendations.push({
      issue: 'Database query failed',
      solution: 'Check database permissions and connection',
      command: 'Verify database user has proper access rights'
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      issue: 'No issues detected',
      solution: 'Database appears to be healthy',
      command: 'If login still fails, check application logs for specific errors'
    });
  }
  
  return recommendations;
}

export default router;