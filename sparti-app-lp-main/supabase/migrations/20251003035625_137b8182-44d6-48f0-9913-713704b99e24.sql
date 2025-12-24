-- Function to call the Brevo sync edge function
CREATE OR REPLACE FUNCTION public.sync_user_to_brevo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  user_data jsonb;
  profile_data record;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = COALESCE(NEW.id, NEW.user_id);

  -- Get profile data if it exists
  SELECT * INTO profile_data
  FROM public.profiles
  WHERE id = COALESCE(NEW.id, NEW.user_id);

  -- Prepare data to send to Brevo
  user_data := jsonb_build_object(
    'user_id', COALESCE(NEW.id, NEW.user_id),
    'email', user_email,
    'first_name', COALESCE(profile_data.first_name, ''),
    'last_name', COALESCE(profile_data.last_name, ''),
    'role', COALESCE(profile_data.role::text, 'user'),
    'plan_id', COALESCE(profile_data.plan_id, ''),
    'tokens', COALESCE(profile_data.tokens, 0),
    'subscription_status', COALESCE(profile_data.subscription_status, '')
  );

  -- Call edge function asynchronously using pg_net extension
  PERFORM
    net.http_post(
      url := 'https://fkemumodynkaeojrrkbj.supabase.co/functions/v1/sync-brevo-contact',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := user_data
    );

  RETURN NEW;
END;
$$;

-- Trigger on auth.users for new signups
DROP TRIGGER IF EXISTS sync_new_user_to_brevo ON auth.users;
CREATE TRIGGER sync_new_user_to_brevo
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_to_brevo();

-- Trigger on profiles for updates
DROP TRIGGER IF EXISTS sync_profile_update_to_brevo ON public.profiles;
CREATE TRIGGER sync_profile_update_to_brevo
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_to_brevo();

-- Function to sync workspace members to Brevo
CREATE OR REPLACE FUNCTION public.sync_workspace_member_to_brevo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  user_data jsonb;
  profile_data record;
  workspace_name text;
BEGIN
  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.user_id;

  -- Get profile data
  SELECT * INTO profile_data
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Get workspace name
  SELECT name INTO workspace_name
  FROM public.workspaces
  WHERE id = NEW.workspace_id;

  -- Prepare data
  user_data := jsonb_build_object(
    'user_id', NEW.user_id,
    'email', user_email,
    'first_name', COALESCE(profile_data.first_name, ''),
    'last_name', COALESCE(profile_data.last_name, ''),
    'role', COALESCE(profile_data.role::text, 'user'),
    'plan_id', COALESCE(profile_data.plan_id, ''),
    'tokens', COALESCE(profile_data.tokens, 0),
    'subscription_status', COALESCE(profile_data.subscription_status, '')
  );

  -- Call edge function
  PERFORM
    net.http_post(
      url := 'https://fkemumodynkaeojrrkbj.supabase.co/functions/v1/sync-brevo-contact',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := user_data
    );

  RETURN NEW;
END;
$$;

-- Trigger on workspace_members
DROP TRIGGER IF EXISTS sync_workspace_member_to_brevo ON public.workspace_members;
CREATE TRIGGER sync_workspace_member_to_brevo
  AFTER INSERT OR UPDATE ON public.workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_workspace_member_to_brevo();