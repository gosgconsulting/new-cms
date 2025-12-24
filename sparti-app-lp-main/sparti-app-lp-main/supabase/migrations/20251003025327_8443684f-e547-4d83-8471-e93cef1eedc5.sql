-- Update get_user_token_balance function to enforce trial token limits
CREATE OR REPLACE FUNCTION public.get_user_token_balance()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  user_tokens NUMERIC(10,2);
  user_plan_id TEXT;
  user_subscription_status TEXT;
  user_trial_end TIMESTAMP WITH TIME ZONE;
  is_trial_active BOOLEAN;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Get user's token balance and subscription info
  SELECT 
    p.tokens, 
    p.plan_id, 
    p.subscription_status,
    p.trial_end
  INTO 
    user_tokens, 
    user_plan_id, 
    user_subscription_status,
    user_trial_end
  FROM public.profiles p
  WHERE p.id = current_user_id;
  
  -- Check if trial is active
  is_trial_active := (
    user_trial_end IS NOT NULL 
    AND user_trial_end > NOW()
  ) OR (
    user_subscription_status = 'trialing'
  ) OR (
    user_plan_id = 'free'
  );
  
  -- If in trial or free plan, cap at 5 tokens
  IF is_trial_active THEN
    RETURN LEAST(COALESCE(user_tokens, 0), 5.00);
  END IF;
  
  -- Otherwise return full token balance
  RETURN COALESCE(user_tokens, 0);
END;
$$;