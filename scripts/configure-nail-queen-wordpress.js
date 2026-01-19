/**
 * Configure WordPress integration for nail-queen tenant and import blog posts
 */

import { query } from '../sparti-cms/db/index.js';
import { createWordPressClientFromConfig } from '../server/services/wordpressClient.js';

const WORDPRESS_URL = 'https://cms.gosgconsulting.com';
const USERNAME = 'oliver@gosgconsulting.com';
const APPLICATION_PASSWORD = 'Xcqu GsvE U7qM d5cJ dV4J mhoV';

async function configureNailQueenWordPress() {
  try {
    console.log('[testing] Starting WordPress configuration for nail-queen...');

    // Step 1: Find or get nail-queen tenant
    console.log('[testing] Step 1: Finding nail-queen tenant...');
    const tenantResult = await query(`
      SELECT id, name, slug
      FROM tenants
      WHERE slug = 'nail-queen' OR id LIKE '%nail%queen%' OR name ILIKE '%nail%queen%'
      LIMIT 1
    `);

    let tenantId;
    if (tenantResult.rows.length > 0) {
      tenantId = tenantResult.rows[0].id;
      console.log(`[testing] Found tenant: ${tenantId} (${tenantResult.rows[0].name})`);
    } else {
      // Try to find by slug 'nail-queen'
      const slugResult = await query(`
        SELECT id, name, slug
        FROM tenants
        WHERE slug = 'nail-queen'
        LIMIT 1
      `);
      
      if (slugResult.rows.length > 0) {
        tenantId = slugResult.rows[0].id;
        console.log(`[testing] Found tenant by slug: ${tenantId}`);
      } else {
        console.log('[testing] Tenant not found. Please provide tenant ID manually.');
        console.log('[testing] Available tenants:');
        const allTenants = await query(`SELECT id, name, slug FROM tenants LIMIT 10`);
        allTenants.rows.forEach(t => {
          console.log(`  - ${t.id} (${t.name}, slug: ${t.slug})`);
        });
        return;
      }
    }

    // Step 2: Test WordPress connection
    console.log('[testing] Step 2: Testing WordPress connection...');
    const testConfig = {
      wordpress_url: WORDPRESS_URL,
      username: USERNAME,
      application_password: APPLICATION_PASSWORD
    };

    const testClient = createWordPressClientFromConfig(testConfig);
    const testResult = await testClient.testConnection();

    if (!testResult.success) {
      console.error('[testing] WordPress connection test failed:', testResult.error);
      return;
    }

    console.log('[testing] WordPress connection successful!');
    console.log('[testing] Connected as:', testResult.user?.name || USERNAME);

    // Step 3: Configure WordPress integration
    console.log('[testing] Step 3: Configuring WordPress integration...');
    const config = {
      wordpress_url: WORDPRESS_URL,
      username: USERNAME,
      application_password: APPLICATION_PASSWORD,
      auto_sync_enabled: true,
      sync_interval: 'realtime',
      last_sync_at: null,
      sync_errors: []
    };

    const upsertResult = await query(`
      INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
      VALUES ($1, 'wordpress', true, $2)
      ON CONFLICT (tenant_id, integration_type)
      DO UPDATE SET
        is_active = true,
        config = EXCLUDED.config,
        updated_at = NOW()
      RETURNING is_active, config, created_at, updated_at
    `, [tenantId, JSON.stringify(config)]);

    console.log('[testing] WordPress integration configured successfully!');

    // Step 4: Import blog posts
    console.log('[testing] Step 4: Importing blog posts from WordPress...');
    
    const posts = await testClient.getPosts({
      page: 1,
      per_page: 100,
      status: 'publish',
      orderby: 'date',
      order: 'desc',
      _embed: true
    });

    console.log(`[testing] Found ${posts.length} published posts in WordPress`);

    if (posts.length === 0) {
      console.log('[testing] No posts to import.');
      return;
    }

    // Import posts (simplified - using the import endpoint logic)
    const models = await import('../sparti-cms/db/sequelize/models/index.js');
    const { Post } = models.default;
    const { Op } = await import('sequelize');
    const { findOrCreateCategory, setPostCategories } = await import('../sparti-cms/db/modules/categories.js');
    const { findOrCreateTag, setPostTags } = await import('../sparti-cms/db/modules/tags.js');
    const crypto = await import('crypto');

    function stripHtml(html) {
      if (!html) return '';
      return html.replace(/<[^>]*>/g, '').trim();
    }

    function getFeaturedImageUrl(wpPost) {
      if (!wpPost._embedded || !wpPost._embedded['wp:featuredmedia'] || !wpPost._embedded['wp:featuredmedia'][0]) {
        return null;
      }
      const media = wpPost._embedded['wp:featuredmedia'][0];
      if (media.media_details && media.media_details.sizes) {
        if (media.media_details.sizes.large) {
          return media.media_details.sizes.large.source_url;
        }
        if (media.media_details.sizes.medium_large) {
          return media.media_details.sizes.medium_large.source_url;
        }
      }
      return media.source_url || null;
    }

    function generateSyncHash(postData) {
      const hashContent = `${postData.title}|${postData.content}|${postData.excerpt}|${postData.status}`;
      return crypto.createHash('md5').update(hashContent).digest('hex');
    }

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

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    for (const wpPost of posts) {
      try {
        const existingPost = await Post.findOne({
          where: {
            [Op.or]: [
              { wordpress_id: wpPost.id, tenant_id: tenantId },
              { slug: wpPost.slug, tenant_id: tenantId }
            ]
          }
        });

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

        let post;
        if (existingPost) {
          await existingPost.update(postData);
          post = existingPost;
          results.updated++;
          console.log(`[testing] Updated post: ${post.title}`);
        } else {
          post = await Post.create(postData);
          results.created++;
          console.log(`[testing] Created post: ${post.title}`);
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
              console.error(`[testing] Error creating category ${wpCategory.slug}:`, catError.message);
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
              console.error(`[testing] Error creating tag ${wpTag.slug}:`, tagError.message);
            }
          }
          
          if (tagIds.length > 0) {
            await setPostTags(post.id, tagIds);
          }
        }

      } catch (postError) {
        console.error(`[testing] Error processing WordPress post ${wpPost.id}:`, postError.message);
        results.errors.push({
          wordpress_id: wpPost.id,
          slug: wpPost.slug,
          error: postError.message
        });
        results.skipped++;
      }
    }

    // Update last_sync_at
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

    console.log('\n[testing] ========================================');
    console.log('[testing] Import Summary:');
    console.log(`[testing]   Created: ${results.created}`);
    console.log(`[testing]   Updated: ${results.updated}`);
    console.log(`[testing]   Skipped: ${results.skipped}`);
    if (results.errors.length > 0) {
      console.log(`[testing]   Errors: ${results.errors.length}`);
      results.errors.forEach(err => {
        console.log(`[testing]     - ${err.slug}: ${err.error}`);
      });
    }
    console.log('[testing] ========================================\n');

    console.log('[testing] WordPress integration and import completed successfully!');

  } catch (error) {
    console.error('[testing] Error configuring WordPress:', error);
    throw error;
  }
}

// Run the script
configureNailQueenWordPress()
  .then(() => {
    console.log('[testing] Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[testing] Script failed:', error);
    process.exit(1);
  });
