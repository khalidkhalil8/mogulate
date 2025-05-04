
import { toast } from "@/components/ui/sonner";
import { createClient } from '@supabase/supabase-js';
import type { Competitor, MarketGapAnalysis, CompetitorDiscoveryResponse, MarketGapAnalysisResponse } from "./types";

// Initialize Supabase client - the URL and anon key are automatically injected by Vite
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

export const findCompetitors = async (idea: string): Promise<Competitor[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('discover-competitors', {
      body: { idea }
    });

    if (error) {
      console.error('Error calling discover-competitors function:', error);
      toast.error('Failed to fetch competitors. Please try again.');
      return [];
    }

    const response = data as CompetitorDiscoveryResponse;
    
    if (!response.success) {
      console.error('Error from discover-competitors function:', response.error);
      toast.error('Failed to fetch competitors. Please try again.');
      return [];
    }

    return response.competitors;
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
    const { data, error } = await supabase.functions.invoke('analyze-market-gaps', {
      body: { 
        idea,
        competitors
      }
    });

    if (error) {
      console.error('Error calling analyze-market-gaps function:', error);
      toast.error('Failed to generate market gap analysis. Please try again.');
      return null;
    }

    const response = data as MarketGapAnalysisResponse;
    
    if (!response.success) {
      console.error('Error from analyze-market-gaps function:', response.error);
      toast.error('Failed to generate market gap analysis. Please try again.');
      return null;
    }

    return response.analysis;
  } catch (error) {
    console.error('Error generating market gap analysis:', error);
    toast.error('Failed to generate market gap analysis. Please try again.');
    return null;
  }
};
