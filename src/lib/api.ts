
import { toast } from "@/components/ui/sonner";
import type { Competitor, MarketGapAnalysis } from "./types";

// These would normally be stored in Supabase
const PERPLEXITY_API_KEY = "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";
const OPENAI_API_KEY = "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";

// Helper function to extract competitor information from Perplexity response
const extractCompetitors = (text: string): Competitor[] => {
  // Split text by double newlines to identify different competitors
  const sections = text.split('\n\n');
  const competitors: Competitor[] = [];
  
  for (const section of sections) {
    const lines = section.split('\n');
    const competitor: Partial<Competitor> = {
      id: `ai-${Math.random().toString(36).substring(2, 9)}`,
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

export const findCompetitors = async (idea: string): Promise<Competitor[]> => {
  try {
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
      const errorData = await response.json();
      console.error('Error from Perplexity API:', errorData);
      toast.error('Failed to fetch competitors. Please try again.');
      return [];
    }

    const data = await response.json();
    const competitorsText = data.choices[0].message.content;
    return extractCompetitors(competitorsText);
  } catch (error) {
    console.error('Error fetching competitors:', error);
    toast.error('Failed to fetch competitors. Please try again.');
    return [];
  }
};

export const generateMarketGapAnalysis = async (
  idea: string, 
  competitors: Competitor[]
): Promise<MarketGapAnalysis | null> => {
  try {
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
      const errorData = await response.json();
      console.error('Error from OpenAI API:', errorData);
      toast.error('Failed to generate market gap analysis. Please try again.');
      return null;
    }

    const data = await response.json();
    const analysisJson = JSON.parse(data.choices[0].message.content);
    
    return analysisJson as MarketGapAnalysis;
  } catch (error) {
    console.error('Error generating market gap analysis:', error);
    toast.error('Failed to generate market gap analysis. Please try again.');
    return null;
  }
};
