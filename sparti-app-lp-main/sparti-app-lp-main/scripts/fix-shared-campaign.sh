#!/bin/bash
# Script to fix the shared campaign links issue

echo "Applying fix for shared campaign links..."

# Run the Supabase migration directly using supabase CLI
supabase db push --db-url "$SUPABASE_DB_URL" ./supabase/migrations/20250812030000_fix_shared_campaign_functions.sql

# Alternative: Run the Node.js script if supabase CLI is not available
# node ./scripts/apply-shared-campaign-fix.js

echo "Fix applied. Please check the shared campaign links now."
