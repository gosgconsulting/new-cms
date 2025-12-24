-- Add subscription_type enum and column to plans table
-- This migration adds support for monthly/yearly subscription types

-- Create subscription_type enum
CREATE TYPE public.subscription_type AS ENUM ('monthly', 'yearly');

-- Add subscription_type column to plans table
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS subscription_type public.subscription_type DEFAULT 'monthly';

-- Add active column if it doesn't exist
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Add free_trial column if it doesn't exist  
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS free_trial smallint DEFAULT 0;

-- Update existing plans to have monthly subscription type
UPDATE public.plans 
SET subscription_type = 'monthly' 
WHERE subscription_type IS NULL;

-- Create separate plans for yearly subscriptions
-- We'll create yearly versions of existing plans with different pricing
INSERT INTO public.plans (id, name, price, token_limit, brand_limit, features, subscription_type, active) VALUES
('starter-yearly', 'Starter - Yearly', 192, 20, 3, ARRAY['20 tokens/month', '3 brands', 'Enhanced features', '20% savings'], 'yearly', true),
('professional-yearly', 'Professional - Yearly', 384, 40, 10, ARRAY['40 tokens/month', '10 brands', 'Advanced features', '20% savings'], 'yearly', true),
('enterprise-yearly', 'Enterprise - Yearly', 960, 100, 0, ARRAY['100 tokens/month', 'Unlimited brands', 'All features', '20% savings'], 'yearly', true)
ON CONFLICT (id) DO NOTHING;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_plans_subscription_type ON public.plans (subscription_type);
CREATE INDEX IF NOT EXISTS idx_plans_active ON public.plans (active);
