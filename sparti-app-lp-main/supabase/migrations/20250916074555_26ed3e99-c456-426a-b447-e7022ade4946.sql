-- Fix security issues for the newly created functions by setting search_path

-- Drop existing functions to recreate them with proper security
DROP FUNCTION IF EXISTS public.get_current_month_token_usage(UUID);
DROP FUNCTION IF EXISTS public.increment_token_usage(UUID, INTEGER);

-- Recreate functions with proper security settings
CREATE OR REPLACE FUNCTION public.get_current_month_token_usage(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  tokens_used INTEGER,
  tokens_limit INTEGER,
  tokens_remaining INTEGER,
  month_year DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_month DATE;
  user_plan_id TEXT;
  plan_token_limit INTEGER;
BEGIN
  -- Get first day of current month
  current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  -- Get user's current plan and token limit
  SELECT p.plan_id INTO user_plan_id FROM public.profiles p WHERE p.id = p_user_id;
  SELECT pl.token_limit INTO plan_token_limit FROM public.plans pl WHERE pl.id = COALESCE(user_plan_id, 'lite');
  
  -- Get or create current month usage record
  INSERT INTO public.monthly_token_usage (user_id, month_year, tokens_limit)
  VALUES (p_user_id, current_month, plan_token_limit)
  ON CONFLICT (user_id, month_year) 
  DO UPDATE SET 
    tokens_limit = plan_token_limit,
    updated_at = now();
  
  -- Return current month usage
  RETURN QUERY
  SELECT 
    mtu.tokens_used,
    mtu.tokens_limit,
    (mtu.tokens_limit - mtu.tokens_used) as tokens_remaining,
    mtu.month_year
  FROM public.monthly_token_usage mtu
  WHERE mtu.user_id = p_user_id AND mtu.month_year = current_month;
END;
$$;

-- Recreate increment function with proper security
CREATE OR REPLACE FUNCTION public.increment_token_usage(p_user_id UUID, p_tokens_used INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_month DATE;
  user_plan_id TEXT;
  plan_token_limit INTEGER;
  current_usage INTEGER;
BEGIN
  -- Get first day of current month
  current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  -- Get user's current plan and token limit
  SELECT p.plan_id INTO user_plan_id FROM public.profiles p WHERE p.id = p_user_id;
  SELECT pl.token_limit INTO plan_token_limit FROM public.plans pl WHERE pl.id = COALESCE(user_plan_id, 'lite');
  
  -- Get or create current month usage record
  INSERT INTO public.monthly_token_usage (user_id, month_year, tokens_limit)
  VALUES (p_user_id, current_month, plan_token_limit)
  ON CONFLICT (user_id, month_year) 
  DO UPDATE SET 
    tokens_limit = plan_token_limit,
    updated_at = now();
  
  -- Check if user has enough tokens
  SELECT mtu.tokens_used INTO current_usage 
  FROM public.monthly_token_usage mtu 
  WHERE mtu.user_id = p_user_id AND mtu.month_year = current_month;
  
  IF (current_usage + p_tokens_used) > plan_token_limit THEN
    RETURN FALSE; -- Not enough tokens
  END IF;
  
  -- Update token usage
  UPDATE public.monthly_token_usage 
  SET 
    tokens_used = tokens_used + p_tokens_used,
    updated_at = now()
  WHERE user_id = p_user_id AND month_year = current_month;
  
  RETURN TRUE; -- Success
END;
$$;