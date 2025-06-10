
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Input validation
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { email } = await req.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Valid email address is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize email (basic sanitization)
    const sanitizedEmail = email.toLowerCase().trim();

    // Create Supabase client with service role for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if email already exists in waitlist
    const { data: existingEntry, error: checkError } = await supabase
      .from('feature_waitlists')
      .select('id')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing entry:', checkError);
      return new Response(
        JSON.stringify({ success: false, error: 'Database error occurred' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If email already exists, return success but indicate it was already joined
    if (existingEntry) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          alreadyJoined: true,
          message: 'Email is already on the waitlist' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Add email to waitlist (anonymous entry - no user_id)
    const { error: insertError } = await supabase
      .from('feature_waitlists')
      .insert({
        email: sanitizedEmail,
        user_id: null // Anonymous entry
      });

    if (insertError) {
      console.error('Error inserting waitlist entry:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to join waitlist' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alreadyJoined: false,
        message: 'Successfully joined the waitlist' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
