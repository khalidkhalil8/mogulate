
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    // Use test keys for testing
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY_TEST");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET_TEST");
    
    if (!stripeSecretKey || !webhookSecret) {
      logStep("Missing required test environment variables");
      throw new Error("Missing STRIPE_SECRET_KEY_TEST or STRIPE_WEBHOOK_SECRET_TEST");
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    
    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      logStep("Missing Stripe signature");
      throw new Error("Missing Stripe signature");
    }

    // Verify the webhook signature using the ASYNC method
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type, eventId: event.id });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event, supabase, stripe);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event, supabase, stripe);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event, supabase, stripe);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event, supabase);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event, supabase);
        break;
      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Webhook processing error", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutCompleted(event: Stripe.Event, supabase: any, stripe: Stripe) {
  const session = event.data.object as Stripe.Checkout.Session;
  logStep("Processing checkout completed", { sessionId: session.id, customerId: session.customer });

  if (!session.customer || !session.customer_email) {
    logStep("Missing customer information in checkout session");
    return;
  }

  const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
  
  // Get subscription details if this was a subscription checkout
  if (session.mode === 'subscription' && session.subscription) {
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
    logStep("Subscription checkout completed", { subscriptionId, customerId });
    
    // Get the subscription to determine the tier
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionChange({ ...event, data: { object: subscription } }, supabase, stripe);
  }
}

async function handleSubscriptionChange(event: Stripe.Event, supabase: any, stripe: Stripe) {
  const subscription = event.data.object as Stripe.Subscription;
  logStep("Processing subscription change", { 
    subscriptionId: subscription.id, 
    status: subscription.status,
    customerId: subscription.customer 
  });

  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  
  // Get customer email
  const customer = await stripe.customers.retrieve(customerId);
  
  if (!customer || customer.deleted || !customer.email) {
    logStep("Customer not found or missing email", { customerId });
    return;
  }

  // Determine subscription tier based on test price IDs
  let subscriptionTier = "free";
  if (subscription.items.data.length > 0) {
    const priceId = subscription.items.data[0].price.id;
    logStep("Processing price ID", { priceId });
    
    // Test price IDs mapping
    if (priceId === "price_1RVMj6Ft7oRBKHCK2GDGVwii") {
      subscriptionTier = "starter";
    } else if (priceId === "price_1RVMjMFt7oRBKHCKCAkHfofU") {
      subscriptionTier = "pro";
    } else {
      // Fallback based on amount
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      if (amount <= 1099) {
        subscriptionTier = "starter";
      } else {
        subscriptionTier = "pro";
      }
    }
  }

  const isActive = subscription.status === 'active';
  const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

  logStep("Updating subscription in database", {
    email: customer.email,
    tier: subscriptionTier,
    active: isActive,
    endDate: subscriptionEnd
  });

  // Find user by email first
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  let userId = null;
  
  if (!authError && authUsers?.users) {
    const matchingUser = authUsers.users.find(user => user.email === customer.email);
    if (matchingUser) {
      userId = matchingUser.id;
      logStep("Found matching auth user", { userId, email: customer.email });
    }
  }

  if (!userId) {
    logStep("No matching user found for email", { email: customer.email });
    return;
  }

  // Update the profiles table by user ID with the correct tier
  const updateData = {
    subscription_tier: isActive ? subscriptionTier : "free",
    subscription_started_at: isActive ? new Date().toISOString() : null,
  };
  
  logStep("Updating profile with data", { userId, updateData });

  const { error: profileError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);

  if (profileError) {
    logStep("Error updating profiles table", { error: profileError });
    throw new Error(`Failed to update profiles: ${profileError.message}`);
  } else {
    logStep("Successfully updated profile");
  }

  // Log the subscription change for audit purposes
  const { error: logError } = await supabase
    .from('api_usage_logs')
    .insert({
      user_id: userId,
      api_type: 'subscription_webhook',
      tokens_used: 0,
      function_name: `subscription_${event.type}`,
      metadata: {
        stripe_customer_id: customerId,
        subscription_id: subscription.id,
        subscription_tier: subscriptionTier,
        subscription_status: subscription.status
      }
    });

  if (logError) {
    logStep("Error logging subscription change", { error: logError });
    // Don't throw here as this is not critical
  }

  logStep("Subscription update completed successfully");
}

async function handleSubscriptionDeleted(event: Stripe.Event, supabase: any, stripe: Stripe) {
  const subscription = event.data.object as Stripe.Subscription;
  logStep("Processing subscription deletion", { subscriptionId: subscription.id });

  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  
  // Get customer email
  const customer = await stripe.customers.retrieve(customerId);
  
  if (!customer || customer.deleted || !customer.email) {
    logStep("Customer not found or missing email", { customerId });
    return;
  }

  logStep("Setting subscription to free tier", { email: customer.email });

  // Find user by email
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  let userId = null;
  if (!authError && authUsers?.users) {
    const matchingUser = authUsers.users.find(user => user.email === customer.email);
    if (matchingUser) {
      userId = matchingUser.id;
    }
  }

  if (!userId) {
    logStep("No matching user found for deletion", { email: customer.email });
    return;
  }

  // Revert to free tier
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: "free",
      subscription_started_at: null,
    })
    .eq('id', userId);

  if (error) {
    logStep("Error updating profiles for deleted subscription", { error });
    throw new Error(`Failed to update profiles: ${error.message}`);
  }

  logStep("Subscription deletion processed successfully");
}

async function handlePaymentSucceeded(event: Stripe.Event, supabase: any) {
  const invoice = event.data.object as Stripe.Invoice;
  logStep("Processing successful payment", { invoiceId: invoice.id, customerId: invoice.customer });

  // Log successful payment for audit purposes
  const { error } = await supabase
    .from('api_usage_logs')
    .insert({
      user_id: null,
      api_type: 'payment_webhook',
      tokens_used: 0,
      function_name: 'payment_succeeded',
      metadata: {
        stripe_customer_id: invoice.customer,
        invoice_id: invoice.id,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency
      }
    });

  if (error) {
    logStep("Error logging payment success", { error });
  }

  logStep("Payment success processed");
}

async function handlePaymentFailed(event: Stripe.Event, supabase: any) {
  const invoice = event.data.object as Stripe.Invoice;
  logStep("Processing failed payment", { invoiceId: invoice.id, customerId: invoice.customer });

  // Log failed payment for audit purposes
  const { error } = await supabase
    .from('api_usage_logs')
    .insert({
      user_id: null,
      api_type: 'payment_webhook',
      tokens_used: 0,
      function_name: 'payment_failed',
      metadata: {
        stripe_customer_id: invoice.customer,
        invoice_id: invoice.id,
        amount_due: invoice.amount_due,
        currency: invoice.currency,
        failure_reason: invoice.last_finalization_error?.message || 'Unknown'
      }
    });

  if (error) {
    logStep("Error logging payment failure", { error });
  }

  logStep("Payment failure processed");
}
