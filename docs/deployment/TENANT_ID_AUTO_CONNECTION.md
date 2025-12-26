# Tenant ID Auto-Connection Fix

## Problem

When switching tenants in the CMS, settings (like Site Name) were not being saved to the correct tenant because the tenant ID wasn't being automatically connected to database operations.

## Solution

### 1. Updated API Utility (`sparti-cms/utils/api.ts`)

The API utility now automatically adds the `X-Tenant-Id` header when `tenantId` is provided in the options:

```typescript
const getAuthHeaders = (additionalHeaders: Record<string, string> = {}, tenantId?: string) => {
  // ... existing headers ...
  // Automatically add X-Tenant-Id header if tenantId is provided
  ...(tenantId && { 'X-Tenant-Id': tenantId }),
  ...additionalHeaders,
};
```

### 2. Updated Settings Routes (`server/routes/settings.js`)

All settings routes now check `req.tenantId` first (set by auth middleware from headers), then fallback to query parameters:

```javascript
// Priority order:
// 1. req.tenantId (from X-Tenant-Id header, set by auth middleware)
// 2. req.query.tenantId (from query string)
// 3. req.user?.tenant_id (from JWT token)
// 4. 'tenant-gosg' (default fallback)
const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
```

### 3. Updated Frontend Components

Frontend components now pass `tenantId` in the API options:

```typescript
// Before
const response = await api.post(endpoint, requestBody);

// After
const response = await api.post(endpoint, requestBody, {
  tenantId: currentTenantId
});
```

## How It Works

1. **Frontend**: When making API calls, the frontend passes `tenantId` in the options object
2. **API Utility**: Automatically adds `X-Tenant-Id` header to the request
3. **Auth Middleware**: Extracts `X-Tenant-Id` header and sets `req.tenantId`
4. **Settings Routes**: Use `req.tenantId` first, ensuring the correct tenant is used

## Testing

To verify tenant ID auto-connection is working:

1. Switch to tenant `tenant-2960b682` (ACATR) in the CMS
2. Change Site Name in Branding Settings
3. Save
4. Check database: Settings should be saved with `tenant_id = 'tenant-2960b682'`

## Affected Routes

All routes in `server/routes/settings.js` have been updated:
- `/api/branding` (GET, POST)
- `/api/language/*` (POST)
- `/api/site-settings/:key` (GET, PUT)
- `/api/theme/:themeId/*` (GET, PUT)

## Notes

- The tenant ID is now automatically connected for all settings operations
- No need to manually pass tenant ID in query strings (though it still works as fallback)
- The system prioritizes the header value over query parameters for security
- Super admins can override tenant via query parameter or header
- Regular users are restricted to their own tenant

