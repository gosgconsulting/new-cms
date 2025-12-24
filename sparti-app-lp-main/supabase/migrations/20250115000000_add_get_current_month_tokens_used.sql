-- Function to get current month tokens used for a user
CREATE OR REPLACE FUNCTION public.get_current_month_tokens_used()
RETURNS NUMERIC AS $$
DECLARE
  current_user_id UUID;
  used_tokens NUMERIC(10,2);
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Get tokens used this month
  SELECT COALESCE(SUM(tokens_deducted), 0) INTO used_tokens
  FROM public.api_token_usage
  WHERE user_id = current_user_id
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
  
  RETURN used_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
