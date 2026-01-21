# Phase 2: Architecture Alignment
**Duration:** 2-3 weeks  
**Priority:** High  
**Goal:** Standardize database access patterns, add path aliases, split large files, align with controller pattern

## Overview

This phase addresses architectural inconsistencies that make the codebase hard to maintain and refactor. We'll standardize patterns and improve code organization.

## Task 1: Standardize Database Access to Sequelize ORM

### 1.1 Audit Current State

**Current State:**
- `pages.js` - Migrated to Sequelize ✅
- `branding.js` - Uses Sequelize for some queries, raw SQL for others
- `forms.js` - Raw SQL
- `contacts.js` - Raw SQL
- `categories.js` - Raw SQL
- `tags.js` - Raw SQL
- `media.js` - Raw SQL
- `content.js` - Raw SQL

**Action Plan:**
1. Create Sequelize models for all tables
2. Migrate database modules to use models
3. Remove raw SQL queries
4. Update tests to use models

### 1.2 Create Missing Sequelize Models

**Models to Create:**
- `sparti-cms/db/sequelize/models/Form.js`
- `sparti-cms/db/sequelize/models/FormSubmission.js`
- `sparti-cms/db/sequelize/models/Contact.js`
- `sparti-cms/db/sequelize/models/Category.js`
- `sparti-cms/db/sequelize/models/Tag.js`
- `sparti-cms/db/sequelize/models/Media.js`
- `sparti-cms/db/sequelize/models/Post.js` (if not exists)

**Template:**
```javascript
// sparti-cms/db/sequelize/models/Contact.js
import { DataTypes } from 'sequelize';

export default function Contact(sequelize) {
  const Contact = sequelize.define('Contact', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tenant_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'contacts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        fields: ['tenant_id'],
        name: 'idx_contacts_tenant_id',
      },
      {
        fields: ['email'],
        name: 'idx_contacts_email',
      },
    ],
  });

  return Contact;
}
```

### 1.3 Migrate Database Modules

**Priority Order:**
1. `contacts.js` (simplest)
2. `categories.js`
3. `tags.js`
4. `forms.js` (most complex)

**Migration Pattern:**
```javascript
// Before (raw SQL)
export async function getContacts(limit, offset, search, tenantId) {
  const query = `
    SELECT * FROM contacts
    WHERE tenant_id = $1
    ${search ? `AND (name ILIKE $2 OR email ILIKE $2)` : ''}
    ORDER BY created_at DESC
    LIMIT $${search ? '3' : '2'} OFFSET $${search ? '4' : '3'}
  `;
  const params = search 
    ? [tenantId, `%${search}%`, limit, offset]
    : [tenantId, limit, offset];
  const result = await query(query, params);
  return result.rows;
}

// After (Sequelize)
import { Op } from 'sequelize';
import models from '../sequelize/models/index.js';
const { Contact } = models;

export async function getContacts(limit, offset, search, tenantId) {
  const where = {
    tenant_id: tenantId,
  };
  
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }
  
  const contacts = await Contact.findAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });
  
  return contacts.map(c => c.toJSON());
}
```

**Files to Migrate:**
- `sparti-cms/db/modules/contacts.js`
- `sparti-cms/db/modules/categories.js`
- `sparti-cms/db/modules/tags.js`
- `sparti-cms/db/modules/forms.js`
- `sparti-cms/db/modules/media.js`
- `sparti-cms/db/modules/content.js`

### 1.4 Update Tests

**Files to Update:**
- `server/tests/database.contacts.test.js` (create if doesn't exist)
- `server/tests/database.categories.test.js` (create if doesn't exist)
- `server/tests/database.tags.test.js` (create if doesn't exist)
- Update existing tests to use models

## Task 2: Add Path Aliases

### 2.1 Update Vite Config

**File:** `vite.config.ts`

**Current State:** Has some aliases but not comprehensive.

**Action:** Add comprehensive path aliases for common imports.

**Implementation:**
```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  // ... existing config
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '~': resolve(__dirname, './'),
      '@server': resolve(__dirname, './server'),
      '@sparti': resolve(__dirname, './sparti-cms'),
      '@db': resolve(__dirname, './sparti-cms/db'),
      '@components': resolve(__dirname, './sparti-cms/components'),
      '@utils': resolve(__dirname, './sparti-cms/utils'),
      '@services': resolve(__dirname, './sparti-cms/services'),
      '@theme': resolve(__dirname, './sparti-cms/theme'),
      '@config': resolve(__dirname, './server/config'),
      '@middleware': resolve(__dirname, './server/middleware'),
      '@routes': resolve(__dirname, './server/routes'),
    },
  },
});
```

### 2.2 Update TypeScript Config

**File:** `tsconfig.json` (create if doesn't exist)

**Action:** Add matching path aliases for TypeScript.

**Implementation:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@server/*": ["./server/*"],
      "@sparti/*": ["./sparti-cms/*"],
      "@db/*": ["./sparti-cms/db/*"],
      "@components/*": ["./sparti-cms/components/*"],
      "@utils/*": ["./sparti-cms/utils/*"],
      "@services/*": ["./sparti-cms/services/*"],
      "@theme/*": ["./sparti-cms/theme/*"],
      "@config/*": ["./server/config/*"],
      "@middleware/*": ["./server/middleware/*"],
      "@routes/*": ["./server/routes/*"]
    }
  }
}
```

### 2.3 Update Package.json for Node.js

**File:** `package.json`

**Action:** Add path aliases for Node.js imports using `import-maps` or `module-alias`.

**Implementation:**
```json
{
  "imports": {
    "@server/*": "./server/*",
    "@sparti/*": "./sparti-cms/*",
    "@db/*": "./sparti-cms/db/*",
    "@config/*": "./server/config/*",
    "@middleware/*": "./server/middleware/*"
  }
}
```

### 2.4 Migrate Imports Gradually

**Strategy:** Migrate one module at a time, starting with most frequently imported.

**Priority:**
1. Database modules (`@db/modules/*`)
2. Utils (`@utils/*`)
3. Services (`@services/*`)
4. Routes (`@routes/*`)

**Example Migration:**
```javascript
// Before
import { query } from '../../sparti-cms/db/index.js';
import { debugLog } from '../../sparti-cms/utils/debugLogger.js';

// After
import { query } from '@db/index.js';
import { debugLog } from '@utils/debugLogger.js';
```

## Task 3: Split Large Route Files

### 3.1 Analyze Current Route Files

**Large Files:**
- `server/routes/content.js` - 2400+ lines
- `server/routes/auth.js` - 1500+ lines
- `server/routes/forms.js` - 600+ lines

### 3.2 Split content.js

**Current Structure:**
- Posts CRUD
- Categories CRUD
- Tags CRUD
- WordPress import
- WordPress sync
- WooCommerce sync

**Proposed Split:**
```
server/routes/
  content/
    posts.js        # Post CRUD operations
    categories.js   # Category operations
    tags.js        # Tag operations
    import.js      # WordPress/WooCommerce import
    sync.js        # WordPress/WooCommerce sync
    index.js       # Aggregates all routes
```

**Implementation:**
```javascript
// server/routes/content/posts.js
import express from 'express';
const router = express.Router();

// Post CRUD routes
router.get('/posts', ...);
router.post('/posts', ...);
router.put('/posts/:id', ...);
router.delete('/posts/:id', ...);

export default router;

// server/routes/content/index.js
import express from 'express';
import postsRoutes from './posts.js';
import categoriesRoutes from './categories.js';
import tagsRoutes from './tags.js';
import importRoutes from './import.js';
import syncRoutes from './sync.js';

const router = express.Router();

router.use(postsRoutes);
router.use(categoriesRoutes);
router.use(tagsRoutes);
router.use(importRoutes);
router.use(syncRoutes);

export default router;
```

### 3.3 Split auth.js

**Current Structure:**
- Login
- Register
- Me endpoint
- Password reset
- Token refresh
- User management

**Proposed Split:**
```
server/routes/auth/
  login.js         # Login endpoint
  register.js      # Registration
  me.js           # Current user info
  password.js     # Password reset/change
  tokens.js       # Token refresh
  index.js        # Aggregates all routes
```

### 3.4 Update Route Registration

**File:** `server/routes/index.js`

**Action:** Update imports to use new structure.

**Implementation:**
```javascript
// Before
import authRoutes from './auth.js';
import contentRoutes from './content.js';

// After
import authRoutes from './auth/index.js';
import contentRoutes from './content/index.js';
```

## Task 4: Align with Controller Pattern

### 4.1 Decision: Use Controllers or Update Documentation

**Options:**
1. **Migrate to Controllers** - Refactor routes to use existing controllers
2. **Update Documentation** - Document current route-based pattern

**Recommendation:** Hybrid approach - use controllers for new features, gradually migrate existing routes.

### 4.2 Create Missing Controllers

**Controllers to Create:**
- `server/controllers/ContentController.js` (enhance existing)
- `server/controllers/FormController.js`
- `server/controllers/ContactController.js`
- `server/controllers/MediaController.js`

**Template:**
```javascript
// server/controllers/ContactController.js
import BaseController from './BaseController.js';
import { getContacts, createContact, updateContact, deleteContact } from '@db/modules/contacts.js';

class ContactController extends BaseController {
  async list(req, res) {
    const tenantId = this.getTenantId(req);
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';
    
    const contacts = await getContacts(limit, offset, search, tenantId);
    return this.success(res, contacts);
  }
  
  async create(req, res) {
    const tenantId = this.getTenantId(req);
    const contact = await createContact({ ...req.body, tenant_id: tenantId });
    return this.created(res, contact);
  }
  
  async update(req, res) {
    const tenantId = this.getTenantId(req);
    const contact = await updateContact(req.params.id, req.body, tenantId);
    return this.success(res, contact);
  }
  
  async delete(req, res) {
    const tenantId = this.getTenantId(req);
    await deleteContact(req.params.id, tenantId);
    return this.noContent(res);
  }
}

export default new ContactController();
```

### 4.3 Migrate Routes to Use Controllers

**Example Migration:**
```javascript
// Before
router.get('/contacts', authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user.tenant_id;
    const contacts = await getContacts(limit, offset, search, tenantId);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get contacts' });
  }
});

// After
import ContactController from '../controllers/ContactController.js';
import { authenticateUser } from '../middleware/auth.js';

router.get('/contacts', 
  authenticateUser,
  ContactController.wrap(ContactController.list)
);
```

**Routes to Migrate:**
- `server/routes/crm.js` - Use ContactController
- `server/routes/forms.js` - Use FormController (create)
- `server/routes/media.js` - Use MediaController (create)
- New routes should use controllers from start

## Testing & Validation

### Test Plan

1. **Database Migration Tests:**
   - Verify all Sequelize models work
   - Test migrations don't break existing functionality
   - Verify performance is acceptable

2. **Path Alias Tests:**
   - Verify all imports resolve correctly
   - Test in both dev and production builds
   - Verify TypeScript types work

3. **Route Split Tests:**
   - Verify all routes still work
   - Test route registration
   - Verify middleware still applies

4. **Controller Tests:**
   - Test controller methods
   - Verify error handling
   - Test tenant isolation

### Success Criteria

- [ ] All database modules use Sequelize ORM
- [ ] Path aliases work in all environments
- [ ] Large route files split into manageable modules
- [ ] New routes use controller pattern
- [ ] All tests pass
- [ ] No performance regression
- [ ] Code is more maintainable

## Estimated Effort

- Task 1: 5-7 days (database migration)
- Task 2: 1-2 days (path aliases)
- Task 3: 2-3 days (splitting routes)
- Task 4: 3-4 days (controller migration)
- Testing: 2 days

**Total: 13-18 days**
