# Phase 4: Documentation
**Duration:** 1 week  
**Priority:** Medium  
**Goal:** Update architecture docs, document auth strategy, create API docs, write deployment guide

## Overview

This phase ensures the codebase is well-documented for current and future developers. Good documentation reduces onboarding time and prevents knowledge loss.

## Task 1: Update Architecture Documentation

### 1.1 Review Current Documentation

**Files to Review:**
- `docs/architecture/REFACTORED_ARCHITECTURE.md`
- `docs/architecture/REFACTOR_SUMMARY.md`
- `docs/architecture/QUICK_REFERENCE.md`

**Issues:**
- Documents Controller/Service/Repository pattern but code doesn't fully use it
- Missing current state documentation
- Outdated examples

### 1.2 Create Current Architecture Document

**New File:** `docs/architecture/CURRENT_ARCHITECTURE.md`

**Content:**
```markdown
# Current Architecture

## Overview
This document describes the current architecture as it exists in the codebase (not aspirational).

## Architecture Layers

### 1. Routes Layer
**Location:** `server/routes/`

Routes handle HTTP requests directly. Some routes use controllers, most call database modules directly.

**Pattern:**
```javascript
router.post('/endpoint', authenticateUser, async (req, res, next) => {
  try {
    const tenantId = req.tenantId || req.user.tenant_id;
    const result = await dbModule.function(params, tenantId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
```

**Current State:**
- Most routes call database modules directly
- Some routes use controllers (auth, content)
- Error handling is inconsistent

### 2. Database Layer
**Location:** `sparti-cms/db/modules/`

Database modules provide data access. Mix of Sequelize ORM and raw SQL.

**Current State:**
- `pages.js` - Uses Sequelize ✅
- `branding.js` - Mix of Sequelize and raw SQL
- Other modules - Raw SQL (migration in progress)

**Pattern:**
```javascript
// Sequelize pattern (preferred)
import models from '../sequelize/models/index.js';
const { Model } = models;

export async function getItems(tenantId) {
  return await Model.findAll({ where: { tenant_id: tenantId } });
}

// Raw SQL pattern (legacy)
export async function getItems(tenantId) {
  const result = await query('SELECT * FROM items WHERE tenant_id = $1', [tenantId]);
  return result.rows;
}
```

### 3. Middleware Layer
**Location:** `server/middleware/`

**Key Middleware:**
- `auth.js` - JWT authentication
- `accessKey.js` - Access key authentication
- `tenantApiKey.js` - Tenant API key authentication
- `errorHandler.js` - Error handling
- `validation.js` - Input validation (inconsistent usage)

### 4. Configuration
**Location:** `server/config/`

**Current State:**
- `constants.js` - Direct process.env access
- Migrating to centralized config module

## Data Flow

```
Request → Middleware (auth, validation) → Route → Database Module → Database
                                                      ↓
                                                 Response
```

## Multi-Tenancy

Tenant ID is extracted from:
1. Authenticated user (`req.user.tenant_id`)
2. Request headers (`X-Tenant-Id`)
3. Query parameters (`tenantId`)
4. Request body (`tenant_id`)

Priority: User > Header > Query > Body

## Error Handling

Errors flow through error handler middleware:
```
Route → throw error → errorHandler middleware → Formatted response
```

## Future Direction

See `docs/architecture/TARGET_ARCHITECTURE.md` for planned improvements.
```

### 1.3 Create Target Architecture Document

**New File:** `docs/architecture/TARGET_ARCHITECTURE.md`

**Content:** Describe the ideal architecture we're moving toward.

### 1.4 Update Quick Reference

**File:** `docs/architecture/QUICK_REFERENCE.md`

**Action:** Update with current file locations and patterns.

## Task 2: Document Authentication Strategy

### 2.1 Create Authentication Guide

**New File:** `docs/authentication/AUTH_STRATEGY.md`

**Content:**
```markdown
# Authentication Strategy

## Overview
The CMS supports multiple authentication methods for different use cases.

## Authentication Methods

### 1. JWT Tokens (User Authentication)
**Use Case:** Admin panel, CMS interface
**Middleware:** `authenticateUser`
**Location:** `server/middleware/auth.js`

**Flow:**
1. User logs in via `/api/auth/login`
2. Server returns access token and refresh token
3. Client includes token in `Authorization: Bearer <token>` header
4. Middleware validates token and attaches user to request

**Routes:**
- `/api/auth/login` - Get tokens
- `/api/auth/register` - Create account
- `/api/auth/me` - Get current user
- `/api/auth/refresh` - Refresh access token

### 2. Access Keys (API Authentication)
**Use Case:** Programmatic API access
**Middleware:** `authenticateWithAccessKey`
**Location:** `server/middleware/accessKey.js`

**Flow:**
1. User creates access key in admin panel
2. Client includes key in `X-Access-Key` header
3. Middleware validates key and attaches user to request

**Routes:** All `/api/*` routes (except auth endpoints)

### 3. Tenant API Keys (Public API)
**Use Case:** Public tenant pages, theme deployments
**Middleware:** `authenticateTenantApiKey`
**Location:** `server/middleware/tenantApiKey.js`

**Flow:**
1. Tenant creates API key
2. Client includes key in `X-API-Key` header
3. Middleware validates key and sets `req.tenantId`

**Routes:** Public API routes (`/api/v1/*`)

### 4. Optional Authentication
**Use Case:** Public endpoints that work with or without auth
**Middleware:** `optionalAuth`
**Location:** Custom middleware in routes

**Flow:**
- If token provided, authenticate and attach user
- If no token, continue as anonymous user

## When to Use Which Method

| Use Case | Method | Example |
|----------|--------|---------|
| Admin panel | JWT | CMS interface |
| API integration | Access Key | Third-party services |
| Public tenant pages | Tenant API Key | Theme deployments |
| Public endpoints | Optional Auth | Blog posts, public pages |

## Security Considerations

1. **JWT Tokens:**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Stored in httpOnly cookies (recommended) or localStorage

2. **Access Keys:**
   - Never expire (user must revoke)
   - Store securely (never in code)
   - Rotate regularly

3. **Tenant API Keys:**
   - Tenant-specific
   - Can be regenerated
   - Rate limited

## Implementation Examples

See `docs/authentication/EXAMPLES.md` for code examples.
```

### 2.2 Create Authentication Examples

**New File:** `docs/authentication/EXAMPLES.md`

**Content:** Code examples for each authentication method.

## Task 3: Create API Documentation

### 3.1 Set Up API Documentation Tool

**Options:**
- OpenAPI/Swagger (recommended)
- Postman Collection
- Markdown files

**Recommendation:** OpenAPI with Swagger UI.

### 3.2 Create OpenAPI Specification

**New File:** `docs/api/openapi.yaml`

**Structure:**
```yaml
openapi: 3.0.0
info:
  title: Sparti CMS API
  version: 1.0.0
  description: Multi-tenant Content Management System API

servers:
  - url: https://cms.sparti.ai/api
    description: Production
  - url: http://localhost:4173/api
    description: Development

paths:
  /auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  accessToken:
                    type: string
                  refreshToken:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'
        '401':
          description: Invalid credentials

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        email:
          type: string
        tenant_id:
          type: string
        role:
          type: string
        is_super_admin:
          type: boolean
```

### 3.3 Add Swagger UI

**Installation:**
```bash
npm install swagger-ui-express swagger-jsdoc
```

**Implementation:**
```javascript
// server/routes/docs.js
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerSpec = readFileSync(
  join(__dirname, '../../docs/api/openapi.yaml'),
  'utf8'
);

router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerSpec));
```

### 3.4 Document All Endpoints

**Endpoints to Document:**
- Authentication (`/api/auth/*`)
- Content (`/api/content/*`)
- Forms (`/api/form-submissions`)
- CRM (`/api/contacts`)
- Settings (`/api/settings`)
- Media (`/api/media`)
- Public API (`/api/v1/*`)

## Task 4: Create Deployment Guide

### 4.1 Create Production Deployment Guide

**New File:** `docs/deployment/PRODUCTION_DEPLOYMENT.md`

**Content:**
```markdown
# Production Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Environment variables configured
- Database migrations run

## Step 1: Environment Setup

1. Copy `.env.example` to `.env.production`
2. Set all required environment variables
3. Verify database connection

## Step 2: Database Setup

1. Run migrations:
   ```bash
   npm run sequelize:migrate:production
   ```

2. Initialize master data:
   ```bash
   node scripts/setup/initialize-master-data.js
   ```

3. Create initial tenant:
   ```bash
   node scripts/setup/create-demo-tenant.js
   ```

## Step 3: Build Application

```bash
npm install
npm run build
```

## Step 4: Start Application

```bash
npm start
```

## Step 5: Verify Deployment

1. Check health endpoint: `GET /health`
2. Test authentication: `POST /api/auth/login`
3. Verify database connection
4. Check error logs

## Monitoring

- Health checks: `/health`
- Metrics: `/metrics`
- Error tracking: Sentry dashboard

## Troubleshooting

See `docs/deployment/TROUBLESHOOTING.md`
```

### 4.2 Create Railway Deployment Guide

**File:** `docs/deployment/RAILWAY_DEPLOYMENT.md`

**Action:** Update existing guide or create new one with current steps.

### 4.3 Create Development Setup Guide

**New File:** `docs/setup/DEVELOPMENT_SETUP.md`

**Content:** Step-by-step guide for new developers.

## Task 5: Create Contributing Guide

### 5.1 Create Contributing Guide

**New File:** `CONTRIBUTING.md`

**Content:**
```markdown
# Contributing Guide

## Development Setup

See `docs/setup/DEVELOPMENT_SETUP.md`

## Code Style

- Use ESLint configuration
- Follow existing patterns
- Write tests for new features

## Git Workflow

1. Create feature branch
2. Make changes
3. Write/update tests
4. Run tests: `npm run test:unit`
5. Run linter: `npm run lint`
6. Submit pull request

## Testing

- Write unit tests for new functions
- Write integration tests for new endpoints
- Maintain 60%+ coverage

## Documentation

- Update relevant docs
- Add JSDoc comments
- Update API docs if adding endpoints
```

## Task 6: Create Architecture Diagrams

### 6.1 Create System Architecture Diagram

**New File:** `docs/architecture/diagrams/system-architecture.mmd`

**Content:** Mermaid diagram showing system components.

### 6.2 Create Data Flow Diagram

**New File:** `docs/architecture/diagrams/data-flow.mmd`

**Content:** Mermaid diagram showing request/response flow.

### 6.3 Create Database Schema Diagram

**New File:** `docs/architecture/diagrams/database-schema.mmd`

**Content:** Mermaid diagram showing database relationships.

## Testing & Validation

### Test Plan

1. **Documentation Review:**
   - Have new developer follow setup guide
   - Verify all steps work
   - Identify gaps

2. **API Documentation:**
   - Test all documented endpoints
   - Verify examples work
   - Check Swagger UI

3. **Deployment Guide:**
   - Follow deployment steps
   - Verify all commands work
   - Test in staging environment

### Success Criteria

- [ ] Architecture docs reflect current state
- [ ] Authentication strategy is documented
- [ ] All API endpoints are documented
- [ ] Deployment guide is complete
- [ ] Contributing guide exists
- [ ] Diagrams are created
- [ ] New developer can set up project using docs

## Estimated Effort

- Task 1: 1-2 days (architecture docs)
- Task 2: 1 day (auth docs)
- Task 3: 2 days (API docs)
- Task 4: 1 day (deployment guide)
- Task 5: 0.5 days (contributing guide)
- Task 6: 0.5 days (diagrams)

**Total: 6-7 days**
