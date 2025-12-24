import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { userId } = await req.json();

    if (userId !== user.id) {
      throw new Error('Unauthorized');
    }

    console.log('Cancelling subscription for user:', userId);

    // Get current subscription info
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('subscription_id, subscription_end_date')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    // Update subscription status to 'canceling' (will remain active until period end)
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'canceling',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error('Failed to update subscription status');
    }

    console.log('Subscription cancelled successfully for user:', userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription cancelled successfully',
        endsAt: profile.subscription_end_date
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
