import { BaseRepository } from './BaseRepository.js';
import { query } from '../../sparti-cms/db/index.js';

/**
 * Media Repository
 * Handles all media-related database operations
 */
export class MediaRepository extends BaseRepository {
  constructor() {
    super('media', 'id');
  }

  /**
   * Find media by tenant
   */
  async findByTenant(tenantId, options = {}) {
    try {
      return await this.findAll({ tenant_id: tenantId }, options);
    } catch (error) {
      console.error('[MediaRepository] findByTenant error:', error);
      throw error;
    }
  }

  /**
   * Find media by folder
   */
  async findByFolder(folderId, tenantId = null, options = {}) {
    try {
      const filters = { folder_id: folderId };
      if (tenantId) {
        filters.tenant_id = tenantId;
      }
      return await this.findAll(filters, options);
    } catch (error) {
      console.error('[MediaRepository] findByFolder error:', error);
      throw error;
    }
  }

  /**
   * Find media by type
   */
  async findByType(mimeType, tenantId = null, options = {}) {
    try {
      let queryText = 'SELECT * FROM media WHERE mime_type LIKE $1';
      const params = [`${mimeType}%`];

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
      console.error('[MediaRepository] findByType error:', error);
      throw error;
    }
  }

  /**
   * Find images only
   */
  async findImages(tenantId = null, options = {}) {
    try {
      return await this.findByType('image/', tenantId, options);
    } catch (error) {
      console.error('[MediaRepository] findImages error:', error);
      throw error;
    }
  }

  /**
   * Find videos only
   */
  async findVideos(tenantId = null, options = {}) {
    try {
      return await this.findByType('video/', tenantId, options);
    } catch (error) {
      console.error('[MediaRepository] findVideos error:', error);
      throw error;
    }
  }

  /**
   * Find documents only
   */
  async findDocuments(tenantId = null, options = {}) {
    try {
      let queryText = `
        SELECT * FROM media 
        WHERE mime_type IN (
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      `;
      const params = [];

      if (tenantId) {
        queryText += ' AND tenant_id = $1';
        params.push(tenantId);
      }

      const { orderBy = 'created_at', orderDirection = 'DESC', limit = 100, offset = 0 } = options;
      queryText += ` ORDER BY ${orderBy} ${orderDirection} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('[MediaRepository] findDocuments error:', error);
      throw error;
    }
  }

  /**
   * Create media file record
   */
  async createMedia(mediaData) {
    try {
      const media = await this.create({
        ...mediaData,
        created_at: new Date(),
        updated_at: new Date()
      });

      return media;
    } catch (error) {
      console.error('[MediaRepository] createMedia error:', error);
      throw error;
    }
  }

  /**
   * Update media metadata
   */
  async updateMedia(id, mediaData) {
    try {
      const media = await this.update(id, {
        ...mediaData,
        updated_at: new Date()
      });

      return media;
    } catch (error) {
      console.error('[MediaRepository] updateMedia error:', error);
      throw error;
    }
  }

  /**
   * Search media by filename or alt text
   */
  async search(searchTerm, tenantId = null, options = {}) {
    try {
      let queryText = `
        SELECT * FROM media 
        WHERE (filename ILIKE $1 OR alt_text ILIKE $1 OR title ILIKE $1)
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
      console.error('[MediaRepository] search error:', error);
      throw error;
    }
  }

  /**
   * Get media statistics
   */
  async getStats(tenantId = null) {
    try {
      let queryText = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN mime_type LIKE 'image/%' THEN 1 END) as images,
          COUNT(CASE WHEN mime_type LIKE 'video/%' THEN 1 END) as videos,
          COUNT(CASE WHEN mime_type LIKE 'audio/%' THEN 1 END) as audio,
          COALESCE(SUM(file_size), 0) as total_size
        FROM media
      `;

      const params = [];
      if (tenantId) {
        queryText += ' WHERE tenant_id = $1';
        params.push(tenantId);
      }

      const result = await query(queryText, params);
      return result.rows[0];
    } catch (error) {
      console.error('[MediaRepository] getStats error:', error);
      throw error;
    }
  }

  /**
   * Get recently uploaded media
   */
  async getRecent(tenantId = null, limit = 10) {
    try {
      const filters = {};
      if (tenantId) {
        filters.tenant_id = tenantId;
      }

      return await this.findAll(filters, {
        orderBy: 'created_at',
        orderDirection: 'DESC',
        limit
      });
    } catch (error) {
      console.error('[MediaRepository] getRecent error:', error);
      throw error;
    }
  }

  /**
   * Find media by URL
   */
  async findByUrl(url) {
    try {
      return await this.findOne({ url });
    } catch (error) {
      console.error('[MediaRepository] findByUrl error:', error);
      throw error;
    }
  }

  /**
   * Find media by path
   */
  async findByPath(path) {
    try {
      return await this.findOne({ path });
    } catch (error) {
      console.error('[MediaRepository] findByPath error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new MediaRepository();
