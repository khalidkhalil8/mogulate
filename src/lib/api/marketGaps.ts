
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Competitor, MarketGapAnalysis, MarketGapAnalysisResponse } from "../types";

export const generateMarketGapAnalysis = async (
  idea: string, 
  competitors: Competitor[]
): Promise<MarketGapAnalysis | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('idea-analysis', {
      body: { 
        idea,
        competitors,
        action: 'analyze-market-gaps'
      },
      method: 'POST'
    });

    if (error) {
      console.error('Error calling analyze-market-gaps function:', error);
      toast.error('Failed to generate market gap analysis. Please try again.', {
        description: error.message
      });
      return null;
    }

    const response = data as MarketGapAnalysisResponse;
    
    if (!response.success) {
      console.error('Error from analyze-market-gaps function:', response.error);
      
      // Improved handling for subscription limit errors
      if (response.error?.includes('limit reached') || response.error?.includes('Monthly usage limit')) {
        toast.error(`Monthly usage limit reached for your ${response.tier || 'current'} plan`, {
          description: 'You can still manually input your market gaps and continue. Consider upgrading your subscription for more AI-generated analyses.',
          duration: 6000
        });
      } else {
        toast.error('Failed to generate market gap analysis. Please try again.', {
          description: response.error || 'An unexpected error occurred'
        });
      }
      return null;
    }

    return response.analysis;
  } catch (error) {
    console.error('Error generating market gap analysis:', error);
    toast.error('Failed to generate market gap analysis. Please try again.', {
      description: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
};
