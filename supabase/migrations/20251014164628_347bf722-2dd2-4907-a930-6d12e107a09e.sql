-- CRITICAL SECURITY FIX: Create proper user roles table
-- Roles MUST NOT be stored in user_profiles to prevent privilege escalation

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 5. Migrate existing roles from user_profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::app_role
FROM public.user_profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Update user_has_role function to use new table (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.user_has_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() 
        AND role = required_role::app_role
    );
END;
$$;

-- 7. Update handle_new_user function to use new table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_tenant_id uuid;
  user_count integer;
  user_role app_role;
BEGIN
  -- Insert into users table
  INSERT INTO users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at);

  -- Check if this is the first user
  SELECT COUNT(*) INTO user_count FROM users;
  
  -- Get or create default tenant
  SELECT id INTO default_tenant_id 
  FROM tenants 
  WHERE domain = 'localhost' OR subdomain = 'default'
  LIMIT 1;
  
  IF default_tenant_id IS NULL THEN
    INSERT INTO tenants (name, domain, subdomain, status)
    VALUES ('Default Site', 'localhost', 'default', 'active')
    RETURNING id INTO default_tenant_id;
  END IF;

  -- Determine role
  IF user_count = 1 OR NEW.email = 'contact@gosgconsulting.com' THEN
    user_role := 'admin';
  ELSE
    user_role := 'user';
  END IF;

  -- Create user profile (without role column)
  INSERT INTO user_profiles (
    user_id, 
    tenant_id, 
    email,
    first_name,
    last_name
  ) VALUES (
    NEW.id,
    default_tenant_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );

  -- Insert role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$$;

-- 8. Remove role column from user_profiles (after migration)
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS role;