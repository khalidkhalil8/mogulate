import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import type { IdeaData } from '@/lib/types';
import type { MarketGapScoringAnalysis } from '@/lib/api/marketGapsScoring';

export const useProjectData = () => {
  const [searchParams] = useSearchParams();
  const { projects } = useProjects();

  const projectId = searchParams.get('projectId');
  const existingProject = projects.find(p => p.id === projectId);

  const [projectTitle, setProjectTitle] = useState('');
  const [selectedGapIndex, setSelectedGapIndex] = useState<number | undefined>();
  const [ideaData, setIdeaData] = useState<IdeaData>({
    idea: '',
    competitors: [],
    marketGaps: '',
    features: [],
    validationPlan: [],
    marketGapAnalysis: undefined,
    marketGapScoringAnalysis: undefined,
  });

  useEffect(() => {
    if (existingProject) {
      let marketGapScoringAnalysis: MarketGapScoringAnalysis | undefined;
      if (existingProject.market_analysis) {
        try {
          marketGapScoringAnalysis = existingProject.market_analysis as MarketGapScoringAnalysis;
        } catch (error) {
          console.error('Error parsing market analysis:', error);
        }
      }

      setProjectTitle(existingProject.title || '');
      setIdeaData(prev => ({
        idea: existingProject.idea || '',
        competitors: existingProject.competitors || [],
        marketGaps: '',
        features: existingProject.features || [],
        validationPlan: existingProject.validation_plan || [],
        marketGapAnalysis: undefined,
        marketGapScoringAnalysis,
      }));
      setSelectedGapIndex(undefined);
    }
  }, [existingProject]);

  return {
    projectId,
    existingProject,
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
  };
};
