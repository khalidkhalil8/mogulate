
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
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authorization header is required',
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 401 
        }
      );
    }

    // Get Supabase client with service role key for admin operations
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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Also create a client with the user's token to verify authentication
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Verify the user's authentication
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication failed',
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 401 
        }
      );
    }

    const userId = user.id;
    console.log('Authenticated user:', userId);

    // Get the user's profile to determine subscription tier
    const { data: profileData, error: profileError } = await supabaseAdmin
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
    // Use the account creation date as the billing cycle anchor for consistency
    const now = new Date();
    const accountCreatedAt = new Date(profileData.created_at);
    
    // Calculate how many months have passed since account creation
    const monthsDiff = (now.getFullYear() - accountCreatedAt.getFullYear()) * 12 + 
                      (now.getMonth() - accountCreatedAt.getMonth());
    
    // Set billing cycle start to the account creation day of the current month
    let billingCycleStart = new Date(accountCreatedAt);
    billingCycleStart.setFullYear(now.getFullYear());
    billingCycleStart.setMonth(accountCreatedAt.getMonth() + monthsDiff);
    
    // If we haven't reached the billing day this month, use last month's billing date
    if (now.getDate() < accountCreatedAt.getDate()) {
      billingCycleStart.setMonth(billingCycleStart.getMonth() - 1);
    }

    console.log('Billing cycle calculation:', {
      accountCreatedAt: profileData.created_at,
      subscriptionStartedAt: profileData.subscription_started_at,
      billingCycleStart: billingCycleStart.toISOString(),
      currentDate: now.toISOString(),
      tier,
      monthsDiff
    });

    // Count API usage since the billing cycle started using admin client
    const { count: used, error: usageError } = await supabaseAdmin
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
      nextReset: nextReset.toISOString().split('T')[0],
      billingCycleMethod: 'account_creation_date'
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
