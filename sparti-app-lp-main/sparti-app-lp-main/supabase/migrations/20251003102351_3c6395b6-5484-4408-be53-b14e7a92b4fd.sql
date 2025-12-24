-- Add trial tracking columns to profiles table if they don't exist
DO $$ 
BEGIN
  -- Add subscription_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_status text DEFAULT 'trialing';
  END IF;

  -- Add trial_start column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'trial_start'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN trial_start timestamp with time zone DEFAULT now();
  END IF;

  -- Add trial_end column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'trial_end'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN trial_end timestamp with time zone DEFAULT (now() + interval '14 days');
  END IF;
END $$;

-- Create function to initialize trial for new users
CREATE OR REPLACE FUNCTION public.initialize_user_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set trial start and end dates for new users
  IF NEW.subscription_status IS NULL OR NEW.subscription_status = 'trialing' THEN
    NEW.trial_start := COALESCE(NEW.trial_start, now());
    NEW.trial_end := COALESCE(NEW.trial_end, NEW.trial_start + interval '14 days');
    NEW.subscription_status := 'trialing';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new profile insertions
DROP TRIGGER IF EXISTS set_trial_dates_on_insert ON public.profiles;
CREATE TRIGGER set_trial_dates_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_trial();

-- Create function to check if trial has expired
CREATE OR REPLACE FUNCTION public.is_trial_expired(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trial_status text;
  trial_end_date timestamp with time zone;
BEGIN
  SELECT subscription_status, trial_end 
  INTO trial_status, trial_end_date
  FROM public.profiles
  WHERE id = user_id_param;
  
  -- If not on trial, return false
  IF trial_status != 'trialing' THEN
    RETURN false;
  END IF;
  
  -- Check if trial has expired
  RETURN trial_end_date < now();
END;
$$;

-- Create function to get trial info
CREATE OR REPLACE FUNCTION public.get_trial_info(user_id_param uuid)
RETURNS TABLE(
  is_on_trial boolean,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  days_remaining integer,
  is_expired boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (p.subscription_status = 'trialing') as is_on_trial,
    p.trial_start,
    p.trial_end,
    CASE 
      WHEN p.trial_end IS NOT NULL AND p.trial_end > now() 
      THEN CEIL(EXTRACT(EPOCH FROM (p.trial_end - now())) / 86400)::integer
      ELSE 0
    END as days_remaining,
    (p.trial_end IS NOT NULL AND p.trial_end < now()) as is_expired
  FROM public.profiles p
  WHERE p.id = user_id_param;
END;
$$;

-- Update existing users without trial dates to have trial dates
UPDATE public.profiles
SET 
  trial_start = COALESCE(trial_start, created_at),
  trial_end = COALESCE(trial_end, created_at + interval '14 days'),
  subscription_status = COALESCE(subscription_status, 'trialing')
WHERE subscription_status IS NULL 
  OR (subscription_status = 'trialing' AND trial_end IS NULL);