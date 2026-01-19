import { BaseController } from './BaseController.js';
import {
  authenticateWithCredentials,
  generateTokenPair,
  refreshAccessToken,
  initiatePasswordReset,
  resetPassword,
  changePassword,
  validatePasswordStrength,
  revokeRefreshToken,
  revokeAllUserTokens
} from '../services/authService.js';
import { logAuthEvent, AuditEventType } from '../services/auditService.js';
import UserRepository from '../repositories/UserRepository.js';

/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */
class AuthController extends BaseController {
  /**
   * Login with email and password
   * POST /api/auth/login
   */
  async login(req, res) {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      await logAuthEvent(
        AuditEventType.LOGIN_FAILURE,
        null,
        { reason: 'missing_credentials' },
        req
      );
      return this.badRequest(res, 'Email and password are required');
    }

    try {
      // Authenticate user
      const user = await authenticateWithCredentials(email, password);

      // Generate tokens
      const tokens = generateTokenPair(user);

      // Log successful login
      await logAuthEvent(
        AuditEventType.LOGIN_SUCCESS,
        user.id,
        { email: user.email },
        req
      );

      return this.success(res, {
        user: this.sanitize(user),
        ...tokens
      }, 'Login successful');
    } catch (error) {
      // Log failed login
      await logAuthEvent(
        AuditEventType.LOGIN_FAILURE,
        null,
        { email, reason: error.message },
        req
      );

      return this.unauthorized(res, error.message);
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refresh(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return this.badRequest(res, 'Refresh token is required');
    }

    try {
      const accessToken = await refreshAccessToken(refreshToken);

      await logAuthEvent(
        AuditEventType.TOKEN_REFRESH,
        req.user?.id,
        {},
        req
      );

      return this.success(res, {
        accessToken,
        expiresIn: '15m'
      }, 'Token refreshed successfully');
    } catch (error) {
      return this.unauthorized(res, error.message);
    }
  }

  /**
   * Logout (revoke refresh token)
   * POST /api/auth/logout
   */
  async logout(req, res) {
    const { refreshToken } = req.body;

    if (refreshToken) {
      revokeRefreshToken(refreshToken);
    }

    await logAuthEvent(
      AuditEventType.LOGOUT,
      req.user?.id,
      {},
      req
    );

    return this.success(res, null, 'Logged out successfully');
  }

  /**
   * Logout from all devices (revoke all refresh tokens)
   * POST /api/auth/logout-all
   */
  async logoutAll(req, res) {
    if (!req.user) {
      return this.unauthorized(res);
    }

    const count = revokeAllUserTokens(req.user.id);

    await logAuthEvent(
      AuditEventType.LOGOUT,
      req.user.id,
      { revokedTokens: count },
      req
    );

    return this.success(res, { revokedTokens: count }, 'Logged out from all devices');
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  async me(req, res) {
    if (!req.user) {
      return this.unauthorized(res);
    }

    try {
      const user = await UserRepository.findByIdSafe(req.user.id);

      if (!user) {
        return this.notFound(res, 'User');
      }

      return this.success(res, user);
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return this.badRequest(res, 'Email is required');
    }

    try {
      const result = await initiatePasswordReset(email);

      await logAuthEvent(
        AuditEventType.PASSWORD_RESET_REQUEST,
        null,
        { email },
        req
      );

      // Always return success to prevent email enumeration
      return this.success(res, null, result.message);
    } catch (error) {
      console.error('[AuthController] Password reset error:', error);
      // Don't reveal error details
      return this.success(res, null, 'If the email exists, a reset link will be sent');
    }
  }

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  async resetPasswordWithToken(req, res) {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return this.badRequest(res, 'Token and new password are required');
    }

    // Validate password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      return this.badRequest(res, 'Password does not meet requirements', validation.errors);
    }

    try {
      await resetPassword(token, newPassword);

      await logAuthEvent(
        AuditEventType.PASSWORD_RESET_SUCCESS,
        null,
        {},
        req
      );

      return this.success(res, null, 'Password reset successful');
    } catch (error) {
      return this.badRequest(res, error.message);
    }
  }

  /**
   * Change password (authenticated)
   * POST /api/auth/change-password
   */
  async changePasswordAuthenticated(req, res) {
    if (!req.user) {
      return this.unauthorized(res);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return this.badRequest(res, 'Current password and new password are required');
    }

    // Validate password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      return this.badRequest(res, 'Password does not meet requirements', validation.errors);
    }

    try {
      await changePassword(req.user.id, currentPassword, newPassword);

      await logAuthEvent(
        AuditEventType.PASSWORD_CHANGE,
        req.user.id,
        {},
        req
      );

      return this.success(res, null, 'Password changed successfully');
    } catch (error) {
      return this.badRequest(res, error.message);
    }
  }

  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req, res) {
    const { email, password, first_name, last_name, tenant_id } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return this.badRequest(res, 'Email, password, first name, and last name are required');
    }

    // Validate password strength
    const validation = validatePasswordStrength(password);
    if (!validation.isValid) {
      return this.badRequest(res, 'Password does not meet requirements', validation.errors);
    }

    try {
      // Check if email already exists
      const emailExists = await UserRepository.emailExists(email);
      if (emailExists) {
        return this.conflict(res, 'Email already registered');
      }

      // Create user
      const user = await UserRepository.createUser({
        email,
        password,
        first_name,
        last_name,
        tenant_id: tenant_id || null,
        role: 'viewer',
        status: 'active'
      });

      // Generate tokens
      const tokens = generateTokenPair(user);

      await logAuthEvent(
        AuditEventType.USER_CREATE,
        user.id,
        { email: user.email },
        req
      );

      return this.created(res, {
        user: this.sanitize(user),
        ...tokens
      }, 'User registered successfully');
    } catch (error) {
      console.error('[AuthController] Registration error:', error);
      return this.error(res, 'Registration failed');
    }
  }

  /**
   * Validate token
   * GET /api/auth/validate
   */
  async validateToken(req, res) {
    // If this endpoint is reached, the auth middleware has already validated the token
    if (!req.user) {
      return this.unauthorized(res);
    }

    return this.success(res, { valid: true, user: this.sanitize(req.user) });
  }
}

export default new AuthController();
