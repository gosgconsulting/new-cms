# CMS Refactored Architecture - Quick Reference

## File Locations

### Controllers
```
server/controllers/
├── BaseController.js      # Base class with utilities
├── AuthController.js      # Authentication endpoints
└── ContentController.js   # Content endpoints
```

### Services
```
server/services/
├── authService.js        # Auth logic (tokens, passwords)
├── auditService.js       # Security audit logging
├── contentService.js     # Content business logic
└── mediaService.js       # Media processing
```

### Repositories
```
server/repositories/
├── BaseRepository.js     # CRUD operations
├── UserRepository.js     # User data access
├── PostRepository.js     # Post data access
└── MediaRepository.js    # Media data access
```

### Middleware
```
server/middleware/
├── auth.js              # JWT authentication
├── rbac.js              # Permissions & roles
├── errorHandler.js      # Error handling
├── validation.js        # Input validation
├── rateLimiter.js       # Rate limiting
└── requestLogger.js     # Request logging
```

## Common Patterns

### Creating an Endpoint

```javascript
// 1. Add service method (if needed)
export async function getPostsByTag(tag) {
  return await PostRepository.findAll({ tag });
}

// 2. Add controller method
async getPostsByTag(req, res) {
  const posts = await ContentService.getPostsByTag(req.params.tag);
  return this.success(res, posts);
}

// 3. Add route
router.get('/posts/tag/:tag',
  authenticateUser,
  requirePermission(Permission.CONTENT_READ),
  ContentController.wrap(ContentController.getPostsByTag)
);
```

### Using Repositories

```javascript
import UserRepository from '../repositories/UserRepository.js';

// Find
const user = await UserRepository.findById(id);
const users = await UserRepository.findAll({ role: 'admin' });

// Create
const newUser = await UserRepository.createUser(userData);

// Update
await UserRepository.updateUser(id, { first_name: 'Jane' });

// Delete
await UserRepository.delete(id);
```

### Using Transactions

```javascript
import { withTransaction } from '../utils/transaction.js';

await withTransaction(async (client) => {
  await client.query('INSERT INTO posts ...');
  await client.query('INSERT INTO post_categories ...');
});
```

### Using RBAC

```javascript
import { requirePermission, Permission } from '../middleware/rbac.js';

router.post('/posts',
  authenticateUser,
  requirePermission(Permission.CONTENT_CREATE),
  handler
);
```

### Error Handling

```javascript
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

// Throw errors
if (!post) throw new NotFoundError('Post');
if (!isValid) throw new ValidationError('Invalid data', errors);

// Errors are caught by errorHandler middleware
```

### Audit Logging

```javascript
import { logUserAction, AuditEventType } from '../services/auditService.js';

await logUserAction(
  AuditEventType.POST_CREATE,
  userId,
  tenantId,
  'post',
  postId,
  { title: post.title },
  req
);
```

## Quick Commands

```bash
# Run tests
npm test

# Run specific test suite
npm run test:auth
npm run test:repos

# Start development server
npm run dev

# Run migrations
npm run sequelize:migrate

# Check environment
npm run verify:env
```

## Common Imports

```javascript
// Controllers
import AuthController from '../controllers/AuthController.js';
import ContentController from '../controllers/ContentController.js';

// Services
import * as AuthService from '../services/authService.js';
import * as ContentService from '../services/contentService.js';
import * as MediaService from '../services/mediaService.js';

// Repositories
import UserRepository from '../repositories/UserRepository.js';
import PostRepository from '../repositories/PostRepository.js';
import MediaRepository from '../repositories/MediaRepository.js';

// Middleware
import { authenticateUser } from '../middleware/auth.js';
import { requirePermission, Permission } from '../middleware/rbac.js';
import { errorHandler, asyncHandler } from '../middleware/errorHandler.js';

// Utilities
import { withTransaction } from '../utils/transaction.js';
```

## Response Formats

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

### Paginated
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## Permissions Quick Reference

| Permission | Description |
|-----------|-------------|
| `user:read` | View users |
| `user:create` | Create users |
| `user:update` | Update users |
| `user:delete` | Delete users |
| `content:read` | View content |
| `content:create` | Create content |
| `content:update` | Update content |
| `content:delete` | Delete content |
| `content:publish` | Publish content |
| `media:upload` | Upload media |
| `settings:update` | Update settings |
| `system:admin` | Full system access |

## Role Permissions

| Role | Permissions |
|------|-------------|
| `super_admin` | All permissions |
| `admin` | Most permissions except system:admin |
| `editor` | Content + media management |
| `author` | Create and edit own content |
| `contributor` | Create content only |
| `viewer` | Read-only access |

## Troubleshooting

### "Authentication required"
- Add `Authorization: Bearer <token>` header
- Check token expiration
- Verify token format

### "Insufficient permissions"
- Check user role
- Verify required permission
- Review RBAC configuration

### "Database connection failed"
- Check DATABASE_URL in .env
- Verify database is running
- Check connection pool status

### Tests failing
- Ensure database is running
- Run migrations: `npm run sequelize:migrate`
- Check environment variables

## Best Practices

1. **Always use repositories** for database access
2. **Put business logic in services**, not controllers
3. **Use transactions** for multi-step operations
4. **Add RBAC** to protected endpoints
5. **Log security events** with audit service
6. **Handle errors** with custom error classes
7. **Validate input** before processing
8. **Write tests** for new features
9. **Document** new endpoints
10. **Follow** existing patterns

## More Information

- [Full Architecture Guide](./REFACTORED_ARCHITECTURE.md)
- [API Documentation](../api/REFACTORED_API.md)
- [Implementation Summary](./REFACTOR_SUMMARY.md)
