
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface UpdateSubscriptionRequest {
  userId: string;
  newTier: string;
}

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

    // Parse request body
    const requestData: UpdateSubscriptionRequest = await req.json();
    const { userId, newTier } = requestData;
    
    if (!userId || !newTier) {
      console.error('Missing required fields in request');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: userId and newTier',
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    console.log(`Updating subscription for user ${userId} to ${newTier}`);

    // Update the profile with new subscription tier only
    // DO NOT update subscription_started_at to maintain consistent billing cycles
    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: newTier,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating subscription:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    // Log the successful update to the database for audit purposes
    const { error: logError } = await supabase
      .from('api_usage_logs')
      .insert({
        user_id: userId,
        api_type: 'subscription',
        tokens_used: 0,
        function_name: 'update_subscription',
      });

    if (logError) {
      console.error('Error logging subscription update:', logError);
      // Continue anyway as this is not critical
    }

    console.log(`Successfully updated subscription for user ${userId} to ${newTier} without resetting billing cycle`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Subscription updated to ${newTier}`,
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
