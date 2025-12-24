-- Update add_tokens_to_user function to reset tokens to plan limit instead of adding
-- This implements the new monthly token reset functionality

CREATE OR REPLACE FUNCTION public.add_tokens_to_user(
  p_user_id UUID,
  p_tokens_to_add NUMERIC(10,2),
  p_reason TEXT DEFAULT 'subscription_renewal'
) RETURNS JSONB AS $$
DECLARE
  current_tokens NUMERIC(10,2);
  user_plan_id TEXT;
  plan_token_limit INTEGER;
  plan_subscription_type public.subscription_type;
  history_result JSONB;
  tokens_difference NUMERIC(10,2);
BEGIN
  -- Get current token balance and plan info
  SELECT tokens, plan_id INTO current_tokens, user_plan_id
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Check if user exists
  IF current_tokens IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;
  
  -- Get plan token limit and subscription type
  SELECT token_limit, subscription_type INTO plan_token_limit, plan_subscription_type
  FROM public.plans
  WHERE id = user_plan_id;
  
  IF plan_token_limit IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Plan not found'
    );
  END IF;
  
  -- Reset tokens to plan limit (not add to current)
  UPDATE public.profiles
  SET tokens = plan_token_limit,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Calculate the difference for history recording
  tokens_difference := plan_token_limit - current_tokens;
  
  -- Record token reset in history
  SELECT public.record_token_addition(
    p_user_id,
    user_plan_id,
    tokens_difference,
    p_reason,
    COALESCE(plan_subscription_type, 'monthly')
  ) INTO history_result;
  
  -- Log the event in subscription_events
  INSERT INTO public.subscription_events (
    user_id,
    event_type,
    event_data
  ) VALUES (
    p_user_id,
    'tokens_reset',
    jsonb_build_object(
      'tokens_difference', tokens_difference,
      'previous_balance', current_tokens,
      'new_balance', plan_token_limit,
      'plan_limit', plan_token_limit,
      'reason', p_reason,
      'history_recorded', history_result->>'success'
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'tokens_difference', tokens_difference,
    'previous_balance', current_tokens,
    'new_balance', plan_token_limit,
    'plan_limit', plan_token_limit,
    'history_recorded', history_result->>'success'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's token history for display
CREATE OR REPLACE FUNCTION public.get_user_token_history_summary(
  p_user_id UUID DEFAULT auth.uid(),
  p_months INTEGER DEFAULT 6
)
RETURNS TABLE(
  month_year DATE,
  plan_name TEXT,
  tokens_added NUMERIC(10,2),
  tokens_total NUMERIC(10,2),
  subscription_type public.subscription_type,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    th.month_year,
    p.name as plan_name,
    th.tokens_added,
    th.tokens_total,
    th.subscription_type,
    th.reason,
    th.created_at
  FROM public.token_history th
  JOIN public.plans p ON p.id = th.plan_id
  WHERE th.user_id = p_user_id
  ORDER BY th.month_year DESC, th.created_at DESC
  LIMIT p_months;
END;
$$;

-- Create function to get monthly token statistics
CREATE OR REPLACE FUNCTION public.get_monthly_token_stats(
  p_user_id UUID DEFAULT auth.uid(),
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE(
  month INTEGER,
  month_name TEXT,
  tokens_added NUMERIC(10,2),
  tokens_total NUMERIC(10,2),
  plan_name TEXT,
  subscription_type public.subscription_type
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(MONTH FROM th.month_year)::INTEGER as month,
    TO_CHAR(th.month_year, 'Month') as month_name,
    th.tokens_added,
    th.tokens_total,
    p.name as plan_name,
    th.subscription_type
  FROM public.token_history th
  JOIN public.plans p ON p.id = th.plan_id
  WHERE th.user_id = p_user_id
    AND EXTRACT(YEAR FROM th.month_year) = p_year
  ORDER BY th.month_year DESC;
END;
$$;
