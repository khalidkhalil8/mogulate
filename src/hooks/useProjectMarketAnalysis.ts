
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import type { MarketGapAnalysis } from '@/lib/types';

export const useProjectMarketAnalysis = (projectId: string) => {
  const [marketAnalysis, setMarketAnalysis] = useState<MarketGapAnalysis | null>(null);
  const [marketGaps, setMarketGaps] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchMarketAnalysis = async () => {
    if (!user?.id || !projectId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('market_analysis')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching market analysis:', error);
        toast.error('Failed to load market analysis');
        return;
      }

      // Safely parse the JSON data with proper type checking
      let analysisData: MarketGapAnalysis | null = null;
      if (data?.market_analysis && typeof data.market_analysis === 'object' && !Array.isArray(data.market_analysis)) {
        const rawAnalysis = data.market_analysis as Record<string, any>;
        if (rawAnalysis.marketGaps && rawAnalysis.positioningSuggestions) {
          analysisData = {
            marketGaps: Array.isArray(rawAnalysis.marketGaps) ? rawAnalysis.marketGaps : [],
            positioningSuggestions: Array.isArray(rawAnalysis.positioningSuggestions) ? rawAnalysis.positioningSuggestions : []
          };
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

  const updateMarketAnalysis = async (analysis: MarketGapAnalysis | null) => {
    if (!user?.id) {
      toast.error('You must be logged in to update market analysis');
      return false;
    }

    try {
      const updateData: any = {
        market_analysis: analysis as any,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating market analysis:', error);
        toast.error('Failed to update market analysis');
        return false;
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
