# Contacts (CRM)

## Overview
The Contacts (CRM) feature provides a customer relationship management system for tracking contacts, managing leads, storing communication history, and organizing customer information. It integrates with forms and provides a centralized contact database.

## Status
🔄 **In Progress** - Core functionality implemented, CRM features expanding

## Key Components
- **ContactsManager Component**: Contact management UI (location to be confirmed)
- **Contact Database**: Contact storage and queries
- **Lead Tracking**: Lead management and conversion tracking
- **Integration**: Forms and contact form submissions
- **API Endpoints**: `/api/contacts/*` and `/api/crm/*` routes

## Database Tables
- `contacts` - Contact information and metadata
- `contact_messages` - Communication history
- Lead tracking integrated with forms

## Implementation Details
- Contact CRUD operations
- Lead status management
- Communication history tracking
- Contact search and filtering
- Integration with form submissions
- Contact import/export (planned)
- Notes and activity tracking
- Multi-tenant contact isolation

## Related Documentation
- Contact management functions in `sparti-cms/db/modules/contacts.js`
- Forms integration for lead capture
