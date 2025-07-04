
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
    console.log('Starting analyze-market-with-scoring function');
    
    const requestData = await req.json();
    const { idea, competitors } = requestData;

    console.log('Request data:', { idea: idea?.substring(0, 100), competitorsCount: competitors?.length });

    // Enhanced input validation
    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
      console.error('Invalid or missing idea');
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or missing idea',
        analysis: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
      console.error('Invalid or missing competitors array');
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or missing competitors data',
        analysis: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Validate competitor structure
    for (let i = 0; i < competitors.length; i++) {
      const comp = competitors[i];
      if (!comp || typeof comp !== 'object' || !comp.name || !comp.website) {
        console.error(`Invalid competitor structure at index ${i}:`, comp);
        return new Response(JSON.stringify({
          success: false,
          error: `Invalid competitor data at position ${i + 1}`,
          analysis: null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('Missing OpenAI API key');
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing OpenAI API key configuration'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    const formattedCompetitors = competitors.map((comp) => `${comp.name} (${comp.website}): ${comp.description || 'No description'}`).join('\n');

    console.log('Formatted competitors:', formattedCompetitors.substring(0, 200));

    const prompt = `You are a business strategist and market analyst.\n\nA user is considering the following idea: "${idea}"\n\nThese are the main competitors: \n${formattedCompetitors}\n\nStep 1: Identify EXACTLY 3 unaddressed market gaps. Each gap should highlight a specific pain point or need that is currently underserved.\n\nStep 2: For each market gap, recommend 1 unique positioning suggestion that aligns specifically with that gap.\n\nStep 3: Score each market gap from 1-10 based on these 4 criteria: (1) market potential, (2) competitive whitespace, (3) ease of building a solution, and (4) alignment with the core idea. Include a short rationale for each score.\n\nReturn only valid JSON with the following format:\n{\n  "marketGaps": [\n    {\n      "gap": "...",\n      "positioningSuggestion": "...",\n      "score": 8,\n      "rationale": "..."\n    },\n    ... 2 more\n  ]\n}`;

    console.log('Making OpenAI API request');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          { role: 'system', content: 'You are a business analyst who always responds with valid JSON.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return new Response(JSON.stringify({
        success: false,
        error: `OpenAI API Error (${response.status}): ${errorText}`,
        analysis: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    const data = await response.json();
    console.log('OpenAI response data structure:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasUsage: !!data.usage,
      totalTokens: data.usage?.total_tokens
    });

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid response from OpenAI API',
        analysis: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    const content = data.choices[0].message.content;
    console.log('Raw OpenAI content:', content?.substring(0, 200));

    if (!content) {
      console.error('Empty content from OpenAI');
      return new Response(JSON.stringify({
        success: false,
        error: 'Empty response from OpenAI API',
        analysis: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    // Enhanced JSON parsing with multiple attempts
    let parsed;
    try {
      // First attempt: direct parsing
      parsed = JSON.parse(content);
    } catch (firstError) {
      console.log('First JSON parse failed, trying to extract JSON from content');
      
      try {
        // Second attempt: extract JSON from content that might have extra text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
          console.log('Successfully extracted JSON from content');
        } else {
          throw new Error('No JSON found in content');
        }
      } catch (secondError) {
        console.error('JSON parsing failed completely:', {
          firstError: firstError.message,
          secondError: secondError.message,
          content: content
        });
        
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to parse AI response as JSON. Please try again.',
          analysis: null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    }

    // Validate parsed structure
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.marketGaps)) {
      console.error('Invalid parsed structure:', parsed);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid response structure from AI',
        analysis: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    // Validate market gaps structure
    if (parsed.marketGaps.length !== 3) {
      console.error('Expected 3 market gaps, got:', parsed.marketGaps.length);
    }

    for (let i = 0; i < parsed.marketGaps.length; i++) {
      const gap = parsed.marketGaps[i];
      if (!gap.gap || !gap.positioningSuggestion || typeof gap.score !== 'number' || !gap.rationale) {
        console.error(`Invalid market gap structure at index ${i}:`, gap);
        return new Response(JSON.stringify({
          success: false,
          error: `Invalid market gap data structure`,
          analysis: null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    }

    console.log('Successfully parsed and validated response');

    // Log token usage (don't let this fail the whole function)
    try {
      const totalTokens = data.usage?.total_tokens || 0;
      if (totalTokens > 0) {
        await supabase.from('api_usage_logs').insert({
          api_type: 'openai',
          tokens_used: totalTokens,
          function_name: 'analyze-market-with-scoring'
        });
        console.log('Successfully logged token usage:', totalTokens);
      }
    } catch (loggingError) {
      console.error('Failed to log token usage (continuing anyway):', loggingError);
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: parsed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in analyze-market-with-scoring function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: `Unexpected error: ${error.message}`,
      analysis: null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
