# Database Migrations

This directory contains all database migration SQL files for the Sparti CMS project. Migrations are organized chronologically with numbered prefixes to indicate execution order.

## Migration Files

- `001_initial_schema.sql` - Initial database schema (components, pages, settings, media, form_submissions)
- `002_tenants.sql` - Tenant management tables (tenants, tenant_databases, tenant_api_keys)
- `003_users.sql` - User management tables (users, user_roles, user_permissions)
- `004_access_keys.sql` - User access keys table
- `005_seo_pages.sql` - SEO-enhanced pages tables
- `006_consolidate_page_types.sql` - Consolidates pages, landing_pages, and legal_pages into unified pages table
- `007_media.sql` - Enhanced media management tables
- `008_forms.sql` - Forms and form submissions tables
- `009_analytics.sql` - Analytics tracking tables (page views, events)
- `010_add_user_tenant_assignment.sql` - Adds tenant_id column and is_super_admin flag to users table

## Naming Convention

Migrations follow the format: `###_description.sql`

- `###` - Three-digit number indicating execution order (001, 002, 003, etc.)
- `description` - Brief description of what the migration does (lowercase, underscores)

## Adding New Migrations

1. Create a new SQL file with the next sequential number (e.g., `010_new_feature.sql`)
2. Use descriptive names that clearly indicate what the migration does
3. Include comments at the top of the file explaining the migration's purpose
4. Update this README to include the new migration in the list above

## Execution

Migrations are executed by JavaScript initialization functions in:
- `postgres.js` - Main database initialization functions
- `content-management.js` - Content management table initialization
- `seo-management.js` - SEO management table initialization

These functions read and execute the SQL files in this directory.

## Notes

- All migrations use `CREATE TABLE IF NOT EXISTS` to be idempotent
- Migrations should be backward compatible when possible
- Always test migrations on a development database before applying to production

