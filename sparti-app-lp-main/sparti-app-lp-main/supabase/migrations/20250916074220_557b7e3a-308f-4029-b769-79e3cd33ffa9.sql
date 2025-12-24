-- Add token_limit column to plans table
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS token_limit INTEGER DEFAULT 20;

-- Update existing plans with token limits based on their features
UPDATE public.plans SET token_limit = 20 WHERE id IN ('lite', 'standard', 'enterprise');

-- Create monthly token usage tracking table
CREATE TABLE IF NOT EXISTS public.monthly_token_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year DATE NOT NULL, -- First day of the month (e.g., 2024-01-01 for January 2024)
  tokens_used INTEGER DEFAULT 0,
  tokens_limit INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure one record per user per month
  UNIQUE(user_id, month_year)
);

-- Enable RLS on monthly_token_usage
ALTER TABLE public.monthly_token_usage ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only see their own token usage
CREATE POLICY "Users can view their own monthly token usage" ON public.monthly_token_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly token usage" ON public.monthly_token_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly token usage" ON public.monthly_token_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to get current month token usage for a user
CREATE OR REPLACE FUNCTION public.get_current_month_token_usage(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  tokens_used INTEGER,
  tokens_limit INTEGER,
  tokens_remaining INTEGER,
  month_year DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to increment token usage
CREATE OR REPLACE FUNCTION public.increment_token_usage(p_user_id UUID, p_tokens_used INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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