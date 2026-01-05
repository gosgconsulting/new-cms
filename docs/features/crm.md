# CRM

## Overview
This category covers customer relationship management, contacts, leads, and CRM-related features.

## CRM Database Workflow

### Tenant Database Connection

When a new tenant is created, the system automatically connects the tenant database for the following modules:

1. **Settings**
   - Site settings with branding
   - Styles configuration

2. **Media**
   - Media library and file management

3. **SEO**
   - Redirects configuration
   - Robots.txt management
   - Sitemap generation
   - OpenGraph settings

4. **CRM**
   - Forms management
   - Contacts database
   - Leads tracking

5. **Users**
   - User management and authentication

6. **Blogs**
   - Blog posts and content management

### Implementation Notes

The tenant database connection is established automatically upon tenant creation, ensuring all modules have isolated data storage per tenant while sharing the same codebase and infrastructure.
