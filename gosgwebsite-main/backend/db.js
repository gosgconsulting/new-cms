import { Pool } from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Configure dotenv
dotenv.config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected successfully:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

/**
 * Get page by slug and tenant ID
 * @param {string} slug - The page slug
 * @param {string} tenantId - The tenant ID
 * @returns {Promise<Object|null>} - The page data or null if not found
 */
const getPageBySlug = async (slug, tenantId) => {
  try {
    const result = await pool.query(
      'SELECT id, page_name, slug, meta_title, meta_description FROM pages WHERE slug = $1 AND tenant_id = $2',
      [slug, tenantId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    throw error;
  }
};

/**
 * Get home page by tenant ID
 * @param {string} tenantId - The tenant ID
 * @returns {Promise<Object|null>} - The home page data or null if not found
 */
const getHomePage = async (tenantId) => {
  try {
    // Try to find the home page using tenant_id and page_name = 'GOSG Homepage'
    const result = await pool.query(
      'SELECT id, page_name, slug, meta_title, meta_description FROM pages WHERE tenant_id = $1 AND page_name = $2',
      [tenantId, 'GOSG Homepage']
    );
    
    // If not found, try with slug as fallback
    if (result.rows.length === 0) {
      const fallbackResult = await pool.query(
        'SELECT id, page_name, slug, meta_title, meta_description FROM pages WHERE tenant_id = $1 AND slug = $2',
        [tenantId, '/gosghome']
      );
      
      return fallbackResult.rows.length > 0 ? fallbackResult.rows[0] : null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching home page:', error);
    throw error;
  }
};

/**
 * Get page layout by page ID
 * @param {number} pageId - The page ID
 * @returns {Promise<Object|null>} - The page layout data or null if not found
 */
const getPageLayout = async (pageId) => {
  try {
    const result = await pool.query(
      'SELECT layout_json FROM page_layouts WHERE page_id = $1',
      [pageId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching page layout:', error);
    throw error;
  }
};

/**
 * Get all pages for a tenant
 * @param {string} tenantId - The tenant ID
 * @returns {Promise<Array>} - Array of pages
 */
const getAllPages = async (tenantId) => {
  try {
    const result = await pool.query(
      'SELECT id, page_name, slug FROM pages WHERE tenant_id = $1',
      [tenantId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching all pages:', error);
    throw error;
  }
};

/**
 * Get site schema by key and tenant ID
 * @param {string} schemaKey - The schema key (e.g., 'header', 'footer')
 * @param {string} tenantId - The tenant ID
 * @returns {Promise<Object|null>} - The schema data or null if not found
 */
const getSiteSchema = async (schemaKey, tenantId) => {
  try {
    const result = await pool.query(
      'SELECT schema_value FROM site_schemas WHERE schema_key = $1 AND tenant_id = $2',
      [schemaKey, tenantId]
    );
    
    return result.rows.length > 0 ? result.rows[0].schema_value : null;
  } catch (error) {
    console.error(`Error fetching ${schemaKey} schema:`, error);
    throw error;
  }
};

/**
 * Ensure the integration_settings table exists
 */
const ensureIntegrationSettingsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS integration_settings (
      id SERIAL PRIMARY KEY,
      tenant_id VARCHAR(255) NOT NULL,
      setting_key VARCHAR(255) NOT NULL,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (tenant_id, setting_key)
    )
  `);
};

/**
 * Upsert an integration setting (scoped by tenant)
 * @param {string} tenantId
 * @param {string} key
 * @param {string} value
 * @returns {Promise<void>}
 */
const setIntegrationSetting = async (tenantId, key, value) => {
  await pool.query(
    `INSERT INTO integration_settings (tenant_id, setting_key, setting_value, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (tenant_id, setting_key)
     DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()`,
    [tenantId, key, value]
  );
};

/**
 * Get an integration setting value
 * @param {string} tenantId
 * @param {string} key
 * @returns {Promise<string|null>}
 */
const getIntegrationSetting = async (tenantId, key) => {
  const result = await pool.query(
    `SELECT setting_value FROM integration_settings WHERE tenant_id = $1 AND setting_key = $2`,
    [tenantId, key]
  );
  return result.rows.length ? result.rows[0].setting_value : null;
};

/**
 * Derive a 32-byte key from ENCRYPTION_KEY env
 */
const getCipherKey = () => {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw || !raw.trim()) {
    throw new Error('ENCRYPTION_KEY is not set');
  }
  // Derive a 32-byte key using SHA-256
  return crypto.createHash('sha256').update(raw).digest();
};

/**
 * Encrypt a string using AES-256-GCM. Returns base64 strings.
 */
const encryptString = (plainText) => {
  const key = getCipherKey();
  const iv = crypto.randomBytes(12); // GCM recommended IV size
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  };
};

/**
 * Decrypt a string using AES-256-GCM from base64 parts.
 */
const decryptString = (ciphertextB64, ivB64, tagB64) => {
  const key = getCipherKey();
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain.toString('utf8');
};

/**
 * Ensure oauth_tokens table exists for securely storing provider tokens per tenant.
 */
const ensureOAuthTokensTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS oauth_tokens (
      id SERIAL PRIMARY KEY,
      tenant_id VARCHAR(255) NOT NULL,
      provider VARCHAR(64) NOT NULL,
      access_token_enc TEXT,
      refresh_token_enc TEXT,
      iv TEXT NOT NULL,
      tag TEXT NOT NULL,
      key_version INTEGER DEFAULT 1,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (tenant_id, provider)
    )
  `);
};

/**
 * Save encrypted OAuth tokens (upsert) for a provider and tenant.
 * @param {string} tenantId
 * @param {string} provider
 * @param {string} accessToken
 * @param {string|null} refreshToken
 * @param {Date|null} expiresAt
 */
const saveOAuthTokensEncrypted = async (tenantId, provider, accessToken, refreshToken = null, expiresAt = null) => {
  const encAccess = encryptString(accessToken);
  const encRefresh = refreshToken ? encryptString(refreshToken) : null;

  await pool.query(
    `
    INSERT INTO oauth_tokens (tenant_id, provider, access_token_enc, refresh_token_enc, iv, tag, key_version, expires_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, 1, $7, NOW())
    ON CONFLICT (tenant_id, provider)
    DO UPDATE SET
      access_token_enc = EXCLUDED.access_token_enc,
      refresh_token_enc = EXCLUDED.refresh_token_enc,
      iv = EXCLUDED.iv,
      tag = EXCLUDED.tag,
      key_version = EXCLUDED.key_version,
      expires_at = EXCLUDED.expires_at,
      updated_at = NOW()
    `,
    [
      tenantId,
      provider,
      encAccess.ciphertext,
      encRefresh ? encRefresh.ciphertext : null,
      encAccess.iv, // Use access token's IV/tag as primary; refresh has its own encryption but we store ciphertext only
      encAccess.tag,
      expiresAt ? new Date(expiresAt) : null,
    ]
  );
};

/**
 * Get decrypted access token for a provider and tenant.
 * @param {string} tenantId
 * @param {string} provider
 * @returns {Promise<string|null>}
 */
const getOAuthAccessTokenDecrypted = async (tenantId, provider) => {
  const res = await pool.query(
    `SELECT access_token_enc, iv, tag FROM oauth_tokens WHERE tenant_id = $1 AND provider = $2`,
    [tenantId, provider]
  );
  if (!res.rows.length || !res.rows[0].access_token_enc) return null;
  const row = res.rows[0];
  return decryptString(row.access_token_enc, row.iv, row.tag);
};

// Export the pool and utility functions
export {
  pool,
  testConnection,
  getPageBySlug,
  getHomePage,
  getPageLayout,
  getAllPages,
  getSiteSchema,
  ensureIntegrationSettingsTable,
  setIntegrationSetting,
  getIntegrationSetting,
  ensureOAuthTokensTable,
  saveOAuthTokensEncrypted,
  getOAuthAccessTokenDecrypted
};