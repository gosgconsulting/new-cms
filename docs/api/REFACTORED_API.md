# Refactored API Documentation

## Base URL

```
Development: http://localhost:4173/api
Production: https://your-domain.com/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

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

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Authentication Endpoints

### Login

**POST** `/api/auth/login`

Authenticate user and receive tokens.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": "15m"
  },
  "message": "Login successful"
}
```

### Refresh Token

**POST** `/api/auth/refresh`

Get a new access token using refresh token.

**Request Body**:
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "expiresIn": "15m"
  }
}
```

### Logout

**POST** `/api/auth/logout`

Revoke refresh token.

**Request Body**:
```json
{
  "refreshToken": "eyJhbGc..."
}
```

### Get Current User

**GET** `/api/auth/me`

Get authenticated user details.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "tenant_id": "tenant-abc"
  }
}
```

### Register

**POST** `/api/auth/register`

Register a new user.

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "tenant_id": "tenant-abc"
}
```

### Forgot Password

**POST** `/api/auth/forgot-password`

Request password reset.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

### Reset Password

**POST** `/api/auth/reset-password`

Reset password with token.

**Request Body**:
```json
{
  "token": "reset-token",
  "newPassword": "NewSecurePassword123!"
}
```

### Change Password

**POST** `/api/auth/change-password`

Change password (authenticated).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

## Content Endpoints

### Get Posts

**GET** `/api/posts`

Get all posts with pagination.

**Query Parameters**:
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20, max: 100)
- `status` (string) - Filter by status
- `author_id` (string) - Filter by author
- `sort` (string) - Sort field (default: created_at)
- `order` (string) - Sort direction: ASC or DESC (default: DESC)

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": { ... }
  }
}
```

### Get Post

**GET** `/api/posts/:id`

Get single post with categories and tags.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Post Title",
    "slug": "post-slug",
    "content": "...",
    "categories": [...],
    "tags": [...]
  }
}
```

### Create Post

**POST** `/api/posts`

Create a new post.

**Headers**: `Authorization: Bearer <token>`

**Required Permission**: `content:create`

**Request Body**:
```json
{
  "title": "New Post",
  "slug": "new-post",
  "content": "Post content...",
  "excerpt": "Brief description",
  "status": "draft"
}
```

### Update Post

**PUT** `/api/posts/:id`

Update existing post.

**Headers**: `Authorization: Bearer <token>`

**Required Permission**: `content:update`

### Delete Post

**DELETE** `/api/posts/:id`

Delete post.

**Headers**: `Authorization: Bearer <token>`

**Required Permission**: `content:delete`

### Publish Post

**POST** `/api/posts/:id/publish`

Publish a post.

**Headers**: `Authorization: Bearer <token>`

**Required Permission**: `content:publish`

### Search Posts

**GET** `/api/posts/search?q=<query>`

Search posts by title or content.

**Query Parameters**:
- `q` (string, required) - Search query
- `page`, `limit`, `sort`, `order` - Same as Get Posts

## Permissions Reference

### User Permissions
- `user:read` - View users
- `user:create` - Create users
- `user:update` - Update users
- `user:delete` - Delete users
- `user:manage_roles` - Change user roles

### Content Permissions
- `content:read` - View content
- `content:create` - Create content
- `content:update` - Update content
- `content:delete` - Delete content
- `content:publish` - Publish content

### Media Permissions
- `media:read` - View media
- `media:upload` - Upload media
- `media:delete` - Delete media

### Tenant Permissions
- `tenant:read` - View tenants
- `tenant:create` - Create tenants
- `tenant:update` - Update tenants
- `tenant:delete` - Delete tenants

### Settings Permissions
- `settings:read` - View settings
- `settings:update` - Update settings

### System Permissions
- `system:admin` - Full system access
- `audit:read` - View audit logs

## Rate Limits

| Endpoint Type | Rate Limit |
|--------------|------------|
| Auth endpoints | 5 requests/minute |
| API endpoints | 100 requests/minute |
| Upload endpoints | 10 requests/minute |

Rate limit headers:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Time when limit resets
- `Retry-After` - Seconds to wait (when limited)

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `INVALID_TOKEN` | 401 | Invalid JWT token |
| `TOKEN_EXPIRED` | 401 | JWT token expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `DATABASE_ERROR` | 500 | Database operation failed |

## Examples

### Complete Authentication Flow

```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
});

const { accessToken, refreshToken } = await loginResponse.json();

// 2. Make authenticated request
const postsResponse = await fetch('/api/posts', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// 3. Refresh token when expired
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});

const { accessToken: newAccessToken } = await refreshResponse.json();
```

### Creating Content with Permissions

```javascript
// Create post (requires content:create permission)
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'New Post',
    slug: 'new-post',
    content: 'Post content...',
    status: 'draft'
  })
});
```

## Changelog

### v2 (Refactored) - 2026-01-19

- Implemented service layer pattern
- Added repository pattern for data access
- Introduced RBAC with fine-grained permissions
- Added audit logging for security events
- Implemented refresh token mechanism
- Added comprehensive error handling
- Introduced rate limiting
- Added transaction support
- Cleaned up debug code
- Improved code organization

### v1 (Legacy)

- Basic JWT authentication
- Direct database queries in routes
- Limited error handling
- No audit logging
