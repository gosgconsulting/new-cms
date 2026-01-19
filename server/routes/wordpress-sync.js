import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import { authenticateUser } from '../middleware/auth.js';
import { createWordPressClientFromConfig } from '../services/wordpressClient.js';
import { getDatabaseState } from '../utils/database.js';
import models from '../../sparti-cms/db/sequelize/models/index.js';
import { findOrCreateCategory, setPostCategories } from '../../sparti-cms/db/modules/categories.js';
import { findOrCreateTag, setPostTags } from '../../sparti-cms/db/modules/tags.js';
import { Op } from 'sequelize';
import crypto from 'crypto';
const { Post, Category, Tag } = models;

const router = express.Router();

/**
 * Helper to get WordPress client for tenant
 */
async function getWordPressClientForTenant(tenantId) {
  const integrationResult = await query(`
    SELECT config, is_active
    FROM tenant_integrations
    WHERE tenant_id = $1 AND integration_type = 'wordpress'
    LIMIT 1
  `, [tenantId]);

  if (integrationResult.rows.length === 0 || !integrationResult.rows[0].is_active) {
    throw new Error('WordPress integration not configured or not active for this tenant');
  }

  const config = integrationResult.rows[0].config;
  if (!config || !config.wordpress_url || !config.username || !config.application_password) {
    throw new Error('WordPress configuration is incomplete');
  }

  return createWordPressClientFromConfig(config);
}

/**
 * Helper to verify tenant access
 */
function verifyTenantAccess(user, tenantId) {
  if (user.is_super_admin) {
    return true;
  }
  return user.tenant_id === tenantId;
}

/**
 * Helper to strip HTML tags from text
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Helper to extract featured image URL from WordPress post
 */
function getFeaturedImageUrl(wpPost) {
  if (!wpPost._embedded || !wpPost._embedded['wp:featuredmedia'] || !wpPost._embedded['wp:featuredmedia'][0]) {
    return null;
  }
  
  const media = wpPost._embedded['wp:featuredmedia'][0];
  if (media.media_details && media.media_details.sizes) {
    // Prefer large or medium_large size
    if (media.media_details.sizes.large) {
      return media.media_details.sizes.large.source_url;
    }
    if (media.media_details.sizes.medium_large) {
      return media.media_details.sizes.medium_large.source_url;
    }
  }
  
  return media.source_url || null;
}

/**
 * Helper to generate sync hash for change detection
 */
function generateSyncHash(postData) {
  const hashContent = `${postData.title}|${postData.content}|${postData.excerpt}|${postData.status}`;
  return crypto.createHash('md5').update(hashContent).digest('hex');
}

/**
 * Helper to map WordPress status to CMS status
 */
function mapWordPressStatus(wpStatus) {
  const statusMap = {
    'publish': 'published',
    'draft': 'draft',
    'private': 'private',
    'trash': 'trash',
    'pending': 'draft',
    'future': 'draft'
  };
  return statusMap[wpStatus] || 'draft';
}

/**
 * GET /api/wordpress/config/:tenantId
 * Get WordPress configuration for a tenant
 * Requires authentication
 */
router.get('/config/:tenantId', authenticateUser, async (req, res) => {
  try {
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

    const tenantId = req.params.tenantId;

    // Verify tenant access
    if (!verifyTenantAccess(req.user, tenantId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have access to this tenant'
      });
    }

    // Get integration config
    const integrationResult = await query(`
      SELECT config, is_active, created_at, updated_at
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = 'wordpress'
      LIMIT 1
    `, [tenantId]);

    if (integrationResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          is_configured: false,
          is_active: false,
          config: null
        }
      });
    }

    const integration = integrationResult.rows[0];
    const config = integration.config || {};

    // Don't return the actual password in the response
    const safeConfig = {
      ...config,
      application_password: config.application_password ? '***' : null
    };

    res.json({
      success: true,
      data: {
        is_configured: true,
        is_active: integration.is_active,
        config: safeConfig,
        created_at: integration.created_at,
        updated_at: integration.updated_at
      }
    });
  } catch (error) {
    console.error('[testing] Error getting WordPress config:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get WordPress configuration'
    });
  }
});

/**
 * PUT /api/wordpress/config/:tenantId
 * Update WordPress configuration for a tenant
 * Requires authentication
 */
router.put('/config/:tenantId', authenticateUser, async (req, res) => {
  try {
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

    const tenantId = req.params.tenantId;
    const { wordpress_url, username, application_password, auto_sync_enabled, sync_interval } = req.body;

    // Verify tenant access
    if (!verifyTenantAccess(req.user, tenantId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have access to this tenant'
      });
    }

    // Validate required fields
    if (!wordpress_url || !username || !application_password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'wordpress_url, username, and application_password are required'
      });
    }

    // Verify tenant exists
    const tenantCheck = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [tenantId]);

    if (tenantCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    // Build config object
    const config = {
      wordpress_url: wordpress_url.replace(/\/$/, ''), // Remove trailing slash
      username,
      application_password,
      auto_sync_enabled: auto_sync_enabled !== undefined ? auto_sync_enabled : true,
      sync_interval: sync_interval || 'realtime',
      last_sync_at: null,
      sync_errors: []
    };

    // Test connection before saving
    try {
      const testClient = createWordPressClientFromConfig(config);
      const testResult = await testClient.testConnection();
      
      if (!testResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Connection test failed',
          message: testResult.error || 'Unable to connect to WordPress'
        });
      }
    } catch (testError) {
      return res.status(400).json({
        success: false,
        error: 'Connection test failed',
        message: testError.message || 'Unable to connect to WordPress'
      });
    }

    // Upsert integration config
    const result = await query(`
      INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
      VALUES ($1, 'wordpress', true, $2)
      ON CONFLICT (tenant_id, integration_type)
      DO UPDATE SET
        is_active = true,
        config = EXCLUDED.config,
        updated_at = NOW()
      RETURNING is_active, config, created_at, updated_at
    `, [tenantId, JSON.stringify(config)]);

    // Don't return the actual password
    const safeConfig = {
      ...config,
      application_password: '***'
    };

    res.json({
      success: true,
      message: 'WordPress configuration saved successfully',
      data: {
        is_active: result.rows[0].is_active,
        config: safeConfig,
        created_at: result.rows[0].created_at,
        updated_at: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('[testing] Error updating WordPress config:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update WordPress configuration'
    });
  }
});

/**
 * POST /api/wordpress/test-connection/:tenantId
 * Test WordPress API connection
 * Requires authentication
 */
router.post('/test-connection/:tenantId', authenticateUser, async (req, res) => {
  try {
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

    const tenantId = req.params.tenantId;

    // Verify tenant access
    if (!verifyTenantAccess(req.user, tenantId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have access to this tenant'
      });
    }

    const client = await getWordPressClientForTenant(tenantId);
    const result = await client.testConnection();

    if (result.success) {
      res.json({
        success: true,
        message: 'Connection successful',
        data: {
          user: result.user,
          connected: true
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Connection failed',
        data: {
          connected: false
        }
      });
    }
  } catch (error) {
    console.error('[testing] Error testing WordPress connection:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to test connection'
    });
  }
});

/**
 * GET /api/wordpress/sync-status/:tenantId
 * Get sync status and statistics
 * Requires authentication
 */
router.get('/sync-status/:tenantId', authenticateUser, async (req, res) => {
  try {
    const { dbInitialized } = getDatabaseState();
    
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Database is initializing'
      });
    }

    const tenantId = req.params.tenantId;

    // Verify tenant access
    if (!verifyTenantAccess(req.user, tenantId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get integration config
    const integrationResult = await query(`
      SELECT config, is_active, updated_at
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = 'wordpress'
      LIMIT 1
    `, [tenantId]);

    if (integrationResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          is_configured: false,
          is_active: false,
          last_sync_at: null,
          synced_posts: 0,
          total_posts: 0
        }
      });
    }

    const integration = integrationResult.rows[0];
    const config = integration.config || {};
    const lastSyncAt = config.last_sync_at || null;

    // Count synced posts
    const syncedCount = await query(`
      SELECT COUNT(*) as count
      FROM posts
      WHERE tenant_id = $1 AND wordpress_sync_enabled = true AND wordpress_id IS NOT NULL
    `, [tenantId]);

    // Count total posts
    const totalCount = await query(`
      SELECT COUNT(*) as count
      FROM posts
      WHERE tenant_id = $1
    `, [tenantId]);

    res.json({
      success: true,
      data: {
        is_configured: true,
        is_active: integration.is_active,
        last_sync_at: lastSyncAt,
        synced_posts: parseInt(syncedCount.rows[0].count),
        total_posts: parseInt(totalCount.rows[0].count),
        wordpress_url: config.wordpress_url || null,
        auto_sync_enabled: config.auto_sync_enabled !== false,
        sync_interval: config.sync_interval || 'realtime',
        sync_errors: config.sync_errors || []
      }
    });
  } catch (error) {
    console.error('[testing] Error getting sync status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get sync status'
    });
  }
});

/**
 * POST /api/wordpress/import/:tenantId
 * Import blog posts from WordPress
 * Requires authentication
 */
router.post('/import/:tenantId', authenticateUser, async (req, res) => {
  try {
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

    const tenantId = req.params.tenantId;
    const { page = 1, per_page = 100 } = req.body;

    // Verify tenant access
    if (!verifyTenantAccess(req.user, tenantId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have access to this tenant'
      });
    }

    const client = await getWordPressClientForTenant(tenantId);
    
    // Fetch posts from WordPress
    const wpPosts = await client.getPosts({
      page,
      per_page,
      status: 'publish',
      orderby: 'date',
      order: 'desc',
      _embed: true
    });

    if (!Array.isArray(wpPosts)) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response from WordPress API'
      });
    }

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    // Process each post
    for (const wpPost of wpPosts) {
      try {
        // Check if post already exists by wordpress_id or slug
        const existingPost = await Post.findOne({
          where: {
            [Op.or]: [
              { wordpress_id: wpPost.id, tenant_id: tenantId },
              { slug: wpPost.slug, tenant_id: tenantId }
            ]
          }
        });

        // Map WordPress post to CMS post structure
        const postData = {
          title: stripHtml(wpPost.title?.rendered || wpPost.title || ''),
          slug: wpPost.slug,
          content: wpPost.content?.rendered || wpPost.content || '',
          excerpt: stripHtml(wpPost.excerpt?.rendered || wpPost.excerpt || ''),
          status: mapWordPressStatus(wpPost.status),
          published_at: wpPost.date ? new Date(wpPost.date) : null,
          wordpress_id: wpPost.id,
          wordpress_sync_enabled: true,
          wordpress_last_synced_at: new Date(),
          tenant_id: tenantId,
          author_id: req.user?.id || null
        };

        // Generate sync hash
        postData.wordpress_sync_hash = generateSyncHash(postData);

        // Extract featured image
        const featuredImageUrl = getFeaturedImageUrl(wpPost);
        if (featuredImageUrl) {
          // Store as meta or in a custom field - for now we'll use og_image
          postData.og_image = featuredImageUrl;
        }

        let post;
        if (existingPost) {
          // Update existing post
          await existingPost.update(postData);
          post = existingPost;
          results.updated++;
        } else {
          // Create new post
          post = await Post.create(postData);
          results.created++;
        }

        // Handle categories
        if (wpPost._embedded && wpPost._embedded['wp:term'] && wpPost._embedded['wp:term'][0]) {
          const categories = wpPost._embedded['wp:term'][0].filter(term => term.taxonomy === 'category');
          const categoryIds = [];
          
          for (const wpCategory of categories) {
            try {
              const category = await findOrCreateCategory(wpCategory.slug, {
                name: wpCategory.name,
                slug: wpCategory.slug,
                description: '',
                tenant_id: tenantId
              });
              categoryIds.push(category.id);
            } catch (catError) {
              console.error(`[testing] Error creating category ${wpCategory.slug}:`, catError);
            }
          }
          
          if (categoryIds.length > 0) {
            await setPostCategories(post.id, categoryIds);
          }
        }

        // Handle tags
        if (wpPost._embedded && wpPost._embedded['wp:term'] && wpPost._embedded['wp:term'][1]) {
          const tags = wpPost._embedded['wp:term'][1].filter(term => term.taxonomy === 'post_tag');
          const tagIds = [];
          
          for (const wpTag of tags) {
            try {
              const tag = await findOrCreateTag(wpTag.slug, {
                name: wpTag.name,
                slug: wpTag.slug,
                description: '',
                tenant_id: tenantId
              });
              tagIds.push(tag.id);
            } catch (tagError) {
              console.error(`[testing] Error creating tag ${wpTag.slug}:`, tagError);
            }
          }
          
          if (tagIds.length > 0) {
            await setPostTags(post.id, tagIds);
          }
        }

      } catch (postError) {
        console.error(`[testing] Error processing WordPress post ${wpPost.id}:`, postError);
        results.errors.push({
          wordpress_id: wpPost.id,
          slug: wpPost.slug,
          error: postError.message
        });
        results.skipped++;
      }
    }

    // Update last_sync_at in integration config
    await query(`
      UPDATE tenant_integrations
      SET config = jsonb_set(
        COALESCE(config, '{}'::jsonb),
        '{last_sync_at}',
        to_jsonb($1::text)
      ),
      updated_at = NOW()
      WHERE tenant_id = $2 AND integration_type = 'wordpress'
    `, [new Date().toISOString(), tenantId]);

    res.json({
      success: true,
      message: `Import completed: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped`,
      data: results
    });
  } catch (error) {
    console.error('[testing] Error importing WordPress posts:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to import WordPress posts'
    });
  }
});

/**
 * POST /api/wordpress/webhook
 * WordPress webhook endpoint to receive post updates
 * Public endpoint (no authentication required, but should verify webhook signature)
 */
router.post('/webhook', async (req, res) => {
  try {
    const { dbInitialized } = getDatabaseState();
    
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Database is initializing'
      });
    }

    const { event, data, tenant_id } = req.body;

    // Validate required fields
    if (!event || !data || !tenant_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: event, data, tenant_id'
      });
    }

    // Verify tenant exists and has WordPress integration
    const integrationResult = await query(`
      SELECT config, is_active
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = 'wordpress' AND is_active = true
      LIMIT 1
    `, [tenant_id]);

    if (integrationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'WordPress integration not found or not active for this tenant'
      });
    }

    const integration = integrationResult.rows[0];
    const config = integration.config || {};

    // Verify webhook signature if configured
    if (config.webhook_secret) {
      const signature = req.headers['x-wordpress-signature'];
      if (!signature) {
        return res.status(401).json({
          success: false,
          error: 'Missing webhook signature'
        });
      }

      // Verify signature (simplified - in production use proper HMAC verification)
      const expectedSignature = crypto
        .createHmac('sha256', config.webhook_secret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return res.status(401).json({
          success: false,
          error: 'Invalid webhook signature'
        });
      }
    }

    // Process webhook event
    let result;
    switch (event) {
      case 'post.created':
        result = await handlePostCreated(data, tenant_id, config);
        break;
      case 'post.updated':
        result = await handlePostUpdated(data, tenant_id, config);
        break;
      case 'post.deleted':
        result = await handlePostDeleted(data, tenant_id, config);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown event type: ${event}`
        });
    }

    res.json({
      success: true,
      event,
      result
    });
  } catch (error) {
    console.error('[testing] Error processing WordPress webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process webhook'
    });
  }
});

/**
 * Handle post.created event
 */
async function handlePostCreated(wpPost, tenantId, config) {
  try {
    // Check if post already exists
    const existingPost = await Post.findOne({
      where: {
        [Op.or]: [
          { wordpress_id: wpPost.id, tenant_id: tenantId },
          { slug: wpPost.slug, tenant_id: tenantId }
        ]
      }
    });

    if (existingPost) {
      return { action: 'skipped', reason: 'Post already exists' };
    }

    // Map WordPress post to CMS post structure
    const postData = {
      title: stripHtml(wpPost.title?.rendered || wpPost.title || ''),
      slug: wpPost.slug,
      content: wpPost.content?.rendered || wpPost.content || '',
      excerpt: stripHtml(wpPost.excerpt?.rendered || wpPost.excerpt || ''),
      status: mapWordPressStatus(wpPost.status),
      published_at: wpPost.date ? new Date(wpPost.date) : null,
      wordpress_id: wpPost.id,
      wordpress_sync_enabled: true,
      wordpress_last_synced_at: new Date(),
      tenant_id: tenantId
    };

    postData.wordpress_sync_hash = generateSyncHash(postData);

    const featuredImageUrl = getFeaturedImageUrl(wpPost);
    if (featuredImageUrl) {
      postData.og_image = featuredImageUrl;
    }

    const post = await Post.create(postData);

    // Handle categories and tags if provided
    if (wpPost.categories && Array.isArray(wpPost.categories)) {
      // Note: In a real webhook, we might need to fetch full category data
      // For now, we'll skip category/tag sync in webhook (can be done in full sync)
    }

    return { action: 'created', post_id: post.id };
  } catch (error) {
    console.error('[testing] Error handling post.created:', error);
    throw error;
  }
}

/**
 * Handle post.updated event
 */
async function handlePostUpdated(wpPost, tenantId, config) {
  try {
    // Find existing post by wordpress_id
    const existingPost = await Post.findOne({
      where: {
        wordpress_id: wpPost.id,
        tenant_id: tenantId,
        wordpress_sync_enabled: true
      }
    });

    if (!existingPost) {
      // Post doesn't exist or sync is disabled, skip
      return { action: 'skipped', reason: 'Post not found or sync disabled' };
    }

    // Map WordPress post to CMS post structure
    const postData = {
      title: stripHtml(wpPost.title?.rendered || wpPost.title || ''),
      slug: wpPost.slug,
      content: wpPost.content?.rendered || wpPost.content || '',
      excerpt: stripHtml(wpPost.excerpt?.rendered || wpPost.excerpt || ''),
      status: mapWordPressStatus(wpPost.status),
      published_at: wpPost.date ? new Date(wpPost.date) : null,
      wordpress_last_synced_at: new Date()
    };

    postData.wordpress_sync_hash = generateSyncHash(postData);

    const featuredImageUrl = getFeaturedImageUrl(wpPost);
    if (featuredImageUrl) {
      postData.og_image = featuredImageUrl;
    }

    await existingPost.update(postData);

    return { action: 'updated', post_id: existingPost.id };
  } catch (error) {
    console.error('[testing] Error handling post.updated:', error);
    throw error;
  }
}

/**
 * Handle post.deleted event
 */
async function handlePostDeleted(wpPost, tenantId, config) {
  try {
    // Find existing post by wordpress_id
    const existingPost = await Post.findOne({
      where: {
        wordpress_id: wpPost.id,
        tenant_id: tenantId
      }
    });

    if (!existingPost) {
      return { action: 'skipped', reason: 'Post not found' };
    }

    // Option 1: Delete the post
    // await existingPost.destroy();

    // Option 2: Mark as deleted (safer)
    await existingPost.update({
      status: 'trash',
      wordpress_sync_enabled: false
    });

    return { action: 'deleted', post_id: existingPost.id };
  } catch (error) {
    console.error('[testing] Error handling post.deleted:', error);
    throw error;
  }
}

export default router;
