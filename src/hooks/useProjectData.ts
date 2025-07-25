
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
      console.log('useProjectData: Loading existing project data:', existingProject);
      
      let marketGapScoringAnalysis: MarketGapScoringAnalysis | undefined;
      if (existingProject.market_analysis) {
        try {
          marketGapScoringAnalysis = existingProject.market_analysis as MarketGapScoringAnalysis;
          console.log('useProjectData: Loaded market analysis:', marketGapScoringAnalysis);
        } catch (error) {
          console.error('Error parsing market analysis:', error);
        }
      }

      // Set project title
      setProjectTitle(existingProject.title || '');

      // Set all idea data from the existing project
      setIdeaData(prev => ({
        idea: existingProject.idea || '',
        competitors: Array.isArray(existingProject.competitors) ? existingProject.competitors : [],
        marketGaps: '', // This field is legacy, not used in new format
        features: Array.isArray(existingProject.features) ? existingProject.features : [],
        validationPlan: Array.isArray(existingProject.validation_plan) ? existingProject.validation_plan : [],
        marketGapAnalysis: undefined, // Legacy field
        marketGapScoringAnalysis,
      }));

      // Reset selected gap index when loading existing project
      setSelectedGapIndex(undefined);

      console.log('useProjectData: Fully loaded project data');
    } else {
      console.log('useProjectData: No existing project found, using empty state');
    }
  }, [existingProject]);

  // Debug logging
  useEffect(() => {
    console.log('useProjectData: Current state:', {
      projectId,
      projectTitle,
      selectedGapIndex,
      ideaDataSummary: {
        idea: ideaData.idea ? 'present' : 'empty',
        competitors: ideaData.competitors.length,
        features: ideaData.features.length,
        validationPlan: ideaData.validationPlan.length,
        hasMarketAnalysis: !!ideaData.marketGapScoringAnalysis,
      }
    });
  }, [projectId, projectTitle, selectedGapIndex, ideaData]);

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
