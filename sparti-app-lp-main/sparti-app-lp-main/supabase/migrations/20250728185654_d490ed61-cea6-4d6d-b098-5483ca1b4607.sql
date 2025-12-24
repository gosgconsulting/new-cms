-- Check if trigger exists and create it if it doesn't
DO $$
BEGIN
  -- Drop the trigger if it exists to recreate it properly
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  
  -- Create the trigger
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_admin_user_signup();
END $$;