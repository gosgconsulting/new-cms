# Pages

## Overview
The Pages feature provides a comprehensive content management system for creating, editing, and managing website pages with full SEO support. It supports multiple page types (regular pages, landing pages, and legal pages) with type-specific fields and functionality.

## Status
✅ **Done** - Fully implemented and operational

## Key Components
- **PagesManager Component**: Main UI for managing pages (`sparti-cms/components/cms/PagesManager.tsx`)
- **EditableSlug Component**: Inline slug editing with validation (`sparti-cms/components/cms/EditableSlug.tsx`)
- **Database Functions**: CRUD operations in `sparti-cms/db/index.js`
- **API Endpoints**: `/api/pages/*` routes in `server/routes/content.js`

## Database Tables
- `pages` - Unified table for all page types with SEO metadata
  - Supports `page_type`: 'page', 'landing', 'legal'
  - SEO fields: meta_title, meta_description, seo_index
  - Landing page fields: campaign_source, conversion_goal
  - Legal page fields: legal_type, version, last_reviewed_date

## Implementation Details
- Unified database schema for all page types
- Slug validation and editing with homepage protection
- SEO metadata management (title, description, index control)
- Multi-tenant support with tenant_id scoping
- Status management (draft, published, archived)
- Campaign tracking for landing pages
- Version control for legal pages

## Related Documentation
- `docs/implementation/SEO_PAGES_SUMMARY.md` - Implementation summary
- `docs/implementation/SEO_PAGES_DATABASE_IMPLEMENTATION.md` - Database schema details
- `docs/implementation/SLUG_EDITING_IMPLEMENTATION.md` - Slug editing feature
