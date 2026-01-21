# Phase 3: Production Hardening
**Duration:** 1-2 weeks  
**Priority:** High  
**Goal:** Add input validation, increase test coverage, add integration tests, set up error tracking

## Overview

This phase focuses on making the application production-ready with proper validation, comprehensive testing, and monitoring capabilities.

## Task 1: Implement Consistent Input Validation

### 1.1 Enhance Validation Middleware

**File:** `server/middleware/validation.js`

**Current State:** Basic validation functions exist but not consistently used.

**Action Plan:**
1. Add schema-based validation using Zod
2. Create validation middleware factory
3. Add common validation schemas
4. Integrate with error handler

**Implementation:**
```javascript
// server/middleware/validation.js
import { z } from 'zod';
import { ValidationError } from './errorHandler.js';

// Common validation schemas
export const schemas = {
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  tenantId: z.string().regex(/^tenant-[a-z0-9]+$/, 'Invalid tenant ID format'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  uuid: z.string().uuid('Invalid UUID format'),
  pagination: z.object({
    limit: z.coerce.number().int().positive().max(100).default(50),
    offset: z.coerce.number().int().nonnegative().default(0),
  }),
};

// Validation middleware factory
export function validate(schema) {
  return async (req, res, next) => {
    try {
      // Validate based on schema structure
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new ValidationError('Validation failed', error.errors));
      }
      next(error);
    }
  };
}

// Example usage schemas
export const contactSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    email: schemas.email,
    phone: z.string().optional(),
    company: z.string().max(255).optional(),
    message: z.string().max(5000).optional(),
  }),
};

export const pageSchema = {
  body: z.object({
    page_name: z.string().min(1, 'Page name is required').max(255),
    slug: schemas.slug,
    meta_title: z.string().max(255).optional(),
    meta_description: z.string().max(500).optional(),
    seo_index: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    page_type: z.enum(['page', 'landing', 'legal']).optional(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
};
```

### 1.2 Apply Validation to Routes

**Priority Routes:**
1. Authentication routes (`/api/auth/login`, `/api/auth/register`)
2. Form submission routes (`/api/form-submissions`)
3. Content routes (`/api/content/posts`, `/api/content/pages`)
4. CRM routes (`/api/contacts`)
5. Settings routes (`/api/settings`)

**Example Implementation:**
```javascript
// server/routes/auth.js
import { validate, schemas } from '../middleware/validation.js';

const loginSchema = {
  body: z.object({
    email: schemas.email,
    password: z.string().min(1, 'Password is required'),
  }),
};

const registerSchema = {
  body: z.object({
    email: schemas.email,
    password: schemas.password,
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    tenant_id: schemas.tenantId.optional(),
  }),
};

router.post('/auth/login', 
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    // req.body is now validated
    // ...
  })
);

router.post('/auth/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    // req.body is now validated
    // ...
  })
);
```

**Files to Update:**
- `server/routes/auth.js`
- `server/routes/forms.js`
- `server/routes/content.js` (or split routes)
- `server/routes/crm.js`
- `server/routes/settings.js`

### 1.3 Add Sanitization

**Action:** Add input sanitization for XSS prevention.

**Implementation:**
```javascript
// server/middleware/sanitize.js
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(req, res, next) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
}

function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? DOMPurify.sanitize(obj) : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
}
```

## Task 2: Increase Test Coverage

### 2.1 Current Test Coverage Analysis

**Current State:**
- 36 tests total
- Coverage: ~15-20% (estimated)
- Missing tests for:
  - Content routes (2400+ lines)
  - CRM routes
  - Settings routes
  - Media routes
  - Most database modules

**Goal:** 60%+ coverage

### 2.2 Add Tests for Database Modules

**Tests to Create:**
- `server/tests/database.contacts.test.js`
- `server/tests/database.categories.test.js`
- `server/tests/database.tags.test.js`
- `server/tests/database.forms.test.js`
- `server/tests/database.media.test.js`

**Template:**
```javascript
// server/tests/database.contacts.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createContact, getContacts, updateContact, deleteContact } from '../../sparti-cms/db/modules/contacts.js';

const testTenant1 = 'tenant-test-1';
const testTenant2 = 'tenant-test-2';

describe('Database Contacts Operations', () => {
  let createdContactId = null;

  beforeAll(async () => {
    // Create test tenant if needed
  });

  afterAll(async () => {
    // Cleanup
    if (createdContactId) {
      await deleteContact(createdContactId, testTenant1);
    }
  });

  describe('createContact()', () => {
    it('should create a new contact', async () => {
      const contact = await createContact({
        name: 'Test Contact',
        email: 'test@example.com',
        phone: '+65 1234 5678',
        tenant_id: testTenant1,
      });
      
      expect(contact).toBeDefined();
      expect(contact.name).toBe('Test Contact');
      expect(contact.email).toBe('test@example.com');
      createdContactId = contact.id;
    });
  });

  describe('getContacts()', () => {
    it('should return contacts for correct tenant', async () => {
      const contacts = await getContacts(10, 0, '', testTenant1);
      expect(Array.isArray(contacts)).toBe(true);
      // Verify tenant isolation
      contacts.forEach(contact => {
        expect(contact.tenant_id).toBe(testTenant1);
      });
    });
  });

  // ... more tests
});
```

### 2.3 Add Tests for Route Handlers

**Tests to Create:**
- `server/tests/routes.content.test.js`
- `server/tests/routes.crm.test.js`
- `server/tests/routes.settings.test.js`
- `server/tests/routes.media.test.js`

**Template:**
```javascript
// server/tests/routes.content.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import contentRoutes from '../routes/content.js';
import { authenticateUser } from '../middleware/auth.js';

const app = express();
app.use(express.json());
app.use('/api', contentRoutes);

describe('Content Routes', () => {
  describe('GET /api/content/posts', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/content/posts');
      
      expect(response.status).toBe(401);
    });

    it('should return posts for authenticated user', async () => {
      // Mock authentication
      // Test endpoint
    });
  });
});
```

### 2.4 Add Integration Tests

**Tests to Create:**
- `server/tests/integration.auth-flow.test.js`
- `server/tests/integration.form-submission.test.js`
- `server/tests/integration.multi-tenant.test.js`

**Template:**
```javascript
// server/tests/integration.multi-tenant.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from './helpers/app.js';

describe('Multi-Tenant Integration Tests', () => {
  it('should isolate data between tenants', async () => {
    const app = createTestApp();
    
    // Create contact for tenant 1
    const contact1 = await request(app)
      .post('/api/contacts')
      .set('X-Tenant-Id', 'tenant-1')
      .send({ name: 'Tenant 1 Contact', email: 't1@example.com' });
    
    // Create contact for tenant 2
    const contact2 = await request(app)
      .post('/api/contacts')
      .set('X-Tenant-Id', 'tenant-2')
      .send({ name: 'Tenant 2 Contact', email: 't2@example.com' });
    
    // Verify tenant 1 can only see their contact
    const tenant1Contacts = await request(app)
      .get('/api/contacts')
      .set('X-Tenant-Id', 'tenant-1');
    
    expect(tenant1Contacts.body).toHaveLength(1);
    expect(tenant1Contacts.body[0].email).toBe('t1@example.com');
  });
});
```

### 2.5 Set Up Coverage Reporting

**File:** `vitest.config.js`

**Action:** Add coverage configuration.

**Implementation:**
```javascript
// vitest.config.js
export default defineConfig({
  test: {
    // ... existing config
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'server/tests/',
        '**/*.test.js',
        '**/*.spec.js',
      ],
    },
  },
});
```

**Package.json Script:**
```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage",
    "test:coverage:watch": "vitest --coverage"
  }
}
```

## Task 3: Set Up Error Tracking

### 3.1 Choose Error Tracking Service

**Options:**
- Sentry (recommended)
- Rollbar
- Bugsnag

**Recommendation:** Sentry for comprehensive error tracking.

### 3.2 Install and Configure Sentry

**Installation:**
```bash
npm install @sentry/node @sentry/integrations
```

**Configuration:**
```javascript
// server/config/sentry.js
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 0.1, // 10% of transactions
      profilesSampleRate: 0.1, // 10% of profiles
    });
  }
}

export { Sentry };
```

### 3.3 Integrate with Error Handler

**File:** `server/middleware/errorHandler.js`

**Action:** Add Sentry error reporting.

**Implementation:**
```javascript
// server/middleware/errorHandler.js
import { Sentry } from '../config/sentry.js';

export function errorHandler(err, req, res, next) {
  // Report to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(err, {
      tags: {
        path: req.path,
        method: req.method,
      },
      extra: {
        body: req.body,
        query: req.query,
        params: req.params,
      },
    });
  }
  
  // ... existing error handling
}
```

### 3.4 Add Performance Monitoring

**Action:** Track slow database queries and API endpoints.

**Implementation:**
```javascript
// server/middleware/performance.js
import { Sentry } from '../config/sentry.js';

export function trackPerformance(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Track slow requests
    if (duration > 1000) {
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `Slow request: ${req.method} ${req.path}`,
        level: 'warning',
        data: {
          duration,
          statusCode: res.statusCode,
        },
      });
    }
  });
  
  next();
}
```

## Task 4: Add Health Checks and Monitoring

### 4.1 Enhance Health Check Endpoint

**File:** `server/routes/health.js`

**Current State:** Basic health check exists.

**Action:** Add comprehensive health checks.

**Implementation:**
```javascript
// server/routes/health.js
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {},
  };
  
  // Database check
  try {
    await query('SELECT 1');
    health.checks.database = { status: 'ok' };
  } catch (error) {
    health.checks.database = { status: 'error', error: error.message };
    health.status = 'degraded';
  }
  
  // Memory check
  const memory = process.memoryUsage();
  health.checks.memory = {
    status: memory.heapUsed < memory.heapTotal * 0.9 ? 'ok' : 'warning',
    heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
    heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
  };
  
  // Disk space check (if applicable)
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### 4.2 Add Metrics Endpoint

**Action:** Create metrics endpoint for monitoring tools (Prometheus, etc.).

**Implementation:**
```javascript
// server/routes/metrics.js
router.get('/metrics', async (req, res) => {
  const metrics = {
    requests: {
      total: requestCount,
      errors: errorCount,
      averageResponseTime: averageResponseTime,
    },
    database: {
      queries: dbQueryCount,
      slowQueries: slowQueryCount,
    },
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  };
  
  res.json(metrics);
});
```

## Testing & Validation

### Test Plan

1. **Validation Tests:**
   - Test all validation schemas
   - Test error messages
   - Test edge cases

2. **Test Coverage:**
   - Run coverage report
   - Verify 60%+ coverage
   - Identify gaps

3. **Error Tracking:**
   - Test Sentry integration
   - Verify error reporting
   - Test performance monitoring

4. **Health Checks:**
   - Test all health check endpoints
   - Verify monitoring works

### Success Criteria

- [ ] All routes have input validation
- [ ] Test coverage is 60%+
- [ ] Integration tests cover critical flows
- [ ] Error tracking is configured
- [ ] Health checks are comprehensive
- [ ] Performance monitoring is active
- [ ] All tests pass

## Estimated Effort

- Task 1: 2-3 days (validation)
- Task 2: 5-7 days (test coverage)
- Task 3: 1-2 days (error tracking)
- Task 4: 1 day (monitoring)
- Testing: 1 day

**Total: 10-14 days**
