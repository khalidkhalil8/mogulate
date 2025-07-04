
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const { project_id } = await req.json();

    if (!project_id) {
      return new Response(JSON.stringify({ success: false, error: 'Missing project_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch project data
    const { data: project, error } = await supabase
      .from('projects')
      .select('id, idea, market_gap_analysis, selected_gap_index')
      .eq('id', project_id)
      .single();

    if (error || !project) {
      console.error('Project fetch error:', error);
      return new Response(JSON.stringify({ success: false, error: 'Project not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const { idea, market_gap_analysis, selected_gap_index } = project;
    
    // Get the selected positioning suggestion
    let positioningSuggestion = '';
    if (market_gap_analysis?.marketGaps && selected_gap_index !== null && selected_gap_index !== undefined) {
      const selectedGap = market_gap_analysis.marketGaps[selected_gap_index];
      if (selectedGap?.positioningSuggestion) {
        positioningSuggestion = selectedGap.positioningSuggestion;
      }
    }

    if (!idea || !positioningSuggestion) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing idea or positioning suggestion. Please complete market analysis first.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('Generating features for idea:', idea);
    console.log('Using positioning:', positioningSuggestion);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a product strategist generating features for a new startup. You must respond with valid JSON only.`,
          },
          {
            role: 'user',
            content: `The startup idea is: "${idea}".
The market positioning they chose is: "${positioningSuggestion}".

Suggest exactly 3 product features the user should build based on the positioning above. 
For each feature, provide:
- A short title (max 50 characters)
- A one-sentence description (max 150 characters)
- A priority label ("High", "Medium", or "Low") based on the feature's potential impact and feasibility.

Respond with this exact JSON structure:
{
  "features": [
    {
      "title": "Feature Name",
      "description": "Brief description of what this feature does.",
      "priority": "High"
    },
    {
      "title": "Another Feature",
      "description": "Brief description of this feature.",
      "priority": "Medium"
    },
    {
      "title": "Third Feature",
      "description": "Brief description of the third feature.",
      "priority": "Low"
    }
  ]
}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI error:', errorData);
      return new Response(JSON.stringify({ success: false, error: 'OpenAI API failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const responseData = await response.json();
    const content = responseData.choices[0].message.content;
    console.log('OpenAI response:', content);
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return new Response(JSON.stringify({ success: false, error: 'Invalid response format' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const features = parsedResponse.features;
    if (!Array.isArray(features) || features.length !== 3) {
      console.error('Invalid features format:', features);
      return new Response(JSON.stringify({ success: false, error: 'Invalid features format' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Add unique IDs and status to features
    const formattedFeatures = features.map((feature, index) => ({
      id: `ai-${Date.now()}-${index}`,
      title: feature.title,
      description: feature.description,
      priority: feature.priority,
      status: 'Planned' as const,
    }));

    // Update project with generated features
    const { error: updateError } = await supabase
      .from('projects')
      .update({ features: formattedFeatures })
      .eq('id', project_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ success: false, error: 'Failed to save features' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Successfully generated and saved features');
    return new Response(JSON.stringify({ success: true, features: formattedFeatures }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Unexpected error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
