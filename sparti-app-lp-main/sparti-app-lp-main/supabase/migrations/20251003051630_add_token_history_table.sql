-- Create token_history table to track token additions to users
-- This table maintains a record of when tokens were added to users each month

CREATE TABLE IF NOT EXISTS public.token_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  tokens_added NUMERIC(10,2) NOT NULL,
  tokens_total NUMERIC(10,2) NOT NULL, -- Total tokens after addition
  month_year DATE NOT NULL, -- First day of the month (e.g., 2024-01-01 for January 2024)
  reason TEXT NOT NULL DEFAULT 'monthly_subscription', -- Reason for token addition
  subscription_type public.subscription_type DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_history_user_id ON public.token_history (user_id);
CREATE INDEX IF NOT EXISTS idx_token_history_month_year ON public.token_history (month_year);
CREATE INDEX IF NOT EXISTS idx_token_history_plan_id ON public.token_history (plan_id);
CREATE INDEX IF NOT EXISTS idx_token_history_user_month ON public.token_history (user_id, month_year);

-- Enable RLS on token_history
ALTER TABLE public.token_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own token history" ON public.token_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert token history" ON public.token_history
  FOR INSERT WITH CHECK (true); -- Allow system to insert records

CREATE POLICY "System can update token history" ON public.token_history
  FOR UPDATE USING (true); -- Allow system to update records

-- Enable automatic timestamp updates
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.token_history 
FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

-- Function to record token addition to history
CREATE OR REPLACE FUNCTION public.record_token_addition(
  p_user_id UUID,
  p_plan_id TEXT,
  p_tokens_added NUMERIC(10,2),
  p_reason TEXT DEFAULT 'monthly_subscription',
  p_subscription_type public.subscription_type DEFAULT 'monthly'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month DATE;
  current_tokens NUMERIC(10,2);
  new_total_tokens NUMERIC(10,2);
  existing_record RECORD;
BEGIN
  -- Get first day of current month
  current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  -- Get current token balance
  SELECT tokens INTO current_tokens
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Calculate new total
  new_total_tokens := COALESCE(current_tokens, 0) + p_tokens_added;
  
  -- Check if record already exists for this month
  SELECT * INTO existing_record
  FROM public.token_history
  WHERE user_id = p_user_id 
    AND month_year = current_month
    AND plan_id = p_plan_id;
  
  -- If record exists, update it
  IF existing_record.id IS NOT NULL THEN
    UPDATE public.token_history
    SET 
      tokens_added = p_tokens_added,
      tokens_total = new_total_tokens,
      reason = p_reason,
      subscription_type = p_subscription_type,
      updated_at = NOW()
    WHERE id = existing_record.id;
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'updated',
      'record_id', existing_record.id,
      'tokens_added', p_tokens_added,
      'tokens_total', new_total_tokens
    );
  ELSE
    -- Insert new record
    INSERT INTO public.token_history (
      user_id,
      plan_id,
      tokens_added,
      tokens_total,
      month_year,
      reason,
      subscription_type
    ) VALUES (
      p_user_id,
      p_plan_id,
      p_tokens_added,
      new_total_tokens,
      current_month,
      p_reason,
      p_subscription_type
    );
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'inserted',
      'tokens_added', p_tokens_added,
      'tokens_total', new_total_tokens
    );
  END IF;
END;
$$;

-- Function to get user's token history
CREATE OR REPLACE FUNCTION public.get_user_token_history(
  p_user_id UUID DEFAULT auth.uid(),
  p_limit INTEGER DEFAULT 12 -- Last 12 months
)
RETURNS TABLE(
  id UUID,
  plan_id TEXT,
  plan_name TEXT,
  tokens_added NUMERIC(10,2),
  tokens_total NUMERIC(10,2),
  month_year DATE,
  reason TEXT,
  subscription_type public.subscription_type,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    th.id,
    th.plan_id,
    p.name as plan_name,
    th.tokens_added,
    th.tokens_total,
    th.month_year,
    th.reason,
    th.subscription_type,
    th.created_at
  FROM public.token_history th
  JOIN public.plans p ON p.id = th.plan_id
  WHERE th.user_id = p_user_id
  ORDER BY th.month_year DESC, th.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE public.token_history IS 'Tracks token additions to users for historical record keeping';
COMMENT ON COLUMN public.token_history.id IS 'Unique identifier for the token history record';
COMMENT ON COLUMN public.token_history.user_id IS 'Foreign key to the user who received tokens';
COMMENT ON COLUMN public.token_history.plan_id IS 'Foreign key to the plan that provided the tokens';
COMMENT ON COLUMN public.token_history.tokens_added IS 'Number of tokens added in this record';
COMMENT ON COLUMN public.token_history.tokens_total IS 'Total tokens after this addition';
COMMENT ON COLUMN public.token_history.month_year IS 'Month and year when tokens were added';
COMMENT ON COLUMN public.token_history.reason IS 'Reason for token addition (monthly_subscription, bonus, etc.)';
COMMENT ON COLUMN public.token_history.subscription_type IS 'Type of subscription (monthly/yearly)';
COMMENT ON COLUMN public.token_history.created_at IS 'When this record was created';
COMMENT ON COLUMN public.token_history.updated_at IS 'When this record was last updated';
