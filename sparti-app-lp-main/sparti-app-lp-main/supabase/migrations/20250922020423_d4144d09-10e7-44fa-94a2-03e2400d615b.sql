-- Create token usage tracking table for all API calls
CREATE TABLE IF NOT EXISTS public.api_token_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL, -- 'openrouter', 'claude', 'openai', etc.
  model_name TEXT,
  request_id TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_usd NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- API cost in USD with 2 decimals
  tokens_deducted NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- Tokens deducted (1 USD = 1 token)
  request_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_token_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to view their own usage
CREATE POLICY "Users can view own token usage" ON public.api_token_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policy for system to insert usage records
CREATE POLICY "System can insert token usage" ON public.api_token_usage
  FOR INSERT WITH CHECK (true);

-- Function to deduct tokens from user account
CREATE OR REPLACE FUNCTION public.deduct_user_tokens(
  p_user_id UUID,
  p_service_name TEXT,
  p_model_name TEXT DEFAULT NULL,
  p_cost_usd NUMERIC DEFAULT 0.00,
  p_request_data JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  tokens_to_deduct NUMERIC(10,2);
  current_tokens NUMERIC(10,2);
  new_balance NUMERIC(10,2);
  usage_record_id UUID;
BEGIN
  -- Calculate tokens to deduct (1 USD = 1 token, with 2 decimals)
  tokens_to_deduct := ROUND(p_cost_usd, 2);
  
  -- Get current token balance
  SELECT tokens INTO current_tokens
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Check if user has enough tokens
  IF current_tokens IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found',
      'current_balance', 0,
      'tokens_needed', tokens_to_deduct
    );
  END IF;
  
  IF current_tokens < tokens_to_deduct THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient tokens',
      'current_balance', current_tokens,
      'tokens_needed', tokens_to_deduct
    );
  END IF;
  
  -- Deduct tokens
  new_balance := current_tokens - tokens_to_deduct;
  
  UPDATE public.profiles
  SET tokens = new_balance,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Record the usage
  INSERT INTO public.api_token_usage (
    user_id,
    service_name,
    model_name,
    cost_usd,
    tokens_deducted,
    request_data
  ) VALUES (
    p_user_id,
    p_service_name,
    p_model_name,
    p_cost_usd,
    tokens_to_deduct,
    p_request_data
  ) RETURNING id INTO usage_record_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'usage_id', usage_record_id,
    'tokens_deducted', tokens_to_deduct,
    'previous_balance', current_tokens,
    'new_balance', new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current month token usage for a user
CREATE OR REPLACE FUNCTION public.get_current_month_token_usage()
RETURNS TABLE(
  tokens_used NUMERIC,
  tokens_limit NUMERIC,
  tokens_remaining NUMERIC,
  month_year TEXT
) AS $$
DECLARE
  current_user_id UUID;
  user_plan_tokens NUMERIC(10,2);
  used_tokens NUMERIC(10,2);
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get user's token limit from their profile
  SELECT 
    CASE 
      WHEN plan_id = 'free' THEN 5.00
      WHEN plan_id = 'starter' THEN 20.00
      WHEN plan_id = 'professional' THEN 40.00
      WHEN plan_id = 'enterprise' THEN 100.00
      ELSE 5.00
    END INTO user_plan_tokens
  FROM public.profiles
  WHERE id = current_user_id;
  
  -- Get tokens used this month
  SELECT COALESCE(SUM(tokens_deducted), 0) INTO used_tokens
  FROM public.api_token_usage
  WHERE user_id = current_user_id
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
  
  -- Return the usage data
  RETURN QUERY SELECT
    used_tokens,
    COALESCE(user_plan_tokens, 5.00),
    GREATEST(COALESCE(user_plan_tokens, 5.00) - used_tokens, 0),
    TO_CHAR(CURRENT_DATE, 'YYYY-MM');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current token balance
CREATE OR REPLACE FUNCTION public.get_user_token_balance()
RETURNS NUMERIC AS $$
DECLARE
  current_user_id UUID;
  user_balance NUMERIC(10,2);
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN 0;
  END IF;
  
  SELECT tokens INTO user_balance
  FROM public.profiles
  WHERE id = current_user_id;
  
  RETURN COALESCE(user_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;