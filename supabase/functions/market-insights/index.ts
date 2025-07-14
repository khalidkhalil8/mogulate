
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

interface Competitor {
  id: string;
  name: string;
  website: string;
  description: string;
  isAiGenerated: boolean;
}

interface MarketGapWithScore {
  gap: string;
  positioningSuggestion: string;
  score: number;
  rationale: string;
}

interface MarketGapAnalysis {
  marketGaps: MarketGapWithScore[];
}

interface MarketInsightsResponse {
  success: boolean;
  competitors?: Competitor[];
  analysis: MarketGapAnalysis | null;
  error?: string;
}

// Log API usage to the database
async function logApiUsage(apiType: string, tokensUsed: number, functionName: string, userId?: string) {
  console.log(`Logging ${apiType} API usage: ${tokensUsed} tokens for function ${functionName}`);
  
  try {
    const { error } = await supabase
      .from('api_usage_logs')
      .insert({
        api_type: apiType,
        tokens_used: tokensUsed,
        function_name: functionName,
        user_id: userId || null
      });
    
    if (error) {
      console.error('Error logging API usage to database:', error);
    } else {
      console.log('Successfully logged API usage to database');
    }
  } catch (err) {
    console.error('Exception when logging API usage:', err);
  }
}

// Helper function to extract competitor information from Perplexity response
const extractCompetitors = (text: string): Competitor[] => {
  console.log("Raw Perplexity response:", text);
  
  const competitors: Competitor[] = [];
  
  // Split by double newlines to separate competitors
  const entries = text.split(/\n\n+/);
  
  for (const entry of entries) {
    const competitor: Partial<Competitor> = {
      id: `ai-${crypto.randomUUID().substring(0, 8)}`,
      isAiGenerated: true
    };
    
    // Parse lines to extract name, website, and description
    const lines = entry.split('\n');
    for (const line of lines) {
      const nameLine = line.match(/Name:\s*(.*)/i);
      const websiteLine = line.match(/Website:\s*(.*)/i);
      const descriptionLine = line.match(/(?:Description|Details):\s*(.*)/i);
      
      if (nameLine && nameLine[1]) competitor.name = nameLine[1].trim();
      if (websiteLine && websiteLine[1]) competitor.website = websiteLine[1].trim();
      if (descriptionLine && descriptionLine[1]) competitor.description = descriptionLine[1].trim();
    }
    
    // Only add if we have all required fields
    if (competitor.name && competitor.website) {
      // Ensure description exists (even if empty)
      if (!competitor.description) competitor.description = "";
      competitors.push(competitor as Competitor);
    }
  }

  console.log(`Extracted ${competitors.length} competitors from Perplexity response`);
  return competitors;
};

async function discoverCompetitors(idea: string): Promise<{ competitors: Competitor[], error?: string }> {
  console.log('Starting competitor discovery for idea:', idea.substring(0, 100) + '...');
  
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  if (!PERPLEXITY_API_KEY) {
    console.error("Missing Perplexity API key - check Supabase secrets");
    return { competitors: [], error: 'Missing Perplexity API key configuration' };
  }
  
  const prompt = `You are a research assistant that provides accurate information about business competitors. Return EXACTLY 5 real companies that would be direct competitors to the idea. For each competitor, include company name, website URL, and a brief description (without using any markdown formatting or special characters like asterisks). Format the information clearly as "Name: [Company Name]", "Website: [URL]", "Description: [Description]" for each competitor. Do not use asterisks, bullets, or markdown formatting in your response. Do not use generic descriptions like "Competitor in the space" - always provide specific details about what each competitor offers. The idea is: "${idea}"`;

  console.log("Making request to Perplexity API...");
  
  // First attempt with detailed logging
  let response;
  try {
    response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
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

    console.log(`Perplexity API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error (${response.status}):`, errorText);
      
      // Retry logic if first attempt fails
      console.log('Retrying Perplexity request after 500ms...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
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
        const retryErrorText = await response.text();
        console.error('Both Perplexity API attempts failed:', retryErrorText);
        return { competitors: [], error: `Perplexity API Error: ${response.status} - ${retryErrorText}` };
      }
    }

    const data = await response.json();
    console.log('Perplexity API response received successfully');
    
    // Log token usage
    const totalTokens = data.usage?.total_tokens || 0;
    console.log(`Perplexity tokens used: ${totalTokens}`);
    
    await logApiUsage('perplexity', totalTokens, 'market_insights');
    
    const competitorsText = data.choices[0].message.content;
    const competitors = extractCompetitors(competitorsText);
    
    return { competitors };
  } catch (error) {
    console.error('Exception during Perplexity API call:', error);
    return { competitors: [], error: `Network error calling Perplexity API: ${error.message}` };
  }
}

async function analyzeMarketGaps(idea: string, competitors: Competitor[]): Promise<{ analysis: MarketGapAnalysis | null, error?: string }> {
  console.log('Starting market gap analysis...');
  
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.error('Missing OpenAI API key - check Supabase secrets');
    return { analysis: null, error: 'Missing OpenAI API key configuration' };
  }

  const formattedCompetitors = competitors.map((comp) => `${comp.name} (${comp.website}): ${comp.description || 'No description'}`).join('\n');

  const prompt = `You are a business strategist and market analyst.\n\nA user is considering the following idea: "${idea}"\n\nThese are the main competitors: \n${formattedCompetitors}\n\nStep 1: Identify EXACTLY 3 unaddressed market gaps. Each gap should highlight a specific pain point or need that is currently underserved.\n\nStep 2: For each market gap, recommend 1 unique positioning suggestion that aligns specifically with that gap.\n\nStep 3: Score each market gap from 1-10 based on these 4 criteria: (1) market potential, (2) competitive whitespace, (3) ease of building a solution, and (4) alignment with the core idea. Include a short rationale for each score.\n\nReturn only valid JSON with the following format:\n{\n  "marketGaps": [\n    {\n      "gap": "...",\n      "positioningSuggestion": "...",\n      "score": 8,\n      "rationale": "..."\n    },\n    ... 2 more\n  ]\n}`;

  console.log('Making OpenAI API request...');

  try {
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

    console.log(`OpenAI API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);
      return { analysis: null, error: `OpenAI API Error (${response.status}): ${errorText}` };
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      return { analysis: null, error: 'Invalid response from OpenAI API' };
    }

    const content = data.choices[0].message.content;
    if (!content) {
      console.error('Empty content from OpenAI');
      return { analysis: null, error: 'Empty response from OpenAI API' };
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
        
        return { analysis: null, error: 'Failed to parse AI response as JSON. Please try again.' };
      }
    }

    // Validate parsed structure
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.marketGaps)) {
      console.error('Invalid parsed structure:', parsed);
      return { analysis: null, error: 'Invalid response structure from AI' };
    }

    // Validate market gaps structure
    for (let i = 0; i < parsed.marketGaps.length; i++) {
      const gap = parsed.marketGaps[i];
      if (!gap.gap || !gap.positioningSuggestion || typeof gap.score !== 'number' || !gap.rationale) {
        console.error(`Invalid market gap structure at index ${i}:`, gap);
        return { analysis: null, error: `Invalid market gap data structure` };
      }
    }

    console.log('Successfully parsed and validated OpenAI response');

    // Log token usage
    const totalTokens = data.usage?.total_tokens || 0;
    if (totalTokens > 0) {
      await logApiUsage('openai', totalTokens, 'market_insights');
      console.log('Successfully logged OpenAI token usage:', totalTokens);
    }

    return { analysis: parsed };
  } catch (error) {
    console.error('Exception during OpenAI API call:', error);
    return { analysis: null, error: `Network error calling OpenAI API: ${error.message}` };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('=== Market Insights Function Started ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  try {
    const requestData = await req.json();
    const { idea, competitors: providedCompetitors } = requestData;

    console.log('Request data received:', { 
      ideaLength: idea?.length || 0, 
      hasCompetitors: !!providedCompetitors,
      competitorsCount: providedCompetitors?.length || 0
    });

    // Validate idea
    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
      console.error('Invalid or missing idea in request');
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or missing idea - please provide a valid project description',
        analysis: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    let competitors: Competitor[] = [];
    let shouldReturnCompetitors = false;

    // Competitor discovery if not provided
    if (!providedCompetitors || !Array.isArray(providedCompetitors) || providedCompetitors.length === 0) {
      console.log('No competitors provided, performing discovery');
      shouldReturnCompetitors = true;
      
      const discoveryResult = await discoverCompetitors(idea);
      if (discoveryResult.error) {
        console.error('Competitor discovery failed:', discoveryResult.error);
        return new Response(JSON.stringify({
          success: false,
          error: discoveryResult.error,
          analysis: null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
      
      competitors = discoveryResult.competitors;
      console.log(`Discovered ${competitors.length} competitors`);
    } else {
      // Validate provided competitors structure
      for (let i = 0; i < providedCompetitors.length; i++) {
        const comp = providedCompetitors[i];
        if (!comp || typeof comp !== 'object' || !comp.name || !comp.website) {
          console.error(`Invalid competitor structure at index ${i}:`, comp);
          return new Response(JSON.stringify({
            success: false,
            error: `Invalid competitor data at position ${i + 1} - missing name or website`,
            analysis: null
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }
      }
      competitors = providedCompetitors;
      console.log(`Using ${competitors.length} provided competitors`);
    }

    // Market gap analysis
    console.log('Starting market gap analysis...');
    const analysisResult = await analyzeMarketGaps(idea, competitors);
    if (analysisResult.error) {
      console.error('Market gap analysis failed:', analysisResult.error);
      return new Response(JSON.stringify({
        success: false,
        error: analysisResult.error,
        analysis: null,
        ...(shouldReturnCompetitors && { competitors })
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    console.log('=== Market Insights Function Completed Successfully ===');

    const response: MarketInsightsResponse = {
      success: true,
      analysis: analysisResult.analysis,
      ...(shouldReturnCompetitors && { competitors })
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('=== Unexpected Error in Market Insights Function ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: `Unexpected server error: ${error.message}`,
      analysis: null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
