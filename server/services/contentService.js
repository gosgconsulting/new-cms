import PostRepository from '../repositories/PostRepository.js';
import { withTransaction } from '../utils/transaction.js';
import { query } from '../../sparti-cms/db/index.js';

/**
 * Content Service
 * Handles business logic for content management (posts, pages)
 */

/**
 * Create post with categories and tags
 */
export async function createPostWithRelations(postData, categoryIds = [], tagIds = []) {
  return await withTransaction(async (client) => {
    // Create post
    const postResult = await client.query(
      `INSERT INTO posts (title, slug, content, excerpt, status, author_id, tenant_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        postData.title,
        postData.slug,
        postData.content || '',
        postData.excerpt || '',
        postData.status || 'draft',
        postData.author_id,
        postData.tenant_id || null
      ]
    );

    const post = postResult.rows[0];

    // Add categories
    if (categoryIds.length > 0) {
      for (const categoryId of categoryIds) {
        await client.query(
          'INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2)',
          [post.id, categoryId]
        );
      }
    }

    // Add tags
    if (tagIds.length > 0) {
      for (const tagId of tagIds) {
        await client.query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)',
          [post.id, tagId]
        );
      }
    }

    return post;
  });
}

/**
 * Update post with categories and tags
 */
export async function updatePostWithRelations(postId, postData, categoryIds = null, tagIds = null) {
  return await withTransaction(async (client) => {
    // Update post
    const postResult = await client.query(
      `UPDATE posts 
       SET title = $1, slug = $2, content = $3, excerpt = $4, status = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        postData.title,
        postData.slug,
        postData.content,
        postData.excerpt,
        postData.status,
        postId
      ]
    );

    const post = postResult.rows[0];

    if (!post) {
      throw new Error('Post not found');
    }

    // Update categories if provided
    if (categoryIds !== null) {
      // Remove existing categories
      await client.query('DELETE FROM post_categories WHERE post_id = $1', [postId]);

      // Add new categories
      if (categoryIds.length > 0) {
        for (const categoryId of categoryIds) {
          await client.query(
            'INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2)',
            [postId, categoryId]
          );
        }
      }
    }

    // Update tags if provided
    if (tagIds !== null) {
      // Remove existing tags
      await client.query('DELETE FROM post_tags WHERE post_id = $1', [postId]);

      // Add new tags
      if (tagIds.length > 0) {
        for (const tagId of tagIds) {
          await client.query(
            'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)',
            [postId, tagId]
          );
        }
      }
    }

    return post;
  });
}

/**
 * Duplicate post
 */
export async function duplicatePost(postId, newTitle, newSlug) {
  const originalPost = await PostRepository.findByIdWithRelations(postId);

  if (!originalPost) {
    throw new Error('Post not found');
  }

  const categoryIds = originalPost.categories?.map(c => c.id) || [];
  const tagIds = originalPost.tags?.map(t => t.id) || [];

  const newPostData = {
    title: newTitle || `${originalPost.title} (Copy)`,
    slug: newSlug || `${originalPost.slug}-copy`,
    content: originalPost.content,
    excerpt: originalPost.excerpt,
    status: 'draft',
    author_id: originalPost.author_id,
    tenant_id: originalPost.tenant_id
  };

  return await createPostWithRelations(newPostData, categoryIds, tagIds);
}

/**
 * Bulk publish posts
 */
export async function bulkPublishPosts(postIds) {
  const results = [];

  for (const postId of postIds) {
    try {
      const post = await PostRepository.publish(postId);
      results.push({ id: postId, success: true, post });
    } catch (error) {
      results.push({ id: postId, success: false, error: error.message });
    }
  }

  return results;
}

/**
 * Bulk delete posts
 */
export async function bulkDeletePosts(postIds) {
  const results = [];

  for (const postId of postIds) {
    try {
      await PostRepository.delete(postId);
      results.push({ id: postId, success: true });
    } catch (error) {
      results.push({ id: postId, success: false, error: error.message });
    }
  }

  return results;
}

/**
 * Get related posts
 */
export async function getRelatedPosts(postId, limit = 5) {
  const post = await PostRepository.findByIdWithRelations(postId);

  if (!post) {
    throw new Error('Post not found');
  }

  const categoryIds = post.categories?.map(c => c.id) || [];
  const tagIds = post.tags?.map(t => t.id) || [];

  if (categoryIds.length === 0 && tagIds.length === 0) {
    return [];
  }

  // Find posts with similar categories or tags
  const result = await query(
    `SELECT DISTINCT p.*, 
      (SELECT COUNT(*) FROM post_categories pc WHERE pc.post_id = p.id AND pc.category_id = ANY($1)) as category_matches,
      (SELECT COUNT(*) FROM post_tags pt WHERE pt.post_id = p.id AND pt.tag_id = ANY($2)) as tag_matches
     FROM posts p
     WHERE p.id != $3 
       AND p.status = 'published'
       AND p.tenant_id = $4
       AND (
         EXISTS (SELECT 1 FROM post_categories pc WHERE pc.post_id = p.id AND pc.category_id = ANY($1))
         OR EXISTS (SELECT 1 FROM post_tags pt WHERE pt.post_id = p.id AND pt.tag_id = ANY($2))
       )
     ORDER BY category_matches + tag_matches DESC, p.published_at DESC
     LIMIT $5`,
    [categoryIds, tagIds, postId, post.tenant_id, limit]
  );

  return result.rows;
}

/**
 * Generate unique slug
 */
export async function generateUniqueSlug(baseSlug, tenantId = null) {
  let slug = baseSlug;
  let counter = 1;

  while (await PostRepository.slugExists(slug, tenantId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Get post revision history
 */
export async function getPostRevisions(postId) {
  const result = await query(
    `SELECT * FROM page_versions 
     WHERE page_id = $1 
     ORDER BY version DESC`,
    [postId]
  );

  return result.rows;
}

/**
 * Restore post from revision
 */
export async function restorePostRevision(postId, versionId) {
  const versionResult = await query(
    'SELECT * FROM page_versions WHERE id = $1 AND page_id = $2',
    [versionId, postId]
  );

  if (versionResult.rows.length === 0) {
    throw new Error('Version not found');
  }

  const version = versionResult.rows[0];

  return await PostRepository.updatePost(postId, {
    title: version.page_data.title,
    slug: version.page_data.slug,
    content: version.page_data.content,
    excerpt: version.page_data.excerpt
  });
}
