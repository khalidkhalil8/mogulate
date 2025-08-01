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
        // Clear existing competitors from normalized table
        await supabase
          .from('project_competitors')
          .delete()
          .eq('project_id', projectId);

        // Insert new competitors into normalized table
        const competitorsToInsert = result.competitors.map(comp => ({
          project_id: projectId,
          name: comp.name,
          website: comp.website || '',
          description: comp.description || '',
          is_ai_generated: comp.isAiGenerated || true,
        }));

        const { error } = await supabase
          .from('project_competitors')
          .insert(competitorsToInsert);

        if (error) {
          console.error('Error inserting new competitors:', error);
          toast.error('Failed to save new competitors');
          return false;
        }

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
        // Clear existing market gaps from normalized table
        await supabase
          .from('project_market_gaps')
          .delete()
          .eq('project_id', projectId);

        // Insert new market gaps into normalized table
        if (result.analysis.marketGaps && Array.isArray(result.analysis.marketGaps)) {
          const marketGapsToInsert = result.analysis.marketGaps.map(gap => ({
            project_id: projectId,
            gap_text: gap.gap,
            positioning_suggestion: gap.positioningSuggestion || '',
            score: Number(gap.score) || 0,
            rationale: gap.rationale || '',
            is_selected: false,
          }));

          const { error } = await supabase
            .from('project_market_gaps')
            .insert(marketGapsToInsert);

          if (error) {
            console.error('Error inserting new market gaps:', error);
            toast.error('Failed to save new market analysis');
            return false;
          }
        }

        // Reset selected gap in projects table
        await updateProject(projectId, { 
          selected_gap_index: null
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
        // Clear existing features from normalized table
        await supabase
          .from('project_features')
          .delete()
          .eq('project_id', projectId);

        // Insert new features into normalized table
        const featuresToInsert = data.features.map(feature => ({
          project_id: projectId,
          title: feature.title,
          description: feature.description || '',
          status: feature.status || 'planned',
          priority: feature.priority || 'medium',
          is_ai_generated: true,
        }));

        const { error: insertError } = await supabase
          .from('project_features')
          .insert(featuresToInsert);

        if (insertError) {
          console.error('Error inserting new features:', insertError);
          toast.error('Failed to save new features');
          return false;
        }

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
        // Clear existing validation steps from normalized table
        await supabase
          .from('project_validation_steps')
          .delete()
          .eq('project_id', projectId);

        // Insert new validation steps into normalized table
        const validationStepsToInsert = result.validationPlan.map(step => ({
          project_id: projectId,
          title: step.title,
          goal: step.goal || '',
          method: step.method || '',
          priority: step.priority || 'medium',
          is_done: step.isDone || false,
          is_ai_generated: true,
        }));

        const { error: insertError } = await supabase
          .from('project_validation_steps')
          .insert(validationStepsToInsert);

        if (insertError) {
          console.error('Error inserting new validation steps:', insertError);
          toast.error('Failed to save new validation plan');
          return false;
        }

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