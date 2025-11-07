# Users Registration and Approval System

## Overview

This document outlines the enhanced Users Management System that includes public user registration with admin approval workflow, status management, and comprehensive authentication controls.

## Features Implemented

### 1. Enhanced User Status Management
- **Status Field**: Added `status` column to users table with values:
  - `active`: User is approved and can access the system
  - `inactive`: User account is deactivated
  - `pending`: User registered but awaiting admin approval
  - `rejected`: User registration was rejected by admin

### 2. Public Authentication Pages
- **Route**: `/auth` - Public sign-in and sign-up page
- **Features**:
  - Toggle between sign-in and sign-up modes
  - Form validation and error handling
  - Password strength requirements (minimum 8 characters)
  - Responsive design with GO SG branding
  - Real-time feedback and loading states

### 3. User Registration Workflow
- **Public Registration**: Users can register via `/auth` page
- **Default Status**: New registrations default to `pending` status
- **Admin Approval Required**: Users cannot access system until approved
- **Email Uniqueness**: Prevents duplicate email registrations

### 4. Admin Approval System
- **Pending Users View**: Admins can see all pending registrations
- **Approval Actions**: 
  - ✅ Approve: Sets status to `active`, enables account
  - ❌ Reject: Sets status to `rejected`, blocks access
- **Bulk Management**: Easy identification of pending users in Users table
- **Activity Logging**: All approval/rejection actions are logged

### 5. Enhanced Authentication Controls
- **Status-Based Access**: Authentication checks user status
- **Blocked States**:
  - `pending`: "Account is pending approval"
  - `rejected`: "Account has been rejected"
  - `inactive`: "Account is deactivated"
- **Active Users Only**: Only `active` status users can sign in

## Database Schema Changes

### Users Table Enhancement
```sql
ALTER TABLE users 
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending' 
CHECK (status IN ('active', 'inactive', 'pending', 'rejected'));
```

### Updated Views
- **users_management_view**: Now includes `status` column
- **user_statistics**: Enhanced with status-based counts:
  - `active_users`
  - `inactive_users` 
  - `pending_users`
  - `rejected_users`

## API Endpoints

### Registration
- **POST** `/api/auth/register`
  - Creates user with `pending` status
  - Validates required fields and password strength
  - Returns registration success message

### User Approval
- **PUT** `/api/users/:id/approve`
  - Admin-only endpoint
  - Sets user status to `active`
  - Enables account access
  - Logs approval activity

### User Rejection
- **PUT** `/api/users/:id/reject`
  - Admin-only endpoint
  - Sets user status to `rejected`
  - Blocks account access
  - Logs rejection activity with reason

### Pending Users
- **GET** `/api/users/pending`
  - Admin-only endpoint
  - Returns list of users with `pending` status
  - Ordered by registration date

## UI Components

### 1. Auth Page (`/auth`)
- **Location**: `src/pages/Auth.tsx`
- **Features**:
  - Animated form transitions
  - Password visibility toggles
  - Form validation feedback
  - Success/error messaging
  - Responsive design

### 2. Enhanced Users Manager
- **Location**: `sparti-cms/components/admin/UsersManager.tsx`
- **New Features**:
  - Status column with color-coded badges
  - Approve/Reject action buttons for pending users
  - Status filter capabilities
  - Enhanced user creation form with status selection

### 3. Updated My Account Page
- **Location**: `sparti-cms/components/admin/MyAccountPage.tsx`
- **Enhancement**: Added Account Status display with color-coded badge

## User Experience Flow

### New User Registration
1. User visits `/auth` page
2. Fills out registration form (first name, last name, email, password)
3. Submits form → Account created with `pending` status
4. User receives confirmation message about pending approval
5. User cannot sign in until approved

### Admin Approval Process
1. Admin logs into CMS
2. Navigates to Users → Users management
3. Sees pending users with yellow "Pending" badges
4. Uses approve (✅) or reject (❌) buttons
5. User status updates immediately
6. Activity is logged for audit trail

### Approved User Access
1. Admin approves user account
2. User status changes to `active`
3. User can now sign in via `/auth` page
4. User gains access to appropriate system areas based on role

## Security Features

### Password Requirements
- Minimum 8 characters
- Client-side validation
- Server-side verification

### Access Control
- Status-based authentication blocking
- Role-based UI restrictions (admin-only approval actions)
- Session management with user status checks

### Audit Trail
- All registration activities logged
- Approval/rejection actions tracked
- Admin actions recorded with timestamps

## Testing

The system has been thoroughly tested with:
- ✅ User registration workflow
- ✅ Pending user authentication blocking
- ✅ Admin approval process
- ✅ User rejection workflow
- ✅ Status-based authentication controls
- ✅ Enhanced user statistics
- ✅ Activity logging functionality

## Configuration

### Default Settings
- New registrations: `pending` status
- Admin users: `active` status (auto-approved)
- Password minimum length: 8 characters
- Session timeout: Configurable via backend

### Environment Variables
No additional environment variables required. Uses existing database configuration.

## Deployment Notes

### Database Migration
The system includes automatic migration for existing installations:
1. Adds `status` column to users table
2. Updates existing admin users to `active` status
3. Recreates database views with status support

### Backward Compatibility
- Existing users maintain functionality
- Previous admin users automatically set to `active`
- No breaking changes to existing API endpoints

## Future Enhancements

### Potential Improvements
1. **Email Notifications**: Notify users when approved/rejected
2. **Bulk Actions**: Approve/reject multiple users at once
3. **Registration Reasons**: Allow users to specify registration purpose
4. **Approval Workflows**: Multi-step approval process
5. **User Onboarding**: Guided setup for newly approved users

## Support

For technical support or questions about this system:
1. Check the activity logs for user actions
2. Verify database status column values
3. Review API endpoint responses
4. Test authentication flow with different user statuses

---

**System Status**: ✅ Production Ready
**Last Updated**: October 2024
**Version**: 2.0 - Enhanced Registration & Approval System
