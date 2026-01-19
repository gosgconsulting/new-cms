import { query } from '../../sparti-cms/db/index.js';

/**
 * Base Repository Class
 * Provides common CRUD operations for all repositories
 * Encapsulates database access patterns
 */
export class BaseRepository {
  constructor(tableName, primaryKey = 'id') {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  /**
   * Find record by primary key
   */
  async findById(id) {
    try {
      const result = await query(
        `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(`[${this.constructor.name}] findById error:`, error);
      throw error;
    }
  }

  /**
   * Find all records with optional filtering
   */
  async findAll(filters = {}, options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = this.primaryKey, orderDirection = 'DESC' } = options;
      
      let queryText = `SELECT * FROM ${this.tableName}`;
      const params = [];
      let paramIndex = 1;

      // Build WHERE clause from filters
      if (Object.keys(filters).length > 0) {
        const whereClauses = [];
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            whereClauses.push(`${key} = $${paramIndex}`);
            params.push(value);
            paramIndex++;
          }
        }
        if (whereClauses.length > 0) {
          queryText += ` WHERE ${whereClauses.join(' AND ')}`;
        }
      }

      // Add ordering
      queryText += ` ORDER BY ${orderBy} ${orderDirection}`;

      // Add pagination
      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error(`[${this.constructor.name}] findAll error:`, error);
      throw error;
    }
  }

  /**
   * Find one record matching filters
   */
  async findOne(filters = {}) {
    try {
      let queryText = `SELECT * FROM ${this.tableName}`;
      const params = [];
      let paramIndex = 1;

      if (Object.keys(filters).length > 0) {
        const whereClauses = [];
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            whereClauses.push(`${key} = $${paramIndex}`);
            params.push(value);
            paramIndex++;
          }
        }
        if (whereClauses.length > 0) {
          queryText += ` WHERE ${whereClauses.join(' AND ')}`;
        }
      }

      queryText += ' LIMIT 1';

      const result = await query(queryText, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`[${this.constructor.name}] findOne error:`, error);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const columns = keys.join(', ');

      const queryText = `
        INSERT INTO ${this.tableName} (${columns})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await query(queryText, values);
      return result.rows[0];
    } catch (error) {
      console.error(`[${this.constructor.name}] create error:`, error);
      throw error;
    }
  }

  /**
   * Update a record by primary key
   */
  async update(id, data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      
      const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
      
      const queryText = `
        UPDATE ${this.tableName}
        SET ${setClause}
        WHERE ${this.primaryKey} = $${keys.length + 1}
        RETURNING *
      `;

      const result = await query(queryText, [...values, id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`[${this.constructor.name}] update error:`, error);
      throw error;
    }
  }

  /**
   * Delete a record by primary key
   */
  async delete(id) {
    try {
      const result = await query(
        `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1 RETURNING *`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(`[${this.constructor.name}] delete error:`, error);
      throw error;
    }
  }

  /**
   * Count records with optional filtering
   */
  async count(filters = {}) {
    try {
      let queryText = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const params = [];
      let paramIndex = 1;

      if (Object.keys(filters).length > 0) {
        const whereClauses = [];
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            whereClauses.push(`${key} = $${paramIndex}`);
            params.push(value);
            paramIndex++;
          }
        }
        if (whereClauses.length > 0) {
          queryText += ` WHERE ${whereClauses.join(' AND ')}`;
        }
      }

      const result = await query(queryText, params);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error(`[${this.constructor.name}] count error:`, error);
      throw error;
    }
  }

  /**
   * Check if record exists
   */
  async exists(filters = {}) {
    try {
      const count = await this.count(filters);
      return count > 0;
    } catch (error) {
      console.error(`[${this.constructor.name}] exists error:`, error);
      throw error;
    }
  }

  /**
   * Execute raw query
   * Use sparingly - prefer typed methods
   */
  async raw(queryText, params = []) {
    try {
      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error(`[${this.constructor.name}] raw query error:`, error);
      throw error;
    }
  }

  /**
   * Batch insert records
   */
  async batchCreate(records) {
    try {
      if (!records || records.length === 0) {
        return [];
      }

      const keys = Object.keys(records[0]);
      const columns = keys.join(', ');
      
      const valueSets = [];
      const params = [];
      let paramIndex = 1;

      for (const record of records) {
        const placeholders = keys.map(() => `$${paramIndex++}`).join(', ');
        valueSets.push(`(${placeholders})`);
        params.push(...Object.values(record));
      }

      const queryText = `
        INSERT INTO ${this.tableName} (${columns})
        VALUES ${valueSets.join(', ')}
        RETURNING *
      `;

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error(`[${this.constructor.name}] batchCreate error:`, error);
      throw error;
    }
  }

  /**
   * Soft delete (if table has deleted_at column)
   */
  async softDelete(id) {
    try {
      const result = await query(
        `UPDATE ${this.tableName} 
         SET deleted_at = NOW() 
         WHERE ${this.primaryKey} = $1 
         RETURNING *`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(`[${this.constructor.name}] softDelete error:`, error);
      throw error;
    }
  }

  /**
   * Restore soft-deleted record
   */
  async restore(id) {
    try {
      const result = await query(
        `UPDATE ${this.tableName} 
         SET deleted_at = NULL 
         WHERE ${this.primaryKey} = $1 
         RETURNING *`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(`[${this.constructor.name}] restore error:`, error);
      throw error;
    }
  }
}
