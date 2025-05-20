
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";

// Setup CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the JWT from the request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing authorization header' 
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get the current user from the JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized or invalid user session' 
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Parse the request body to get the feature_name
    const { feature_name } = await req.json();
    
    if (!feature_name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'feature_name is required' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if the user is already on the waitlist
    const { data: existingEntry, error: checkError } = await supabase
      .from('feature_waitlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('feature_name', feature_name)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking waitlist entry:', checkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error checking waitlist status' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // If user is already in the waitlist, return success
    if (existingEntry) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Already on waitlist',
          alreadyJoined: true
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Insert the new waitlist entry
    const { data, error } = await supabase
      .from('feature_waitlists')
      .insert({
        user_id: user.id,
        feature_name: feature_name,
        // joined_at will use the default now() value from the table definition
      })
      .select();

    if (error) {
      console.error('Error joining waitlist:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to join waitlist' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully joined waitlist',
        data
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (err) {
    // Handle any unexpected errors
    console.error('Unexpected error in joinWaitlist function:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
