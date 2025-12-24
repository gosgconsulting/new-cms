-- Add monthly token reset functionality
-- This migration implements token reset to plan limit at the start of each month

-- Create function to check and reset user tokens for new month
CREATE OR REPLACE FUNCTION public.check_and_reset_monthly_tokens(
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan_id TEXT;
  plan_token_limit INTEGER;
  current_tokens NUMERIC(10,2);
  current_month DATE;
  last_reset_month DATE;
  reset_result JSONB;
BEGIN
  -- Get first day of current month
  current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  -- Get user's plan and current tokens
  SELECT plan_id, tokens INTO user_plan_id, current_tokens
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Check if user exists
  IF user_plan_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;
  
  -- Get plan token limit
  SELECT token_limit INTO plan_token_limit
  FROM public.plans
  WHERE id = user_plan_id;
  
  IF plan_token_limit IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Plan not found'
    );
  END IF;
  
  -- Check if tokens were already reset this month
  SELECT month_year INTO last_reset_month
  FROM public.token_history
  WHERE user_id = p_user_id 
    AND month_year = current_month
    AND reason = 'monthly_reset'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If already reset this month, return current status
  IF last_reset_month IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'action', 'already_reset',
      'current_tokens', current_tokens,
      'plan_limit', plan_token_limit,
      'reset_month', current_month
    );
  END IF;
  
  -- Reset tokens to plan limit
  UPDATE public.profiles
  SET tokens = plan_token_limit,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record the reset in token history
  SELECT public.record_token_addition(
    p_user_id,
    user_plan_id,
    plan_token_limit - COALESCE(current_tokens, 0),
    'monthly_reset',
    (SELECT subscription_type FROM public.plans WHERE id = user_plan_id)
  ) INTO reset_result;
  
  -- Log the reset event
  INSERT INTO public.subscription_events (
    user_id,
    event_type,
    event_data
  ) VALUES (
    p_user_id,
    'monthly_token_reset',
    jsonb_build_object(
      'previous_tokens', current_tokens,
      'new_tokens', plan_token_limit,
      'plan_id', user_plan_id,
      'reset_month', current_month
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'action', 'reset_completed',
    'previous_tokens', current_tokens,
    'new_tokens', plan_token_limit,
    'plan_limit', plan_token_limit,
    'reset_month', current_month,
    'history_recorded', reset_result->>'success'
  );
END;
$$;

-- Create function to get user's monthly reset status
CREATE OR REPLACE FUNCTION public.get_user_monthly_reset_status(
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE(
  current_tokens NUMERIC(10,2),
  plan_token_limit INTEGER,
  plan_name TEXT,
  last_reset_month DATE,
  current_month DATE,
  needs_reset BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month DATE;
BEGIN
  current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  RETURN QUERY
  SELECT 
    p.tokens as current_tokens,
    pl.token_limit as plan_token_limit,
    pl.name as plan_name,
    COALESCE(th.month_year, '1900-01-01'::DATE) as last_reset_month,
    current_month,
    (COALESCE(th.month_year, '1900-01-01'::DATE) < current_month) as needs_reset
  FROM public.profiles p
  JOIN public.plans pl ON pl.id = p.plan_id
  LEFT JOIN (
    SELECT user_id, month_year
    FROM public.token_history
    WHERE reason = 'monthly_reset'
    ORDER BY created_at DESC
    LIMIT 1
  ) th ON th.user_id = p.id
  WHERE p.id = p_user_id;
END;
$$;

-- Create function to reset tokens for all users (admin function)
CREATE OR REPLACE FUNCTION public.reset_all_users_monthly_tokens()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  reset_count INTEGER := 0;
  error_count INTEGER := 0;
  result JSONB;
BEGIN
  -- Only allow service role to run this
  IF auth.role() != 'service_role' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized - service role required'
    );
  END IF;
  
  -- Loop through all active users
  FOR user_record IN 
    SELECT id, plan_id, tokens
    FROM public.profiles
    WHERE plan_id IS NOT NULL
  LOOP
    BEGIN
      -- Check and reset tokens for this user
      SELECT public.check_and_reset_monthly_tokens(user_record.id) INTO result;
      
      IF result->>'success' = 'true' AND result->>'action' = 'reset_completed' THEN
        reset_count := reset_count + 1;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
        -- Continue with next user
    END;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'users_processed', reset_count + error_count,
    'resets_completed', reset_count,
    'errors', error_count
  );
END;
$$;

-- Create function to check if user needs token reset (for frontend)
CREATE OR REPLACE FUNCTION public.user_needs_token_reset(
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month DATE;
  last_reset_month DATE;
BEGIN
  current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  -- Check if tokens were reset this month
  SELECT month_year INTO last_reset_month
  FROM public.token_history
  WHERE user_id = p_user_id 
    AND month_year = current_month
    AND reason = 'monthly_reset'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Return true if no reset found for current month
  RETURN last_reset_month IS NULL;
END;
$$;

-- Add index for faster monthly reset checks
CREATE INDEX IF NOT EXISTS idx_token_history_monthly_reset 
ON public.token_history (user_id, month_year, reason) 
WHERE reason = 'monthly_reset';

-- Comments for documentation
COMMENT ON FUNCTION public.check_and_reset_monthly_tokens IS 'Checks if user needs monthly token reset and performs it if needed';
COMMENT ON FUNCTION public.get_user_monthly_reset_status IS 'Returns user''s current token status and reset information';
COMMENT ON FUNCTION public.reset_all_users_monthly_tokens IS 'Admin function to reset tokens for all users (service role only)';
COMMENT ON FUNCTION public.user_needs_token_reset IS 'Quick check if user needs token reset for current month';
