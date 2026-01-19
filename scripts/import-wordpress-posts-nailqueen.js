/**
 * Import WordPress blog posts for nail-queen tenant
 */

import { WordPressClient } from '../server/services/wordpressClient.js';
import { query } from '../sparti-cms/db/index.js';
import models from '../sparti-cms/db/sequelize/models/index.js';
import { Op } from 'sequelize';
import crypto from 'crypto';

const { Post } = models;

const TENANT_ID = 'tenant-nail-queen';
const WORDPRESS_URL = 'https://nailqueen.sg';
const USERNAME = 'oliver@gosgconsulting.com';
const APPLICATION_PASSWORD = 'Xcqu GsvE U7qM d5cJ dV4J mhoV';

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

async function importPosts() {
  try {
    console.log('[testing] Creating WordPress client...');
    const client = new WordPressClient({
      wordpress_url: WORDPRESS_URL,
      username: USERNAME,
      application_password: APPLICATION_PASSWORD
    });

    console.log('[testing] Testing connection...');
    const testResult = await client.testConnection();
    if (!testResult.success) {
      console.error('[testing] Connection failed:', testResult.error);
      console.log('[testing] Trying to fetch posts anyway...');
    } else {
      console.log('[testing] Connection successful!');
    }

    console.log('[testing] Fetching posts from WordPress...');
    const posts = await client.getPosts({
      page: 1,
      per_page: 100,
      status: 'publish',
      orderby: 'date',
      order: 'desc',
      _embed: true
    });

    console.log(`[testing] Found ${posts.length} published posts`);

    if (posts.length === 0) {
      console.log('[testing] No posts to import.');
      return;
    }

    const { findOrCreateCategory, setPostCategories } = await import('../sparti-cms/db/modules/categories.js');
    const { findOrCreateTag, setPostTags } = await import('../sparti-cms/db/modules/tags.js');

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    for (const wpPost of posts) {
      try {
        console.log(`[testing] Processing: ${wpPost.title?.rendered || wpPost.slug}`);

        const existingPost = await Post.findOne({
          where: {
            [Op.or]: [
              { wordpress_id: wpPost.id, tenant_id: TENANT_ID },
              { slug: wpPost.slug, tenant_id: TENANT_ID }
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
          tenant_id: TENANT_ID
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
          console.log(`[testing] ✓ Updated: ${post.title}`);
        } else {
          post = await Post.create(postData);
          results.created++;
          console.log(`[testing] ✓ Created: ${post.title}`);
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
                tenant_id: TENANT_ID
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
                tenant_id: TENANT_ID
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
        console.error(`[testing] ✗ Error processing post ${wpPost.id}:`, postError.message);
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
    `, [new Date().toISOString(), TENANT_ID]);

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

  } catch (error) {
    console.error('[testing] Fatal error:', error);
    throw error;
  }
}

importPosts()
  .then(() => {
    console.log('[testing] Import completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[testing] Import failed:', error);
    process.exit(1);
  });
