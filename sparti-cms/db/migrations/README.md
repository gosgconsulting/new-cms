# Database Migrations

This directory previously contained SQL migration files. All migrations have been migrated to Sequelize migrations.

## Sequelize Migrations

All database migrations are now managed through Sequelize migrations located in:
- `../sequelize/migrations/`

## Migration Files

All migrations are now Sequelize migration files with the following naming convention:
- `YYYYMMDDHHMMSS-description.js`

### Current Migrations

1. `20241202000000-create-core-tables.js` - Core tables (site_settings, form_submissions, contacts, projects, project_steps)
2. `20241202000001-create-tenant-tables.js` - Tenant management tables (tenants, tenant_databases, tenant_api_keys)
3. `20241202000002-create-user-tables.js` - User management tables (users, sessions, permissions, etc.) with views and triggers
4. `20241202000003-create-page-tables.js` - Page tables (pages, page_layouts, page_components, slug_change_log)
5. `20241202000004-create-content-tables.js` - Content tables (posts, terms, term_taxonomy, term_relationships, breadcrumbs)
6. `20241202000005-create-seo-tables.js` - SEO tables (redirects, seo_meta, sitemap_entries, robots_config, seo_analytics)
7. `20241202000006-create-media-tables.js` - Media and component tables
8. `20241202000007-create-analytics-tables.js` - Analytics tracking tables
9. `20241201000000-create-categories-and-tags.js` - Categories and tags tables

## Running Migrations

### Run all pending migrations
```bash
npm run sequelize:migrate
```

### Undo last migration
```bash
npm run sequelize:migrate:undo
```

### Check migration status
```bash
npm run sequelize:migrate:status
```

## Programmatic Migration Execution

Migrations can also be run programmatically from initialization functions using the `runMigrations` helper:

```javascript
import { runMigrations } from '../sequelize/run-migrations.js';

// Run specific migrations
await runMigrations(['20241202000000-create-core-tables.js']);

// Run all pending migrations
await runMigrations();
```

## Notes

- All migrations are idempotent (check for table existence before creating)
- Migrations preserve existing data
- Migrations are backward compatible when possible
- Views and triggers are created using raw SQL within migrations for PostgreSQL-specific features
