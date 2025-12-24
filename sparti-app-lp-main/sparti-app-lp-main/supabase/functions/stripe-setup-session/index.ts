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

interface SetupSessionRequest {
  success_url: string;
  cancel_url: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("[stripe-setup-session] Request received");
    
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
      console.error("[stripe-setup-session] Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("[stripe-setup-session] User authenticated:", user.id);

    const { success_url, cancel_url }: SetupSessionRequest = await req.json();

    if (!success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: success_url, cancel_url" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get or create Stripe customer
    let customer_id: string;
    
    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    console.log("[stripe-setup-session] Profile data:", profile);

    if (profile?.stripe_customer_id) {
      customer_id = profile.stripe_customer_id;
      console.log("[stripe-setup-session] Using existing customer:", customer_id);
    } else {
      // Create new Stripe customer
      console.log("[stripe-setup-session] Creating new Stripe customer");
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customer_id = customer.id;
      console.log("[stripe-setup-session] Created customer:", customer_id);

      // Update user profile with customer ID
      await supabaseClient
        .from("profiles")
        .update({ stripe_customer_id: customer_id })
        .eq("id", user.id);
      
      console.log("[stripe-setup-session] Updated profile with customer ID");
    }

    // Create Stripe Setup Session for collecting payment method
    console.log("[stripe-setup-session] Creating setup session");
    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
      mode: "setup",
      payment_method_types: ["card"],
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        user_id: user.id,
      },
    });

    console.log("[stripe-setup-session] Setup session created:", session.id);

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
    console.error("[stripe-setup-session] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
