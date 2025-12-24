-- Add billing_cycle_day column to profiles table
-- This stores the day of the month (1-31) when the subscription started
-- Tokens will reset on this day each month
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_cycle_day INTEGER DEFAULT 1 CHECK (billing_cycle_day >= 1 AND billing_cycle_day <= 31);

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.billing_cycle_day IS 'Day of the month when tokens reset (based on subscription start date)';

-- Update existing users to set their billing cycle day based on subscription_created_at
-- If no subscription_created_at, use created_at or default to 1st of month
UPDATE public.profiles 
SET billing_cycle_day = COALESCE(
  EXTRACT(DAY FROM subscription_created_at)::INTEGER,
  EXTRACT(DAY FROM created_at)::INTEGER,
  1
)
WHERE billing_cycle_day IS NULL OR billing_cycle_day = 1;

-- Create or replace function to get next token reset date
CREATE OR REPLACE FUNCTION public.get_next_token_reset_date(user_id_param UUID)
RETURNS DATE
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cycle_day INTEGER;
  current_date_val DATE;
  next_reset_date DATE;
  current_day INTEGER;
BEGIN
  -- Get user's billing cycle day
  SELECT billing_cycle_day INTO cycle_day
  FROM public.profiles
  WHERE id = user_id_param;
  
  -- Default to 1 if not set
  IF cycle_day IS NULL THEN
    cycle_day := 1;
  END IF;
  
  current_date_val := CURRENT_DATE;
  current_day := EXTRACT(DAY FROM current_date_val)::INTEGER;
  
  -- If current day is before cycle day this month, reset is this month
  IF current_day < cycle_day THEN
    -- Try to construct the date for this month
    BEGIN
      next_reset_date := DATE_TRUNC('month', current_date_val) + (cycle_day - 1) * INTERVAL '1 day';
    EXCEPTION WHEN OTHERS THEN
      -- If cycle_day is beyond the last day of this month, use last day of month
      next_reset_date := (DATE_TRUNC('month', current_date_val) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    END;
  ELSE
    -- Reset is next month
    BEGIN
      next_reset_date := DATE_TRUNC('month', current_date_val + INTERVAL '1 month') + (cycle_day - 1) * INTERVAL '1 day';
    EXCEPTION WHEN OTHERS THEN
      -- If cycle_day is beyond the last day of next month, use last day of next month
      next_reset_date := (DATE_TRUNC('month', current_date_val + INTERVAL '2 months') - INTERVAL '1 day')::DATE;
    END;
  END IF;
  
  RETURN next_reset_date;
END;
$$;

-- Create or replace function to format reset date message
CREATE OR REPLACE FUNCTION public.get_token_reset_message(user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cycle_day INTEGER;
  plan_type TEXT;
  next_reset DATE;
  day_suffix TEXT;
BEGIN
  -- Get user's billing cycle day and plan
  SELECT p.billing_cycle_day, pl.subscription_type INTO cycle_day, plan_type
  FROM public.profiles p
  LEFT JOIN public.plans pl ON p.plan_id = pl.id
  WHERE p.id = user_id_param;
  
  -- Default to 1 if not set
  IF cycle_day IS NULL THEN
    cycle_day := 1;
  END IF;
  
  -- Get proper suffix for the day (st, nd, rd, th)
  day_suffix := CASE
    WHEN cycle_day IN (11, 12, 13) THEN 'th'
    WHEN cycle_day % 10 = 1 THEN 'st'
    WHEN cycle_day % 10 = 2 THEN 'nd'
    WHEN cycle_day % 10 = 3 THEN 'rd'
    ELSE 'th'
  END;
  
  -- Get next reset date
  next_reset := get_next_token_reset_date(user_id_param);
  
  -- Return appropriate message based on subscription type
  IF plan_type = 'yearly' THEN
    RETURN FORMAT('Token usage resets on the %s%s of each month (next reset: %s)', 
                  cycle_day, day_suffix, TO_CHAR(next_reset, 'Mon DD, YYYY'));
  ELSE
    RETURN FORMAT('Token usage resets on the %s%s of each month (next reset: %s)', 
                  cycle_day, day_suffix, TO_CHAR(next_reset, 'Mon DD, YYYY'));
  END IF;
END;
$$;