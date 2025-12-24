# Shared Campaign Fix Documentation

## Issue
The shared campaign links (e.g., `/shared/campaign/seo-20250716-7`) were not displaying any blog articles. After investigation, we identified two key issues:

1. The `get_shared_campaign_posts` function in the database was incorrectly implemented in a recent migration
2. The parameters being passed to this function from the frontend component were not matching what the function expected

## Solution
We've implemented the following fixes:

1. Created a new migration file `20250812030000_fix_shared_campaign_functions.sql` that:
   - Corrects the `get_shared_campaign_posts` function to properly return all required fields
   - Ensures the `update_shared_campaign_post` function works correctly

2. Updated the `SharedCampaign.tsx` component to:
   - Use the correct parameter format when calling the database functions
   - Add debugging logs to help diagnose any further issues

## How to Apply the Fix

### 1. Apply the Database Migration

#### Option A: Using Supabase CLI
```bash
supabase db push --db-url "$SUPABASE_DB_URL" ./supabase/migrations/20250812030000_fix_shared_campaign_functions.sql
```

#### Option B: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/migrations/20250812030000_fix_shared_campaign_functions.sql`
4. Paste into the SQL Editor and run the query

### 2. Deploy the Updated Frontend Code
Deploy the updated `src/pages/SharedCampaign.tsx` file to your hosting environment.

## Verification
After applying the fix:
1. Navigate to a shared campaign link (e.g., `/shared/campaign/seo-20250716-7`)
2. Check the browser console for debugging logs
3. Verify that the blog articles are now displayed in the table
4. Test the edit functionality to ensure it works correctly

## Troubleshooting
If issues persist:
1. Check the browser console for any errors in the API responses
2. Verify that the `campaign_share_articles` table has entries for the shared campaign
3. Confirm that the blog posts referenced in `campaign_share_articles` exist in the `blog_posts` table
