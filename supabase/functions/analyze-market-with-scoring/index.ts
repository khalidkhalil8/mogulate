
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { idea, competitors } = requestData;

    if (!idea || !competitors || competitors.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing idea or competitors data',
        analysis: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing OpenAI API key'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    const formattedCompetitors = competitors.map((comp) => `${comp.name} (${comp.website}): ${comp.description || ''}`).join('\n');

    const prompt = `You are a business strategist and market analyst.\n\nA user is considering the following idea: \"${idea}\"\n\nThese are the main competitors: \n${formattedCompetitors}\n\nStep 1: Identify EXACTLY 3 unaddressed market gaps. Each gap should highlight a specific pain point or need that is currently underserved.\n\nStep 2: For each market gap, recommend 1 unique positioning suggestion that aligns specifically with that gap.\n\nStep 3: Score each market gap from 1-10 based on these 4 criteria: (1) market potential, (2) competitive whitespace, (3) ease of building a solution, and (4) alignment with the core idea. Include a short rationale for each score.\n\nReturn only valid JSON with the following format:\n{\n  \"marketGaps\": [\n    {\n      \"gap\": \"...\",\n      \"positioningSuggestion\": \"...\",\n      \"score\": 8,\n      \"rationale\": \"...\"\n    },\n    ... 2 more\n  ]\n}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: 'You are a business analyst.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({
        success: false,
        error: `OpenAI Error: ${errorText}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Log token usage
    const totalTokens = data.usage?.total_tokens || 0;
    await supabase.from('api_usage_logs').insert({
      api_type: 'openai',
      tokens_used: totalTokens,
      function_name: 'analyze-market-with-scoring'
    });

    return new Response(JSON.stringify({
      success: true,
      analysis: parsed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
