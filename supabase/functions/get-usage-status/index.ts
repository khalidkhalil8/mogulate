
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables for Supabase client');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server configuration error',
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user ID from the request
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User ID is required',
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // Get the user's profile to determine subscription tier
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_started_at, created_at')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return new Response(
        JSON.stringify({
          success: false,
          error: profileError.message,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    const tier = profileData.subscription_tier;

    // Define usage limits based on subscription tier
    const tierLimits: Record<string, number> = {
      free: 5,
      starter: 20,
      pro: 100
    };

    const limit = tierLimits[tier] || 0;

    // Calculate the start of the current billing cycle
    // Use subscription_started_at if available, otherwise use a simple monthly cycle
    const now = new Date();
    let billingCycleStart: Date;

    if (profileData.subscription_started_at) {
      // Use subscription start date as the billing cycle reference
      const subscriptionStart = new Date(profileData.subscription_started_at);
      
      // Calculate how many months have passed since subscription started
      const monthsDiff = (now.getFullYear() - subscriptionStart.getFullYear()) * 12 + 
                        (now.getMonth() - subscriptionStart.getMonth());
      
      // Set billing cycle start to the subscription day of the current month
      billingCycleStart = new Date(subscriptionStart);
      billingCycleStart.setFullYear(now.getFullYear());
      billingCycleStart.setMonth(subscriptionStart.getMonth() + monthsDiff);
      
      // If we haven't reached the billing day this month, use last month's billing date
      if (now.getDate() < subscriptionStart.getDate()) {
        billingCycleStart.setMonth(billingCycleStart.getMonth() - 1);
      }
    } else {
      // Fallback: Use start of current month
      billingCycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    console.log('Billing cycle calculation:', {
      subscriptionStartedAt: profileData.subscription_started_at,
      billingCycleStart: billingCycleStart.toISOString(),
      currentDate: now.toISOString(),
      tier
    });

    // Count API usage since the billing cycle started
    const { count: used, error: usageError } = await supabase
      .from("api_usage_logs")
      .select("*", { count: 'exact' })
      .eq("user_id", userId)
      .gte("timestamp", billingCycleStart.toISOString());
      
    if (usageError) {
      console.error("Error fetching API usage:", usageError);
      return new Response(
        JSON.stringify({
          success: false,
          error: usageError.message,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    // Calculate next reset date (next month's billing date)
    const nextReset = new Date(billingCycleStart);
    nextReset.setMonth(nextReset.getMonth() + 1);

    // Calculate remaining usage
    const usedCount = used || 0;
    const remaining = Math.max(0, limit - usedCount);

    console.log('Usage calculation result:', {
      usedCount,
      limit,
      remaining,
      nextReset: nextReset.toISOString().split('T')[0]
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          tier,
          used: usedCount,
          limit,
          remaining,
          nextReset: nextReset.toISOString().split('T')[0] // Format as YYYY-MM-DD
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
