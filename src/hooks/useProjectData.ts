
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import type { IdeaData } from '@/lib/types';

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
    validationPlan: '',
    marketGapAnalysis: undefined,
    marketGapScoringAnalysis: undefined,
  });

  useEffect(() => {
    if (existingProject) {
      setIdeaData({
        idea: existingProject.idea || '',
        competitors: existingProject.competitors || [],
        marketGaps: existingProject.market_gaps || '',
        features: existingProject.features || [],
        validationPlan: existingProject.validation_plan || '',
        marketGapAnalysis: existingProject.market_gap_analysis,
        marketGapScoringAnalysis: undefined, // Not stored in DB yet
      });
      setProjectTitle(existingProject.title || '');
      setSelectedGapIndex(existingProject.selected_gap_index ?? undefined);
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
