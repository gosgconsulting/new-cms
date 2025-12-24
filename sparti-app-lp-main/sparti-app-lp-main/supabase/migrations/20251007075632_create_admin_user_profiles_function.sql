-- Create a new function to get user profiles with emails for admin users
-- This function will use a simpler approach without strict type matching

CREATE OR REPLACE FUNCTION public.get_admin_user_profiles()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Get user profiles with emails and return as JSON
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'email', au.email,
      'subscription_status', p.subscription_status,
      'plan_id', p.plan_id,
      'trial_end', p.trial_end,
      'created_at', p.created_at,
      'plan_name', COALESCE(pl.name, 'Free Trial')
    )
  ) INTO result
  FROM public.profiles p
  LEFT JOIN auth.users au ON p.id = au.id
  LEFT JOIN public.plans pl ON p.plan_id = pl.id
  ORDER BY p.created_at DESC;

  -- Return empty array if no results
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_user_profiles() TO authenticated;
