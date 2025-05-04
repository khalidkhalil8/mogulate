
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Type definitions
interface Competitor {
  id: string;
  name: string;
  website: string;
  description: string;
  isAiGenerated?: boolean;
}

interface MarketGapAnalysis {
  marketGaps: string[];
  positioningSuggestions: string[];
}

interface RequestBody {
  idea: string;
  competitors: Competitor[];
}

interface MarketGapAnalysisResponse {
  analysis: MarketGapAnalysis;
  success: boolean;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { idea, competitors } = await req.json() as RequestBody;
    
    if (!idea || !competitors || competitors.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No idea or competitors provided',
          analysis: { marketGaps: [], positioningSuggestions: [] }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get OpenAI API key from environment variable
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing API key',
          analysis: { marketGaps: [], positioningSuggestions: [] }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Create a string description of all competitors
    const competitorDescriptions = competitors.map(comp => 
      `${comp.name} (${comp.website}): ${comp.description}`
    ).join('\n');

    const prompt = `You are analyzing a business idea: "${idea}". Here are the direct competitors in this market space: ${competitorDescriptions}. Based on these competitors and the business idea, please identify 3 potential gaps in the market not addressed by these competitors, suggest a unique angle or approach for this business idea, and recommend 3 specific features or positioning elements that would help differentiate this idea. Format your response as a valid JSON object with this exact structure: { "marketGaps": [ "First gap description - make this a specific opportunity not addressed by competitors", "Second gap description - another specific opportunity", "Third gap description - another specific opportunity" ], "positioningSuggestions": [ "First positioning suggestion with specific feature or approach recommendation", "Second positioning suggestion with specific feature or approach recommendation", "Third positioning suggestion with specific feature or approach recommendation" ] }. Make each description a separate paragraph with enough detail to be actionable (max 50 words each). Do not include any text, markdown, or explanations outside the JSON object.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using a suitable model for this task
        messages: [
          {
            role: 'system',
            content: 'You are a business analyst specialized in market analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error from OpenAI API:', errorData);
      return new Response(
        JSON.stringify({
          success: false,
          error: `API Error: ${response.status}`,
          analysis: { marketGaps: [], positioningSuggestions: [] }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const data = await response.json();
    const analysisJson = JSON.parse(data.choices[0].message.content);
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisJson
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        analysis: { marketGaps: [], positioningSuggestions: [] }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
