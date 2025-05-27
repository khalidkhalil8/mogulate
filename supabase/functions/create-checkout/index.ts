
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");
    
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) {
      logStep("Authentication failed - no user or email");
      throw new Error("User not authenticated or email not available");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    const { tier } = await req.json();
    logStep("Request body parsed", { tier });
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("Missing Stripe secret key");
      throw new Error("Stripe secret key not configured");
    }
    
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2023-10-16" 
    });
    
    logStep("Stripe client initialized");
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found, will create new one during checkout");
    }

    // Map tier to actual Stripe Price IDs
    let priceId;
    if (tier === "starter") {
      priceId = "price_1RSedFFt7oRBKHCKJ6srGnT2";
    } else if (tier === "pro") {
      priceId = "price_1RSpgaFt7oRBKHCKlLpPke8Z";
    } else {
      logStep("Invalid tier provided", { tier });
      throw new Error("Invalid tier. Only 'starter' and 'pro' are supported.");
    }

    logStep("Using Stripe Price ID", { tier, priceId });

    const origin = req.headers.get("origin") || "https://mogulate.com";
    logStep("Origin detected", { origin });

    const sessionConfig = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription" as const,
      success_url: `${origin}/profile?success=true`,
      cancel_url: `${origin}/pricing`,
    };

    logStep("Creating Stripe checkout session", sessionConfig);

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Stripe checkout session created successfully", { 
      sessionId: session.id, 
      url: session.url 
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
