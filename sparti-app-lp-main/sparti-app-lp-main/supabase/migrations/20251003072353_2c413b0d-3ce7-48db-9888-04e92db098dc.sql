-- Add brand_id column to api_token_usage table for better tracking
ALTER TABLE public.api_token_usage 
ADD COLUMN brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_api_token_usage_brand_id ON public.api_token_usage(brand_id);

-- Create index for user_id and brand_id combination
CREATE INDEX idx_api_token_usage_user_brand ON public.api_token_usage(user_id, brand_id);