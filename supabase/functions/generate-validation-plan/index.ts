
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { project_id, idea, positioningSuggestion, features } = requestBody;
    
    let projectIdea, projectPositioning, projectFeatures;

    if (project_id) {
      // Existing project flow - fetch from database
      const { data: project, error } = await supabase
        .from('projects')
        .select('id, idea, market_analysis, project_features')
        .eq('id', project_id)
        .single();

      if (error || !project) {
        return new Response(JSON.stringify({ success: false, error: 'Project not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        });
      }

      projectIdea = project.idea;
      projectFeatures = project.project_features;
      const selected = project.market_analysis?.selected;
      projectPositioning = selected?.positioningSuggestion;
    } else {
      // Initial setup flow - use provided data
      if (!idea || !positioningSuggestion) {
        return new Response(JSON.stringify({ success: false, error: 'Missing required data: idea and positioningSuggestion are required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }

      projectIdea = idea;
      projectPositioning = positioningSuggestion;
      projectFeatures = features || [];
    }

    if (!projectPositioning) {
      return new Response(JSON.stringify({ success: false, error: 'Missing positioning suggestion' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'Missing OpenAI API key' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    const featuresText = projectFeatures && projectFeatures.length > 0 
      ? projectFeatures.map((f: any) => `${f.title}: ${f.description}`).join(', ')
      : 'No specific features defined';

    const prompt = `
You are a startup advisor helping a founder validate a new product idea. 

Product Idea: "${projectIdea}"
Market Positioning: "${projectPositioning}"
Planned Features: ${featuresText}

Generate EXACTLY 3 validation steps that align with this positioning and features. For each step, return:
- "title": A brief title (4–6 words)
- "description": The purpose of the step (1–2 sentences)
- "tool": What tool, method, or resource would be used to carry out the step
- "priority": One of "High", "Medium", or "Low"

Focus on practical, actionable validation methods that test the core assumptions of this positioning.

Respond in this exact JSON format:
{
  "validationSteps": [
    {
      "title": "",
      "description": "",
      "tool": "",
      "priority": ""
    }
  ]
}
Only return the JSON, no commentary or markdown.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a product validation expert who helps startups test their assumptions efficiently.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      return new Response(JSON.stringify({ success: false, error: "OpenAI API error" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    const data = await response.json();
    const responseContent = data.choices?.[0]?.message?.content;
    
    if (!responseContent) {
      return new Response(JSON.stringify({ success: false, error: "No response from OpenAI" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    const parsedResponse = JSON.parse(responseContent);
    const validationSteps = parsedResponse.validationSteps || [];

    // Convert to the format expected by the UI
    const formattedSteps = validationSteps.map((step: any, index: number) => ({
      id: (index + 1).toString(),
      title: step.title,
      description: step.description,
      tool: step.tool,
      priority: step.priority
    }));

    // Save to database only if we have a project_id
    if (project_id) {
      const validationPlan = formattedSteps.map((step: any, index: number) => 
        `Step ${index + 1}: ${step.title}\nGoal/Description: ${step.description}\nTool/Method: ${step.tool}\nPriority: ${step.priority}`
      ).join('\n\n');

      const { error: updateError } = await supabase
        .from('projects')
        .update({ project_validation_steps: validationPlan })
        .eq('id', project_id);

      if (updateError) {
        console.error('Error updating project:', updateError);
        return new Response(JSON.stringify({ success: false, error: 'Failed to save validation plan' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    }

    return new Response(JSON.stringify({ success: true, validationSteps: formattedSteps }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
