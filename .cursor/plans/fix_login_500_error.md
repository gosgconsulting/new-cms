# Fix Login 500 Error

## Problem
Login endpoint `/api/auth/login` returns 500 Internal Server Error with "Server error. Please try again in a moment."

## Root Cause
The error could be from:
1. Access key middleware failing before login handler runs
2. Database state check throwing an error
3. Unhandled error in login endpoint caught by asyncHandler

## Solution

### 1. Improve Access Key Middleware Error Handling
- Wrap `getDatabaseState()` in try-catch in `server/middleware/accessKey.js`
- Handle errors gracefully
- Ensure login/register endpoints are properly skipped

### 2. Add Defensive Error Handling
- Ensure `getDatabaseState()` errors don't crash the middleware
- Return proper error responses instead of generic 500

## Files to Modify
- `server/middleware/accessKey.js` - Add try-catch around getDatabaseState()

## Expected Outcome
- Login works correctly
- Better error messages for debugging
- Access key middleware doesn't interfere with auth endpoints
