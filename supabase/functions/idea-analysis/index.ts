
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Type definitions
interface Competitor {
  id: string;
  name: string;
  website: string;
  description: string;
  isAiGenerated: boolean;
}

interface MarketGapAnalysis {
  marketGaps: string[];
  positioningSuggestions: string[];
}

// Request and response interfaces
interface CompetitorDiscoveryRequest {
  idea: string;
  action: string;
}

interface MarketGapRequest {
  idea: string;
  competitors: Competitor[];
  action: string;
}

interface CompetitorDiscoveryResponse {
  competitors: Competitor[];
  success: boolean;
  error?: string;
  tier?: string;
  remainingUsage?: number;
}

interface MarketGapAnalysisResponse {
  analysis: MarketGapAnalysis;
  success: boolean;
  error?: string;
  tier?: string;
  remainingUsage?: number;
}

// Subscription tiers and limits
interface TierLimits {
  usageLimit: number;
  competitorCount: number;
  showCompetitorDescription: boolean;
  marketGapCount: number;
  positioningSuggestionCount: number;
}

const tierLimits: Record<string, TierLimits> = {
  free: {
    usageLimit: 5,
    competitorCount: 3,
    showCompetitorDescription: false,
    marketGapCount: 1,
    positioningSuggestionCount: 0
  },
  starter: {
    usageLimit: 20,
    competitorCount: 3,
    showCompetitorDescription: true,
    marketGapCount: 3,
    positioningSuggestionCount: 1
  },
  pro: {
    usageLimit: 100,
    competitorCount: 5,
    showCompetitorDescription: true,
    marketGapCount: 3,
    positioningSuggestionCount: 3
  }
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client for logging
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Check user's subscription tier and remaining usage
async function checkUserAccess(userId: string, functionName: string): Promise<{
  canAccess: boolean;
  tier: string;
  tierLimits: TierLimits;
  remainingUsage: number;
  error?: string;
  nextReset?: string;
}> {
  try {
    // Get user's subscription tier and subscription start date
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_started_at')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { 
        canAccess: false, 
        tier: 'free', 
        tierLimits: tierLimits['free'],
        remainingUsage: 0,
        error: 'Failed to retrieve user profile'
      };
    }

    const tier = profileData.subscription_tier || 'free';
    const limits = tierLimits[tier] || tierLimits['free'];
    let subscriptionStartedAt = new Date(profileData.subscription_started_at);
    const now = new Date();
    
    // Check if 30 days have passed since subscription started
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const daysSinceSubscriptionStarted = now.getTime() - subscriptionStartedAt.getTime();
    
    // If 30 days have passed, reset the subscription_started_at date
    if (daysSinceSubscriptionStarted >= thirtyDaysInMs) {
      console.log(`Resetting subscription cycle for user ${userId} as 30 days have passed`);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription_started_at: now.toISOString() })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error resetting subscription cycle:', updateError);
      } else {
        // Update the subscription start date for the current check
        subscriptionStartedAt = now;
      }
    }

    // Get usage since subscription started
    const { count, error: usageError } = await supabase
      .from('api_usage_logs')
      .select('*', { count: 'exact', head: false })
      .eq('user_id', userId)
      .gte('timestamp', subscriptionStartedAt.toISOString());

    if (usageError) {
      console.error('Error checking API usage:', usageError);
      return { 
        canAccess: false, 
        tier,
        tierLimits: limits,
        remainingUsage: 0,
        error: 'Failed to check API usage'
      };
    }

    const usageCount = count || 0;
    const remainingUsage = Math.max(0, limits.usageLimit - usageCount);
    const canAccess = remainingUsage > 0;
    
    // Calculate next reset date (30 days from subscription_started_at)
    const nextResetDate = new Date(subscriptionStartedAt.getTime() + thirtyDaysInMs);
    const nextResetFormatted = nextResetDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log(`User ${userId} (${tier} tier) has used ${usageCount}/${limits.usageLimit} API calls this cycle. Remaining: ${remainingUsage}`);
    console.log(`Next reset date: ${nextResetFormatted}`);

    return {
      canAccess,
      tier,
      tierLimits: limits,
      remainingUsage,
      nextReset: nextResetFormatted,
      error: canAccess ? undefined : `You've reached your monthly limit. Your plan will reset 30 days after your subscription started (${nextResetFormatted}).`
    };
  } catch (err) {
    console.error('Exception when checking user access:', err);
    return { 
      canAccess: false, 
      tier: 'free', 
      tierLimits: tierLimits['free'],
      remainingUsage: 0,
      error: 'Error checking access permissions'
    };
  }
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

serve(async (req) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const requestData = await req.json();
    const action = requestData.action;
    console.log(`Processing action: ${action}`);

    // Extract user ID from authorization header if available
    let userId = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: userData, error } = await supabase.auth.getUser(token);
        if (!error && userData?.user) {
          userId = userData.user.id;
          console.log(`Request from authenticated user: ${userId}`);
        }
      } catch (e) {
        console.error('Error extracting user ID from token:', e);
      }
    }

    // Check if user is authenticated
    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication required',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check user access and remaining usage
    const userAccess = await checkUserAccess(userId, action);
    if (!userAccess.canAccess) {
      return new Response(
        JSON.stringify({
          success: false,
          error: userAccess.error || 'Access denied',
          remainingUsage: userAccess.remainingUsage,
          tier: userAccess.tier,
          nextReset: userAccess.nextReset
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    if (action === 'discover-competitors') {
      return await handleDiscoverCompetitors(requestData, userId, userAccess.tier, userAccess.tierLimits);
    } else if (action === 'analyze-market-gaps') {
      return await handleMarketGapAnalysis(requestData, userId, userAccess.tier, userAccess.tierLimits);
    } else {
      console.error(`Invalid action specified: ${action}`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid action specified',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function handleDiscoverCompetitors(
  requestData: CompetitorDiscoveryRequest,
  userId: string,
  tier: string,
  tierLimits: TierLimits
): Promise<Response> {
  const { idea } = requestData;
  console.log(`Processing competitor discovery for idea: ${idea} (${tier} tier)`);
  
  if (!idea) {
    console.error("No idea provided");
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
    console.error("Missing Perplexity API key");
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Missing API key',
        competitors: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
  
  // Adjust the prompt based on tier limits
  const count = tierLimits.competitorCount;
  const prompt = `You are a research assistant that provides accurate information about business competitors. Return EXACTLY ${count} real companies that would be direct competitors to the idea. For each competitor, include company name, website URL${tierLimits.showCompetitorDescription ? ", and a brief description" : ""} (without using any markdown formatting or special characters like asterisks). Format the information clearly as "Name: [Company Name]", "Website: [URL]"${tierLimits.showCompetitorDescription ? ', "Description: [Description]"' : ""} for each competitor. Do not use asterisks, bullets, or markdown formatting in your response. Do not use generic descriptions like "Competitor in the space" - always provide specific details about what each competitor offers. The idea is: "${idea}"`;

  console.log("Sending request to Perplexity API");
  const startTime = Date.now();
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
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
  console.log(`Perplexity API response received in ${Date.now() - startTime}ms`);
  
  // Log token usage
  const promptTokens = data.usage?.prompt_tokens || 0;
  const completionTokens = data.usage?.completion_tokens || 0;
  const totalTokens = data.usage?.total_tokens || 0;
  
  console.log(`Tokens used - Prompt: ${promptTokens}, Completion: ${completionTokens}, Total: ${totalTokens}`);
  
  // Log API usage to the database
  await logApiUsage(
    'perplexity',
    totalTokens,
    'competitor_discovery',
    userId
  );
  
  const competitorsText = data.choices[0].message.content;
  let competitors = extractCompetitors(competitorsText);
  
  // Apply tier limitations
  if (competitors.length > tierLimits.competitorCount) {
    console.log(`Trimming competitor list from ${competitors.length} to ${tierLimits.competitorCount}`);
    competitors = competitors.slice(0, tierLimits.competitorCount);
  } else if (competitors.length < tierLimits.competitorCount) {
    console.warn(`Only ${competitors.length} valid competitors found, expected ${tierLimits.competitorCount}`);
    
    // Fill remaining slots with placeholder competitors if needed
    const missingCount = tierLimits.competitorCount - competitors.length;
    for (let i = 0; i < missingCount; i++) {
      competitors.push({
        id: `ai-${crypto.randomUUID().substring(0, 8)}`,
        name: `Generic Competitor ${i + 1}`,
        website: `https://example${i + 1}.com`,
        description: tierLimits.showCompetitorDescription ? `A competitor in the ${idea} space. More research needed for detailed information.` : "",
        isAiGenerated: true
      });
    }
  }

  // Remove descriptions for free tier
  if (!tierLimits.showCompetitorDescription) {
    competitors = competitors.map(comp => ({
      ...comp,
      description: ""
    }));
  }

  return new Response(
    JSON.stringify({
      success: true,
      competitors,
      tier,
      remainingUsage: tierLimits.usageLimit - 1 // Approximate remaining usage
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleMarketGapAnalysis(
  requestData: MarketGapRequest,
  userId: string,
  tier: string,
  tierLimits: TierLimits
): Promise<Response> {
  const { idea, competitors } = requestData;
  console.log(`Processing market gap analysis for idea: ${idea} with ${competitors.length} competitors (${tier} tier)`);
  
  if (!idea || !competitors || competitors.length === 0) {
    console.error("Missing idea or competitors data");
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
    console.error("Missing OpenAI API key");
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Missing OpenAI API key',
        analysis: { marketGaps: [], positioningSuggestions: [] }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
  
  // Create a string description of all competitors
  const competitorDescriptions = competitors.map(comp => 
    `${comp.name} (${comp.website})${comp.description ? ': ' + comp.description : ''}`
  ).join('\n');

  // Adjust the prompt based on tier limits
  const marketGapCount = tierLimits.marketGapCount;
  const positioningSuggestionCount = tierLimits.positioningSuggestionCount;
  
  const prompt = `You are analyzing a business idea: "${idea}". Here are the direct competitors in this market space: ${competitorDescriptions}. Based on these competitors and the business idea, please identify EXACTLY ${marketGapCount} potential gap${marketGapCount === 1 ? '' : 's'} in the market not addressed by these competitors${positioningSuggestionCount > 0 ? `, and recommend EXACTLY ${positioningSuggestionCount} specific feature${positioningSuggestionCount === 1 ? '' : 's'} or positioning element${positioningSuggestionCount === 1 ? '' : 's'} that would help differentiate this idea` : ''}. Format your response as a valid JSON object with this exact structure: { "marketGaps": [ "First gap description - make this a specific opportunity not addressed by competitors"${marketGapCount > 1 ? ', "Second gap description - another specific opportunity"' : ''}${marketGapCount > 2 ? ', "Third gap description - another specific opportunity"' : ''} ]${positioningSuggestionCount > 0 ? ', "positioningSuggestions": [ "First positioning suggestion with specific feature or approach recommendation"' + (positioningSuggestionCount > 1 ? ', "Second positioning suggestion with specific feature or approach recommendation"' : '') + (positioningSuggestionCount > 2 ? ', "Third positioning suggestion with specific feature or approach recommendation"' : '') + ' ]' : ''} }. Make each description a separate paragraph with enough detail to be actionable (max 50 words each). Do not include any text, markdown, or explanations outside the JSON object.`;

  console.log("Sending request to OpenAI API");
  const startTime = Date.now();
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
        error: `OpenAI API Error: ${response.status}`,
        analysis: { marketGaps: [], positioningSuggestions: [] }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  const data = await response.json();
  console.log(`OpenAI API response received in ${Date.now() - startTime}ms`);
  
  // Log token usage
  const promptTokens = data.usage?.prompt_tokens || 0;
  const completionTokens = data.usage?.completion_tokens || 0;
  const totalTokens = data.usage?.total_tokens || 0;
  
  console.log(`Tokens used - Prompt: ${promptTokens}, Completion: ${completionTokens}, Total: ${totalTokens}`);
  
  // Log API usage to the database
  await logApiUsage(
    'openai',
    totalTokens,
    'market_gap_analysis',
    userId
  );
  
  const analysisJson = JSON.parse(data.choices[0].message.content);
  
  // Apply tier limitations
  let marketGaps = analysisJson.marketGaps || [];
  let positioningSuggestions = analysisJson.positioningSuggestions || [];
  
  if (marketGaps.length > tierLimits.marketGapCount) {
    console.log(`Trimming market gaps from ${marketGaps.length} to ${tierLimits.marketGapCount}`);
    marketGaps = marketGaps.slice(0, tierLimits.marketGapCount);
  } else if (marketGaps.length < tierLimits.marketGapCount) {
    console.warn(`Only ${marketGaps.length} market gaps found, expected ${tierLimits.marketGapCount}`);
    
    // Fill remaining market gaps if needed
    const missingCount = tierLimits.marketGapCount - marketGaps.length;
    for (let i = 0; i < missingCount; i++) {
      marketGaps.push(`Consider exploring additional market segments or features not covered by competitors to fill gap ${i+1} in the current market landscape.`);
    }
  }
  
  if (tierLimits.positioningSuggestionCount === 0) {
    positioningSuggestions = [];
  } else if (positioningSuggestions.length > tierLimits.positioningSuggestionCount) {
    console.log(`Trimming positioning suggestions from ${positioningSuggestions.length} to ${tierLimits.positioningSuggestionCount}`);
    positioningSuggestions = positioningSuggestions.slice(0, tierLimits.positioningSuggestionCount);
  } else if (positioningSuggestions.length < tierLimits.positioningSuggestionCount) {
    console.warn(`Only ${positioningSuggestions.length} positioning suggestions found, expected ${tierLimits.positioningSuggestionCount}`);
    
    // Fill remaining positioning suggestions if needed
    const missingCount = tierLimits.positioningSuggestionCount - positioningSuggestions.length;
    for (let i = 0; i < missingCount; i++) {
      positioningSuggestions.push(`Differentiate your offering by focusing on unique value proposition ${i+1} that addresses a specific customer pain point not covered by competitors.`);
    }
  }
  
  const analysis = {
    marketGaps,
    positioningSuggestions
  };
  
  return new Response(
    JSON.stringify({
      success: true,
      analysis,
      tier,
      remainingUsage: tierLimits.usageLimit - 1 // Approximate remaining usage
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
