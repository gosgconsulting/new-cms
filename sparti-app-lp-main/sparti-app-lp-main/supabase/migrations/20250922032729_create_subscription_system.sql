-- Create subscription system tables and functions
-- This migration adds Stripe subscription support with token management

-- Add subscription-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS tokens NUMERIC(10,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS subscription_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMP WITH TIME ZONE;

-- Create plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  token_limit INTEGER NOT NULL,
  brand_limit INTEGER NOT NULL,
  features TEXT[] DEFAULT '{}',
  stripe_price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add stripe_price_id column if it doesn't exist (for existing plans table)
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Insert default plans
INSERT INTO public.plans (id, name, price, token_limit, brand_limit, features, stripe_price_id) VALUES
('free', 'Free - 5 tokens / month', 0, 5, 1, ARRAY['5 tokens/month', '1 brand', 'Basic features'], NULL),
('starter', '20 tokens / month', 20, 20, 3, ARRAY['20 tokens/month', '3 brands', 'Enhanced features'], NULL),
('professional', '40 tokens / month', 40, 40, 10, ARRAY['40 tokens/month', '10 brands', 'Advanced features'], NULL),
('enterprise', '100 tokens / month', 100, 100, 0, ARRAY['100 tokens/month', 'Unlimited brands', 'All features'], NULL)
ON CONFLICT (id) DO NOTHING;

-- Create subscription_events table for tracking subscription changes
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'subscription_created', 'subscription_updated', 'subscription_cancelled', 'payment_succeeded', 'payment_failed'
  stripe_event_id TEXT,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on subscription_events
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_events
CREATE POLICY "Users can view their own subscription events" ON public.subscription_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscription events" ON public.subscription_events
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to add tokens to user account
CREATE OR REPLACE FUNCTION public.add_tokens_to_user(
  p_user_id UUID,
  p_tokens_to_add NUMERIC(10,2),
  p_reason TEXT DEFAULT 'subscription_renewal'
) RETURNS JSONB AS $$
DECLARE
  current_tokens NUMERIC(10,2);
  new_balance NUMERIC(10,2);
BEGIN
  -- Get current token balance
  SELECT tokens INTO current_tokens
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Check if user exists
  IF current_tokens IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;
  
  -- Add tokens
  new_balance := current_tokens + p_tokens_to_add;
  
  UPDATE public.profiles
  SET tokens = new_balance,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the event
  INSERT INTO public.subscription_events (
    user_id,
    event_type,
    event_data
  ) VALUES (
    p_user_id,
    'tokens_added',
    jsonb_build_object(
      'tokens_added', p_tokens_to_add,
      'previous_balance', current_tokens,
      'new_balance', new_balance,
      'reason', p_reason
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'tokens_added', p_tokens_to_add,
    'previous_balance', current_tokens,
    'new_balance', new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user subscription
CREATE OR REPLACE FUNCTION public.update_user_subscription(
  p_user_id UUID,
  p_plan_id TEXT,
  p_stripe_customer_id TEXT DEFAULT NULL,
  p_stripe_subscription_id TEXT DEFAULT NULL,
  p_subscription_status TEXT DEFAULT 'active'
) RETURNS JSONB AS $$
DECLARE
  plan_token_limit INTEGER;
  current_tokens NUMERIC(10,2);
BEGIN
  -- Get plan token limit
  SELECT token_limit INTO plan_token_limit
  FROM public.plans
  WHERE id = p_plan_id;
  
  IF plan_token_limit IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Plan not found'
    );
  END IF;
  
  -- Get current tokens
  SELECT tokens INTO current_tokens
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Update user profile
  UPDATE public.profiles
  SET 
    plan_id = p_plan_id,
    stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
    stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
    subscription_status = p_subscription_status,
    subscription_updated_at = now(),
    updated_at = now()
  WHERE id = p_user_id;
  
  -- If this is a new subscription, add initial tokens
  IF p_subscription_status = 'active' AND current_tokens < plan_token_limit THEN
    PERFORM public.add_tokens_to_user(
      p_user_id,
      plan_token_limit - current_tokens,
      'initial_subscription_tokens'
    );
  END IF;
  
  -- Log the event
  INSERT INTO public.subscription_events (
    user_id,
    event_type,
    event_data
  ) VALUES (
    p_user_id,
    'subscription_updated',
    jsonb_build_object(
      'plan_id', p_plan_id,
      'stripe_customer_id', p_stripe_customer_id,
      'stripe_subscription_id', p_stripe_subscription_id,
      'subscription_status', p_subscription_status
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'plan_id', p_plan_id,
    'subscription_status', p_subscription_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user token balance
CREATE OR REPLACE FUNCTION public.get_user_token_balance(p_user_id UUID DEFAULT auth.uid())
RETURNS NUMERIC(10,2) AS $$
DECLARE
  token_balance NUMERIC(10,2);
BEGIN
  SELECT tokens INTO token_balance
  FROM public.profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(token_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_plan_id ON public.profiles(plan_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON public.subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON public.subscription_events(created_at);

-- Drop existing function first to avoid return type conflicts
DROP FUNCTION IF EXISTS public.get_current_month_token_usage(UUID);

-- Create the updated get_current_month_token_usage function to work with the new schema
CREATE OR REPLACE FUNCTION public.get_current_month_token_usage(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  tokens_used NUMERIC,
  tokens_limit NUMERIC,
  tokens_remaining NUMERIC,
  month_year TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_month DATE;
  user_plan_id TEXT;
  plan_token_limit NUMERIC(10,2);
  used_tokens NUMERIC(10,2);
  current_tokens NUMERIC(10,2);
BEGIN
  -- Get first day of current month
  current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  -- Get user's current plan and token limit
  SELECT p.plan_id INTO user_plan_id FROM public.profiles p WHERE p.id = p_user_id;
  SELECT pl.token_limit INTO plan_token_limit FROM public.plans pl WHERE pl.id = COALESCE(user_plan_id, 'free');
  
  -- Get current token balance
  SELECT tokens INTO current_tokens FROM public.profiles WHERE id = p_user_id;
  
  -- Calculate tokens used this month (simplified - in production you'd track this more precisely)
  used_tokens := GREATEST(0, plan_token_limit - COALESCE(current_tokens, 0));
  
  -- Return current month usage
  RETURN QUERY
  SELECT 
    used_tokens,
    plan_token_limit,
    COALESCE(current_tokens, 0),
    current_month::TEXT
  WHERE plan_token_limit IS NOT NULL;
END;
$$;
