
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
    const { data, error } = await supabase.functions.invoke('analyze-market-with-scoring', {
      body: {
        idea,
        competitors
      }
    });

    if (error) {
      console.error('Error calling analyze-market-with-scoring function:', error);
      return {
        success: false,
        error: error.message,
        analysis: null
      };
    }

    return data as MarketGapScoringResponse;
  } catch (error) {
    console.error('Error in analyzeMarketGapsWithScoring:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      analysis: null
    };
  }
};
