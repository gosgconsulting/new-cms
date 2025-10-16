# Sparti CMS - Development Workflow Guide

## Overview
This guide outlines the standard operating procedure (SOP) for developing websites with Sparti CMS using a **frontend-first** approach.

## Core Philosophy: Frontend First, Database Last

❌ **WRONG APPROACH:**
1. Create database schemas
2. Build components to match database
3. Deploy

✅ **CORRECT APPROACH:**
1. Build and test frontend components
2. Create component registry definitions
3. Test everything thoroughly
4. Migrate to database for production

---

## Standard Operating Procedure (SOP)

### Phase 1: Server Setup

**Time Estimate:** 15-30 minutes

1. **Duplicate Railway Template**
   - Use existing Railway PostgreSQL template
   - Configure environment variables
   - Note database credentials

2. **Duplicate Git Repository**
   - Clone base repository
   - Create new branch for project
   - Setup version control

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Configure database URLs
   - Add API keys (Resend, etc.)

---

### Phase 2: Website Development (Frontend-First)

**Time Estimate:** 2-5 days

#### Step 1: Design Frontend with Cursor/IDE

**Location:** `src/components/`, `src/pages/`

1. **Create Page Components**
   ```tsx
   // Example: src/components/HeroSection.tsx
   export const HeroSection = () => {
     return (
       <section className="pt-32 md:pt-24 pb-12 px-4">
         {/* Hero content */}
       </section>
     );
   };
   ```

2. **Follow Design System**
   - Use semantic tokens from `index.css`
   - Follow spacing guidelines from `ux-ui-guidelines.md`
   - Ensure mobile-responsive design

3. **Test Components Locally**
   ```bash
   npm run dev
   # Visit http://localhost:5173
   ```

#### Step 2: Create Component Definitions

**Location:** `sparti-cms/registry/components/`

For each new component type, create a JSON definition:

```json
{
  "id": "hero-section",
  "name": "Hero Section",
  "type": "container",
  "category": "layout",
  "description": "Main hero section with title and CTA",
  "properties": {
    "title": {
      "type": "string",
      "description": "Hero title",
      "editable": true,
      "required": true
    },
    "subtitle": {
      "type": "string",
      "description": "Hero subtitle",
      "editable": true
    },
    "ctaText": {
      "type": "string",
      "description": "CTA button text",
      "editable": true
    }
  },
  "editor": "ContainerEditor",
  "version": "1.0.0",
  "tenant_scope": "tenant",
  "tags": ["hero", "landing", "cta"],
  "last_updated": "2025-01-28T00:00:00Z"
}
```

#### Step 3: Add Components to CMS Admin

1. **Register Component**
   ```typescript
   // Components auto-load from registry/components/
   // Verify in admin at /admin -> Components tab
   ```

2. **Test in Admin Interface**
   - Login to `/admin` (admin/admin)
   - Navigate to Components tab
   - Verify component appears with correct metadata
   - Test component search and filtering

#### Step 4: Create Database Schema (Production Only)

**Location:** `sparti-cms/db/migrations.sql`

**⚠️ ONLY do this step when frontend is 100% complete and tested**

```sql
-- Create table for component metadata
CREATE TABLE IF NOT EXISTS cms_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  component_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  definition JSONB NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, component_id)
);

-- Add RLS policies
ALTER TABLE cms_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage components in their tenant"
  ON cms_components FOR ALL
  USING (tenant_id = get_current_tenant_id() AND user_has_role('admin'));

CREATE POLICY "Users can view components in their tenant"
  ON cms_components FOR SELECT
  USING (tenant_id = get_current_tenant_id());
```

#### Step 5: Sync Pages with Components

**Location:** `sparti-cms/components/admin/PagesManager.tsx`

1. **Map Pages to Components**
   - Define which components are available per page
   - Configure component ordering
   - Set default component configurations

2. **Test Page Editing**
   - Navigate to Pages tab in admin
   - Verify components load correctly
   - Test adding/removing components

#### Step 6: Sync Blog with Sparti API

**Location:** `src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`

1. **Configure Blog Integration**
   - Setup blog post fetching
   - Map blog components to frontend
   - Configure SEO metadata

2. **Test Blog Functionality**
   - Create test blog post
   - Verify rendering
   - Test routing and navigation

---

### Phase 3: Setups & Configuration

**Time Estimate:** 1-2 hours

#### SMTP Configuration (Resend API)

1. **Navigate to Admin > SMTP**
2. **Configure Settings:**
   - Resend API Key
   - From Email (e.g., noreply@yourdomain.com)
   - From Name (e.g., Your Company)

3. **Test Email Delivery:**
   - Submit test contact form
   - Verify email received

#### Email Recipients

1. **Navigate to Admin > Contacts**
2. **Configure Recipients:**
   - Add recipient emails
   - Set notification preferences

#### Email Content Templates

**Location:** Contact form submission handlers

1. **Customize Email Templates**
   - Update email subject lines
   - Customize email body
   - Add company branding

#### Content Integration

1. **Upload Assets:**
   - Logo: `src/assets/` or `public/assets/`
   - Favicon: `public/favicon.png`
   - Client content: `src/assets/`

2. **Update Branding:**
   - Admin > Settings > Branding
   - Upload logo
   - Configure brand colors

---

### Phase 4: Deployment

**Time Estimate:** 30 minutes - 1 hour

1. **Pre-Deployment Checklist:**
   - [ ] All components tested locally
   - [ ] Database migrations written (not run yet)
   - [ ] Environment variables configured
   - [ ] SMTP tested
   - [ ] Assets uploaded
   - [ ] SEO metadata configured

2. **Deploy to Railway:**
   ```bash
   git push origin main
   # Railway auto-deploys from main branch
   ```

3. **Verify Deployment:**
   - Check Railway logs for errors
   - Visit production URL
   - Test critical paths
   - Verify forms and email delivery

---

### Phase 5: Component Migration to Database

**Time Estimate:** 30 minutes

**⚠️ CRITICAL: This is the FINAL step, only after everything works!**

#### Why Migrate Last?
- Frontend components are already tested and working
- Database is just for persistence and multi-tenancy
- If migration fails, frontend still works (using LocalStorage)
- No risk of database schema blocking development

#### Migration Process

1. **Export Component Registry**
   ```typescript
   // In browser console or create migration script
   import { componentRegistry } from '@/sparti-cms/registry';
   
   const components = componentRegistry.export();
   console.log(JSON.stringify(components, null, 2));
   ```

2. **Run Database Migration**
   ```bash
   # Run migrations.sql on Railway database
   # This creates cms_components table and RLS policies
   ```

3. **Populate Database**
   ```typescript
   // Create migration script: sparti-cms/db/migrate-components.ts
   import { supabase } from '@/integrations/supabase/client';
   import { componentRegistry } from '@/sparti-cms/registry';
   
   async function migrateComponents() {
     const components = componentRegistry.getAll();
     
     for (const component of components) {
       const { error } = await supabase
         .from('cms_components')
         .upsert({
           component_id: component.id,
           name: component.name,
           type: component.type,
           category: component.category,
           definition: component,
           version: component.version
         });
       
       if (error) {
         console.error(`Failed to migrate ${component.id}:`, error);
       } else {
         console.log(`✓ Migrated ${component.id}`);
       }
     }
   }
   
   migrateComponents();
   ```

4. **Verify Migration**
   - Check admin > Components tab
   - Verify all components appear
   - Test component editing
   - Verify sync between registry and database

---

## Development Rules

### DO:
✅ Build frontend components first
✅ Test thoroughly before database migration
✅ Use design system tokens consistently
✅ Follow spacing and typography guidelines
✅ Create component definitions in registry
✅ Keep frontend and database in sync after migration

### DON'T:
❌ Start with database schemas
❌ Block frontend development waiting for database
❌ Migrate to database before testing
❌ Use hardcoded colors (use semantic tokens)
❌ Skip component registry definitions
❌ Deploy without testing locally

---

## Database Migration Rules

### Before Migration:
1. **Frontend components are 100% complete and tested**
2. **Component registry definitions exist for all components**
3. **All components work with LocalStorage**
4. **Design system is finalized**
5. **All integrations tested (SMTP, forms, etc.)**

### During Migration:
1. **Create database tables and RLS policies**
2. **Export component registry**
3. **Populate database with component definitions**
4. **Verify data integrity**

### After Migration:
1. **Test component loading from database**
2. **Verify sync between registry and database**
3. **Test component editing in admin**
4. **Monitor for sync issues**

---

## Troubleshooting

### Components Not Appearing in Admin
1. Check `sparti-cms/registry/components/` for JSON definitions
2. Verify component schema is valid
3. Check browser console for errors
4. Ensure component is registered in ComponentRegistry

### Database Migration Failed
1. Verify database connection
2. Check SQL syntax in migrations
3. Ensure RLS policies are correct
4. Rollback and retry

### Components Out of Sync
1. Check if database has latest component definitions
2. Run sync from database: `componentRegistry.syncFromDatabase()`
3. Verify tenant_id matches current user
4. Check RLS policies allow access

---

## Quick Reference Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run database migrations (Railway)
# Use Railway dashboard SQL editor

# Export component registry
# Use browser console in /admin
```

---

## File Locations Quick Reference

| Purpose | Location |
|---------|----------|
| Frontend Components | `src/components/` |
| Page Components | `src/pages/` |
| Component Registry | `sparti-cms/registry/components/` |
| Database Migrations | `sparti-cms/db/migrations.sql` |
| Admin Dashboard | `sparti-cms/components/admin/` |
| Design System | `src/index.css`, `tailwind.config.ts` |
| UX Guidelines | `sparti-cms/docs/ux-ui-guidelines.md` |

---

**Last Updated:** 2025-01-28  
**Version:** 1.0.0
