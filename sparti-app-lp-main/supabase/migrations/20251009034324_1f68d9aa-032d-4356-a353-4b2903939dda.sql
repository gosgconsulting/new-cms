-- Ensure oliver@gosgconsulting.com has admin role
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get the user ID for oliver@gosgconsulting.com
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'oliver@gosgconsulting.com';
  
  -- If user exists, ensure they have admin role
  IF target_user_id IS NOT NULL THEN
    -- First, remove any existing user role for this user
    DELETE FROM public.user_roles
    WHERE user_id = target_user_id;
    
    -- Then insert the admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin'::app_role);
    
    RAISE NOTICE 'Admin role assigned to oliver@gosgconsulting.com';
  ELSE
    RAISE NOTICE 'User oliver@gosgconsulting.com not found in auth.users';
  END IF;
END $$;