-- Update the get_token_reset_message function to handle free trial users
CREATE OR REPLACE FUNCTION public.get_token_reset_message(user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cycle_day INTEGER;
  plan_type TEXT;
  plan_id_val TEXT;
  next_reset DATE;
  day_suffix TEXT;
BEGIN
  -- Get user's billing cycle day, plan, and plan ID
  SELECT p.billing_cycle_day, pl.subscription_type, p.plan_id 
  INTO cycle_day, plan_type, plan_id_val
  FROM public.profiles p
  LEFT JOIN public.plans pl ON p.plan_id = pl.id
  WHERE p.id = user_id_param;
  
  -- Check if user is on free trial - return specific message
  IF plan_id_val IN ('free', 'free_trial') THEN
    RETURN 'Free trial tokens do not reset. Upgrade to a paid plan for monthly token renewals.';
  END IF;
  
  -- Default to 1 if not set (for paid plans)
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
  
  -- Return message based on subscription type
  RETURN FORMAT('Token usage resets on the %s%s of each month based on your subscription date (next reset: %s)', 
                cycle_day, day_suffix, TO_CHAR(next_reset, 'Mon DD, YYYY'));
END;
$$;