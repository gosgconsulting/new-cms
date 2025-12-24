-- Drop the existing function and recreate with correct return types
DROP FUNCTION IF EXISTS public.get_user_profiles_with_emails();

-- Create the function with correct return types that match the database schema
CREATE OR REPLACE FUNCTION public.get_user_profiles_with_emails()
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  email text,
  subscription_status character varying,
  plan_id uuid,
  trial_end timestamp with time zone,
  created_at timestamp with time zone,
  plan_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Return user profiles with emails from auth.users
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    au.email,
    p.subscription_status,
    p.plan_id,
    p.trial_end,
    p.created_at,
    COALESCE(pl.name, 'Free Trial') as plan_name
  FROM public.profiles p
  LEFT JOIN auth.users au ON p.id = au.id
  LEFT JOIN public.plans pl ON p.plan_id = pl.id
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profiles_with_emails() TO authenticated;
