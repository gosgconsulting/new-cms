-- Set all admin users to Agency plan
UPDATE public.profiles
SET 
  plan_id = 'agency',
  tokens = 100,
  subscription_status = 'active',
  updated_at = now()
WHERE role = 'admin';

-- Create a trigger function to automatically assign Agency plan to new admin users
CREATE OR REPLACE FUNCTION public.assign_agency_plan_to_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    NEW.plan_id := 'agency';
    NEW.tokens := 100;
    NEW.subscription_status := 'active';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign Agency plan when a user becomes admin
DROP TRIGGER IF EXISTS auto_assign_agency_to_admins ON public.profiles;
CREATE TRIGGER auto_assign_agency_to_admins
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_agency_plan_to_admins();