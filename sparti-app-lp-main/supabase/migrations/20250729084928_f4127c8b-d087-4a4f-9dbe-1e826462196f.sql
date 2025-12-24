-- Fix the handle_new_user function to resolve ambiguous column references
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_workspace_id uuid;
  v_user_id uuid := NEW.id;
  v_first_name text := NEW.raw_user_meta_data->>'first_name';
  v_last_name text := NEW.raw_user_meta_data->>'last_name';
BEGIN
  -- Insert the user profile
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (v_user_id, v_first_name, v_last_name, 'user')
  ON CONFLICT (id) DO NOTHING;

  -- Check if a default workspace already exists for this user
  SELECT w.id INTO v_workspace_id
  FROM public.workspaces w
  WHERE w.created_by = v_user_id AND w.is_default = true
  LIMIT 1;

  -- If no default workspace exists, create one
  IF v_workspace_id IS NULL THEN
    INSERT INTO public.workspaces (name, description, created_by, is_default)
    VALUES ('Main Workspace', 'Default workspace created upon signup', v_user_id, true)
    RETURNING id INTO v_workspace_id;
  END IF;

  -- Add the user as an admin member of this workspace, if not already a member
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (v_workspace_id, v_user_id, 'admin', 'active')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Also fix the update_updated_at_column function to have proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';