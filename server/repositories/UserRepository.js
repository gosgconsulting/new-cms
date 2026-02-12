import { BaseRepository } from './BaseRepository.js';
import { query } from '../../sparti-cms/db/index.js';
import bcrypt from 'bcryptjs';

/**
 * User Repository
 * Handles all user-related database operations
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super('users', 'id');
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('[UserRepository] findByEmail error:', error);
      throw error;
    }
  }

  /**
   * Find users by tenant
   */
  async findByTenant(tenantId, options = {}) {
    try {
      return await this.findAll({ tenant_id: tenantId }, options);
    } catch (error) {
      console.error('[UserRepository] findByTenant error:', error);
      throw error;
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role, options = {}) {
    try {
      return await this.findAll({ role }, options);
    } catch (error) {
      console.error('[UserRepository] findByRole error:', error);
      throw error;
    }
  }

  /**
   * Create user with hashed password
   */
  async createUser(userData) {
    try {
      const { password, ...otherData } = userData;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await this.create({
        ...otherData,
        password: hashedPassword,
        status: userData.status || 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('[UserRepository] createUser error:', error);
      throw error;
    }
  }

  /**
   * Update user (excluding password)
   */
  async updateUser(id, userData) {
    try {
      // Remove password from update data (use updatePassword for that)
      const { password, ...updateData } = userData;

      const user = await this.update(id, {
        ...updateData,
        updated_at: new Date()
      });

      if (!user) {
        return null;
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('[UserRepository] updateUser error:', error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const result = await query(
        `UPDATE users 
         SET password = $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING id, email, first_name, last_name, role, tenant_id, is_super_admin`,
        [hashedPassword, id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('[UserRepository] updatePassword error:', error);
      throw error;
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(id, password) {
    try {
      const result = await query(
        'SELECT password FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return false;
      }

      const user = result.rows[0];
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('[UserRepository] verifyPassword error:', error);
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateRole(id, role) {
    try {
      const result = await query(
        `UPDATE users 
         SET role = $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING id, email, first_name, last_name, role, tenant_id, is_super_admin`,
        [role, id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('[UserRepository] updateRole error:', error);
      throw error;
    }
  }

  /**
   * Set user as super admin
   */
  async setSuperAdmin(id, isSuperAdmin = true) {
    try {
      const result = await query(
        `UPDATE users 
         SET is_super_admin = $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING id, email, first_name, last_name, role, tenant_id, is_super_admin`,
        [isSuperAdmin, id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('[UserRepository] setSuperAdmin error:', error);
      throw error;
    }
  }

  /**
   * Activate user
   */
  async activate(id) {
    try {
      const result = await query(
        `UPDATE users 
         SET status = 'active', updated_at = NOW() 
         WHERE id = $1 
         RETURNING id, email, first_name, last_name, role, tenant_id, is_super_admin, status`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('[UserRepository] activate error:', error);
      throw error;
    }
  }

  /**
   * Deactivate user
   */
  async deactivate(id) {
    try {
      const result = await query(
        `UPDATE users 
         SET status = 'inactive', updated_at = NOW() 
         WHERE id = $1 
         RETURNING id, email, first_name, last_name, role, tenant_id, is_super_admin, status`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('[UserRepository] deactivate error:', error);
      throw error;
    }
  }

  /**
   * Get user with safe fields only (no password)
   */
  async findByIdSafe(id) {
    try {
      const result = await query(
        `SELECT id, email, first_name, last_name, role, tenant_id, is_super_admin, status, created_at, updated_at 
         FROM users 
         WHERE id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('[UserRepository] findByIdSafe error:', error);
      throw error;
    }
  }

  /**
   * Get all users with safe fields only
   */
  async findAllSafe(filters = {}, options = {}) {
    try {
      const users = await this.findAll(filters, options);
      // Remove passwords from all users
      return users.map(({ password, ...user }) => user);
    } catch (error) {
      console.error('[UserRepository] findAllSafe error:', error);
      throw error;
    }
  }

  /**
   * Check if email is already taken
   */
  async emailExists(email, excludeUserId = null) {
    try {
      let queryText = 'SELECT COUNT(*) as count FROM users WHERE email = $1';
      const params = [email];

      if (excludeUserId) {
        queryText += ' AND id != $2';
        params.push(excludeUserId);
      }

      const result = await query(queryText, params);
      return parseInt(result.rows[0].count, 10) > 0;
    } catch (error) {
      console.error('[UserRepository] emailExists error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getStats(tenantId = null) {
    try {
      let queryText = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
          COUNT(CASE WHEN is_super_admin = true THEN 1 END) as super_admins
        FROM users
      `;

      const params = [];
      if (tenantId) {
        queryText += ' WHERE tenant_id = $1';
        params.push(tenantId);
      }

      const result = await query(queryText, params);
      return result.rows[0];
    } catch (error) {
      console.error('[UserRepository] getStats error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new UserRepository();
