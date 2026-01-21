# Raw SQL Usage Audit

## Overview

This document audits all raw SQL usage in `sparti-cms/db/modules/` to identify files that need migration to Sequelize ORM.

## Files Using Raw SQL

### 1. `pages.js` (PRIMARY TARGET)
- **Status**: Uses raw SQL exclusively
- **Functions**: 
  - `createPage()` - INSERT with RETURNING
  - `getPages()` - SELECT with WHERE and ORDER BY
  - `getPage()` - SELECT with WHERE
  - `getPageBySlug()` - SELECT with WHERE
  - `updatePage()` - UPDATE with WHERE
  - `deletePage()` - DELETE with WHERE
- **Query Count**: 46 instances
- **Migration Priority**: HIGH
- **Sequelize Model**: Page model needs to be created

### 2. `branding.js`
- **Status**: Mixed (Sequelize + raw SQL)
- **Functions**: 
  - Uses Sequelize for `SiteSetting` operations
  - Uses raw SQL for fallback queries and schema operations
- **Migration Priority**: MEDIUM (already mostly Sequelize)

### 3. `forms.js`
- **Status**: Uses raw SQL
- **Functions**: Form submission and management
- **Migration Priority**: MEDIUM

### 4. `contacts.js`
- **Status**: Uses raw SQL
- **Functions**: Contact CRUD operations
- **Migration Priority**: MEDIUM

### 5. `media.js`
- **Status**: Uses raw SQL
- **Functions**: Media file management
- **Migration Priority**: LOW

### 6. `ecommerce.js`
- **Status**: Uses raw SQL
- **Functions**: E-commerce operations
- **Migration Priority**: LOW

### 7. `terms.js`
- **Status**: Uses raw SQL
- **Functions**: Categories and tags
- **Migration Priority**: LOW

### 8. `layouts.js`
- **Status**: Uses raw SQL
- **Functions**: Page layout management
- **Migration Priority**: LOW

### 9. `content.js`
- **Status**: Uses raw SQL
- **Functions**: Content management
- **Migration Priority**: LOW

## Migration Strategy

### Phase 1: Create Missing Sequelize Models
1. Create `Page` model in `sparti-cms/db/sequelize/models/Page.js`
2. Add Page to models index
3. Verify model matches database schema

### Phase 2: Migrate `pages.js` (Primary Target)
1. Replace `query()` imports with Sequelize model imports
2. Convert `createPage()` to `Page.create()`
3. Convert `getPages()` to `Page.findAll()`
4. Convert `getPage()` to `Page.findByPk()`
5. Convert `getPageBySlug()` to `Page.findOne({ where: { slug } })`
6. Convert `updatePage()` to `Page.update()`
7. Convert `deletePage()` to `Page.destroy()`
8. Test all functions to ensure functionality preserved

### Phase 3: Future Migrations
- Migrate other modules incrementally as needed
- Prioritize high-traffic modules first

## Notes

- `branding.js` already uses Sequelize for primary operations
- Raw SQL is used for fallback scenarios and complex queries
- Some modules may require raw SQL for performance-critical operations
- Migration should be done incrementally to avoid breaking changes
