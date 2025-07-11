
import { supabase } from "@/integrations/supabase/client";
import type { Competitor, MarketGapAnalysisResponse, MarketGapAnalysis } from "../types";
import { toast } from "@/components/ui/sonner";

export async function analyzeMarketGaps(idea: string, competitors: Competitor[]): Promise<{ 
  analysis: MarketGapAnalysis | null, 
  tier?: string, 
  remainingUsage?: number,
  nextReset?: string 
}> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    if (!token) {
      toast.error("Authentication required", {
        description: "Please sign in to use this feature.",
      });
      return { analysis: null };
    }

    const { data, error } = await supabase.functions.invoke('market-insights', {
      body: {
        idea,
        competitors
      }
    });

    if (error) {
      console.error('Error calling market-insights function:', error);
      toast.error("Failed to analyze market gaps", {
        description: error.message || "Unknown error occurred",
      });
      return { analysis: null };
    }

    if (!data.success) {
      toast.error("Failed to analyze market gaps", {
        description: data.error || "Unknown error occurred",
      });
      return { analysis: null };
    }

    // Convert the scored analysis to the legacy format for backward compatibility
    const legacyAnalysis: MarketGapAnalysis = {
      marketGaps: data.analysis?.marketGaps?.map((gap: any) => gap.gap) || [],
      positioningSuggestions: data.analysis?.marketGaps?.map((gap: any) => gap.positioningSuggestion) || []
    };

    return { 
      analysis: legacyAnalysis
    };
  } catch (error) {
    console.error("Error analyzing market gaps:", error);
    toast.error("Failed to analyze market gaps", {
      description: "An unexpected error occurred",
    });
    return { analysis: null };
  }
}
