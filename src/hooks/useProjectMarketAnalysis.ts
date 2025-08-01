
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import type { MarketGapAnalysis } from '@/lib/types';
import type { MarketGapScoringAnalysis } from '@/lib/api/marketGapsScoring';

export const useProjectMarketAnalysis = (projectId: string) => {
  const [marketAnalysis, setMarketAnalysis] = useState<MarketGapAnalysis | MarketGapScoringAnalysis | null>(null);
  const [marketGaps, setMarketGaps] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchMarketAnalysis = async () => {
    if (!user?.id || !projectId) {
      setIsLoading(false);
      return;
    }

    try {
      // First try to get from normalized table
      const { data: normalizedData, error: normalizedError } = await supabase
        .from('project_market_gaps')
        .select('*')
        .eq('project_id', projectId)
        .order('score', { ascending: false });

      if (normalizedError) {
        console.error('Error fetching market gaps from normalized table:', normalizedError);
        toast.error('Failed to load market analysis');
        return;
      }

      // Convert normalized data to MarketGapScoringAnalysis format
      if (normalizedData && normalizedData.length > 0) {
        const marketGaps = normalizedData.map(gap => ({
          gap: gap.gap_text,
          positioningSuggestion: gap.positioning_suggestion || '',
          score: Number(gap.score) || 0,
          rationale: gap.rationale || '',
        }));

        const analysisData: MarketGapScoringAnalysis = {
          marketGaps
        };
        
        setMarketAnalysis(analysisData);
        setMarketGaps(''); // No longer stored separately
        return;
      }

      // Fallback: Check if data exists in JSONB format (legacy)
      const { data: legacyData, error: legacyError } = await supabase
        .from('projects')
        .select('market_analysis')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (legacyError) {
        console.error('Error fetching legacy market analysis:', legacyError);
        setMarketAnalysis(null);
        return;
      }

      // Handle both new and legacy market analysis formats
      let analysisData: MarketGapAnalysis | MarketGapScoringAnalysis | null = null;
      if (legacyData?.market_analysis && typeof legacyData.market_analysis === 'object' && !Array.isArray(legacyData.market_analysis)) {
        const rawAnalysis = legacyData.market_analysis as Record<string, any>;
        
        // Check if it's the new scoring format
        if (rawAnalysis.marketGaps && Array.isArray(rawAnalysis.marketGaps) && 
            rawAnalysis.marketGaps.length > 0 && 
            typeof rawAnalysis.marketGaps[0] === 'object' && 
            'score' in rawAnalysis.marketGaps[0]) {
          // New scoring format
          analysisData = rawAnalysis as MarketGapScoringAnalysis;
        } else if (rawAnalysis.marketGaps && rawAnalysis.positioningSuggestions) {
          // Legacy format
          analysisData = {
            marketGaps: Array.isArray(rawAnalysis.marketGaps) ? rawAnalysis.marketGaps : [],
            positioningSuggestions: Array.isArray(rawAnalysis.positioningSuggestions) ? rawAnalysis.positioningSuggestions : []
          } as MarketGapAnalysis;
        }
      }
      
      setMarketAnalysis(analysisData);
      setMarketGaps(''); // No longer stored separately
    } catch (error) {
      console.error('Error fetching market analysis:', error);
      toast.error('Failed to load market analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMarketAnalysis = async (analysis: MarketGapAnalysis | MarketGapScoringAnalysis | null) => {
    if (!user?.id) {
      toast.error('You must be logged in to update market analysis');
      return false;
    }

    try {
      // Clear existing market gaps first
      await supabase
        .from('project_market_gaps')
        .delete()
        .eq('project_id', projectId);

      // Insert new market gaps if analysis exists
      if (analysis && 'marketGaps' in analysis && Array.isArray(analysis.marketGaps)) {
        const marketGapsToInsert = analysis.marketGaps.map(gap => {
          // Handle both legacy and scoring formats
          if (typeof gap === 'string') {
            // Legacy format - just the gap text
            return {
              project_id: projectId,
              gap_text: gap,
              positioning_suggestion: '',
              score: 0,
              rationale: '',
              is_selected: false,
            };
          } else {
            // Scoring format - with score, rationale, etc.
            return {
              project_id: projectId,
              gap_text: gap.gap || '',
              positioning_suggestion: gap.positioningSuggestion || '',
              score: Number(gap.score) || 0,
              rationale: gap.rationale || '',
              is_selected: false,
            };
          }
        });

        const { error: insertError } = await supabase
          .from('project_market_gaps')
          .insert(marketGapsToInsert);

        if (insertError) {
          console.error('Error inserting market gaps:', insertError);
          toast.error('Failed to update market analysis');
          return false;
        }
      }

      setMarketAnalysis(analysis);
      toast.success('Market analysis updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating market analysis:', error);
      toast.error('Failed to update market analysis');
      return false;
    }
  };

  useEffect(() => {
    fetchMarketAnalysis();
  }, [user?.id, projectId]);

  return {
    marketAnalysis,
    marketGaps,
    isLoading,
    updateMarketAnalysis,
    refetchMarketAnalysis: fetchMarketAnalysis,
  };
};
