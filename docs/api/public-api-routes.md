# Public API Routes Documentation

## Overview

This document describes the public API endpoints available at `/api/v1/`. These endpoints provide read-only access to pages, blog posts, site schemas (header/footer), and public settings.

**Base URL**: `/api/v1`

## Authentication & Tenant Isolation

All endpoints require authentication using a **Tenant API Key**. The API key identifies the tenant and automatically scopes all responses to that tenant's data, ensuring complete data isolation between tenants.

### Authentication Methods

The API supports three methods for providing your API key (all methods are equivalent):

#### Method 1: X-API-Key Header (Recommended)
```bash
curl -H "X-API-Key: your-api-key-here" https://api.example.com/api/v1/pages
```

#### Method 2: Authorization Bearer Token
```bash
curl -H "Authorization: Bearer your-api-key-here" https://api.example.com/api/v1/pages
```

#### Method 3: Case-Insensitive Header
```bash
curl -H "x-api-key: your-api-key-here" https://api.example.com/api/v1/pages
```

### Getting Your API Key

API keys are managed through the Tenant Management API. To generate an API key for your tenant:

**Endpoint**: `POST /api/tenants/:id/api-keys`

**Request Example**:
```bash
POST /api/tenants/tenant-123/api-keys
Content-Type: application/json

{
  "description": "Production API Key"
}
```

**Response Example**:
```json
{
  "apiKey": "tenant_tenant-123_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

> **⚠️ Important**: Store your API key securely. The API key is only shown once when generated. If you lose it, you'll need to generate a new one.

### API Key Format

API keys follow this format:
```
tenant_{tenant_id}_{uuid}
```

Example: `tenant_tenant-gosg_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### Validating Your API Key

You can validate an API key before using it:

**Endpoint**: `POST /api/tenants/validate-api-key`

**Request Example**:
```bash
POST /api/tenants/validate-api-key
Content-Type: application/json

{
  "apiKey": "tenant_tenant-123_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Response Example** (Valid Key):
```json
{
  "valid": true,
  "tenant": {
    "tenant_id": "tenant-123",
    "name": "My Tenant"
  }
}
```

**Response Example** (Invalid Key):
```json
{
  "valid": false
}
```

### Managing API Keys

#### List All API Keys for a Tenant

**Endpoint**: `GET /api/tenants/:id/api-keys`

**Response Example**:
```json
[
  {
    "id": 1,
    "api_key": "tenant_tenant-123_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "description": "Production API Key",
    "created_at": "2024-01-01T00:00:00.000Z",
    "expires_at": null
  }
]
```

#### Delete an API Key

**Endpoint**: `DELETE /api/tenants/:id/api-keys/:keyId`

**Response Example**:
```json
{
  "message": "API key deleted successfully"
}
```

### Authentication Errors

If authentication fails, you'll receive one of these error responses:

#### Missing API Key
**Status Code**: `401 Unauthorized`
```json
{
  "success": false,
  "error": "API key is required",
  "code": "MISSING_API_KEY"
}
```

#### Invalid or Expired API Key
**Status Code**: `401 Unauthorized`
```json
{
  "success": false,
  "error": "Invalid or expired API key",
  "code": "INVALID_API_KEY"
}
```

#### Authentication Error
**Status Code**: `500 Internal Server Error`
```json
{
  "success": false,
  "error": "Authentication error",
  "code": "AUTH_ERROR"
}
```

### API Key Expiration

- API keys can have an optional expiration date (`expires_at`)
- If an expiration date is set, the key will be automatically rejected after that date
- Keys without an expiration date (`expires_at` is `NULL`) never expire
- Expired keys return `INVALID_API_KEY` error

### Security Best Practices

1. **Never commit API keys to version control** - Use environment variables or secure secret management
2. **Use different keys for different environments** - Generate separate keys for development, staging, and production
3. **Rotate keys regularly** - Generate new keys and delete old ones periodically
4. **Use HTTPS only** - Always make API requests over HTTPS to protect your keys in transit
5. **Store keys securely** - Use secure storage solutions (e.g., environment variables, secret managers)
6. **Monitor key usage** - Regularly review which keys are active and delete unused ones

### Example: Complete Authenticated Request

```bash
# Using curl with X-API-Key header
curl -X GET \
  -H "X-API-Key: tenant_tenant-123_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
  -H "Content-Type: application/json" \
  https://api.example.com/api/v1/pages?status=published&limit=10

# Using curl with Authorization Bearer
curl -X GET \
  -H "Authorization: Bearer tenant_tenant-123_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
  -H "Content-Type: application/json" \
  https://api.example.com/api/v1/pages?status=published&limit=10
```

### JavaScript/Node.js Example

```javascript
const apiKey = 'tenant_tenant-123_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
const baseUrl = 'https://api.example.com/api/v1';

// Using fetch with X-API-Key header
const response = await fetch(`${baseUrl}/pages?status=published&limit=10`, {
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Python Example

```python
import requests

api_key = 'tenant_tenant-123_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
base_url = 'https://api.example.com/api/v1'

headers = {
    'X-API-Key': api_key,
    'Content-Type': 'application/json'
}

response = requests.get(
    f'{base_url}/pages',
    params={'status': 'published', 'limit': 10},
    headers=headers
)

data = response.json()
```

### Tenant Isolation

Once authenticated, all API requests are automatically scoped to your tenant:
- All data returned is specific to your tenant
- You cannot access data from other tenants
- The `tenant_id` is automatically extracted from your API key and included in all responses
- No need to manually specify tenant ID in requests

## Response Format

### Success Response

All successful responses follow this structure:

```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "tenant_id": "string",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response

All error responses follow this structure:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- `200` - Success
- `401` - Unauthorized (authentication required or failed)
- `403` - Forbidden (e.g., non-public setting)
- `404` - Resource not found
- `500` - Internal server error

---

## Pages Endpoints

### Get All Pages

Retrieve a list of pages with optional filtering and pagination.

**Endpoint**: `GET /api/v1/pages`

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | - | Filter by page status |
| `page_type` | string | No | - | Filter by page type |
| `limit` | integer | No | 100 | Maximum number of results to return |
| `offset` | integer | No | 0 | Number of results to skip (requires `limit`) |

**Example Request**:
```bash
GET /api/v1/pages?status=published&page_type=landing&limit=20&offset=0
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "page_name": "Home Page",
      "slug": "/",
      "meta_title": "Welcome",
      "meta_description": "Home page description",
      "seo_index": true,
      "status": "published",
      "page_type": "landing",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "campaign_source": null,
      "conversion_goal": null,
      "legal_type": null,
      "last_reviewed_date": null,
      "version": 1
    }
  ],
  "meta": {
    "tenant_id": "tenant-123",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Codes**:
- `FETCH_PAGES_ERROR` - General error fetching pages

---

### Get Single Page by Slug

Retrieve a single page with its full layout data by slug.

**Endpoint**: `GET /api/v1/pages/:slug`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Page slug (leading `/` is optional, will be added automatically) |

**Example Request**:
```bash
GET /api/v1/pages/about-us
# or
GET /api/v1/pages/about-us
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "page_name": "About Us",
    "slug": "/about-us",
    "layout": { /* page layout schema */ },
    /* ... other page fields ... */
  },
  "meta": {
    "tenant_id": "tenant-123",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Codes**:
- `PAGE_NOT_FOUND` (404) - Page with the specified slug does not exist
- `FETCH_PAGE_ERROR` - General error fetching page

**Notes**:
- The slug parameter will automatically be prefixed with `/` if it doesn't start with one
- Returns full page data including layout schema via `getPageWithLayout()`

---

## Site Schema Endpoints

### Get Header Schema

Retrieve the header schema configuration for the site.

**Endpoint**: `GET /api/v1/header`

**Example Request**:
```bash
GET /api/v1/header
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    /* header schema object */
  },
  "meta": {
    "tenant_id": "tenant-123",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Codes**:
- `HEADER_NOT_FOUND` (404) - Header schema not configured for this tenant
- `FETCH_HEADER_ERROR` - General error fetching header schema

---

### Get Footer Schema

Retrieve the footer schema configuration for the site.

**Endpoint**: `GET /api/v1/footer`

**Example Request**:
```bash
GET /api/v1/footer
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    /* footer schema object */
  },
  "meta": {
    "tenant_id": "tenant-123",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Codes**:
- `FOOTER_NOT_FOUND` (404) - Footer schema not configured for this tenant
- `FETCH_FOOTER_ERROR` - General error fetching footer schema

---

## Blog Endpoints

### Get All Blog Posts

Retrieve a list of blog posts with optional filtering and pagination.

**Endpoint**: `GET /api/v1/blog/posts`

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | `published` | Filter by post status (defaults to `published` if not specified) |
| `limit` | integer | No | 20 | Maximum number of results to return |
| `offset` | integer | No | 0 | Number of results to skip (requires `limit`) |

**Example Request**:
```bash
GET /api/v1/blog/posts?status=published&limit=10&offset=0
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Blog Post Title",
      "slug": "blog-post-title",
      "excerpt": "Post excerpt...",
      "content": "Full post content...",
      "featured_image": "https://example.com/image.jpg",
      "status": "published",
      "post_type": "post",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "published_at": "2024-01-01T00:00:00.000Z",
      "view_count": 100,
      "terms": [
        {
          "id": 1,
          "name": "Technology",
          "slug": "technology",
          "taxonomy": "category"
        },
        {
          "id": 2,
          "name": "web-development",
          "slug": "web-development",
          "taxonomy": "tag"
        }
      ]
    }
  ],
  "meta": {
    "tenant_id": "tenant-123",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Codes**:
- `FETCH_POSTS_ERROR` - General error fetching blog posts

**Notes**:
- If the `posts` table has a `tenant_id` column, results are automatically filtered by tenant
- If `tenant_id` column doesn't exist, all published posts are returned (tenant isolation not enforced)
- Posts are ordered by `created_at` in descending order (newest first)
- Each post includes associated terms (categories and tags) as a JSON array

---

### Get Single Blog Post by Slug

Retrieve a single blog post with its associated terms (categories and tags) by slug.

**Endpoint**: `GET /api/v1/blog/posts/:slug`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Post slug |

**Example Request**:
```bash
GET /api/v1/blog/posts/my-blog-post
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Blog Post Title",
    "slug": "my-blog-post",
    "excerpt": "Post excerpt...",
    "content": "Full post content...",
    "featured_image": "https://example.com/image.jpg",
    "status": "published",
    "post_type": "post",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "published_at": "2024-01-01T00:00:00.000Z",
    "view_count": 100,
    "terms": [
      {
        "id": 1,
        "name": "Technology",
        "slug": "technology",
        "taxonomy": "category"
      },
      {
        "id": 2,
        "name": "web-development",
        "slug": "web-development",
        "taxonomy": "tag"
      }
    ]
  },
  "meta": {
    "tenant_id": "tenant-123",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Codes**:
- `POST_NOT_FOUND` (404) - Post with the specified slug does not exist
- `FETCH_POST_ERROR` - General error fetching blog post

**Notes**:
- Returns the post with all associated terms (categories and tags)
- Terms are returned as an array of objects with `id`, `name`, `slug`, and `taxonomy` fields

---

## Settings Endpoints

### Get All Public Settings

Retrieve all public settings for the tenant as a key-value object.

**Endpoint**: `GET /api/v1/settings`

**Example Request**:
```bash
GET /api/v1/settings
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "site_name": "My Site",
    "site_description": "A great website",
    "contact_email": "contact@example.com"
  },
  "meta": {
    "tenant_id": "tenant-123",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Codes**:
- `FETCH_SETTINGS_ERROR` - General error fetching settings

**Notes**:
- Only returns settings where `is_public === true`
- Settings are returned as a flat key-value object for easy access
- Non-public settings are automatically filtered out

---

### Get Specific Setting by Key

Retrieve a single public setting by its key.

**Endpoint**: `GET /api/v1/settings/:key`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Setting key identifier |

**Example Request**:
```bash
GET /api/v1/settings/site_name
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "key": "site_name",
    "value": "My Site",
    "type": "string",
    "category": "general"
  },
  "meta": {
    "tenant_id": "tenant-123",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Codes**:
- `SETTING_NOT_FOUND` (404) - Setting with the specified key does not exist
- `SETTING_NOT_PUBLIC` (403) - Setting exists but is not marked as public
- `FETCH_SETTING_ERROR` - General error fetching setting

**Notes**:
- Returns detailed information about the setting including type and category
- Only public settings can be accessed through this endpoint
- Attempting to access a non-public setting will return a 403 Forbidden error

---

## Error Reference

### Common Error Codes

#### Authentication Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `MISSING_API_KEY` | 401 | API key is required but not provided in the request |
| `INVALID_API_KEY` | 401 | API key is invalid, expired, or does not exist |
| `AUTH_ERROR` | 500 | Internal error occurred during authentication |

#### Endpoint Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `FETCH_PAGES_ERROR` | 500 | Error occurred while fetching pages |
| `PAGE_NOT_FOUND` | 404 | Requested page does not exist |
| `FETCH_PAGE_ERROR` | 500 | Error occurred while fetching a single page |
| `HEADER_NOT_FOUND` | 404 | Header schema not found |
| `FETCH_HEADER_ERROR` | 500 | Error occurred while fetching header schema |
| `FOOTER_NOT_FOUND` | 404 | Footer schema not found |
| `FETCH_FOOTER_ERROR` | 500 | Error occurred while fetching footer schema |
| `FETCH_POSTS_ERROR` | 500 | Error occurred while fetching blog posts |
| `POST_NOT_FOUND` | 404 | Requested blog post does not exist |
| `FETCH_POST_ERROR` | 500 | Error occurred while fetching a single blog post |
| `FETCH_SETTINGS_ERROR` | 500 | Error occurred while fetching settings |
| `SETTING_NOT_FOUND` | 404 | Requested setting does not exist |
| `SETTING_NOT_PUBLIC` | 403 | Requested setting is not public |
| `FETCH_SETTING_ERROR` | 500 | Error occurred while fetching a single setting |

---

## Implementation Notes

### Tenant Isolation

All endpoints automatically filter results by `tenant_id` when available. The tenant ID is automatically extracted from your API key during authentication and used to ensure complete data isolation between tenants. You don't need to manually specify tenant ID in your requests.

### Pagination

Endpoints that support pagination use `limit` and `offset` query parameters:
- `limit`: Maximum number of results (defaults vary by endpoint)
- `offset`: Number of results to skip (must be used with `limit`)

### Default Behavior

- **Blog Posts**: Defaults to `status=published` if no status filter is provided
- **Pages**: No default status filter; returns all pages matching other criteria
- **Pagination**: Default limits vary by endpoint (pages: 100, blog posts: 20)

### Data Format

- All timestamps are returned in ISO 8601 format
- JSON fields are automatically parsed when returned from the database
- Terms/categories are returned as JSON arrays

---

## Version History

- **v1.0** - Initial API documentation

