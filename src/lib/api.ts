
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Competitor, MarketGapAnalysis, CompetitorDiscoveryResponse, MarketGapAnalysisResponse } from "./types";

export const findCompetitors = async (idea: string): Promise<Competitor[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('idea-analysis/discover-competitors', {
      body: { idea },
      method: 'POST'
    });

    if (error) {
      console.error('Error calling discover-competitors function:', error);
      toast('Failed to fetch competitors. Please try again.', {
        description: error.message,
        variant: "destructive"
      });
      return [];
    }

    const response = data as CompetitorDiscoveryResponse;
    
    if (!response.success) {
      console.error('Error from discover-competitors function:', response.error);
      toast('Failed to fetch competitors. Please try again.', {
        description: response.error,
        variant: "destructive"
      });
      return [];
    }

    return response.competitors;
  } catch (error) {
    console.error('Error fetching competitors:', error);
    toast('Failed to fetch competitors. Please try again.', {
      description: error instanceof Error ? error.message : String(error),
      variant: "destructive"
    });
    return [];
  }
};

export const generateMarketGapAnalysis = async (
  idea: string, 
  competitors: Competitor[]
): Promise<MarketGapAnalysis | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('idea-analysis/analyze-market-gaps', {
      body: { 
        idea,
        competitors
      },
      method: 'POST'
    });

    if (error) {
      console.error('Error calling analyze-market-gaps function:', error);
      toast('Failed to generate market gap analysis. Please try again.', {
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    const response = data as MarketGapAnalysisResponse;
    
    if (!response.success) {
      console.error('Error from analyze-market-gaps function:', response.error);
      toast('Failed to generate market gap analysis. Please try again.', {
        description: response.error,
        variant: "destructive"
      });
      return null;
    }

    return response.analysis;
  } catch (error) {
    console.error('Error generating market gap analysis:', error);
    toast('Failed to generate market gap analysis. Please try again.', {
      description: error instanceof Error ? error.message : String(error),
      variant: "destructive"
    });
    return null;
  }
};
