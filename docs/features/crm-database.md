# CRM Database

## Overview

This document outlines the action plan for fixing tenant database operations. Currently, when a tenant is created and site settings are changed, they are not being saved to the database. The system uses a shared PostgreSQL database with tenant_id columns for data isolation. All tenants share the same database tables, but data is isolated per tenant using tenant_id.

## Tenant Creation with Theme - Copy Theme Pages

When a tenant is created and a theme is selected, the system must copy all pages from the theme (where theme_id is set and tenant_id is NULL) to the tenant (where tenant_id is set to the new tenant's ID). This ensures the tenant starts with the theme's default pages. The pages table already supports both theme_id and tenant_id columns. Implement logic in `createTenant` or `initializeTenantDefaults` to query theme pages and insert copies with the tenant's ID.

## Tenant Creation with Custom Theme - Ensure Empty Tables Exist

When a tenant is created with a custom theme (theme_id is NULL), ensure all required database tables exist and are ready for tenant-specific data. While tables are shared, verify that all module tables (site_settings, pages, media_folders, media_files, sitemap_entries, forms, contacts, leads, users, posts, categories, tags) have proper schema and indexes for tenant_id isolation. Run schema validation/migration checks during tenant initialization.

## Fix Site Settings Saving - Ensure tenant_id is Passed

The current issue is that site settings are not being saved when changed after tenant creation. Review the site settings update flow in `server/routes/settings.js` and `sparti-cms/db/modules/branding.js`. Ensure that tenant_id is properly extracted from the request context (req.tenantId, req.user.tenant_id, or query parameter) and passed to `updateSiteSettingByKey`. Verify that the tenant_id is not defaulting to 'tenant-gosg' when it should use the actual tenant ID. Check middleware that sets req.tenantId and ensure it's working correctly for tenant-specific requests.

## Initialize All Module Tables for Tenant

Ensure that when a tenant is created, all module database tables are properly initialized with tenant-specific data or empty structures. This includes: Settings (site_settings table with tenant_id), Media (media_folders and media_files with tenant_id), SEO (sitemap_entries, robots_config with tenant_id), CRM (forms, contacts, leads tables with tenant_id), Users (users table with tenant_id), and Blogs (posts, categories, tags with tenant_id). Review `initializeTenantDefaults` in `sparti-cms/db/tenant-initialization.js` and ensure all modules are properly initialized. Currently, it only handles sitemap and media folders - extend it to handle all modules.

## Database Connection Verification

Verify that the database connection in `sparti-cms/db/connection.js` and `sparti-cms/db/index.js` properly supports tenant-specific queries. The current implementation uses a shared connection pool, which is correct for shared database architecture. Ensure that all queries include tenant_id filtering where appropriate. Review query functions across all modules to ensure they properly filter by tenant_id.

## Theme Pages Table Structure

Verify that the pages table structure supports both theme template pages (theme_id set, tenant_id NULL) and tenant-specific pages (tenant_id set, theme_id can be set or NULL). When a tenant uses a theme, pages should be copied from theme template pages to tenant-specific pages. Ensure the pages table has proper indexes on (tenant_id, theme_id) for efficient queries. Review the migration `20241223000001-add-theme-id-to-pages.js` to ensure schema is correct.

## Settings Module - Tenant Isolation

Review the site_settings table usage across all modules. Ensure that when settings are read, they properly fall back to master settings (tenant_id NULL) if tenant-specific settings don't exist. When settings are written, they must always include tenant_id. Verify that `getSiteSettingByKey` and `updateSiteSettingByKey` in `sparti-cms/db/modules/branding.js` properly handle tenant_id. Check that the unique constraint on (setting_key, tenant_id, theme_id) is working correctly.

## Testing Tenant Database Operations

Create comprehensive tests to verify: 1) Tenant creation with theme copies theme pages correctly, 2) Tenant creation with custom theme has empty but accessible tables, 3) Site settings can be saved and retrieved per tenant, 4) All module data is properly isolated by tenant_id, 5) Theme pages are accessible to tenants using that theme, 6) Settings fallback to master settings when tenant-specific settings don't exist. Test the full flow from tenant creation through settings modification to data retrieval.
