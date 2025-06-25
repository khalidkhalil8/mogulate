
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

const logError = (step: string, error: any) => {
  console.error(`[CHECK-SUBSCRIPTION] ERROR at ${step}:`, error);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    logStep("Function started");

    // Check authorization header first
    const authHeader = req.headers.get("Authorization");
    logStep("Authorization header check", { hasHeader: !!authHeader });
    
    if (!authHeader) {
      logError("Authentication", "No authorization header provided");
      return new Response(JSON.stringify({ error: "Authorization header required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Initialize Supabase client with proper auth headers
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { 
        auth: { persistSession: false },
        global: { 
          headers: { 
            Authorization: authHeader 
          } 
        }
      }
    );

    // Verify Stripe configuration
    const useLiveStripe = Deno.env.get('USE_LIVE_STRIPE') === 'true';
    const stripeKey = useLiveStripe 
      ? Deno.env.get("STRIPE_SECRET_KEY")
      : Deno.env.get("STRIPE_SECRET_KEY_TEST");
    
    logStep("Environment check", { 
      useLiveStripe, 
      hasStripeKey: !!stripeKey,
      stripeKeyPrefix: stripeKey ? stripeKey.substring(0, 7) + '...' : 'missing'
    });
    
    if (!stripeKey) {
      logError("Configuration", `Missing Stripe secret key for ${useLiveStripe ? 'live' : 'test'} environment`);
      return new Response(JSON.stringify({ error: "Stripe configuration error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Authenticate user with detailed error handling
    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    let userData, userError;
    try {
      const authResult = await supabaseClient.auth.getUser(token);
      userData = authResult.data;
      userError = authResult.error;
    } catch (authException) {
      logError("Authentication", `Exception during getUser: ${authException}`);
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    if (userError) {
      logError("Authentication", `Authentication error: ${userError.message}`);
      return new Response(JSON.stringify({ error: `Authentication error: ${userError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = userData.user;
    if (!user?.email) {
      logError("Authentication", "User not authenticated or email not available");
      return new Response(JSON.stringify({ error: "User not authenticated or email not available" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get current user profile to check existing subscription tier
    let currentProfile;
    try {
      const { data: profileData } = await supabaseClient
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();
      currentProfile = profileData;
      logStep("Current profile retrieved", { subscriptionTier: currentProfile?.subscription_tier });
    } catch (profileError) {
      logStep("Profile retrieval failed", { error: profileError });
      // Continue without current profile data
    }

    // Initialize Stripe
    let stripe;
    try {
      stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      logStep("Stripe initialized successfully");
    } catch (stripeError) {
      logError("Stripe initialization", stripeError);
      return new Response(JSON.stringify({ error: "Stripe initialization failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Look up customer in Stripe
    let customers;
    try {
      customers = await stripe.customers.list({ email: user.email, limit: 1 });
      logStep("Customer lookup completed", { customerCount: customers.data.length });
    } catch (customerError) {
      logError("Customer lookup", customerError);
      return new Response(JSON.stringify({ error: "Failed to check customer status" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      
      // Only update if the user is not already on free tier to avoid unnecessary resets
      if (currentProfile?.subscription_tier !== "free") {
        logStep("Updating to free tier");
        try {
          await supabaseClient.from("profiles").upsert({
            id: user.id,
            subscription_tier: "free",
            subscription_started_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        } catch (updateError) {
          logError("Database update", updateError);
          // Continue even if update fails
        }
      } else {
        logStep("User already on free tier, skipping update");
      }
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        subscription_tier: "free",
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    let subscriptions;
    try {
      subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      logStep("Subscriptions lookup completed", { activeSubscriptions: subscriptions.data.length });
    } catch (subscriptionError) {
      logError("Subscription lookup", subscriptionError);
      return new Response(JSON.stringify({ error: "Failed to check subscription status" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = "free";
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Determine subscription tier from price amount
      try {
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;
        
        if (amount === 1000) {
          subscriptionTier = "starter";
        } else if (amount === 3000) {
          subscriptionTier = "pro";
        }
        logStep("Determined subscription tier", { priceId, amount, subscriptionTier });
      } catch (priceError) {
        logError("Price lookup", priceError);
        // Continue with default tier
      }
    } else {
      logStep("No active subscription found");
    }

    // Only update the profiles table if the subscription tier has actually changed
    if (currentProfile?.subscription_tier !== subscriptionTier) {
      logStep("Subscription tier changed, updating database", { 
        from: currentProfile?.subscription_tier, 
        to: subscriptionTier 
      });
      
      try {
        await supabaseClient.from("profiles").upsert({
          id: user.id,
          subscription_tier: subscriptionTier,
          subscription_started_at: new Date().toISOString(),
        }, { onConflict: 'id' });
        logStep("Database update successful");
      } catch (updateError) {
        logError("Database update", updateError);
        // Continue even if update fails
      }
    } else {
      logStep("Subscription tier unchanged, skipping database update");
    }

    logStep("Function completed successfully", { subscribed: hasActiveSub, subscriptionTier });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logError("Unexpected error in check-subscription", { 
      message: errorMessage, 
      stack: errorStack,
      type: typeof error
    });
    
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
