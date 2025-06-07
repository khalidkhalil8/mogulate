
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// CORS headers with restricted origins (webhooks typically don't need CORS)
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://dashboard.stripe.com',
  'Access-Control-Allow-Headers': 'stripe-signature, content-type',
  'Access-Control-Allow-Methods': 'POST',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
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
    logStep("Webhook received");

    // Use USE_LIVE_STRIPE flag to determine environment (preserving existing logic)
    const useLiveStripe = Deno.env.get('USE_LIVE_STRIPE') === 'true';
    const stripeKey = useLiveStripe 
      ? Deno.env.get('STRIPE_SECRET_KEY')
      : Deno.env.get('STRIPE_SECRET_KEY_TEST');
    
    const webhookSecret = useLiveStripe
      ? Deno.env.get('STRIPE_WEBHOOK_SECRET')
      : Deno.env.get('STRIPE_WEBHOOK_SECRET_TEST');

    if (!stripeKey || !webhookSecret) {
      logStep("Missing Stripe configuration", { useLiveStripe });
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    logStep("Using Stripe environment", { live: useLiveStripe });

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logStep("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Verify webhook signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      logStep("Missing Stripe signature");
      return new Response(
        JSON.stringify({ error: 'Missing stripe signature' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type });
    } catch (error) {
      logStep("Webhook signature verification failed", { error: error instanceof Error ? error.message : String(error) });
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription event", { 
          subscriptionId: subscription.id, 
          customerId: subscription.customer,
          status: subscription.status 
        });

        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        if (!customer.email) {
          logStep("Customer has no email", { customerId: customer.id });
          break;
        }

        // Determine subscription tier and status
        let subscriptionTier = 'free';
        const isActive = subscription.status === 'active';

        if (isActive && subscription.items.data.length > 0) {
          const price = subscription.items.data[0].price;
          const amount = price.unit_amount || 0;
          
          if (amount === 1000) {
            subscriptionTier = 'starter';
          } else if (amount === 3000) {
            subscriptionTier = 'pro';
          }
        }

        logStep("Updating user profile", { 
          email: customer.email, 
          tier: subscriptionTier, 
          active: isActive 
        });

        // Update user profile
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            stripe_customer_id: customer.id,
            subscription_tier: subscriptionTier,
            subscription_started_at: isActive ? new Date().toISOString() : null,
          })
          .eq('stripe_customer_id', customer.id);

        if (updateError) {
          logStep("Failed to update profile", { error: updateError.message });
          return new Response(
            JSON.stringify({ error: 'Database update failed' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 500 
            }
          );
        }

        // Log the event for audit purposes
        const { error: logError } = await supabase
          .from('api_usage_logs')
          .insert({
            user_id: null, // We don't have user_id in webhook context
            api_type: 'webhook',
            tokens_used: 0,
            function_name: 'stripe_webhook',
          });

        if (logError) {
          logStep("Failed to log webhook event", { error: logError.message });
          // Continue anyway as this is not critical
        }

        logStep("Successfully processed subscription event");
        break;
      }
      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
  } catch (error) {
    logStep("Unexpected error", { message: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
