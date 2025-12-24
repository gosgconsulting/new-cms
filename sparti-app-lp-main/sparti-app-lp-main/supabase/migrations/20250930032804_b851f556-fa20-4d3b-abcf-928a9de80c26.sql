-- Create demo user account
-- Email: demo@sparti.ai
-- Password: demo

-- Insert the demo user into auth.users
-- Note: We use a specific UUID for the demo user to make it identifiable
DO $$
DECLARE
  demo_user_id UUID := '11111111-1111-1111-1111-111111111111';
  encrypted_password TEXT;
BEGIN
  -- Generate encrypted password for "demo"
  encrypted_password := crypt('demo', gen_salt('bf'));
  
  -- Check if demo user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@sparti.ai') THEN
    -- Insert demo user
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      demo_user_id,
      '00000000-0000-0000-0000-000000000000',
      'demo@sparti.ai',
      encrypted_password,
      NOW(), -- Email is pre-confirmed
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    );

    -- Insert corresponding profile (if handle_new_user trigger doesn't run)
    INSERT INTO public.profiles (id, role, tokens, created_at, updated_at)
    VALUES (demo_user_id, 'user', 1000, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Demo user created successfully with email: demo@sparti.ai';
  ELSE
    RAISE NOTICE 'Demo user already exists';
  END IF;
END $$;