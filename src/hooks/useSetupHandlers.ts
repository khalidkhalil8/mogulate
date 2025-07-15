import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { toast } from '@/components/ui/sonner';
import type { IdeaData, Competitor, MarketGapAnalysis, Feature } from '@/lib/types';
import type { MarketGapScoringAnalysis } from '@/lib/api/marketGapsScoring';

interface UseSetupHandlersParams {
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  selectedGapIndex?: number;
  setSelectedGapIndex: (index: number | undefined) => void;
  ideaData: IdeaData;
  setIdeaData: React.Dispatch<React.SetStateAction<IdeaData>>;
  projectId: string | null;
}

export const useSetupHandlers = ({
  projectTitle,
  setProjectTitle,
  selectedGapIndex,
  setSelectedGapIndex,
  ideaData,
  setIdeaData,
  projectId,
}: UseSetupHandlersParams) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProject, updateProject } = useProjects();

  const handleIdeaSubmit = async (idea: string, title: string) => {
    try {
      let currentProjectId = projectId;

      if (!currentProjectId) {
        const newProject = await createProject(title, idea);
        if (!newProject) throw new Error('Project creation failed');
        currentProjectId = newProject.id;
      } else {
        await updateProject(currentProjectId, {
          title,
          idea,
        });
      }

      setProjectTitle(title);
      setIdeaData(prev => ({ ...prev, idea }));

      navigate(`/competitors?projectId=${currentProjectId}`);
    } catch (error) {
      console.error('handleIdeaSubmit error:', error);
      toast.error('Failed to save idea');
    }
  };

  const handleCompetitorsSubmit = async (competitors: Competitor[]) => {
    try {
      setIdeaData(prev => ({ ...prev, competitors }));

      if (projectId) {
        await updateProject(projectId, { competitors });
      }

      navigate(`/market-gaps?projectId=${projectId}`);
    } catch (error) {
      console.error('handleCompetitorsSubmit error:', error);
      toast.error('Failed to save competitors');
    }
  };

  const handleMarketGapsSubmit = async (
    marketGaps: string,
    analysis: MarketGapAnalysis | undefined,
    scoringAnalysis?: MarketGapScoringAnalysis,
    selectedIndex?: number
  ) => {
    setIdeaData(prev => ({
      ...prev,
      marketGaps,
      marketGapAnalysis: analysis,
      marketGapScoringAnalysis: scoringAnalysis,
    }));

    if (selectedIndex !== undefined) {
      setSelectedGapIndex(selectedIndex);
    }

    if (projectId && scoringAnalysis && user?.id) {
      try {
        await updateProject(projectId, {
          market_analysis: scoringAnalysis as any,
        });
      } catch (error) {
        console.error('Error saving market analysis:', error);
      }
    }

    navigate(`/features?projectId=${projectId}`);
  };

  const handleFeaturesSubmit = async (features: Feature[]) => {
    setIdeaData(prev => ({ ...prev, features }));

    if (projectId) {
      await updateProject(projectId, { features });
    }

    navigate(`/validation-plan?projectId=${projectId}`);
  };

  const handleValidationPlanSubmit = async (validationPlan: any) => {
    setIdeaData(prev => ({ ...prev, validationPlan }));

    if (projectId) {
      await updateProject(projectId, { validation_plan: validationPlan });
    }

    navigate(`/summary?projectId=${projectId}`);
  };

  const handleSaveProject = async () => {
    if (!user) {
      toast.error('You must be logged in to save a project');
      return;
    }

    try {
      let currentProjectId = projectId;

      if (!currentProjectId) {
        const newProject = await createProject(projectTitle, ideaData.idea);
        if (!newProject) throw new Error('Project creation failed');
        currentProjectId = newProject.id;
      }

      await updateProject(currentProjectId, {
        competitors: ideaData.competitors,
        features: ideaData.features,
        validation_plan: ideaData.validationPlan,
        market_analysis: ideaData.marketGapScoringAnalysis as any,
      });

      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const handleReset = () => {
    setIdeaData({
      idea: '',
      competitors: [],
      marketGaps: '',
      features: [],
      validationPlan: [],
      marketGapScoringAnalysis: undefined,
    });
    setSelectedGapIndex(undefined);
  };

  return {
    handleIdeaSubmit,
    handleCompetitorsSubmit,
    handleMarketGapsSubmit,
    handleFeaturesSubmit,
    handleValidationPlanSubmit,
    handleSaveProject,
    handleReset,
  };
};
