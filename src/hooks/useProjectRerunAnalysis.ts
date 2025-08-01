import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useProjectCredits } from '@/hooks/useProjectCredits';
import { fetchCompetitors } from '@/lib/api/competitors';
import { analyzeMarketGapsWithScoring } from '@/lib/api/marketGapsScoring';
import { generateValidationPlan } from '@/lib/api/validationPlan';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import type { Competitor, Feature } from '@/lib/types';

export const useProjectRerunAnalysis = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { updateProject } = useProjects();
  const { useCredit } = useProjectCredits(projectId);

  const rerunCompetitorDiscovery = async (idea: string) => {
    setIsLoading(true);
    try {
      // Use credit first
      const creditUsed = await useCredit('competitor-discovery-rerun');
      if (!creditUsed) {
        toast.error('Unable to use credit. Please check your plan.');
        return false;
      }

      const result = await fetchCompetitors(idea);
      if (result?.competitors) {
        await updateProject(projectId, { 
          competitors: result.competitors 
        });
        toast.success('Competitor discovery completed!');
        return true;
      } else {
        toast.error('Failed to discover competitors');
        return false;
      }
    } catch (error) {
      console.error('Error rerunning competitor discovery:', error);
      toast.error('Failed to rerun competitor discovery');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rerunMarketAnalysis = async (idea: string, competitors: Competitor[]) => {
    setIsLoading(true);
    try {
      // Use credit first
      const creditUsed = await useCredit('market-analysis-rerun');
      if (!creditUsed) {
        toast.error('Unable to use credit. Please check your plan.');
        return false;
      }

      const result = await analyzeMarketGapsWithScoring(idea, competitors);
      if (result?.success && result.analysis) {
        await updateProject(projectId, { 
          market_analysis: result.analysis,
          selected_gap_index: null // Reset selected gap
        });
        toast.success('Market analysis completed!');
        return true;
      } else {
        toast.error('Failed to analyze market gaps');
        return false;
      }
    } catch (error) {
      console.error('Error rerunning market analysis:', error);
      toast.error('Failed to rerun market analysis');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rerunFeatureGeneration = async (idea: string, competitors: Competitor[], positioning?: string) => {
    setIsLoading(true);
    try {
      // Use credit first
      const creditUsed = await useCredit('feature-generation-rerun');
      if (!creditUsed) {
        toast.error('Unable to use credit. Please check your plan.');
        return false;
      }

      // Call the edge function for generating features
      const { data, error } = await supabase.functions.invoke('generate-features', {
        body: {
          project_id: projectId,
          idea,
          competitors,
          positioning
        }
      });

      if (error) {
        console.error('Error calling generate-features function:', error);
        toast.error('Failed to generate features');
        return false;
      }

      if (data?.features) {
        await updateProject(projectId, { 
          features: data.features 
        });
        toast.success('Features generated successfully!');
        return true;
      } else {
        toast.error('No features were generated');
        return false;
      }
    } catch (error) {
      console.error('Error rerunning feature generation:', error);
      toast.error('Failed to rerun feature generation');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rerunValidationPlan = async (
    idea: string, 
    positioningSuggestion: string, 
    competitors: Competitor[], 
    features: Feature[]
  ) => {
    setIsLoading(true);
    try {
      // Use credit first
      const creditUsed = await useCredit('validation-plan-rerun');
      if (!creditUsed) {
        toast.error('Unable to use credit. Please check your plan.');
        return false;
      }

      const result = await generateValidationPlan(idea, positioningSuggestion, competitors, features);
      if (result?.success && result.validationPlan) {
        await updateProject(projectId, { 
          validation_plan: result.validationPlan 
        });
        toast.success('Validation plan generated successfully!');
        return true;
      } else {
        toast.error('Failed to generate validation plan');
        return false;
      }
    } catch (error) {
      console.error('Error rerunning validation plan:', error);
      toast.error('Failed to rerun validation plan');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    rerunCompetitorDiscovery,
    rerunMarketAnalysis,
    rerunFeatureGeneration,
    rerunValidationPlan,
  };
};