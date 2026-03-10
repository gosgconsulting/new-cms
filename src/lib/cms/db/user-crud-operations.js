import { query } from './index.js';
import { 
  hashPassword, 
  verifyPassword, 
  validatePasswordStrength,
  logUserActivity, 
  logSecurityEvent,
  createUserSession,
  invalidateAllUserSessions
} from './secure-user-management.js';

// User CRUD Operations

// Create a new user
export async function createUser(userData, createdBy = null) {
  try {
    console.log('[testing] Creating user:', userData.email);
    
    // Validate required fields
    if (!userData.first_name || !userData.last_name || !userData.email || !userData.password) {
      throw new Error('Missing required fields: first_name, last_name, email, password');
    }
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }
    
    // Hash password
    const { hash, salt } = await hashPassword(userData.password);
    
    // Check if email already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email address already exists');
    }
    
    const result = await query(`
      INSERT INTO users (
        first_name, last_name, email, password_hash, password_salt, 
        role, status, is_active, email_verified, profile_data, preferences, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, uuid, first_name, last_name, email, role, status, is_active, 
                email_verified, two_factor_enabled, created_at, updated_at
    `, [
      userData.first_name,
      userData.last_name,
      userData.email.toLowerCase(),
      hash,
      salt,
      userData.role || 'user',
      userData.status || (userData.role === 'admin' ? 'active' : 'pending'),
      userData.is_active !== undefined ? userData.is_active : true,
      userData.email_verified || false,
      JSON.stringify(userData.profile_data || {}),
      JSON.stringify(userData.preferences || {}),
      createdBy
    ]);
    
    const newUser = result.rows[0];
    
    // Store password in history
    await query(`
      INSERT INTO user_password_history (user_id, password_hash, password_salt)
      VALUES ($1, $2, $3)
    `, [newUser.id, hash, salt]);
    
    // Log activity
    await logUserActivity(
      createdBy || newUser.id, 
      'user_created', 
      'user', 
      newUser.id, 
      { 
        created_user_email: newUser.email,
        created_user_role: newUser.role,
        created_user_status: newUser.status
      }
    );
    
    console.log('[testing] User created successfully:', newUser.id);
    return newUser;
  } catch (error) {
    console.error('[testing] Error creating user:', error);
    throw error;
  }
}

// Get all users with pagination and search
export async function getUsers(limit = 50, offset = 0, search = '', filters = {}) {
  try {
    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramIndex = 1;
    
    // Search functionality
    if (search) {
      whereClause += ` AND (
        first_name ILIKE $${paramIndex} OR 
        last_name ILIKE $${paramIndex} OR 
        email ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Filter by role
    if (filters.role) {
      whereClause += ` AND role = $${paramIndex}`;
      params.push(filters.role);
      paramIndex++;
    }
    
    // Filter by status
    if (filters.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    // Filter by active status
    if (filters.is_active !== undefined) {
      whereClause += ` AND is_active = $${paramIndex}`;
      params.push(filters.is_active);
      paramIndex++;
    }
    
    // Add limit and offset
    params.push(limit, offset);
    
    const result = await query(`
      SELECT * FROM users_management_view 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);
    
    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total FROM users ${whereClause}
    `, params.slice(0, -2)); // Remove limit and offset for count
    
    return {
      users: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  } catch (error) {
    console.error('[testing] Error fetching users:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(userId) {
  try {
    const result = await query(`
      SELECT * FROM users_management_view WHERE id = $1
    `, [userId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error fetching user by ID:', error);
    throw error;
  }
}

// Get user by UUID
export async function getUserByUUID(uuid) {
  try {
    const result = await query(`
      SELECT * FROM users_management_view WHERE uuid = $1
    `, [uuid]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error fetching user by UUID:', error);
    throw error;
  }
}

// Get user by email
export async function getUserByEmail(email) {
  try {
    const result = await query(`
      SELECT u.*, 
             CASE WHEN u.locked_until > NOW() THEN true ELSE false END as is_locked
      FROM users u 
      WHERE email = $1
    `, [email.toLowerCase()]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('[testing] Error fetching user by email:', error);
    throw error;
  }
}

// Update user
export async function updateUser(userId, userData, updatedBy = null) {
  try {
    console.log('[testing] Updating user:', userId);
    
    // Get current user data for comparison
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }
    
    // Build dynamic update query
    const updateFields = [];
    const params = [userId];
    let paramIndex = 2;
    
    const allowedFields = [
      'first_name', 'last_name', 'email', 'role', 'status', 
      'is_active', 'email_verified', 'two_factor_enabled', 
      'profile_data', 'preferences'
    ];
    
    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        if (field === 'email') {
          // Check if email is being changed and if new email already exists
          if (userData.email.toLowerCase() !== currentUser.email.toLowerCase()) {
            const existingUser = await getUserByEmail(userData.email);
            if (existingUser && existingUser.id !== userId) {
              throw new Error('Email address already exists');
            }
          }
          updateFields.push(`${field} = $${paramIndex}`);
          params.push(userData.email.toLowerCase());
        } else if (field === 'profile_data' || field === 'preferences') {
          updateFields.push(`${field} = $${paramIndex}`);
          params.push(JSON.stringify(userData[field]));
        } else {
          updateFields.push(`${field} = $${paramIndex}`);
          params.push(userData[field]);
        }
        paramIndex++;
      }
    }
    
    if (updateFields.length === 0) {
      return currentUser; // No changes to make
    }
    
    // Add updated_by and updated_at
    updateFields.push(`updated_by = $${paramIndex}`, `updated_at = NOW()`);
    params.push(updatedBy);
    
    const result = await query(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING id, uuid, first_name, last_name, email, role, status, is_active, 
                email_verified, two_factor_enabled, created_at, updated_at
    `, params);
    
    const updatedUser = result.rows[0];
    
    // Log activity
    await logUserActivity(
      updatedBy || userId, 
      'user_updated', 
      'user', 
      userId, 
      { 
        updated_fields: Object.keys(userData),
        previous_values: Object.keys(userData).reduce((acc, key) => {
          acc[key] = currentUser[key];
          return acc;
        }, {}),
        new_values: userData
      }
    );
    
    console.log('[testing] User updated successfully:', userId);
    return updatedUser;
  } catch (error) {
    console.error('[testing] Error updating user:', error);
    throw error;
  }
}

// Update user password
export async function updateUserPassword(userId, newPassword, currentPassword = null, updatedBy = null) {
  try {
    console.log('[testing] Updating password for user:', userId);
    
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get full user data including password hash and salt
    const fullUserResult = await query(`
      SELECT password_hash, password_salt FROM users WHERE id = $1
    `, [userId]);
    
    if (fullUserResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const fullUser = fullUserResult.rows[0];
    
    // If current password is provided, verify it
    if (currentPassword) {
      const isCurrentPasswordValid = await verifyPassword(
        currentPassword, 
        fullUser.password_hash, 
        fullUser.password_salt
      );
      
      if (!isCurrentPasswordValid) {
        await logSecurityEvent(
          userId, 
          'password_change_failed', 
          'medium', 
          'Invalid current password provided during password change attempt'
        );
        throw new Error('Current password is incorrect');
      }
    }
    
    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }
    
    // Check password history to prevent reuse
    const passwordHistoryResult = await query(`
      SELECT password_hash, password_salt FROM user_password_history 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [userId]);
    
    for (const historyEntry of passwordHistoryResult.rows) {
      const isPasswordReused = await verifyPassword(
        newPassword, 
        historyEntry.password_hash, 
        historyEntry.password_salt
      );
      
      if (isPasswordReused) {
        throw new Error('Cannot reuse recent passwords. Please choose a different password.');
      }
    }
    
    // Hash new password
    const { hash, salt } = await hashPassword(newPassword);
    
    // Update password
    await query(`
      UPDATE users 
      SET password_hash = $2, password_salt = $3, password_changed_at = NOW(), updated_by = $4, updated_at = NOW()
      WHERE id = $1
    `, [userId, hash, salt, updatedBy]);
    
    // Store in password history
    await query(`
      INSERT INTO user_password_history (user_id, password_hash, password_salt)
      VALUES ($1, $2, $3)
    `, [userId, hash, salt]);
    
    // Invalidate all existing sessions for security
    await invalidateAllUserSessions(userId);
    
    // Log activity
    await logUserActivity(
      updatedBy || userId, 
      'password_changed', 
      'user', 
      userId, 
      { password_strength_score: passwordValidation.score }
    );
    
    console.log('[testing] Password updated successfully for user:', userId);
    return true;
  } catch (error) {
    console.error('[testing] Error updating user password:', error);
    throw error;
  }
}

// Soft delete user (deactivate)
export async function deleteUser(userId, deletedBy = null, reason = null) {
  try {
    console.log('[testing] Soft deleting user:', userId);
    
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Soft delete by setting status to inactive and is_active to false
    const result = await query(`
      UPDATE users 
      SET status = 'inactive', is_active = false, updated_by = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, role, status, is_active
    `, [userId, deletedBy]);
    
    // Invalidate all sessions
    await invalidateAllUserSessions(userId);
    
    // Log activity
    await logUserActivity(
      deletedBy || userId, 
      'user_deleted', 
      'user', 
      userId, 
      { 
        deleted_user_email: user.email,
        reason: reason,
        deletion_type: 'soft_delete'
      }
    );
    
    console.log('[testing] User soft deleted successfully:', userId);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error soft deleting user:', error);
    throw error;
  }
}

// Hard delete user (permanent removal)
export async function hardDeleteUser(userId, deletedBy = null, reason = null) {
  try {
    console.log('[testing] Hard deleting user:', userId);
    
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Log activity before deletion
    await logUserActivity(
      deletedBy || userId, 
      'user_hard_deleted', 
      'user', 
      userId, 
      { 
        deleted_user_email: user.email,
        reason: reason,
        deletion_type: 'hard_delete'
      }
    );
    
    // Hard delete (cascading will handle related records)
    await query(`DELETE FROM users WHERE id = $1`, [userId]);
    
    console.log('[testing] User hard deleted successfully:', userId);
    return true;
  } catch (error) {
    console.error('[testing] Error hard deleting user:', error);
    throw error;
  }
}

// User registration (public signup)
export async function registerUser(userData) {
  try {
    console.log('[testing] Registering new user:', userData.email);
    
    // Set default values for public registration
    const registrationData = {
      ...userData,
      role: 'user', // Always user role for public registration
      status: 'pending', // Always pending for admin approval
      is_active: false, // Not active until approved
      email_verified: false // Not verified initially
    };
    
    const user = await createUser(registrationData);
    
    // Log registration
    await logUserActivity(
      user.id, 
      'user_registered', 
      'user', 
      user.id, 
      { registration_method: 'public_signup' }
    );
    
    return user;
  } catch (error) {
    console.error('[testing] Error registering user:', error);
    throw error;
  }
}

// Approve user (admin action)
export async function approveUser(userId, approvedBy) {
  try {
    console.log('[testing] Approving user:', userId);
    
    const result = await query(`
      UPDATE users 
      SET status = 'active', is_active = true, email_verified = true, updated_by = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, uuid, first_name, last_name, email, role, status, is_active, email_verified
    `, [userId, approvedBy]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = result.rows[0];
    
    // Log activity
    await logUserActivity(
      approvedBy, 
      'user_approved', 
      'user', 
      userId, 
      { approved_user_email: user.email }
    );
    
    console.log('[testing] User approved successfully:', userId);
    return user;
  } catch (error) {
    console.error('[testing] Error approving user:', error);
    throw error;
  }
}

// Reject user (admin action)
export async function rejectUser(userId, rejectedBy, reason = null) {
  try {
    console.log('[testing] Rejecting user:', userId);
    
    const result = await query(`
      UPDATE users 
      SET status = 'rejected', is_active = false, updated_by = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, uuid, first_name, last_name, email, role, status
    `, [userId, rejectedBy]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = result.rows[0];
    
    // Log activity
    await logUserActivity(
      rejectedBy, 
      'user_rejected', 
      'user', 
      userId, 
      { 
        rejected_user_email: user.email,
        reason: reason
      }
    );
    
    console.log('[testing] User rejected successfully:', userId);
    return user;
  } catch (error) {
    console.error('[testing] Error rejecting user:', error);
    throw error;
  }
}

// Suspend user (admin action)
export async function suspendUser(userId, suspendedBy, reason = null, suspensionDuration = null) {
  try {
    console.log('[testing] Suspending user:', userId);
    
    const result = await query(`
      UPDATE users 
      SET status = 'suspended', is_active = false, updated_by = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, uuid, first_name, last_name, email, role, status
    `, [userId, suspendedBy]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = result.rows[0];
    
    // Invalidate all sessions
    await invalidateAllUserSessions(userId);
    
    // Log security event
    await logSecurityEvent(
      userId, 
      'user_suspended', 
      'high', 
      `User suspended by admin. Reason: ${reason || 'No reason provided'}`,
      null,
      null,
      { 
        suspended_by: suspendedBy,
        reason: reason,
        suspension_duration: suspensionDuration
      }
    );
    
    // Log activity
    await logUserActivity(
      suspendedBy, 
      'user_suspended', 
      'user', 
      userId, 
      { 
        suspended_user_email: user.email,
        reason: reason,
        suspension_duration: suspensionDuration
      }
    );
    
    console.log('[testing] User suspended successfully:', userId);
    return user;
  } catch (error) {
    console.error('[testing] Error suspending user:', error);
    throw error;
  }
}

// Get pending users
export async function getPendingUsers() {
  try {
    const result = await query(`
      SELECT * FROM users_management_view
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching pending users:', error);
    throw error;
  }
}

// Get user statistics
export async function getUserStatistics() {
  try {
    const result = await query(`SELECT * FROM user_statistics`);
    return result.rows[0] || {};
  } catch (error) {
    console.error('[testing] Error fetching user statistics:', error);
    throw error;
  }
}

// Get user activity history
export async function getUserActivity(userId, limit = 50, offset = 0) {
  try {
    const result = await query(`
      SELECT * FROM user_activity_log
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching user activity:', error);
    throw error;
  }
}

// Get security events
export async function getSecurityEvents(userId = null, severity = null, limit = 50, offset = 0) {
  try {
    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramIndex = 1;
    
    if (userId) {
      whereClause += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    if (severity) {
      whereClause += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }
    
    params.push(limit, offset);
    
    const result = await query(`
      SELECT se.*, u.email as user_email, u.first_name, u.last_name
      FROM security_events se
      LEFT JOIN users u ON se.user_id = u.id
      ${whereClause}
      ORDER BY se.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);
    
    return result.rows;
  } catch (error) {
    console.error('[testing] Error fetching security events:', error);
    throw error;
  }
}
