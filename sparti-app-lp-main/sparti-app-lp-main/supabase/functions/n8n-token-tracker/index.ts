import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { calculateTokenCost } from '../shared/tokenPricing.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface N8NTokenUsageRequest {
  user_id: string;
  service_name: string;
  model_name?: string;
  cost_usd?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  request_data?: Record<string, any>;
  brand_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: N8NTokenUsageRequest = await req.json();

    // Validate required fields
    if (!requestData.user_id || !requestData.service_name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: user_id, service_name' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate cost if not provided
    let costUsd = requestData.cost_usd;
    
    if (costUsd === undefined) {
      if (requestData.total_tokens && requestData.model_name) {
        // Calculate cost from tokens and model
        const usage = {
          promptTokens: requestData.prompt_tokens || Math.floor(requestData.total_tokens * 0.7),
          completionTokens: requestData.completion_tokens || Math.floor(requestData.total_tokens * 0.3),
          totalTokens: requestData.total_tokens
        };
        
        const cost = calculateTokenCost(usage, requestData.model_name);
        costUsd = cost.totalCost;
        
        console.log(`💰 Calculated cost: ${costUsd} USD for ${requestData.total_tokens} tokens using ${requestData.model_name}`);
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Either cost_usd or (total_tokens + model_name) must be provided' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    console.log('📊 N8N Token Usage Request:', {
      user_id: requestData.user_id,
      service_name: requestData.service_name,
      model_name: requestData.model_name,
      cost_usd: costUsd,
      total_tokens: requestData.total_tokens
    });

    // Record token usage using the existing function
    const { data, error } = await supabaseClient.rpc('deduct_user_tokens', {
      p_user_id: requestData.user_id,
      p_service_name: requestData.service_name,
      p_model_name: requestData.model_name,
      p_cost_usd: costUsd,
      p_brand_id: requestData.brand_id,
      p_request_data: {
        ...requestData.request_data,
        prompt_tokens: requestData.prompt_tokens,
        completion_tokens: requestData.completion_tokens,
        total_tokens: requestData.total_tokens,
        processed_by: 'n8n',
        timestamp: new Date().toISOString()
      }
    });

    if (error) {
      console.error('❌ Database error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to record token usage',
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!data?.success) {
      console.error('❌ Token deduction failed:', data?.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data?.error || 'Failed to deduct tokens',
          current_balance: data?.current_balance,
          tokens_needed: data?.tokens_needed
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Token usage recorded successfully:', {
      usage_id: data.usage_id,
      tokens_deducted: data.tokens_deducted,
      new_balance: data.new_balance
    });

    return new Response(
      JSON.stringify({
        success: true,
        usage_id: data.usage_id,
        tokens_deducted: data.tokens_deducted,
        previous_balance: data.previous_balance,
        new_balance: data.new_balance,
        message: 'Token usage recorded successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ N8N Token Tracker Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});