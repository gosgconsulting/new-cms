/**
 * Authentication Middleware Tests
 * 
 * Tests for authenticateUser middleware including JWT and access key authentication
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authenticateUser } from '../middleware/auth.js';

// Mock the auth service - must use vi.fn() directly in factory (hoisted)
vi.mock('../services/authService.js', () => {
  const actual = vi.importActual('../services/authService.js');
  return {
    ...actual,
    verifyAccessToken: vi.fn(),
    extractTokenFromHeader: vi.fn((header) => {
      if (!header) return null;
      if (header.startsWith('Bearer ')) {
        return header.substring(7);
      }
      return header;
    }),
    createAuthErrorResponse: vi.fn((message, statusCode = 401) => ({
      success: false,
      error: message,
      statusCode
    })),
  };
});

// Import after mocking to get the mocked functions
import { verifyAccessToken, extractTokenFromHeader, createAuthErrorResponse } from '../services/authService.js';

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock request
    req = {
      headers: {},
      user: null,
    };

    // Create mock response
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    // Create mock next function
    next = vi.fn();
  });

  describe('authenticateUser', () => {
    describe('Access Key Authentication (req.user already set)', () => {
      it('should allow request when req.user is already set', () => {
        // Simulate access key middleware has already authenticated
        req.user = {
          id: 1,
          email: 'user@example.com',
          tenant_id: 'tenant-test',
          role: 'admin',
        };

        authenticateUser(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });

      it('should preserve req.user when already set', () => {
        const userData = {
          id: 2,
          email: 'test@example.com',
          tenant_id: 'tenant-123',
          role: 'user',
          is_super_admin: false,
        };

        req.user = userData;

        authenticateUser(req, res, next);

        expect(req.user).toEqual(userData);
        expect(next).toHaveBeenCalled();
      });
    });

    describe('JWT Token Authentication', () => {
      it('should authenticate with valid JWT token', () => {
        const mockUser = {
          id: 1,
          email: 'user@example.com',
          tenant_id: 'tenant-test',
        };

        const mockToken = 'valid-jwt-token';

        req.headers.authorization = `Bearer ${mockToken}`;
        vi.mocked(verifyAccessToken).mockReturnValue(mockUser);

        authenticateUser(req, res, next);

        expect(verifyAccessToken).toHaveBeenCalledWith(mockToken);
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should accept token from Authorization header (case insensitive)', () => {
        const mockUser = { id: 1, email: 'user@example.com' };
        const mockToken = 'valid-token';

        req.headers.Authorization = `Bearer ${mockToken}`;
        vi.mocked(verifyAccessToken).mockReturnValue(mockUser);

        authenticateUser(req, res, next);

        expect(verifyAccessToken).toHaveBeenCalledWith(mockToken);
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
      });

      it('should accept token without Bearer prefix', () => {
        const mockUser = { id: 1, email: 'user@example.com' };
        const mockToken = 'valid-token';

        req.headers.authorization = mockToken;
        vi.mocked(verifyAccessToken).mockReturnValue(mockUser);

        authenticateUser(req, res, next);

        expect(verifyAccessToken).toHaveBeenCalled();
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
      });
    });

    describe('Authentication Failures', () => {
      it('should return 401 when no token is provided', () => {
        req.headers = {};

        authenticateUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: 'Not authenticated',
          })
        );
        expect(next).not.toHaveBeenCalled();
        expect(req.user).toBeNull();
      });

      it('should return 401 when Authorization header is missing', () => {
        req.headers = {};

        authenticateUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 when token is invalid', () => {
        const invalidToken = 'invalid-token';
        req.headers.authorization = `Bearer ${invalidToken}`;

        vi.mocked(verifyAccessToken).mockImplementation(() => {
          throw new Error('Invalid token');
        });

        authenticateUser(req, res, next);

        expect(verifyAccessToken).toHaveBeenCalledWith(invalidToken);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: 'Invalid token',
          })
        );
        expect(next).not.toHaveBeenCalled();
        expect(req.user).toBeNull();
      });

      it('should return 401 when token is expired', () => {
        const expiredToken = 'expired-token';
        req.headers.authorization = `Bearer ${expiredToken}`;

        vi.mocked(verifyAccessToken).mockImplementation(() => {
          const error = new Error('Token expired');
          error.name = 'TokenExpiredError';
          throw error;
        });

        authenticateUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: 'Token expired',
          })
        );
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 when token verification throws generic error', () => {
        const token = 'bad-token';
        req.headers.authorization = `Bearer ${token}`;

        vi.mocked(verifyAccessToken).mockImplementation(() => {
          throw new Error('Token verification failed');
        });

        authenticateUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: 'Token verification failed',
          })
        );
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should handle unexpected errors from verifyAccessToken', () => {
        req.headers.authorization = 'Bearer token';

        // Mock verifyAccessToken to throw an unexpected error
        vi.mocked(verifyAccessToken).mockImplementation(() => {
          throw new TypeError('Unexpected error');
        });

        authenticateUser(req, res, next);

        // The error is caught in the inner try-catch, so it returns 401, not 500
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
      });

      it('should handle missing error message', () => {
        req.headers.authorization = 'Bearer token';

        vi.mocked(verifyAccessToken).mockImplementation(() => {
          const error = new Error();
          error.message = undefined;
          throw error;
        });

        authenticateUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: expect.any(String), // Error message or 'Invalid or expired token'
          })
        );
        expect(next).not.toHaveBeenCalled();
      });

      it('should handle errors in token extraction (outer catch)', () => {
        // This test verifies the outer try-catch handles unexpected errors
        req.headers.authorization = 'Bearer token';
        
        // Make extractTokenFromHeader throw to trigger outer catch
        vi.mocked(extractTokenFromHeader).mockImplementationOnce(() => {
          throw new Error('Header parsing error');
        });

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        authenticateUser(req, res, next);

        // Should catch in outer try-catch and return 500
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: 'Authentication middleware error',
          })
        );

        consoleErrorSpy.mockRestore();
      });
    });

    describe('Priority: Access Key over JWT', () => {
      it('should prefer req.user over JWT token when both are present', () => {
        // Access key middleware has already set req.user
        req.user = {
          id: 1,
          email: 'access-key-user@example.com',
          tenant_id: 'tenant-access-key',
        };

        // JWT token is also present
        req.headers.authorization = 'Bearer jwt-token';

        authenticateUser(req, res, next);

        // Should use req.user and not verify JWT
        expect(verifyAccessToken).not.toHaveBeenCalled();
        expect(req.user.email).toBe('access-key-user@example.com');
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should not overwrite req.user when JWT is also present', () => {
        const accessKeyUser = {
          id: 1,
          email: 'access-key@example.com',
          tenant_id: 'tenant-1',
        };

        req.user = accessKeyUser;
        req.headers.authorization = 'Bearer jwt-token';

        authenticateUser(req, res, next);

        expect(req.user).toEqual(accessKeyUser);
        expect(verifyAccessToken).not.toHaveBeenCalled();
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with access key authentication flow', () => {
      // Simulate: access key middleware runs first and sets req.user
      req.user = {
        id: 5,
        email: 'embed-user@example.com',
        tenant_id: 'tenant-embed',
        role: 'editor',
      };

      authenticateUser(req, res, next);

      // Should pass through without checking JWT
      expect(next).toHaveBeenCalled();
      expect(req.user.tenant_id).toBe('tenant-embed');
    });

    it('should work with JWT authentication flow', () => {
      const jwtUser = {
        id: 10,
        email: 'jwt-user@example.com',
        tenant_id: 'tenant-jwt',
      };

      req.headers.authorization = 'Bearer valid-jwt-token';
      vi.mocked(verifyAccessToken).mockReturnValue(jwtUser);

      authenticateUser(req, res, next);

      expect(req.user).toEqual(jwtUser);
      expect(next).toHaveBeenCalled();
    });

    it('should handle embed mode scenario (access key -> pages/all route)', () => {
      // Simulate embed mode: access key authenticated user
      req.user = {
        id: 20,
        email: 'embed@example.com',
        tenant_id: 'tenant-embed',
        is_super_admin: false,
      };

      // No JWT token (typical in embed mode)
      req.headers = {};

      authenticateUser(req, res, next);

      // Should succeed because req.user is set
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(req.user.tenant_id).toBe('tenant-embed');
    });
  });
});
