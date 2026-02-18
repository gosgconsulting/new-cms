import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../../sparti-cms/db/index.js';
import { authenticateUser } from '../middleware/auth.js';
import { generateToken } from '../utils/auth.js';
import { getDatabaseState, isMockDatabaseEnabled } from '../utils/database.js';
import { debugLog, debugError } from '../../sparti-cms/utils/debugLogger.js';

// Helper function to check if database connection is to localhost
const isLocalhostConnection = () => {
  const connString = process.env.DATABASE_URL || '';
  return connString.includes('localhost') || 
         connString.includes('127.0.0.1') || 
         connString.includes('::1');
};

// Helper function to generate localhost-specific error message
const getLocalhostErrorMessage = (errorCode, baseMessage) => {
  if (!isLocalhostConnection()) {
    return baseMessage;
  }
  
  const localhostGuidance = [
    '1. Verify PostgreSQL is running locally:',
    '   - Windows: Check Services or run: net start postgresql-x64-XX',
    '   - Mac/Linux: Check with: pg_isready or systemctl status postgresql',
    '2. Verify your connection string format in .env:',
    '   DATABASE_URL=postgresql://username:password@localhost:5432/database_name',
    '3. Check PostgreSQL credentials (username, password, database name)',
    '4. If SSL errors occur, add DATABASE_SSL=false to your .env file',
    '5. Verify PostgreSQL is listening on the correct port (default: 5432)'
  ].join('\n');
  
  return `${baseMessage}\n\nFor localhost connections:\n${localhostGuidance}`;
};
import {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  getTenantDatabaseDetails,
  setTenantDatabaseDetails,
  generateTenantApiKey,
  getTenantApiKeys,
  deleteTenantApiKey,
  validateApiKey
} from '../../sparti-cms/db/tenant-management.js';
import { initializeTenantDefaults } from '../../sparti-cms/db/tenant-initialization.js';
import { createPage } from '../../sparti-cms/db/modules/pages.js';
import { updateSiteSchema } from '../../sparti-cms/db/modules/branding.js';
import { getThemeBySlug } from '../../sparti-cms/services/themeSync.js';

const router = express.Router();

// ===== AUTHENTICATION ROUTES =====

// Async error handler wrapper
// Properly handles async route handlers and ensures promises are returned to Express
const asyncHandler = (fn) => (req, res, next) => {
  // Execute the async function and get the promise
  // This ensures Express properly awaits the async operation
  const promise = Promise.resolve(fn(req, res, next));
  
  // Handle promise rejection (async errors)
  promise.catch((error) => {
    debugError('========== UNHANDLED ASYNC ERROR ==========');
    debugError('Unhandled async error in route handler:', error);
    debugError('Error type:', error?.constructor?.name || 'Unknown');
    debugError('Error message:', error?.message);
    debugError('Error code:', error?.code || 'N/A');
    debugError('Error stack:', error?.stack);
    debugError('Request path:', req.path);
    debugError('Request method:', req.method);
    debugError('Request URL:', req.url);
    debugError('Request originalUrl:', req.originalUrl);
    debugError('============================================');
    
    if (!res.headersSent) {
      // Provide better error messages in development mode
      const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
      const errorMessage = isDevelopment && error?.message
        ? `Server error: ${error.message}${error?.code ? ` (Code: ${error.code})` : ''}`
        : 'Server error. Please try again in a moment.';
      
      try {
        res.status(500).json({
          success: false,
          error: errorMessage,
          message: errorMessage,
          diagnostic: '/health/database',
          errorCode: error?.code,
          ...(isDevelopment && error?.stack ? { stack: error.stack } : {})
        });
      } catch (sendError) {
        debugError('Failed to send error response:', sendError);
      }
    } else {
      debugError('Response already sent, cannot send error response');
    }
  });
  
  // Return the promise to Express so it can properly await the async operation
  return promise;
};

// Login endpoint
router.post('/auth/login', asyncHandler(async (req, res) => {
  debugLog(' Login attempt started');
  debugLog(' Request method:', req.method);
  debugLog(' Request path:', req.path);
  debugLog(' Request body:', JSON.stringify(req.body));
  debugLog(' Request headers:', JSON.stringify(req.headers));

  // If we're in mock DB mode, login via DB is not supported.
  // Return a clean 503 (instead of crashing on missing tables).
  if (isMockDatabaseEnabled()) {
    return res.status(503).json({
      success: false,
      error: 'Database is not configured',
      message:
        'This environment is running in mock database mode (no DATABASE_URL configured). Login is unavailable. Use the "Create Admin User" button for local/demo access, or connect a real database to enable authentication.'
    });
  }
  
  // Ensure response hasn't been sent by middleware
  if (res.headersSent) {
    debugError(' Response already sent by middleware, aborting login handler');
    return;
  }
  
  try {
    // Step 1: Check database initialization state
    debugLog(' Step 1: Checking database initialization state...');
    let dbState;
    try {
      dbState = getDatabaseState();
      debugLog(' Database state:', {
        initialized: dbState.dbInitialized,
        hasError: !!dbState.dbInitializationError
      });
    } catch (stateError) {
      debugError(' Error getting database state:', stateError);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: 'Server configuration error',
          message: 'Unable to check database state. Please check server logs.'
        });
      }
      return;
    }
    
    const { dbInitialized, dbInitializationError } = dbState;
    
    // Check if database is ready
    if (!dbInitialized) {
      debugError(' Database not initialized');
      if (dbInitializationError) {
        debugError(' Database initialization error:', dbInitializationError.message);
        return res.status(503).json({
          success: false,
          error: 'Database initialization failed',
          message: `Database connection failed: ${dbInitializationError.message}. Check DATABASE_URL environment variable in your .env file.`,
          diagnostic: '/health/database'
        });
      }
      return res.status(503).json({
        success: false,
        error: 'Database is initializing',
        message: 'Database is still connecting. Please try again in a moment.',
        diagnostic: '/health/database'
      });
    }
    debugLog(' Database is initialized');

    // Step 2: Validate input
    debugLog(' Step 2: Validating input...');
    debugLog(' Request body type:', typeof req.body);
    debugLog(' Request body keys:', req.body ? Object.keys(req.body) : 'null/undefined');
    debugLog(' Content-Type header:', req.headers['content-type']);
    
    const { email, password } = req.body || {};
    
    // Check if body is empty or missing
    if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
      debugError(' Request body is missing or invalid:', req.body);
      debugError(' Raw request body:', req.rawBody || 'not available');
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        message: 'Request body must be valid JSON with email and password fields. Make sure Content-Type is application/json.'
      });
    }
    
    // Validate email and password are present and not empty
    if (!email || typeof email !== 'string' || email.trim() === '') {
      debugError(' Missing or invalid email. Received:', email);
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        message: 'Please provide a valid email address'
      });
    }
    
    if (!password || typeof password !== 'string' || password.trim() === '') {
      debugError(' Missing or invalid password');
      return res.status(400).json({
        success: false,
        error: 'Password is required',
        message: 'Please provide a password'
      });
    }
    
    debugLog(' Input validated, email:', email);

    // Capture tenant from header or query for master DB tenant scoping
    const requestedTenantId = req.headers['x-tenant-id'] || req.headers['X-Tenant-Id'] || req.query.tenantId || null;
    if (requestedTenantId) {
      debugLog(' Requested tenant for login:', requestedTenantId);
    } else {
      debugLog(' No tenantId provided in headers/query; login will be unscoped (super admins allowed, tenant users must match by email only)');
    }

    // Capture theme slug from query or header for theme-scoped login
    const requestedThemeSlug = req.query.themeSlug || req.headers['x-theme-slug'] || req.headers['X-Theme-Slug'] || null;
    if (requestedThemeSlug) {
      debugLog(' Requested theme for login:', requestedThemeSlug);
    }

    // Step 3: Check if users table exists
    debugLog(' Step 3: Checking if users table exists...');
    try {
      const tableCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);
      
      const tableExists = tableCheck?.rows?.[0]?.exists === true;
      debugLog(' Users table exists:', tableExists);
      
      if (!tableExists) {
        debugError(' Users table does not exist');
        return res.status(503).json({
          success: false,
          error: 'Database not fully initialized',
          message: 'Required authentication tables are missing. Please initialize the database schema.',
          diagnostic: '/health/database'
        });
      }
    } catch (checkError) {
      debugError(' Error checking users table existence:', checkError);
      debugError(' Check error details:', {
        code: checkError?.code,
        message: checkError?.message,
        errno: checkError?.errno,
        syscall: checkError?.syscall
      });
      
      // Check if response was already sent
      if (res.headersSent) {
        debugError(' Response already sent, cannot send error response');
        return;
      }
      
      // Provide specific error messages based on error type
      if (checkError?.code === 'ECONNREFUSED' || checkError?.code === 'ETIMEDOUT' || checkError?.code === 'ECONNRESET') {
        const baseMessage = 'Unable to connect to database. Check DATABASE_URL environment variable in your .env file and ensure database server is running.';
        return res.status(503).json({
          success: false,
          error: 'Database connection failed',
          message: getLocalhostErrorMessage(checkError?.code, baseMessage),
          diagnostic: '/health/database',
          errorCode: checkError?.code
        });
      }
      
      return res.status(503).json({
        success: false,
        error: 'Database error',
        message: `Unable to verify database state: ${checkError?.message || 'Unknown error'}. Check server logs for details.`,
        diagnostic: '/health/database'
      });
    }

    // Step 4: Test database connection before querying
    debugLog(' Step 4: Testing database connection...');
    try {
      await query('SELECT 1');
      debugLog(' Database connection test successful');
    } catch (connectionTestError) {
      debugError(' Database connection test failed:', connectionTestError);
      debugError(' Connection test error details:', {
        code: connectionTestError?.code,
        message: connectionTestError?.message
      });
      
      if (res.headersSent) {
        debugError(' Response already sent, cannot send error response');
        return;
      }
      
      if (connectionTestError?.code === 'ECONNREFUSED' || connectionTestError?.code === 'ETIMEDOUT' || connectionTestError?.code === 'ECONNRESET') {
        const baseMessage = 'Unable to connect to database. If DATABASE_URL points to localhost, ensure Postgres is running locally. For cloud databases, use the full connection string in DATABASE_URL.';
        return res.status(503).json({
          success: false,
          error: 'Database connection failed',
          message: getLocalhostErrorMessage(connectionTestError?.code, baseMessage),
          diagnostic: '/health/database',
          errorCode: connectionTestError?.code
        });
      }
      
      return res.status(503).json({
        success: false,
        error: 'Database connection error',
          message: `Database connection test failed: ${connectionTestError?.message || 'Unknown error'}. Check DATABASE_URL environment variable in your .env file.`,
        diagnostic: '/health/database',
        errorCode: connectionTestError?.code
      });
    }

    // Step 5: Querying user by email (tenant-scoped if provided)
    debugLog(' Step 5: Querying user by email...');
    let userResult;
    try {
      if (requestedTenantId) {
        // Restrict to requested tenant unless super admin
        debugLog(' Querying with tenant filter:', requestedTenantId);
        userResult = await query(
          `SELECT id, first_name, last_name, email, password_hash, role, is_active, status,
           tenant_id, COALESCE(is_super_admin, false) as is_super_admin
           FROM users
           WHERE email = $1 AND (tenant_id = $2 OR COALESCE(is_super_admin, false) = true)
           LIMIT 1`,
          [email, requestedTenantId]
        );
      } else {
        // No tenant provided: allow super admins or any matching email (legacy behavior)
        debugLog(' Querying without tenant filter');
        userResult = await query(
          `SELECT id, first_name, last_name, email, password_hash, role, is_active, status,
           tenant_id, COALESCE(is_super_admin, false) as is_super_admin
           FROM users
           WHERE email = $1
           LIMIT 1`,
          [email]
        );
      }
      debugLog(' User query completed, found', userResult.rows.length, 'user(s)');
    } catch (queryError) {
      debugError(' ========== USER QUERY ERROR ==========');
      debugError(' Query error type:', queryError?.constructor?.name);
      debugError(' Query error message:', queryError?.message);
      debugError(' Query error code:', queryError?.code);
      debugError(' Query error stack:', queryError?.stack);
      debugError(' =======================================');
      debugError(' Database query error during login:', queryError);
      debugError(' Query error details:', {
        code: queryError?.code,
        message: queryError?.message,
        errno: queryError?.errno,
        syscall: queryError?.syscall,
        stack: queryError?.stack
      });
      
      // Check if response was already sent
      if (res.headersSent) {
        debugError(' Response already sent, cannot send error response');
        return;
      }
      
      // Handle specific database errors with actionable messages
      if (queryError?.code === '42P01') {
        return res.status(503).json({
          success: false,
          error: 'Database table missing',
          message: 'Users table does not exist. Run: npm run sequelize:migrate',
          diagnostic: '/health/database',
          errorCode: queryError.code
        });
      }
      
      if (queryError?.code === 'ECONNREFUSED' || queryError?.code === 'ETIMEDOUT' || queryError?.code === 'ECONNRESET') {
        const baseMessage = 'Unable to connect to database. Check DATABASE_URL environment variable in your .env file and ensure database server is running.';
        return res.status(503).json({
          success: false,
          error: 'Database connection failed',
          message: getLocalhostErrorMessage(queryError?.code, baseMessage),
          diagnostic: '/health/database',
          errorCode: queryError.code
        });
      }
      
      // PostgreSQL error codes (42xxx)
      if (queryError?.code && queryError.code.startsWith('42')) {
        return res.status(500).json({
          success: false,
          error: 'Database query error',
          message: `Database query failed (PostgreSQL error ${queryError.code}): ${queryError.message || 'Unknown error'}. Check server logs for details.`,
          diagnostic: '/health/database',
          errorCode: queryError.code
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Database query failed',
        message: `Unable to verify credentials: ${queryError?.message || 'Unknown error'}. Check server logs for details.`,
        diagnostic: '/health/database',
        errorCode: queryError?.code
      });
    }

    // Step 6: Validate user exists
    debugLog(' Step 6: Validating user...');
    if (userResult.rows.length === 0) {
      debugLog(' No user found with email:', email, 'for tenant:', requestedTenantId || '(none)');
      // If tenant was provided, return clearer message
      if (requestedTenantId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied for tenant or invalid credentials',
          message: 'This account is not associated with the selected tenant.'
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];
    debugLog(' User found:', user.email, 'ID:', user.id, 'tenant_id:', user.tenant_id, 'super_admin:', user.is_super_admin);

    // Check if user is active and approved
    if (!user.is_active) {
      debugError(' User account is not active:', user.email);
      return res.status(401).json({
        success: false,
        error: 'Account is not active'
      });
    }
    if (user.status && user.status !== 'active') {
      debugError(' User account status not active (', user.status, '):', user.email);
      return res.status(401).json({
        success: false,
        error: 'Account pending approval'
      });
    }

    // Check if password_hash exists
    if (!user.password_hash) {
      debugError(' User has no password_hash:', user.email);
      return res.status(401).json({
        success: false,
        error: 'Account configuration error. Please contact support.'
      });
    }

    // Step 7: Verify password
    debugLog(' Step 7: Verifying password...');
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.password_hash);
      debugLog(' Password verification result:', isValidPassword);
    } catch (bcryptError) {
      debugError(' Bcrypt comparison error:', bcryptError);
      debugError(' Bcrypt error details:', {
        message: bcryptError?.message,
        stack: bcryptError?.stack
      });
      
      if (res.headersSent) {
        debugError(' Response already sent, cannot send error response');
        return;
      }
      
      return res.status(500).json({
        success: false,
        error: 'Password verification failed',
        message: 'An error occurred while verifying password. Please try again.'
      });
    }
    
    if (!isValidPassword) {
      debugLog(' Invalid password for user:', user.email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Step 7.5: Validate theme-tenant relationship if theme context provided
    if (requestedThemeSlug && !user.is_super_admin && user.tenant_id) {
      debugLog(' Validating theme-tenant relationship...');
      debugLog(' Theme validation params:', { tenant_id: user.tenant_id, themeSlug: requestedThemeSlug });
      try {
        // Validate parameters before querying
        if (!user.tenant_id || !requestedThemeSlug) {
          debugError(' Invalid parameters for theme validation:', { tenant_id: user.tenant_id, themeSlug: requestedThemeSlug });
          if (res.headersSent) {
            return;
          }
          return res.status(400).json({
            success: false,
            error: 'Invalid theme validation parameters',
            message: 'Missing tenant ID or theme slug for validation.'
          });
        }
        
        // Check if user's tenant uses the requested theme
        const tenantThemeCheck = await query(`
          SELECT id, name, slug, theme_id
          FROM tenants
          WHERE id = $1 AND theme_id = $2
          LIMIT 1
        `, [user.tenant_id, requestedThemeSlug]);

        if (tenantThemeCheck.rows.length === 0) {
          debugLog(' User tenant does not use requested theme');
          if (res.headersSent) {
            debugError(' Response already sent, cannot send error response');
            return;
          }
          return res.status(403).json({
            success: false,
            error: 'Access denied',
            message: 'Your tenant does not use this theme. You can only access themes assigned to your tenant.',
            code: 'TENANT_THEME_MISMATCH'
          });
        }
        debugLog(' Theme-tenant relationship validated successfully');
      } catch (themeCheckError) {
        debugError(' Error validating theme-tenant relationship:', themeCheckError);
        debugError(' Theme check error details:', {
          code: themeCheckError?.code,
          message: themeCheckError?.message,
          stack: themeCheckError?.stack
        });
        
        if (res.headersSent) {
          debugError(' Response already sent, cannot send error response');
          return;
        }
        
        // Handle specific database errors
        if (themeCheckError?.code === '42P01') {
          return res.status(503).json({
            success: false,
            error: 'Database table missing',
            message: 'Tenants table does not exist. Run: npm run sequelize:migrate',
            diagnostic: '/health/database',
            errorCode: themeCheckError.code
          });
        }
        
        if (themeCheckError?.code === 'ECONNREFUSED' || themeCheckError?.code === 'ETIMEDOUT' || themeCheckError?.code === 'ECONNRESET') {
          const baseMessage = 'Unable to connect to database. Check DATABASE_URL environment variable in your .env file and ensure database server is running.';
          return res.status(503).json({
            success: false,
            error: 'Database connection failed',
            message: getLocalhostErrorMessage(themeCheckError?.code, baseMessage),
            diagnostic: '/health/database',
            errorCode: themeCheckError.code
          });
        }
        
        return res.status(500).json({
          success: false,
          error: 'Theme validation failed',
          message: `Unable to verify theme access: ${themeCheckError?.message || 'Unknown error'}. Please try again later.`,
          errorCode: themeCheckError?.code
        });
      }
    }

    // Step 8: Create JWT token using centralized utility
    debugLog(' Step 8: Creating JWT token...');
    // For super admins, use requested tenantId if provided to set a default context; otherwise null
    const tenantId = user.is_super_admin ? (requestedTenantId || null) : user.tenant_id;
    const userData = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      tenant_id: tenantId,
      is_super_admin: user.is_super_admin || false,
      // Include theme context in token if provided (for downstream validation)
      themeSlug: requestedThemeSlug || null
    };
    
    let token;
    try {
      token = generateToken(userData);
      debugLog(' JWT token created successfully');
    } catch (tokenError) {
      debugError(' Token generation error:', tokenError);
      debugError(' Token error details:', {
        message: tokenError?.message,
        stack: tokenError?.stack
      });
      
      if (res.headersSent) {
        debugError(' Response already sent, cannot send error response');
        return;
      }
      
      return res.status(500).json({
        success: false,
        error: 'Token generation failed',
        message: tokenError.message || 'An error occurred while generating authentication token. Please try again.'
      });
    }

    // Step 9: Return user data with token
    debugLog(' Step 9: Sending success response...');
    // Check if response was already sent (shouldn't happen, but safety check)
    if (res.headersSent) {
      debugError(' Response already sent, cannot send success response');
      return;
    }
    
    debugLog(' Login successful for user:', user.email);
    res.json({
      success: true,
      user: userData,
      token: token
    });

  } catch (error) {
    debugError(' ========== LOGIN ERROR ==========');
    debugError(' Login error:', error);
    debugError(' Login error code:', error?.code);
    debugError(' Login error message:', error?.message);
    debugError(' Login error name:', error?.name);
    debugError(' Login error errno:', error?.errno);
    debugError(' Login error syscall:', error?.syscall);
    debugError(' Login error stack:', error?.stack);
    debugError(' ===================================');
    
    // Ensure we always send a valid JSON response
    if (res.headersSent) {
      debugError(' Response already sent, cannot send error response');
      return;
    }
    
    // Handle database connection errors
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT' || error?.code === 'ENOTFOUND' || error?.code === 'ECONNRESET' || error?.code === 'ENETUNREACH') {
      const baseMessage = `Unable to connect to database (${error.code}). Check DATABASE_URL environment variable in your .env file and ensure database server is running.`;
      return res.status(503).json({
        success: false,
        error: 'Database connection failed',
        message: getLocalhostErrorMessage(error.code, baseMessage),
        diagnostic: '/health/database',
        errorCode: error.code
      });
    }
    
    // Handle SSL/TLS connection errors
    if (error?.code === 'EPROTO' || error?.code === 'ETLS' || error?.message?.includes('SSL') || error?.message?.includes('TLS')) {
      return res.status(503).json({
        success: false,
        error: 'Database SSL connection failed',
        message: `SSL/TLS connection error: ${error.message}. For localhost connections, you may need to disable SSL by setting DATABASE_SSL=false in your .env file.`,
        diagnostic: '/health/database',
        errorCode: error.code
      });
    }
    
    // Handle database not ready errors
    let dbState;
    try {
      dbState = getDatabaseState();
    } catch (stateError) {
      debugError(' Error getting database state in catch block:', stateError);
    }
    
    if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
      if (dbState && !dbState.dbInitialized) {
        return res.status(503).json({
          success: false,
          error: 'Database is initializing',
          message: 'Database is still connecting. Please try again in a moment.',
          diagnostic: '/health/database'
        });
      }
      return res.status(503).json({
        success: false,
        error: 'Database table missing',
        message: 'Required database tables are missing. Please initialize the database schema.',
        diagnostic: '/health/database',
        errorCode: error.code
      });
    }
    
    // Handle PostgreSQL query errors (42xxx)
    if (error?.code && error.code.startsWith('42')) {
      return res.status(500).json({
        success: false,
        error: 'Database query error',
        message: `Database query failed (PostgreSQL error ${error.code}): ${error.message || 'Unknown error'}. Check server logs for details.`,
        diagnostic: '/health/database',
        errorCode: error.code
      });
    }
    
    // Log full error details for debugging
    debugError(' ========== UNHANDLED LOGIN ERROR ==========');
    debugError(' Error type:', error?.constructor?.name || 'Unknown');
    debugError(' Error message:', error?.message);
    debugError(' Error code:', error?.code || 'N/A');
    debugError(' Error stack:', error?.stack);
    debugError(' ===========================================');
    
    // Generic error - but include more details in development
    // Always show detailed error in development, or if error message is available
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
    const errorMessage = isDevelopment && error?.message
      ? `Login failed: ${error.message}${error?.code ? ` (Code: ${error.code})` : ''}`
      : error?.message || 'Server error. Please try again in a moment.';
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: errorMessage,
        message: errorMessage,
        diagnostic: '/health/database',
        errorCode: error?.code,
        ...(isDevelopment && error?.stack ? { stack: error.stack } : {})
      });
    }
  }
}));

// REGISTER endpoint expected by the frontend
router.post('/auth/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Basic validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'first_name, last_name, email, and password are required'
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Ensure DB is initialized
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        error: dbInitializationError ? 'Database initialization failed' : 'Database is initializing',
        message: dbInitializationError ? dbInitializationError.message : 'Please try again in a moment'
      });
    }

    // Check users table exists
    const check = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    if (!check.rows[0].exists) {
      return res.status(503).json({
        success: false,
        error: 'Database not fully initialized',
        message: 'Users table is missing. Run: npm run sequelize:migrate'
      });
    }

    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists',
        message: 'A user with this email already exists'
      });
    }

    // Hash password using bcrypt (consistent with other routes)
    const password_hash = await bcrypt.hash(password, 10);

    // Create user as pending/disabled until approved
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, status, is_active)
       VALUES ($1, $2, $3, $4, 'user', 'pending', false)
       RETURNING id, first_name, last_name, email, role, status, is_active`,
      [first_name, last_name, email, password_hash]
    );

    return res.status(201).json({
      success: true,
      user: result.rows[0],
      message: 'Registration successful! Your account is pending approval.'
    });
  } catch (error) {
    debugError(' Registration error:', error);
    if (error?.code === '42P01') {
      return res.status(503).json({
        success: false,
        error: 'Database table missing',
        message: 'Users table does not exist. Run: npm run sequelize:migrate'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error?.message || 'Unknown error'
    });
  }
});

// Get current user from token
router.get('/auth/me', authenticateUser, async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
    // Check if database is ready
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

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
    }

    const userId = req.user.id;
    
    let userResult;
    try {
      // Query user - handle NULL tenant_id for super admins
      userResult = await query(
        `SELECT id, first_name, last_name, email, role, status, 
         tenant_id, 
         COALESCE(is_super_admin, false) as is_super_admin 
         FROM users WHERE id = $1`,
        [userId]
      );
    } catch (queryError) {
      debugError(' Database query error in /auth/me:', queryError);
      return res.status(500).json({
        success: false,
        error: 'Database query failed',
        message: 'Unable to fetch user data. Please try again later.'
      });
    }

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Check if user is active (check both status and is_active for compatibility)
    const isActive = (user.status === 'active' || user.status === undefined) && (user.is_active !== false);
    if (!isActive) {
      return res.status(401).json({ success: false, error: 'Account is not active' });
    }

    // Ensure super admin accounts have tenant_id = NULL
    const tenantId = user.is_super_admin ? null : user.tenant_id;

    res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        tenant_id: tenantId,
        is_super_admin: user.is_super_admin || false
      }
    });

  } catch (error) {
    debugError(' Error fetching current user:', error);
    
    // Handle database not ready errors gracefully
    const { dbInitialized } = getDatabaseState();
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      if (!dbInitialized) {
        return res.status(503).json({
          success: false,
          error: 'Database is initializing',
          message: 'Please try again in a moment'
        });
      }
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user data.' 
    });
  }
});

// Verify access key and return user data
router.get('/auth/verify-access-key', async (req, res) => {
  try {
    const { access_key } = req.query;

    if (!access_key) {
      return res.status(400).json({
        success: false,
        error: 'Access key is required'
      });
    }

    // Find the access key and get user data
    const result = await query(`
      SELECT 
        uak.id as key_id,
        uak.access_key,
        uak.key_name,
        uak.last_used_at,
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.is_active,
        u.tenant_id,
        u.is_super_admin
      FROM user_access_keys uak
      JOIN users u ON uak.user_id = u.id
      WHERE uak.access_key = $1 AND uak.is_active = true
    `, [access_key]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired access key'
      });
    }

    const keyData = result.rows[0];

    // Check if user is active
    if (!keyData.is_active) {
      return res.status(401).json({
        success: false,
        error: 'User account is not active'
      });
    }

    // Update last_used_at timestamp
    await query(
      'UPDATE user_access_keys SET last_used_at = NOW() WHERE id = $1',
      [keyData.key_id]
    );

    res.json({
      success: true,
      user: {
        id: keyData.id,
        first_name: keyData.first_name,
        last_name: keyData.last_name,
        email: keyData.email,
        role: keyData.role,
        tenant_id: keyData.tenant_id,
        is_super_admin: keyData.is_super_admin
      },
      access_key_info: {
        key_name: keyData.key_name,
        last_used_at: keyData.last_used_at
      }
    });

  } catch (error) {
    debugError(' Error verifying access key:', error);
    debugError(' Error details:', error.message);
    debugError(' Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to verify access key'
    });
  }
});

// ===== ACCESS KEYS MANAGEMENT ROUTES =====

// Generate new access key
router.post('/access-keys/generate', authenticateUser, async (req, res) => {
  try {
    const { key_name } = req.body;
    const userId = req.user.id;

    if (!key_name || key_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Key name is required'
      });
    }

    // Generate a unique access key (UUID v4)
    const { v4: uuidv4 } = await import('uuid');
    const accessKey = uuidv4();

    // Insert the new access key
    const result = await query(
      'INSERT INTO user_access_keys (user_id, access_key, key_name) VALUES ($1, $2, $3) RETURNING id, access_key, key_name, created_at',
      [userId, accessKey, key_name.trim()]
    );

    const newKey = result.rows[0];

    res.json({
      success: true,
      access_key: newKey.access_key,
      key_name: newKey.key_name,
      created_at: newKey.created_at,
      message: 'Access key generated successfully. Save this key - it won\'t be shown again.'
    });

  } catch (error) {
    debugError(' Error generating access key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate access key'
    });
  }
});

// List user's access keys
router.get('/access-keys', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { include_inactive } = req.query;

    let queryStr = `
      SELECT id, key_name, access_key, is_active, last_used_at, created_at, updated_at
      FROM user_access_keys 
      WHERE user_id = $1
    `;
    const queryParams = [userId];

    if (include_inactive !== 'true') {
      queryStr += ' AND is_active = true';
    }

    queryStr += ' ORDER BY created_at DESC';

    const result = await query(queryStr, queryParams);

    // Mask the access keys for security
    const maskedKeys = result.rows.map(key => ({
      ...key,
      access_key: key.access_key.length > 8 
        ? key.access_key.substring(0, 4) + '...' + key.access_key.substring(key.access_key.length - 4)
        : '****'
    }));

    res.json({
      success: true,
      access_keys: maskedKeys
    });

  } catch (error) {
    debugError(' Error fetching access keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch access keys'
    });
  }
});

// Revoke access key
router.delete('/access-keys/:keyId', authenticateUser, async (req, res) => {
  try {
    const { keyId } = req.params;
    const userId = req.user.id;

    // Verify the key belongs to the user
    const checkResult = await query(
      'SELECT id FROM user_access_keys WHERE id = $1 AND user_id = $2',
      [keyId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Access key not found or you do not have permission to revoke it'
      });
    }

    // Revoke the key (set is_active to false)
    await query(
      'UPDATE user_access_keys SET is_active = false, updated_at = NOW() WHERE id = $1',
      [keyId]
    );

    res.json({
      success: true,
      message: 'Access key revoked successfully'
    });

  } catch (error) {
    debugError(' Error revoking access key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke access key'
    });
  }
});

// ===== TENANT ROUTES =====

// Get all tenants
router.get('/tenants', authenticateUser, async (req, res) => {
  try {
    if (!req.user.is_super_admin) {
      // For non-super-admins, return only their tenant with full data
      if (req.tenantId) {
        const tenant = await getTenantById(req.tenantId);
        return res.json(tenant ? [tenant] : []);
      }
      return res.json([]);
    }
    // Fetch all tenants with full data for super admin
    const tenants = await getAllTenants();
    res.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// Get tenant by ID
router.get('/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await getTenantById(id);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json(tenant);
  } catch (error) {
    console.error(`[testing] Error getting tenant with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get tenant' });
  }
});

// Create a new tenant
router.post('/tenants', async (req, res) => {
  try {
    const { name, template } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Tenant name is required' });
    }
    
    // Set theme_id: use theme value if provided and not 'custom', otherwise null
    const theme_id = template && template !== 'custom' ? template : null;
    
    // Validate theme exists if provided
    if (theme_id) {
      const themeRecord = await getThemeBySlug(theme_id);
      if (!themeRecord) {
        return res.status(400).json({ 
          error: 'Invalid theme',
          message: `Theme "${theme_id}" does not exist in the themes table. Please ensure the theme is synced from the file system.`
        });
      }
      if (!themeRecord.is_active) {
        return res.status(400).json({
          error: 'Theme is not active',
          message: `Theme "${theme_id}" exists but is marked as inactive.`
        });
      }
    }
    
    const newTenant = await createTenant({ name, theme_id });
    
    // Include initialization summary in response if available
    const response = {
      ...newTenant,
      message: 'Tenant created successfully'
    };
    
    if (newTenant.initialization) {
      const init = newTenant.initialization;
      const summary = init.summary || {};
      const totalInitialized = summary.total || 0;
      
      response.initialization = {
        success: true,
        summary: {
          settings: summary.settings || 0,
          branding: summary.branding || 0,
          sitemap: summary.sitemap || 0,
          media_folders: summary.media_folders || 0,
          robots: summary.robots || 0,
          categories: summary.categories || 0,
          tags: summary.tags || 0,
          total: totalInitialized
        },
        message: `Tenant initialized with ${totalInitialized} default records`
      };
    }
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// Import theme data to a tenant
router.post('/tenants/:id/import-theme', authenticateUser, async (req, res) => {
  try {
    const { id: tenantId } = req.params;
    const { theme } = req.body;
    
    if (!theme) {
      return res.status(400).json({ error: 'Theme name is required' });
    }
    
    // Verify tenant exists
    const tenant = await getTenantById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Validate theme exists in themes table
    const themeRecord = await getThemeBySlug(theme);
    if (!themeRecord) {
      return res.status(404).json({ 
        error: 'Theme not found',
        message: `Theme "${theme}" does not exist in the themes table. Please ensure the theme is synced from the file system.`
      });
    }
    
    if (!themeRecord.is_active) {
      return res.status(400).json({
        error: 'Theme is not active',
        message: `Theme "${theme}" exists but is marked as inactive.`
      });
    }
    
    // Update tenant's theme_id if not already set
    if (!tenant.theme_id) {
      await updateTenant(tenantId, { theme_id: theme });
    }
    
    // Get theme pages (hardcoded for now)
    const getThemePages = () => {
      if (theme === 'landingpage') {
        return [
          {
            page_name: 'Homepage',
            slug: '/',
            meta_title: 'Homepage',
            meta_description: 'Welcome to our homepage',
            seo_index: true,
            status: 'published',
            page_type: 'page'
          }
        ];
      }
      return [];
    };
    
    const themePages = getThemePages();
    const importedPages = [];
    
    // Import pages
    for (const pageData of themePages) {
      try {
        const createdPage = await createPage({
          ...pageData,
          tenant_id: tenantId
        });
        importedPages.push(createdPage);
      } catch (error) {
        console.error(`[testing] Error importing page ${pageData.page_name}:`, error);
        // Continue with other pages even if one fails
      }
    }
    
    // Import default header and footer schemas if they don't exist
    try {
      // Default header schema
      const defaultHeaderSchema = {
        logo: {
          src: '',
          alt: 'Logo',
          height: '40px'
        },
        menu: [],
        showCart: false,
        showSearch: false,
        showAccount: false
      };
      
      // Default footer schema
      const defaultFooterSchema = {
        logo: {
          src: '',
          alt: 'Logo'
        },
        links: [],
        socialLinks: [],
        copyright: `© ${new Date().getFullYear()} ${tenant.name}. All rights reserved.`
      };
      
      // Check if schemas exist, if not create them
      const { getSiteSchema } = await import('../../sparti-cms/db/index.js');
      
      const existingHeader = await getSiteSchema('header', tenantId);
      if (!existingHeader) {
        await updateSiteSchema('header', defaultHeaderSchema, 'default', tenantId);
      }
      
      const existingFooter = await getSiteSchema('footer', tenantId);
      if (!existingFooter) {
        await updateSiteSchema('footer', defaultFooterSchema, 'default', tenantId);
      }
    } catch (schemaError) {
      debugError(' Error importing schemas:', schemaError);
      // Continue even if schema import fails
    }
    
    res.json({
      success: true,
      message: `Theme "${theme}" imported successfully`,
      importedPages: importedPages.length,
      pages: importedPages
    });
  } catch (error) {
    debugError(' Error importing theme:', error);
    res.status(500).json({ error: 'Failed to import theme' });
  }
});

// Sync tenant (ensure tenant exists and create missing default settings)
router.post('/tenants/:id/sync', authenticateUser, async (req, res) => {
  try {
    const { id: tenantId } = req.params;
    
    // Verify tenant exists
    const tenant = await getTenantById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Check if user has access to this tenant
    if (!req.user.is_super_admin && req.user.tenant_id !== tenantId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Initialize/sync tenant defaults (creates missing settings)
    console.log(`[testing] Syncing tenant ${tenantId}...`);
    const initializationSummary = await initializeTenantDefaults(tenantId);
    
    // Use formatted summary from initialization
    const summary = initializationSummary.summary || {
      total: 0,
      settings: 0,
      branding: 0,
      sitemap: initializationSummary.sitemap?.inserted || 0,
      media_folders: initializationSummary.media?.folders?.inserted || 0,
      robots: 0,
      categories: 0,
      tags: 0
    };
    
    res.json({
      success: true,
      message: 'Tenant synced successfully',
      tenant_id: tenantId,
      initialization: {
        success: true,
        summary: summary,
        message: summary.total > 0 
          ? `Created ${summary.total} missing field(s)` 
          : 'Tenant is already up to date'
      }
    });
  } catch (error) {
    debugError(' Error syncing tenant:', error);
    res.status(500).json({ 
      error: 'Failed to sync tenant',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update an existing tenant
router.put('/tenants/:id', async (req, res) => {
  try {
    const { name, theme_id } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Tenant name is required' });
    }
    
    const updatedTenant = await updateTenant(req.params.id, { name, theme_id });
    
    if (!updatedTenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json(updatedTenant);
  } catch (error) {
    console.error(`[testing] Error updating tenant with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

// Delete a tenant
router.delete('/tenants/:id', async (req, res) => {
  try {
    const result = await deleteTenant(req.params.id);
    
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    
    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error(`[testing] Error deleting tenant with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

// Get database details for a tenant
router.get('/tenants/:id/database', async (req, res) => {
  try {
    const dbDetails = await getTenantDatabaseDetails(req.params.id);
    
    if (!dbDetails) {
      return res.status(404).json({ error: 'Database details not found for this tenant' });
    }
    
    res.json(dbDetails);
  } catch (error) {
    console.error(`[testing] Error getting database details for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get database details' });
  }
});

// Set database details for a tenant
router.post('/tenants/:id/database', async (req, res) => {
  try {
    const { host, port, database_name, username, password, ssl } = req.body;
    
    // Validate required fields
    if (!host || !database_name || !username || !password) {
      return res.status(400).json({ error: 'Host, database name, username, and password are required' });
    }
    
    const result = await setTenantDatabaseDetails(req.params.id, {
      host,
      port: port || 5432,
      database_name,
      username,
      password,
      ssl: ssl !== undefined ? ssl : true
    });
    
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    
    res.json(result.data);
  } catch (error) {
    console.error(`[testing] Error setting database details for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to set database details' });
  }
});

// Generate API key for a tenant
router.post('/tenants/:id/api-keys', async (req, res) => {
  try {
    const { description } = req.body;
    
    const result = await generateTenantApiKey(req.params.id, description || 'API Access Key');
    
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    
    res.json({ apiKey: result.apiKey });
  } catch (error) {
    console.error(`[testing] Error generating API key for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

// Get API keys for a tenant
router.get('/tenants/:id/api-keys', async (req, res) => {
  try {
    const apiKeys = await getTenantApiKeys(req.params.id);
    res.json(apiKeys);
  } catch (error) {
    console.error(`[testing] Error getting API keys for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get API keys' });
  }
});

// Delete an API key
router.delete('/tenants/:id/api-keys/:keyId', async (req, res) => {
  try {
    await deleteTenantApiKey(req.params.keyId);
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error(`[testing] Error deleting API key with ID ${req.params.keyId}:`, error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

// Validate an API key
router.post('/tenants/validate-api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    const result = await validateApiKey(apiKey);
    res.json(result);
  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({ error: 'Failed to validate API key' });
  }
});

export default router;