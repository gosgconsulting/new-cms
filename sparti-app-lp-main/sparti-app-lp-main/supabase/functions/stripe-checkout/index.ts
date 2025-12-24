import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateCheckoutRequest {
  plan_id: string;
  success_url: string;
  cancel_url: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { plan_id, success_url, cancel_url }: CreateCheckoutRequest = await req.json();

    if (!plan_id || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: plan_id, success_url, cancel_url" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get plan details from database
    const { data: plan, error: planError } = await supabaseClient
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: "Plan not found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get or create Stripe customer
    let customer_id: string;
    
    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customer_id = profile.stripe_customer_id;
      
      // If user has an active subscription, cancel it first
      if (profile.stripe_subscription_id) {
        try {
          console.log("[testing] Cancelling existing subscription:", profile.stripe_subscription_id);
          await stripe.subscriptions.cancel(profile.stripe_subscription_id);
          console.log("[testing] Successfully cancelled existing subscription");
        } catch (cancelError) {
          console.error("Error cancelling existing subscription:", cancelError);
          // Continue with new subscription even if cancellation fails
        }
      }
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customer_id = customer.id;

      // Update user profile with customer ID
      await supabaseClient
        .from("profiles")
        .update({ stripe_customer_id: customer_id })
        .eq("id", user.id);
    }

    // Create Stripe checkout session with 14-day free trial
    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
              description: `Monthly subscription for ${plan.token_limit} tokens`,
            },
            unit_amount: Math.round(plan.price * 100), // Convert to cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        user_id: user.id,
        plan_id: plan_id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: plan_id,
        },
        trial_period_days: 14, // 14-day free trial
      },
    });

    return new Response(
      JSON.stringify({ 
        session_id: session.id,
        url: session.url 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
