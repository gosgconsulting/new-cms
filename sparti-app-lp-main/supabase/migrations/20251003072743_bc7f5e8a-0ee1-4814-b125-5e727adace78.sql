-- Update the deduct_user_tokens function to accept and store brand_id
CREATE OR REPLACE FUNCTION public.deduct_user_tokens(
  p_user_id uuid,
  p_service_name text,
  p_model_name text DEFAULT NULL,
  p_cost_usd numeric DEFAULT 0.00,
  p_brand_id uuid DEFAULT NULL,
  p_request_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance numeric;
  v_tokens_to_deduct numeric;
  v_new_balance numeric;
  v_usage_id uuid;
BEGIN
  -- Get current token balance
  SELECT tokens INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;
  
  -- Calculate tokens to deduct (cost * 5 = tokens)
  v_tokens_to_deduct := p_cost_usd * 5;
  
  -- Check if user has enough tokens
  IF v_current_balance < v_tokens_to_deduct THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient tokens',
      'current_balance', v_current_balance,
      'required_tokens', v_tokens_to_deduct
    );
  END IF;
  
  -- Deduct tokens from balance
  v_new_balance := v_current_balance - v_tokens_to_deduct;
  
  UPDATE profiles
  SET tokens = v_new_balance
  WHERE id = p_user_id;
  
  -- Record the token usage with brand_id
  INSERT INTO api_token_usage (
    user_id,
    service_name,
    model_name,
    cost_usd,
    tokens_deducted,
    brand_id,
    request_data,
    prompt_tokens,
    completion_tokens,
    total_tokens
  ) VALUES (
    p_user_id,
    p_service_name,
    p_model_name,
    p_cost_usd,
    v_tokens_to_deduct,
    p_brand_id,
    p_request_data,
    COALESCE((p_request_data->>'prompt_tokens')::integer, 0),
    COALESCE((p_request_data->>'completion_tokens')::integer, 0),
    COALESCE((p_request_data->>'total_tokens')::integer, 0)
  )
  RETURNING id INTO v_usage_id;
  
  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'previous_balance', v_current_balance,
    'tokens_deducted', v_tokens_to_deduct,
    'new_balance', v_new_balance,
    'usage_id', v_usage_id
  );
END;
$$;