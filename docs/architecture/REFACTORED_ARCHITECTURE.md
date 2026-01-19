# CMS Refactored Architecture

## Overview

This document describes the refactored CMS architecture implemented to improve code organization, maintainability, and scalability. The refactor focuses on three core areas: authentication system, database layer, and API routes.

## Architecture Layers

### 1. API Layer (Controllers)

**Location**: `server/controllers/`

Controllers handle HTTP requests and responses. They are thin layers that:
- Validate input
- Call appropriate services
- Format responses
- Handle errors

**Key Controllers**:
- `AuthController.js` - Authentication endpoints
- `ContentController.js` - Content management endpoints
- `BaseController.js` - Common controller utilities

**Example Usage**:
```javascript
import AuthController from '../controllers/AuthController.js';

router.post('/login', AuthController.wrap(AuthController.login));
```

### 2. Service Layer

**Location**: `server/services/`

Services contain business logic and orchestrate operations. They:
- Implement business rules
- Coordinate between repositories
- Handle complex workflows
- Manage transactions

**Key Services**:
- `authService.js` - Authentication & authorization logic
- `auditService.js` - Audit logging and security events
- `contentService.js` - Content management business logic
- `mediaService.js` - Media processing and management

**Example Usage**:
```javascript
import { authenticateWithCredentials, generateTokenPair } from '../services/authService.js';

const user = await authenticateWithCredentials(email, password);
const tokens = generateTokenPair(user);
```

### 3. Repository Layer

**Location**: `server/repositories/`

Repositories encapsulate database access. They:
- Provide CRUD operations
- Abstract database queries
- Ensure consistent data access
- Handle database errors

**Key Repositories**:
- `BaseRepository.js` - Common CRUD operations
- `UserRepository.js` - User data access
- `PostRepository.js` - Post data access
- `MediaRepository.js` - Media data access

**Example Usage**:
```javascript
import UserRepository from '../repositories/UserRepository.js';

const user = await UserRepository.findByEmail(email);
const users = await UserRepository.findByTenant(tenantId);
```

### 4. Middleware Layer

**Location**: `server/middleware/`

Middleware handles cross-cutting concerns:

**Authentication & Authorization**:
- `auth.js` - JWT token verification
- `rbac.js` - Role-based access control
- `tenantApiKey.js` - Tenant API key authentication
- `accessKey.js` - Access key authentication

**Request Processing**:
- `validation.js` - Input validation
- `rateLimiter.js` - Rate limiting
- `requestLogger.js` - Request logging
- `errorHandler.js` - Centralized error handling

**Other**:
- `cors.js` - CORS configuration
- `databaseReady.js` - Database readiness check
- `tenantUrl.js` - Tenant URL resolution
- `themeUrl.js` - Theme URL resolution

### 5. Database Layer

**Location**: `sparti-cms/db/`

Database layer provides:
- Connection pooling (`connection.js`)
- Query execution with retry logic
- Transaction support (`server/utils/transaction.js`)
- Modular database operations (`modules/`)

## Authentication System

### Token-Based Authentication

The system uses JWT tokens with a dual-token approach:

1. **Access Token** (15 minutes)
   - Short-lived
   - Used for API requests
   - Contains user data

2. **Refresh Token** (7 days)
   - Long-lived
   - Used to obtain new access tokens
   - Stored server-side

### Authentication Flow

```
Client                    Server
  |                         |
  |-- Login (email/pwd) --->|
  |                         |-- Verify credentials
  |                         |-- Generate tokens
  |<-- Access + Refresh ----|
  |                         |
  |-- API Request --------->|
  |    (Access Token)       |-- Verify access token
  |                         |-- Process request
  |<-- Response ------------|
  |                         |
  |-- Refresh ------------->|
  |    (Refresh Token)      |-- Verify refresh token
  |<-- New Access Token ----|
```

### Role-Based Access Control (RBAC)

**Roles** (in order of permissions):
1. `super_admin` - Full system access
2. `admin` - Tenant administration
3. `editor` - Content management
4. `author` - Content creation
5. `contributor` - Limited content creation
6. `viewer` - Read-only access

**Permission Examples**:
```javascript
import { requirePermission, Permission } from '../middleware/rbac.js';

// Require specific permission
router.post('/posts', 
  authenticateUser, 
  requirePermission(Permission.CONTENT_CREATE),
  createPost
);

// Require super admin
router.delete('/tenants/:id',
  authenticateUser,
  requireSuperAdmin(),
  deleteTenant
);
```

### Audit Logging

All security-relevant events are logged:
- Authentication attempts
- User actions
- Permission denials
- Resource modifications

**Example**:
```javascript
import { logAuthEvent, AuditEventType } from '../services/auditService.js';

await logAuthEvent(
  AuditEventType.LOGIN_SUCCESS,
  user.id,
  { email: user.email },
  req
);
```

## Repository Pattern

### Base Repository

All repositories extend `BaseRepository` which provides:
- `findById(id)` - Find by primary key
- `findAll(filters, options)` - Find with filtering
- `findOne(filters)` - Find single record
- `create(data)` - Create record
- `update(id, data)` - Update record
- `delete(id)` - Delete record
- `count(filters)` - Count records
- `exists(filters)` - Check existence

### Custom Repository Methods

Repositories can add domain-specific methods:

```javascript
class UserRepository extends BaseRepository {
  async findByEmail(email) {
    // Custom query logic
  }
  
  async findByTenant(tenantId) {
    // Custom query logic
  }
}
```

## Transaction Support

### Simple Transaction

```javascript
import { withTransaction } from '../utils/transaction.js';

const result = await withTransaction(async (client) => {
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO profiles ...');
  return { success: true };
});
```

### Manual Transaction Control

```javascript
import { createTransaction } from '../utils/transaction.js';

const txn = await createTransaction();
try {
  await txn.query('INSERT INTO ...');
  await txn.query('UPDATE ...');
  await txn.commit();
} catch (error) {
  await txn.rollback();
  throw error;
} finally {
  txn.release();
}
```

### Transaction with Retry

```javascript
import { withTransactionRetry } from '../utils/transaction.js';

const result = await withTransactionRetry(async (client) => {
  // Operations that might encounter deadlocks
}, 3, 100); // 3 retries, 100ms delay
```

## Error Handling

### Custom Error Classes

```javascript
import { 
  AppError, 
  ValidationError, 
  NotFoundError,
  UnauthorizedError,
  ForbiddenError 
} from '../middleware/errorHandler.js';

// Throw custom errors
throw new NotFoundError('Post');
throw new ValidationError('Invalid input', errors);
throw new UnauthorizedError();
```

### Centralized Error Handler

All errors are caught by the centralized error handler:

```javascript
import { errorHandler, asyncHandler } from '../middleware/errorHandler.js';

// Wrap async routes
router.get('/posts', asyncHandler(async (req, res) => {
  // Any thrown error will be caught
  const posts = await PostRepository.findAll();
  res.json(posts);
}));

// Register error handler (must be last)
app.use(errorHandler);
```

## API Versioning

### Current Version: v1

All existing routes are under `/api/*` (implicit v1)

### Future: v2

New routes can be added under `/api/v2/*`:

```javascript
// v2 routes with improved structure
router.use('/api/v2/auth', authV2Routes);
router.use('/api/v2/content', contentV2Routes);
```

## Middleware Stack Order

Middleware is applied in this order:

1. **CORS** - Handle cross-origin requests
2. **Request ID** - Add unique ID to each request
3. **Request Logger** - Log incoming requests
4. **Body Parser** - Parse JSON/URL-encoded bodies
5. **Rate Limiter** - Prevent abuse
6. **Authentication** - Verify JWT tokens
7. **Authorization** - Check permissions
8. **Validation** - Validate input
9. **Routes** - Handle requests
10. **Error Handler** - Catch and format errors

## Best Practices

### 1. Use Repositories for Data Access

❌ **Don't**:
```javascript
const result = await query('SELECT * FROM users WHERE id = $1', [id]);
```

✅ **Do**:
```javascript
const user = await UserRepository.findById(id);
```

### 2. Use Services for Business Logic

❌ **Don't**:
```javascript
router.post('/posts', async (req, res) => {
  // Complex business logic in route
  const post = await createPost(...);
  await addCategories(...);
  await sendNotifications(...);
});
```

✅ **Do**:
```javascript
router.post('/posts', async (req, res) => {
  const post = await ContentService.createPostWithRelations(...);
  res.json(post);
});
```

### 3. Use Controllers for HTTP Handling

❌ **Don't**:
```javascript
router.get('/posts', async (req, res) => {
  const posts = await PostRepository.findAll();
  res.json({ success: true, data: posts });
});
```

✅ **Do**:
```javascript
router.get('/posts', ContentController.wrap(ContentController.getPosts));
```

### 4. Use Transactions for Multi-Step Operations

❌ **Don't**:
```javascript
await createPost(data);
await addCategories(postId, categories);
// If this fails, post is created but categories aren't
```

✅ **Do**:
```javascript
await withTransaction(async (client) => {
  await client.query('INSERT INTO posts ...');
  await client.query('INSERT INTO post_categories ...');
});
```

### 5. Use RBAC for Authorization

❌ **Don't**:
```javascript
router.delete('/posts/:id', async (req, res) => {
  if (!req.user.is_super_admin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // ...
});
```

✅ **Do**:
```javascript
router.delete('/posts/:id',
  authenticateUser,
  requirePermission(Permission.CONTENT_DELETE),
  deletePost
);
```

## Migration Guide

### Migrating Existing Routes

1. **Extract business logic to service**
2. **Create controller method**
3. **Update route to use controller**
4. **Add proper error handling**
5. **Add RBAC if needed**

**Before**:
```javascript
router.post('/posts', authenticateUser, async (req, res) => {
  try {
    const post = await query('INSERT INTO posts ...');
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**After**:
```javascript
router.post('/posts',
  authenticateUser,
  requirePermission(Permission.CONTENT_CREATE),
  ContentController.wrap(ContentController.createPost)
);
```

## Testing

### Running Tests

```bash
# Run all tests
node server/tests/runTests.js

# Run specific test suite
node server/tests/authService.test.js
node server/tests/repositories.test.js
```

### Writing Tests

Tests are organized by component:
- `authService.test.js` - Auth service tests
- `repositories.test.js` - Repository tests
- Add new test files as needed

## Performance Considerations

### Database Connection Pooling

- Connection pool configured in `sparti-cms/db/connection.js`
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 10 seconds (30s for localhost)

### Query Optimization

- Use indexes for common queries
- Implement pagination for large result sets
- Use connection pooling
- Implement query result caching where appropriate

### Rate Limiting

- Auth endpoints: 5 requests/minute
- API endpoints: 100 requests/minute
- Upload endpoints: 10 requests/minute

## Security

### Authentication

- JWT tokens with short expiration
- Refresh token rotation
- Secure password hashing (bcrypt)
- Password strength validation

### Authorization

- Role-based access control
- Tenant isolation
- Resource ownership checks
- Permission-based middleware

### Audit Logging

- All auth events logged
- User actions tracked
- Security events recorded
- 90-day retention policy

## Troubleshooting

### Common Issues

**Issue**: "Authentication required"
- Check if Authorization header is present
- Verify token format: `Bearer <token>`
- Check token expiration

**Issue**: "Insufficient permissions"
- Verify user role
- Check required permissions for endpoint
- Review RBAC configuration

**Issue**: "Database connection failed"
- Check DATABASE_URL environment variable
- Verify database is running
- Check connection pool status

## Future Enhancements

1. **Redis Integration** - For session storage and caching
2. **GraphQL API** - Alternative to REST
3. **WebSocket Support** - Real-time updates
4. **Advanced Caching** - Query result caching
5. **API Gateway** - Centralized API management
6. **Microservices** - Split into smaller services
7. **Event Sourcing** - Track all state changes
8. **CQRS Pattern** - Separate read/write models

## Additional Resources

- [API Documentation](../api/README.md)
- [Database Schema](../setup/DATABASE_SCHEMA.md)
- [Deployment Guide](../deployment/DEPLOYMENT.md)
- [Testing Guide](../testing/TESTING.md)
