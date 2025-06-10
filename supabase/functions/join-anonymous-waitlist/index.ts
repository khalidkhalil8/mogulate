
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
    // Create Supabase client using service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { email } = await req.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Valid email is required' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Please enter a valid email address' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if email is already on the waitlist
    const { data: existingEntry, error: checkError } = await supabase
      .from('feature_waitlists')
      .select('id')
      .eq('email', trimmedEmail)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing waitlist entry:', checkError);
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

    // If email is already in the waitlist, return success
    if (existingEntry) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'This email is already on the waitlist',
          alreadyJoined: true
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Insert the new waitlist entry (anonymous signup, no user_id)
    const { data, error } = await supabase
      .from('feature_waitlists')
      .insert({
        email: trimmedEmail,
        user_id: null, // Anonymous signup
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
        message: "✅ You've joined the waitlist! We'll notify you when these features launch.",
        data
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (err) {
    // Handle any unexpected errors
    console.error('Unexpected error in join-anonymous-waitlist function:', err);
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
