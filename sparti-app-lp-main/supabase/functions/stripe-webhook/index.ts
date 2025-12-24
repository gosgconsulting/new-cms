import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Verify webhook signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not set");
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(supabaseClient, session);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(supabaseClient, invoice);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabaseClient, subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabaseClient, subscription);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function handleCheckoutSessionCompleted(
  supabaseClient: any,
  session: Stripe.Checkout.Session
) {
  console.log("[testing] Handling checkout.session.completed");
  
  const user_id = session.metadata?.user_id;
  const plan_id = session.metadata?.plan_id;
  const subscription_id = session.subscription as string;

  if (!user_id || !plan_id || !subscription_id) {
    console.error("Missing required metadata in checkout session");
    return;
  }

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscription_id);
  
  // Check if subscription is in trial period
  const isTrial = subscription.status === 'trialing';
  const subscriptionStatus = isTrial ? 'trialing' : subscription.status;
  
  // Calculate billing cycle day based on when billing actually starts
  // For trials, use the trial end date; otherwise use current start date
  const billingStartDate = isTrial && subscription.trial_end 
    ? new Date(subscription.trial_end * 1000)
    : new Date(subscription.current_period_start * 1000);
  const billingCycleDay = billingStartDate.getDate();
  
  console.log(`[testing] Subscription status: ${subscriptionStatus}, Trial: ${isTrial}, Billing cycle day: ${billingCycleDay}`);
  
  // Update user subscription
  const { error } = await supabaseClient.rpc("update_user_subscription", {
    p_user_id: user_id,
    p_plan_id: plan_id,
    p_stripe_customer_id: session.customer as string,
    p_stripe_subscription_id: subscription_id,
    p_subscription_status: subscriptionStatus
  });

  if (error) {
    console.error("Error updating user subscription:", error);
  } else {
    // Update billing cycle day separately
    const { error: cycleError } = await supabaseClient
      .from("profiles")
      .update({ 
        billing_cycle_day: billingCycleDay,
        subscription_created_at: billingStartDate.toISOString()
      })
      .eq("id", user_id);
      
    if (cycleError) {
      console.error("Error updating billing cycle day:", cycleError);
    } else {
      console.log(`[testing] Successfully updated subscription for user ${user_id} to plan ${plan_id} (Trial: ${isTrial}, Cycle day: ${billingCycleDay})`);
    }
  }
}

async function handleInvoicePaymentSucceeded(
  supabaseClient: any,
  invoice: Stripe.Invoice
) {
  console.log("[testing] Handling invoice.payment_succeeded");
  
  const customer_id = invoice.customer as string;
  const subscription_id = invoice.subscription as string;

  if (!customer_id || !subscription_id) {
    console.error("Missing customer_id or subscription_id in invoice");
    return;
  }

  // Get user by Stripe customer ID first
  let { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("id, plan_id")
    .eq("stripe_customer_id", customer_id)
    .single();

  // If not found by customer ID, try to find by email from Stripe customer
  if (profileError || !profile) {
    console.log("[testing] User not found by customer_id, trying to find by email");
    
    try {
      // Get customer details from Stripe
      const customer = await stripe.customers.retrieve(customer_id);
      if (customer && !customer.deleted && customer.email) {
        console.log("[testing] Looking up user by email:", customer.email);
        
        // Find user by email in auth.users
        const { data: authUser } = await supabaseClient.auth.admin.getUserByEmail(customer.email);
        
        if (authUser?.user) {
          // Update the profile with the stripe_customer_id
          const { data: updatedProfile, error: updateError } = await supabaseClient
            .from("profiles")
            .update({ stripe_customer_id: customer_id })
            .eq("id", authUser.user.id)
            .select("id, plan_id")
            .single();
            
          if (!updateError && updatedProfile) {
            profile = updatedProfile;
            console.log("[testing] Successfully linked customer to user:", authUser.user.id);
          }
        }
      }
    } catch (stripeError) {
      console.error("Error fetching customer from Stripe:", stripeError);
    }
  }

  if (!profile) {
    console.error("User not found for customer:", customer_id);
    return;
  }

  // Get plan token limit
  const { data: plan, error: planError } = await supabaseClient
    .from("plans")
    .select("token_limit")
    .eq("id", profile.plan_id)
    .single();

  if (planError || !plan) {
    console.error("Plan not found:", profile.plan_id);
    return;
  }

  // Add monthly tokens to user account
  const { error: addTokensError } = await supabaseClient.rpc("add_tokens_to_user", {
    p_user_id: profile.id,
    p_tokens_to_add: plan.token_limit,
    p_reason: "monthly_subscription_renewal"
  });

  if (addTokensError) {
    console.error("Error adding tokens:", addTokensError);
  } else {
    console.log(`[testing] Successfully added ${plan.token_limit} tokens to user ${profile.id}`);
  }
}

async function handleSubscriptionUpdated(
  supabaseClient: any,
  subscription: Stripe.Subscription
) {
  console.log("[testing] Handling customer.subscription.updated");
  
  const customer_id = subscription.customer as string;
  const subscription_id = subscription.id;

  // Get user by Stripe customer ID first
  let { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customer_id)
    .single();

  // If not found by customer ID, try to find by email from Stripe customer
  if (profileError || !profile) {
    console.log("[testing] User not found by customer_id, trying to find by email");
    
    try {
      // Get customer details from Stripe
      const customer = await stripe.customers.retrieve(customer_id);
      if (customer && !customer.deleted && customer.email) {
        console.log("[testing] Looking up user by email:", customer.email);
        
        // Find user by email in auth.users
        const { data: authUser } = await supabaseClient.auth.admin.getUserByEmail(customer.email);
        
        if (authUser?.user) {
          // Update the profile with the stripe_customer_id
          const { data: updatedProfile, error: updateError } = await supabaseClient
            .from("profiles")
            .update({ stripe_customer_id: customer_id })
            .eq("id", authUser.user.id)
            .select("id")
            .single();
            
          if (!updateError && updatedProfile) {
            profile = updatedProfile;
            console.log("[testing] Successfully linked customer to user:", authUser.user.id);
          }
        }
      }
    } catch (stripeError) {
      console.error("Error fetching customer from Stripe:", stripeError);
    }
  }

  if (!profile) {
    console.error("User not found for customer:", customer_id);
    return;
  }

  // Update subscription status
  const { error } = await supabaseClient
    .from("profiles")
    .update({ 
      subscription_status: subscription.status,
      subscription_updated_at: new Date().toISOString()
    })
    .eq("id", profile.id);

  if (error) {
    console.error("Error updating subscription status:", error);
  } else {
    console.log(`[testing] Updated subscription status for user ${profile.id} to ${subscription.status}`);
  }
}

async function handleSubscriptionDeleted(
  supabaseClient: any,
  subscription: Stripe.Subscription
) {
  console.log("[testing] Handling customer.subscription.deleted");
  
  const customer_id = subscription.customer as string;

  // Get user by Stripe customer ID first
  let { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customer_id)
    .single();

  // If not found by customer ID, try to find by email from Stripe customer
  if (profileError || !profile) {
    console.log("[testing] User not found by customer_id, trying to find by email");
    
    try {
      // Get customer details from Stripe
      const customer = await stripe.customers.retrieve(customer_id);
      if (customer && !customer.deleted && customer.email) {
        console.log("[testing] Looking up user by email:", customer.email);
        
        // Find user by email in auth.users
        const { data: authUser } = await supabaseClient.auth.admin.getUserByEmail(customer.email);
        
        if (authUser?.user) {
          // Update the profile with the stripe_customer_id
          const { data: updatedProfile, error: updateError } = await supabaseClient
            .from("profiles")
            .update({ stripe_customer_id: customer_id })
            .eq("id", authUser.user.id)
            .select("id")
            .single();
            
          if (!updateError && updatedProfile) {
            profile = updatedProfile;
            console.log("[testing] Successfully linked customer to user:", authUser.user.id);
          }
        }
      }
    } catch (stripeError) {
      console.error("Error fetching customer from Stripe:", stripeError);
    }
  }

  if (!profile) {
    console.error("User not found for customer:", customer_id);
    return;
  }

  // Update user to free plan
  const { error } = await supabaseClient.rpc("update_user_subscription", {
    p_user_id: profile.id,
    p_plan_id: "free",
    p_subscription_status: "cancelled"
  });

  if (error) {
    console.error("Error updating user to free plan:", error);
  } else {
    console.log(`[testing] Updated user ${profile.id} to free plan after subscription cancellation`);
  }
}
