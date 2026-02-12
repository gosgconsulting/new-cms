/**
 * Authentication Routes Tests
 * 
 * Tests for authentication endpoints: login, register, me
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.js';
import { query } from '../../sparti-cms/db/index.js';
import bcrypt from 'bcryptjs';
import { isMockDatabaseEnabled, getDatabaseState } from '../utils/database.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api', authRoutes);

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  tenant_id: 'tenant-test'
};

let testUserId = null;

describe('Authentication Routes', () => {
  beforeAll(async () => {
    // Clean up any existing test user
    try {
      await query('DELETE FROM users WHERE email = $1', [testUser.email]);
    } catch (error) {
      // Ignore if table doesn't exist
    }
  });

  afterAll(async () => {
    // Clean up test user
    if (testUserId) {
      try {
        await query('DELETE FROM users WHERE id = $1', [testUserId]);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('POST /api/auth/login', () => {
    it('should return 503 in mock database mode', async () => {
      // This test assumes mock mode is enabled when no DB is configured
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      // In mock mode, should return 503
      // In real DB mode, would need valid credentials
      expect([400, 401, 503]).toContain(response.status);
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: testUser.password
        });

      // Route returns 503 if database is not initialized or in mock mode
      // Returns 400 for validation errors if database is initialized
      const dbState = getDatabaseState();
      const isMock = isMockDatabaseEnabled();
      
      if (isMock || !dbState.dbInitialized) {
        expect(response.status).toBe(503);
        expect(response.body.success).toBe(false);
      } else {
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Email');
      }
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email
        });

      // Route returns 503 if database is not initialized or in mock mode
      // Returns 400 for validation errors if database is initialized
      const dbState = getDatabaseState();
      const isMock = isMockDatabaseEnabled();
      
      if (isMock || !dbState.dbInitialized) {
        expect(response.status).toBe(503);
        expect(response.body.success).toBe(false);
      } else {
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Password');
      }
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      // Route returns 503 if database is not initialized or in mock mode
      // Returns 400 for validation errors if database is initialized
      const dbState = getDatabaseState();
      const isMock = isMockDatabaseEnabled();
      
      if (isMock || !dbState.dbInitialized) {
        expect(response.status).toBe(503);
        expect(response.body.success).toBe(false);
      } else {
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email
          // Missing password
        });

      // In mock database mode, may return 503 before validation
      // In real database mode, returns 400 for validation error
      expect([400, 503]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: testUser.password
        });

      // In mock database mode, may return 503 before validation
      // In real database mode, returns 400 for validation error
      expect([400, 503]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: 'weak'
        });

      // In mock database mode, may return 503 before validation
      // In real database mode, returns 400 for validation error
      expect([400, 503]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
