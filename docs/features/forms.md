# Forms

## Overview
The Forms feature provides a comprehensive form builder and management system for creating custom forms, collecting submissions, managing email notifications, and tracking form interactions. It includes advanced email configuration with template placeholders and auto-reply functionality.

## Status
🔄 **In Progress** - Core functionality complete, UX improvements ongoing

## Key Components
- **FormsManager Component**: Form management UI (`sparti-cms/components/cms/FormsManager.tsx`)
- **Form Builder**: Dynamic form field configuration
- **Submission Tracking**: Form submission management and analytics
- **Email System**: Notification and auto-reply emails
- **Database Functions**: Form operations in `sparti-cms/db/modules/forms.js`
- **API Endpoints**: `/api/forms/*` routes

## Database Tables
- `forms` - Form definitions with fields and settings
- `form_fields` - Individual form field configurations
- `form_submissions` - Form submission data
- `form_submissions_extended` - Enhanced submission tracking
- `form_email_settings` - Email notification configuration

## Implementation Details
- 10+ field types supported (text, email, phone, textarea, select, checkbox, radio, file, date, number)
- Dynamic form builder with drag-and-drop (planned)
- Email notifications with multiple recipients
- Auto-reply emails with template placeholders
- Submission status tracking (new, read, replied, archived)
- CSV export functionality
- Form validation and error handling
- Integration with contact management

## Related Documentation
- `docs/implementation/FORMS_MANAGEMENT_IMPLEMENTATION.md` - Core implementation
- `docs/implementation/FORMS_SYSTEM_COMPLETION_SUMMARY.md` - Completion summary
- `docs/implementation/FORMS_UX_IMPROVEMENTS_SUMMARY.md` - UX enhancements
- `docs/implementation/HOMEPAGE_FORMS_INTEGRATION.md` - Homepage integration
