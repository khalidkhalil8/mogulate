
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Type definitions
interface Competitor {
  id: string;
  name: string;
  website: string;
  description: string;
  isAiGenerated: boolean;
}

interface RequestBody {
  idea: string;
}

interface CompetitorDiscoveryResponse {
  competitors: Competitor[];
  success: boolean;
  error?: string;
}

// Helper function to extract competitor information from Perplexity response
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
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { idea } = await req.json() as RequestBody;
    
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

    // Get Perplexity API key from environment variable
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing API key',
          competitors: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
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
      return new Response(
        JSON.stringify({
          success: false,
          error: `API Error: ${response.status}`,
          competitors: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const data = await response.json();
    const competitorsText = data.choices[0].message.content;
    const competitors = extractCompetitors(competitorsText);

    return new Response(
      JSON.stringify({
        success: true,
        competitors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        competitors: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
