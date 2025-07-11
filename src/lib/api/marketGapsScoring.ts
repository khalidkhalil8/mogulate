
import { supabase } from '@/integrations/supabase/client';
import type { Competitor } from '@/lib/types';

export interface MarketGapWithScore {
  gap: string;
  positioningSuggestion: string;
  score: number;
  rationale: string;
}

export interface MarketGapScoringAnalysis {
  marketGaps: MarketGapWithScore[];
}

export interface MarketGapScoringResponse {
  success: boolean;
  analysis: MarketGapScoringAnalysis | null;
  error?: string;
}

export const analyzeMarketGapsWithScoring = async (
  idea: string,
  competitors: Competitor[]
): Promise<MarketGapScoringResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('market-insights', {
      body: {
        idea,
        competitors
      }
    });

    if (error) {
      console.error('Error calling market-insights function:', error);
      return {
        success: false,
        error: error.message,
        analysis: null
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Unknown error occurred',
        analysis: null
      };
    }

    return {
      success: true,
      analysis: data.analysis
    };
  } catch (error) {
    console.error('Error in analyzeMarketGapsWithScoring:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      analysis: null
    };
  }
};
