-- Drop the function with CASCADE to remove all dependent triggers
DROP FUNCTION IF EXISTS public.sync_user_to_brevo() CASCADE;

-- Now update oliver@gosgconsulting.com to agency plan
UPDATE public.profiles
SET 
  plan_id = 'agency',
  subscription_status = 'active',
  tokens = 100,
  updated_at = now()
WHERE id = 'e7e16a8d-f7a6-4130-8075-f30355ec055c';