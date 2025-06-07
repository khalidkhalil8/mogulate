
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface CheckoutRequest {
  priceId?: string;
  tier?: string;
}

// CORS headers with restricted origins
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const validTiers = ['starter', 'pro'];

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

const logError = (step: string, error: any) => {
  console.error(`[CREATE-CHECKOUT] ERROR at ${step}:`, error);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 405 
      }
    );
  }

  try {
    logStep("Function started");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logError("Configuration", "Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logError("Authentication", "No authorization header");
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 401 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      logError("Authentication", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 401 
        }
      );
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse and validate request body
    let requestData: CheckoutRequest;
    try {
      requestData = await req.json();
      logStep("Request body parsed", requestData);
    } catch (parseError) {
      logError("Request parsing", parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // Validate tier if provided
    if (requestData.tier && !validTiers.includes(requestData.tier)) {
      logError("Validation", { tier: requestData.tier, validTiers });
      return new Response(
        JSON.stringify({ error: 'Invalid subscription tier' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // Determine which Stripe environment to use
    const useLiveStripe = Deno.env.get('USE_LIVE_STRIPE') === 'true';
    logStep("Environment check", { useLiveStripe, envValue: Deno.env.get('USE_LIVE_STRIPE') });
    
    // Get the appropriate keys based on environment
    const stripeKey = useLiveStripe 
      ? Deno.env.get('STRIPE_SECRET_KEY')
      : Deno.env.get('STRIPE_SECRET_KEY_TEST');
    
    const starterPriceId = useLiveStripe
      ? Deno.env.get('STRIPE_PRICE_ID_STARTER')
      : Deno.env.get('STRIPE_PRICE_ID_STARTER_TEST');
    
    const proPriceId = useLiveStripe
      ? Deno.env.get('STRIPE_PRICE_ID_PRO')
      : Deno.env.get('STRIPE_PRICE_ID_PRO_TEST');

    // Log what we found (without exposing the full keys)
    logStep("Stripe configuration", { 
      useLiveStripe,
      hasStripeKey: !!stripeKey,
      stripeKeyPrefix: stripeKey ? stripeKey.substring(0, 7) + '...' : 'missing',
      hasStarterPriceId: !!starterPriceId,
      hasProPriceId: !!proPriceId,
      starterPriceId: starterPriceId ? starterPriceId.substring(0, 10) + '...' : 'missing',
      proPriceId: proPriceId ? proPriceId.substring(0, 10) + '...' : 'missing'
    });

    if (!stripeKey) {
      logError("Configuration", `Missing Stripe secret key for ${useLiveStripe ? 'live' : 'test'} environment`);
      return new Response(
        JSON.stringify({ error: 'Payment system configuration error - missing secret key' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    if (!starterPriceId || !proPriceId) {
      logError("Configuration", `Missing price IDs for ${useLiveStripe ? 'live' : 'test'} environment`);
      return new Response(
        JSON.stringify({ error: 'Payment system configuration error - missing price IDs' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    // Initialize Stripe with proper error handling
    let stripe;
    try {
      stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
      logStep("Stripe initialized successfully");
    } catch (stripeError) {
      logError("Stripe initialization", stripeError);
      return new Response(
        JSON.stringify({ error: 'Payment system initialization failed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    // Determine price ID
    let priceId = requestData.priceId;
    if (!priceId && requestData.tier) {
      priceId = requestData.tier === 'starter' ? starterPriceId : proPriceId;
    }
    if (!priceId) {
      priceId = starterPriceId; // Default to starter
    }

    logStep("Price ID determined", { priceId, tier: requestData.tier });

    // Check if customer exists with error handling
    let customerId;
    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });
      } else {
        logStep("No existing customer found, will create during checkout");
      }
    } catch (customerError) {
      logError("Customer lookup", customerError);
      // Continue without customerId - Stripe will create a new customer
      logStep("Continuing without customer lookup due to error");
    }

    // Create checkout session with comprehensive error handling
    const origin = req.headers.get('origin') || req.headers.get('referer') || 'http://localhost:5173';
    logStep("Creating checkout session", { 
      priceId, 
      tier: requestData.tier, 
      customerId: customerId || 'new customer',
      origin 
    });

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${origin}/pricing?success=true`,
        cancel_url: `${origin}/pricing?canceled=true`,
        metadata: {
          user_id: user.id,
          environment: useLiveStripe ? 'live' : 'test',
        },
        billing_address_collection: 'required',
        allow_promotion_codes: true,
      });

      logStep("Checkout session created successfully", { 
        sessionId: session.id, 
        url: session.url ? 'URL generated' : 'No URL',
        mode: session.mode,
        customer: session.customer
      });
    } catch (sessionError) {
      logError("Checkout session creation", {
        error: sessionError,
        message: sessionError instanceof Error ? sessionError.message : 'Unknown error',
        priceId,
        useLiveStripe
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create checkout session',
          details: sessionError instanceof Error ? sessionError.message : 'Unknown error',
          environment: useLiveStripe ? 'live' : 'test'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    if (!session.url) {
      logError("Session validation", "No checkout URL in session response");
      return new Response(
        JSON.stringify({ error: 'No checkout URL generated' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    logStep("Success - returning checkout URL", { sessionId: session.id });

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
  } catch (error) {
    logError("Unexpected error", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
