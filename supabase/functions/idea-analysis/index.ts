
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

// Request types
interface DiscoverCompetitorsRequest {
  idea: string;
}

interface MarketGapRequest {
  idea: string;
  competitors: Competitor[];
}

// Response types
interface CompetitorDiscoveryResponse {
  competitors: Competitor[];
  success: boolean;
  error?: string;
}

interface MarketGapAnalysisResponse {
  analysis: MarketGapAnalysis;
  success: boolean;
  error?: string;
}

// Helper function to extract competitor information from AI response
const extractCompetitors = (text: string): Competitor[] => {
  // Split text by double newlines to identify different competitors
  const sections = text.split('\n\n');
  const competitors: Competitor[] = [];
  
  for (const section of sections) {
    const lines = section.split('\n');
    const competitor: Partial<Competitor> = {
      id: `ai-${crypto.randomUUID().substring(0, 8)}`,
      isAiGenerated: true
    };
    
    for (const line of lines) {
      if (line.startsWith('Name:')) {
        competitor.name = line.replace('Name:', '').trim();
      } else if (line.startsWith('Website:')) {
        competitor.website = line.replace('Website:', '').trim();
      } else if (line.startsWith('Description:')) {
        competitor.description = line.replace('Description:', '').trim();
      }
    }
    
    // Only add if we have all required fields
    if (competitor.name && competitor.website && competitor.description) {
      competitors.push(competitor as Competitor);
    }
  }

  return competitors;
}

async function discoverCompetitors(idea: string): Promise<CompetitorDiscoveryResponse> {
  try {
    // Get Perplexity API key from environment variable
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      throw new Error('Missing Perplexity API key');
    }
    
    const prompt = `You are a research assistant that provides accurate information about business competitors. Return only factual information about real companies that would be direct competitors to the idea. For each competitor, include company name, website URL, and a brief description (without using any markdown formatting or special characters like asterisks). Format the information clearly as "Name: [Company Name]", "Website: [URL]", "Description: [Description]" for each competitor. Do not use asterisks, bullets, or markdown formatting in your response. Do not use generic descriptions like "Competitor in the space" - always provide specific details about what each competitor offers. The idea is: "${idea}"`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful research assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error from Perplexity API:', errorData);
      throw new Error(`Perplexity API Error: ${response.status}`);
    }

    const data = await response.json();
    const competitorsText = data.choices[0].message.content;
    const competitors = extractCompetitors(competitorsText);

    return {
      success: true,
      competitors
    };
  } catch (error) {
    console.error('Error in discoverCompetitors:', error);
    return {
      success: false,
      error: error.message,
      competitors: []
    };
  }
}

async function analyzeMarketGaps(idea: string, competitors: Competitor[]): Promise<MarketGapAnalysisResponse> {
  try {
    // Get OpenAI API key from environment variable
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key');
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
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    const analysisJson = JSON.parse(data.choices[0].message.content);
    
    return {
      success: true,
      analysis: analysisJson
    };
  } catch (error) {
    console.error('Error in analyzeMarketGaps:', error);
    return {
      success: false,
      error: error.message,
      analysis: { marketGaps: [], positioningSuggestions: [] }
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const body = await req.json();

    // Route handling based on path
    if (path === 'discover-competitors') {
      const { idea } = body as DiscoverCompetitorsRequest;
      
      if (!idea) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No idea provided',
            competitors: []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const result = await discoverCompetitors(idea);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: result.success ? 200 : 500 }
      );

    } else if (path === 'analyze-market-gaps') {
      const { idea, competitors } = body as MarketGapRequest;
      
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

      const result = await analyzeMarketGaps(idea, competitors);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: result.success ? 200 : 500 }
      );

    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unknown endpoint'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
