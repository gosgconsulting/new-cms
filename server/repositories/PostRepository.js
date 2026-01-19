import { BaseRepository } from './BaseRepository.js';
import { query } from '../../sparti-cms/db/index.js';

/**
 * Post Repository
 * Handles all post-related database operations
 */
export class PostRepository extends BaseRepository {
  constructor() {
    super('posts', 'id');
  }

  /**
   * Find posts by tenant
   */
  async findByTenant(tenantId, options = {}) {
    try {
      return await this.findAll({ tenant_id: tenantId }, options);
    } catch (error) {
      console.error('[PostRepository] findByTenant error:', error);
      throw error;
    }
  }

  /**
   * Find posts by author
   */
  async findByAuthor(authorId, options = {}) {
    try {
      return await this.findAll({ author_id: authorId }, options);
    } catch (error) {
      console.error('[PostRepository] findByAuthor error:', error);
      throw error;
    }
  }

  /**
   * Find posts by status
   */
  async findByStatus(status, tenantId = null, options = {}) {
    try {
      const filters = { status };
      if (tenantId) {
        filters.tenant_id = tenantId;
      }
      return await this.findAll(filters, options);
    } catch (error) {
      console.error('[PostRepository] findByStatus error:', error);
      throw error;
    }
  }

  /**
   * Find post by slug
   */
  async findBySlug(slug, tenantId = null) {
    try {
      const filters = { slug };
      if (tenantId) {
        filters.tenant_id = tenantId;
      }
      return await this.findOne(filters);
    } catch (error) {
      console.error('[PostRepository] findBySlug error:', error);
      throw error;
    }
  }

  /**
   * Find published posts
   */
  async findPublished(tenantId = null, options = {}) {
    try {
      let queryText = `
        SELECT * FROM posts 
        WHERE status = 'published' 
        AND (published_at IS NULL OR published_at <= NOW())
      `;
      const params = [];

      if (tenantId) {
        queryText += ' AND tenant_id = $1';
        params.push(tenantId);
      }

      const { orderBy = 'published_at', orderDirection = 'DESC', limit = 100, offset = 0 } = options;
      queryText += ` ORDER BY ${orderBy} ${orderDirection} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('[PostRepository] findPublished error:', error);
      throw error;
    }
  }

  /**
   * Create post with metadata
   */
  async createPost(postData) {
    try {
      const post = await this.create({
        ...postData,
        created_at: new Date(),
        updated_at: new Date()
      });

      return post;
    } catch (error) {
      console.error('[PostRepository] createPost error:', error);
      throw error;
    }
  }

  /**
   * Update post
   */
  async updatePost(id, postData) {
    try {
      const post = await this.update(id, {
        ...postData,
        updated_at: new Date()
      });

      return post;
    } catch (error) {
      console.error('[PostRepository] updatePost error:', error);
      throw error;
    }
  }

  /**
   * Publish post
   */
  async publish(id) {
    try {
      const result = await query(
        `UPDATE posts 
         SET status = 'published', 
             published_at = COALESCE(published_at, NOW()),
             updated_at = NOW()
         WHERE id = $1 
         RETURNING *`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('[PostRepository] publish error:', error);
      throw error;
    }
  }

  /**
   * Unpublish post (set to draft)
   */
  async unpublish(id) {
    try {
      const result = await query(
        `UPDATE posts 
         SET status = 'draft', updated_at = NOW() 
         WHERE id = $1 
         RETURNING *`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('[PostRepository] unpublish error:', error);
      throw error;
    }
  }

  /**
   * Get post with categories and tags
   */
  async findByIdWithRelations(id) {
    try {
      const result = await query(
        `SELECT 
          p.*,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) 
            FILTER (WHERE c.id IS NOT NULL), '[]'
          ) as categories,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) 
            FILTER (WHERE t.id IS NOT NULL), '[]'
          ) as tags
        FROM posts p
        LEFT JOIN post_categories pc ON p.id = pc.post_id
        LEFT JOIN categories c ON pc.category_id = c.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.id = $1
        GROUP BY p.id`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('[PostRepository] findByIdWithRelations error:', error);
      throw error;
    }
  }

  /**
   * Search posts by title or content
   */
  async search(searchTerm, tenantId = null, options = {}) {
    try {
      let queryText = `
        SELECT * FROM posts 
        WHERE (title ILIKE $1 OR content ILIKE $1)
      `;
      const params = [`%${searchTerm}%`];

      if (tenantId) {
        queryText += ' AND tenant_id = $2';
        params.push(tenantId);
      }

      const { orderBy = 'created_at', orderDirection = 'DESC', limit = 100, offset = 0 } = options;
      queryText += ` ORDER BY ${orderBy} ${orderDirection} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('[PostRepository] search error:', error);
      throw error;
    }
  }

  /**
   * Get post statistics
   */
  async getStats(tenantId = null) {
    try {
      let queryText = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
          COUNT(CASE WHEN status = 'private' THEN 1 END) as private
        FROM posts
      `;

      const params = [];
      if (tenantId) {
        queryText += ' WHERE tenant_id = $1';
        params.push(tenantId);
      }

      const result = await query(queryText, params);
      return result.rows[0];
    } catch (error) {
      console.error('[PostRepository] getStats error:', error);
      throw error;
    }
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug, tenantId = null, excludePostId = null) {
    try {
      let queryText = 'SELECT COUNT(*) as count FROM posts WHERE slug = $1';
      const params = [slug];
      let paramIndex = 2;

      if (tenantId) {
        queryText += ` AND tenant_id = $${paramIndex}`;
        params.push(tenantId);
        paramIndex++;
      }

      if (excludePostId) {
        queryText += ` AND id != $${paramIndex}`;
        params.push(excludePostId);
      }

      const result = await query(queryText, params);
      return parseInt(result.rows[0].count, 10) > 0;
    } catch (error) {
      console.error('[PostRepository] slugExists error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new PostRepository();
