# Phase 1: Critical Fixes
**Duration:** 1-2 weeks  
**Priority:** Critical  
**Goal:** Remove hardcoded values, centralize configuration, standardize error handling, complete logging migration

## Overview

This phase addresses critical issues that break multi-tenancy and create security risks. These fixes must be completed before moving to architecture improvements.

## Task 1: Remove All Hardcoded Tenant IDs

### 1.1 Database Modules

**Files to Update:**
- `sparti-cms/db/modules/pages.js`
- `sparti-cms/db/modules/branding.js`

**Current Issues:**
```javascript
// sparti-cms/db/modules/pages.js:22
const homePageRes = await query(`SELECT id FROM pages WHERE slug = '/' AND tenant_id = 'tenant-gosg'`);

// sparti-cms/db/modules/pages.js:27
VALUES ('Homepage', '/', '...', 'tenant-gosg')

// sparti-cms/db/modules/branding.js:10
export async function getBrandingSettings(tenantId = 'tenant-gosg', themeId = null)
```

**Action Plan:**
1. Remove default `'tenant-gosg'` from function signatures
2. Make `tenantId` parameter required (no default)
3. Add validation to throw error if `tenantId` is missing
4. Update all call sites to pass `tenantId` explicitly

**Implementation:**
```javascript
// Before
export async function getBrandingSettings(tenantId = 'tenant-gosg', themeId = null) {
  // ...
}

// After
export async function getBrandingSettings(tenantId, themeId = null) {
  if (!tenantId) {
    throw new Error('tenantId is required for getBrandingSettings');
  }
  // ...
}
```

**Call Sites to Update:**
- `server/routes/public.js` - Pass `req.tenantId` explicitly
- `server/routes/settings.js` - Extract from request
- `sparti-cms/render/pageRenderer.js` - Pass tenant from context
- All theme components using `useThemeBranding` hook

### 1.2 Frontend Components

**Files to Update:**
- `sparti-cms/theme/landingpage/index.tsx` (line 57)
- `sparti-cms/components/auth/AuthProvider.tsx` (line 116)

**Current Issues:**
```typescript
// sparti-cms/theme/landingpage/index.tsx:57
const { branding, loading: brandingLoading, error: brandingError } = useThemeBranding(tenantSlug, 'tenant-2960b682'); // TODO: fix this

// sparti-cms/components/auth/AuthProvider.tsx:116
if (!tenantIdToSet && import.meta.env.DEV) {
  tenantIdToSet = 'tenant-gosg';
}
```

**Action Plan:**
1. **landingpage/index.tsx:**
   - Use `effectiveTenantId` from props/environment
   - Pass `effectiveTenantId` to `useThemeBranding` instead of hardcoded value
   - Add fallback to `null` if no tenant ID available

2. **AuthProvider.tsx:**
   - Remove hardcoded `'tenant-gosg'` fallback
   - Use environment variable `VITE_DEFAULT_TENANT_ID` if needed for dev
   - Document that dev mode requires explicit tenant selection

**Implementation:**
```typescript
// landingpage/index.tsx
const effectiveTenantId = tenantId || (typeof window !== 'undefined' && (window as any).__CMS_TENANT__) || null;
const { branding, loading: brandingLoading, error: brandingError } = useThemeBranding(tenantSlug, effectiveTenantId);

// AuthProvider.tsx
if (!tenantIdToSet && import.meta.env.DEV) {
  const devTenant = import.meta.env.VITE_DEFAULT_TENANT_ID;
  if (devTenant) {
    tenantIdToSet = devTenant;
  } else {
    console.warn('[Auth] No tenant ID available in dev mode. User must select tenant.');
  }
}
```

### 1.3 Search and Replace All Instances

**Script to Run:**
```bash
# Find all hardcoded tenant IDs
grep -r "tenant-gosg" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" .
grep -r "tenant-2960b682" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" .
```

**Files to Review:**
- All files in `sparti-cms/db/modules/`
- All theme files in `sparti-cms/theme/`
- All component files using tenant context

**Validation:**
- Run tests after each change
- Verify multi-tenant isolation works
- Check that no tenant can access another tenant's data

## Task 2: Centralize Configuration Management

### 2.1 Create Configuration Module

**New File:** `server/config/index.js`

**Purpose:** Centralize all environment variable access with validation and type safety.

**Implementation:**
```javascript
// server/config/index.js
import { z } from 'zod'; // Add zod as dependency

const configSchema = z.object({
  // Database
  database: z.object({
    url: z.string().url().optional(),
    publicUrl: z.string().url().optional(),
    ssl: z.boolean().default(true),
  }),
  
  // Server
  server: z.object({
    port: z.number().int().positive().default(4173),
    nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  }),
  
  // JWT
  jwt: z.object({
    secret: z.string().min(32, 'JWT secret must be at least 32 characters'),
    refreshSecret: z.string().min(32, 'Refresh secret must be at least 32 characters'),
  }),
  
  // Email
  email: z.object({
    resendApiKey: z.string().optional(),
    fromEmail: z.string().email().default('noreply@gosg.com'),
  }),
  
  // Frontend
  frontend: z.object({
    apiBaseUrl: z.string().url(),
  }),
  
  // Optional integrations
  integrations: z.object({
    googleApiKey: z.string().optional(),
    openrouterApiKey: z.string().optional(),
    anthropicApiKey: z.string().optional(),
  }).optional(),
});

function loadConfig() {
  const rawConfig = {
    database: {
      url: process.env.DATABASE_URL,
      publicUrl: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL !== 'false',
    },
    server: {
      port: parseInt(process.env.PORT || '4173', 10),
      nodeEnv: process.env.NODE_ENV || 'development',
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      refreshSecret: process.env.REFRESH_SECRET,
    },
    email: {
      resendApiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@gosg.com',
    },
    frontend: {
      apiBaseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:4173',
    },
    integrations: {
      googleApiKey: process.env.GOOGLE_API_KEY,
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    },
  };
  
  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[Config] Validation errors:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Configuration validation failed. Check environment variables.');
    }
    throw error;
  }
}

export const config = loadConfig();
export default config;
```

### 2.2 Update Existing Config Files

**File:** `server/config/constants.js`

**Action:** Replace direct `process.env` access with config import.

**Before:**
```javascript
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'noreply@gosg.com';
export const JWT_SECRET = process.env.JWT_SECRET || 'sparti-demo-secret-key';
```

**After:**
```javascript
import config from './index.js';

export const RESEND_API_KEY = config.email.resendApiKey;
export const SMTP_FROM_EMAIL = config.email.fromEmail;
export const JWT_SECRET = config.jwt.secret;
export const PORT = config.server.port;
export const NODE_ENV = config.server.nodeEnv;
```

### 2.3 Update All Direct process.env Access

**Files to Update:**
- `server/utils/database.js` - Use `config.database`
- `server/middleware/auth.js` - Use `config.jwt`
- `server/utils/emailService.js` - Use `config.email`
- All route files accessing environment variables

**Search Pattern:**
```bash
grep -r "process\.env\." --include="*.js" server/ | grep -v node_modules
```

**Validation:**
- All environment variable access goes through config module
- Missing required variables throw clear errors at startup
- Optional variables have sensible defaults

## Task 3: Standardize Error Handling

### 3.1 Update Error Handler Middleware

**File:** `server/middleware/errorHandler.js`

**Current State:** Exists but not consistently used.

**Action Plan:**
1. Ensure all routes use error handler middleware
2. Update error handler to use debug logger
3. Add consistent error response format
4. Add error tracking integration points

**Implementation:**
```javascript
// server/middleware/errorHandler.js
import { debugError } from '../../sparti-cms/utils/debugLogger.js';
import { AppError, ValidationError } from './errorHandler.js';

export function errorHandler(err, req, res, next) {
  // Use debug logger instead of console.error
  debugError('[ErrorHandler] Error caught:', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    // Only include stack in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
  
  // ... rest of error handling logic
}
```

### 3.2 Update Route Error Handling

**Files to Update:**
- `server/routes/auth.js` - Remove inline try/catch, use error handler
- `server/routes/content.js` - Standardize error responses
- `server/routes/forms.js` - Use error handler
- `server/routes/crm.js` - Use error handler
- All other route files

**Pattern to Apply:**
```javascript
// Before
router.post('/endpoint', async (req, res) => {
  try {
    // ... logic
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

// After
router.post('/endpoint', async (req, res, next) => {
  try {
    // ... logic
  } catch (error) {
    next(error); // Pass to error handler middleware
  }
});
```

### 3.3 Update Database Module Error Handling

**Files to Update:**
- `sparti-cms/db/modules/pages.js`
- `sparti-cms/db/modules/branding.js`
- `sparti-cms/db/modules/forms.js`
- All other database modules

**Action:** Replace `console.error` with `debugError` and throw proper errors.

**Implementation:**
```javascript
// Before
catch (error) {
  console.error('Error updating page:', error);
  throw error;
}

// After
import { debugError } from '../../utils/debugLogger.js';
import { AppError } from '../../../server/middleware/errorHandler.js';

catch (error) {
  debugError('Error updating page:', error);
  throw new AppError('Failed to update page', 500, 'PAGE_UPDATE_FAILED');
}
```

## Task 4: Complete Logging Migration

### 4.1 Replace All console.log/error/warn

**Search for Remaining Instances:**
```bash
# Find all console.log with [testing]
grep -r "console\.log.*\[testing\]" --include="*.js" --include="*.ts" .

# Find all console.error
grep -r "console\.error" --include="*.js" --include="*.ts" .

# Find all console.warn
grep -r "console\.warn" --include="*.js" --include="*.ts" .
```

**Files to Update:**
- `server/utils/emailService.js` - Replace `console.error` with `debugError`
- `sparti-cms/db/modules/*.js` - Replace all console statements
- `server/routes/*.js` - Replace console statements
- All other files with console statements

### 4.2 Update Email Service

**File:** `server/utils/emailService.js`

**Current Issues:**
- Lines 130, 189, 234 use `console.error('[testing] ...')`

**Action:**
```javascript
// Before
console.error('[testing] Error sending form notification emails:', error);

// After
import { debugError } from '../../sparti-cms/utils/debugLogger.js';
debugError('Error sending form notification emails:', error);
```

### 4.3 Update Database Modules

**Files:** All files in `sparti-cms/db/modules/`

**Action:** Replace all `console.log`, `console.error`, `console.warn` with debug logger.

**Pattern:**
```javascript
// Add import at top
import { debugLog, debugError, debugWarn } from '../../utils/debugLogger.js';

// Replace
console.log('[testing] ...') → debugLog('...')
console.error('[testing] ...') → debugError('...')
console.warn('[testing] ...') → debugWarn('...')
```

### 4.4 Verify ESLint Rule

**File:** `eslint.config.js`

**Action:** Ensure rule prevents new `[testing]` console statements.

**Validation:**
- Run `npm run lint` to verify no violations
- Test that new `console.log('[testing]')` statements are caught

## Testing & Validation

### Test Plan

1. **Multi-Tenant Isolation Tests:**
   - Create test tenants
   - Verify no data leakage between tenants
   - Test that missing tenant ID throws errors

2. **Configuration Tests:**
   - Test with missing required env vars
   - Test with invalid env var values
   - Verify clear error messages

3. **Error Handling Tests:**
   - Test error handler middleware
   - Verify consistent error response format
   - Test error logging

4. **Logging Tests:**
   - Verify logs only appear in development
   - Test log filtering
   - Verify no `[testing]` prefixes remain

### Success Criteria

- [ ] Zero hardcoded tenant IDs in codebase
- [ ] All environment variables accessed through config module
- [ ] All routes use error handler middleware
- [ ] All console statements replaced with debug logger
- [ ] All tests pass
- [ ] Multi-tenant isolation verified
- [ ] No ESLint violations

## Estimated Effort

- Task 1: 2-3 days
- Task 2: 1-2 days
- Task 3: 2-3 days
- Task 4: 1-2 days
- Testing: 1 day

**Total: 7-11 days**
