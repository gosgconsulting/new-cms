-- Create admin user entry (this assumes the user will sign up with this email)
-- We'll create a trigger to automatically assign admin role when this email signs up

CREATE OR REPLACE FUNCTION public.handle_admin_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'oliver@gosgconsulting.com' THEN
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role);
  ELSE
    -- Insert regular user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto role assignment
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_user_signup();