
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

    const { priceId, tier } = await req.json();
    logStep("Request body parsed", { priceId, tier });
    
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

    // Create price based on tier or use provided priceId
    let unitAmount;
    let productName;
    let priceData;
    
    if (priceId) {
      // Use existing Stripe price ID
      logStep("Using provided Stripe price ID", { priceId });
      priceData = { price: priceId };
    } else {
      // Create price dynamically based on tier
      if (tier === "starter") {
        unitAmount = 1000; // $10.00 in cents
        productName = "Starter Plan";
      } else if (tier === "pro") {
        unitAmount = 3000; // $30.00 in cents
        productName = "Pro Plan";
      } else {
        logStep("Invalid tier provided", { tier });
        throw new Error("Invalid tier");
      }

      logStep("Price configuration", { tier, unitAmount, productName });

      priceData = {
        price_data: {
          currency: "usd",
          product_data: { 
            name: productName,
            description: `Monthly subscription to ${productName}`
          },
          unit_amount: unitAmount,
          recurring: { interval: "month" },
        }
      };
    }

    const origin = req.headers.get("origin") || "https://mogulate.com";
    logStep("Origin detected", { origin });

    const sessionConfig = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          ...priceData,
          quantity: 1,
        },
      ],
      mode: "subscription",
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
