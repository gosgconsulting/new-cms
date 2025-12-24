-- Ensure free trial plan exists with correct limits
INSERT INTO public.plans (
  id,
  name,
  price,
  token_limit,
  brand_limit,
  features,
  active,
  free_trial,
  subscription_type
) VALUES (
  'free_trial',
  'Free Trial',
  0,
  5,
  1,
  ARRAY['14-day trial', '5 tokens', '1 brand', 'Basic features'],
  true,
  14,
  'monthly'
)
ON CONFLICT (id) 
DO UPDATE SET
  token_limit = 5,
  brand_limit = 1,
  features = ARRAY['14-day trial', '5 tokens', '1 brand', 'Basic features'],
  free_trial = 14;