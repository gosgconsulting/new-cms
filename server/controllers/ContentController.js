import { BaseController } from './BaseController.js';
import PostRepository from '../repositories/PostRepository.js';
import { logUserAction, AuditEventType } from '../services/auditService.js';

/**
 * Content Controller
 * Handles content-related HTTP requests (posts, pages)
 */
class ContentController extends BaseController {
  /**
   * Get all posts
   * GET /api/posts
   */
  async getPosts(req, res) {
    try {
      const { page, limit, offset } = this.getPagination(req);
      const { orderBy, orderDirection } = this.getSort(req, 'created_at', 'DESC');
      const filters = this.getFilters(req, ['status', 'author_id']);
      
      const tenantId = this.getTenantId(req);
      if (tenantId) {
        filters.tenant_id = tenantId;
      }

      const posts = await PostRepository.findAll(filters, {
        limit,
        offset,
        orderBy,
        orderDirection
      });

      const total = await PostRepository.count(filters);

      return this.paginated(res, posts, total, page, limit);
    } catch (error) {
      console.error('[ContentController] getPosts error:', error);
      return this.error(res, 'Failed to retrieve posts');
    }
  }

  /**
   * Get post by ID
   * GET /api/posts/:id
   */
  async getPost(req, res) {
    try {
      const { id } = req.params;
      const post = await PostRepository.findByIdWithRelations(id);

      if (!post) {
        return this.notFound(res, 'Post');
      }

      // Check tenant access
      if (post.tenant_id && !this.canAccessTenant(req, post.tenant_id)) {
        return this.forbidden(res);
      }

      return this.success(res, post);
    } catch (error) {
      console.error('[ContentController] getPost error:', error);
      return this.error(res, 'Failed to retrieve post');
    }
  }

  /**
   * Create post
   * POST /api/posts
   */
  async createPost(req, res) {
    try {
      const postData = {
        ...req.body,
        author_id: req.user.id,
        tenant_id: this.getTenantId(req)
      };

      // Validate required fields
      this.validateRequired(postData, ['title', 'slug']);

      // Check if slug exists
      const slugExists = await PostRepository.slugExists(
        postData.slug,
        postData.tenant_id
      );

      if (slugExists) {
        return this.conflict(res, 'A post with this slug already exists');
      }

      const post = await PostRepository.createPost(postData);

      await logUserAction(
        AuditEventType.POST_CREATE,
        req.user.id,
        postData.tenant_id,
        'post',
        post.id,
        { title: post.title },
        req
      );

      return this.created(res, post, 'Post created successfully');
    } catch (error) {
      console.error('[ContentController] createPost error:', error);
      return this.error(res, error.message || 'Failed to create post');
    }
  }

  /**
   * Update post
   * PUT /api/posts/:id
   */
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const existingPost = await PostRepository.findById(id);

      if (!existingPost) {
        return this.notFound(res, 'Post');
      }

      // Check tenant access
      if (existingPost.tenant_id && !this.canAccessTenant(req, existingPost.tenant_id)) {
        return this.forbidden(res);
      }

      // Check ownership (unless admin)
      if (!this.isSuperAdmin(req) && req.user.role !== 'admin') {
        if (existingPost.author_id !== req.user.id) {
          return this.forbidden(res, 'You can only edit your own posts');
        }
      }

      // Check slug uniqueness if changed
      if (req.body.slug && req.body.slug !== existingPost.slug) {
        const slugExists = await PostRepository.slugExists(
          req.body.slug,
          existingPost.tenant_id,
          id
        );

        if (slugExists) {
          return this.conflict(res, 'A post with this slug already exists');
        }
      }

      const post = await PostRepository.updatePost(id, req.body);

      await logUserAction(
        AuditEventType.POST_UPDATE,
        req.user.id,
        existingPost.tenant_id,
        'post',
        id,
        { title: post.title },
        req
      );

      return this.success(res, post, 'Post updated successfully');
    } catch (error) {
      console.error('[ContentController] updatePost error:', error);
      return this.error(res, 'Failed to update post');
    }
  }

  /**
   * Delete post
   * DELETE /api/posts/:id
   */
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const post = await PostRepository.findById(id);

      if (!post) {
        return this.notFound(res, 'Post');
      }

      // Check tenant access
      if (post.tenant_id && !this.canAccessTenant(req, post.tenant_id)) {
        return this.forbidden(res);
      }

      // Check ownership (unless admin)
      if (!this.isSuperAdmin(req) && req.user.role !== 'admin') {
        if (post.author_id !== req.user.id) {
          return this.forbidden(res, 'You can only delete your own posts');
        }
      }

      await PostRepository.delete(id);

      await logUserAction(
        AuditEventType.POST_DELETE,
        req.user.id,
        post.tenant_id,
        'post',
        id,
        { title: post.title },
        req
      );

      return this.success(res, null, 'Post deleted successfully');
    } catch (error) {
      console.error('[ContentController] deletePost error:', error);
      return this.error(res, 'Failed to delete post');
    }
  }

  /**
   * Publish post
   * POST /api/posts/:id/publish
   */
  async publishPost(req, res) {
    try {
      const { id } = req.params;
      const post = await PostRepository.findById(id);

      if (!post) {
        return this.notFound(res, 'Post');
      }

      // Check tenant access
      if (post.tenant_id && !this.canAccessTenant(req, post.tenant_id)) {
        return this.forbidden(res);
      }

      const publishedPost = await PostRepository.publish(id);

      await logUserAction(
        AuditEventType.POST_PUBLISH,
        req.user.id,
        post.tenant_id,
        'post',
        id,
        { title: post.title },
        req
      );

      return this.success(res, publishedPost, 'Post published successfully');
    } catch (error) {
      console.error('[ContentController] publishPost error:', error);
      return this.error(res, 'Failed to publish post');
    }
  }

  /**
   * Unpublish post
   * POST /api/posts/:id/unpublish
   */
  async unpublishPost(req, res) {
    try {
      const { id } = req.params;
      const post = await PostRepository.findById(id);

      if (!post) {
        return this.notFound(res, 'Post');
      }

      // Check tenant access
      if (post.tenant_id && !this.canAccessTenant(req, post.tenant_id)) {
        return this.forbidden(res);
      }

      const unpublishedPost = await PostRepository.unpublish(id);

      await logUserAction(
        AuditEventType.POST_UPDATE,
        req.user.id,
        post.tenant_id,
        'post',
        id,
        { title: post.title, action: 'unpublish' },
        req
      );

      return this.success(res, unpublishedPost, 'Post unpublished successfully');
    } catch (error) {
      console.error('[ContentController] unpublishPost error:', error);
      return this.error(res, 'Failed to unpublish post');
    }
  }

  /**
   * Search posts
   * GET /api/posts/search
   */
  async searchPosts(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return this.badRequest(res, 'Search query is required');
      }

      const { page, limit, offset } = this.getPagination(req);
      const { orderBy, orderDirection } = this.getSort(req);
      const tenantId = this.getTenantId(req);

      const posts = await PostRepository.search(q, tenantId, {
        limit,
        offset,
        orderBy,
        orderDirection
      });

      // Get total count (simplified - would need a separate count method)
      const total = posts.length;

      return this.paginated(res, posts, total, page, limit);
    } catch (error) {
      console.error('[ContentController] searchPosts error:', error);
      return this.error(res, 'Failed to search posts');
    }
  }

  /**
   * Get post statistics
   * GET /api/posts/stats
   */
  async getStats(req, res) {
    try {
      const tenantId = this.getTenantId(req);
      const stats = await PostRepository.getStats(tenantId);

      return this.success(res, stats);
    } catch (error) {
      console.error('[ContentController] getStats error:', error);
      return this.error(res, 'Failed to retrieve statistics');
    }
  }
}

export default new ContentController();
