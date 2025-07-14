
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
    setIdeaData(prev => ({ ...prev, idea }));
    setProjectTitle(title);
    navigate('/competitors');
  };

  const handleCompetitorsSubmit = async (competitors: Competitor[]) => {
    setIdeaData(prev => ({ ...prev, competitors }));
    navigate('/market-gaps');
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
      marketGapScoringAnalysis: scoringAnalysis 
    }));
    
    if (selectedIndex !== undefined) {
      setSelectedGapIndex(selectedIndex);
    }

    // Save to database immediately if we have projectId and scoringAnalysis
    if (projectId && scoringAnalysis && user?.id) {
      try {
        await updateProject(projectId, {
          market_analysis: scoringAnalysis as any
        });
        console.log('Market analysis saved to database in handleMarketGapsSubmit');
      } catch (error) {
        console.error('Error saving market analysis in handleMarketGapsSubmit:', error);
      }
    }
    
    navigate('/features');
  };

  const handleFeaturesSubmit = async (features: Feature[]) => {
    setIdeaData(prev => ({ ...prev, features }));
    navigate('/validation-plan');
  };

  const handleValidationPlanSubmit = async (validationPlan: any) => {
    setIdeaData(prev => ({ ...prev, validationPlan }));
    navigate('/summary');
  };

  const handleSaveProject = async () => {
    if (!user) {
      toast.error('You must be logged in to save a project');
      return;
    }

    try {
      let currentProjectId = projectId;
      
      // Create new project if we don't have one
      if (!currentProjectId) {
        const newProject = await createProject(projectTitle, ideaData.idea);
        if (!newProject) throw new Error('Project creation failed');
        currentProjectId = newProject.id;
      }

      // Update project with all data
      await updateProject(currentProjectId, {
        competitors: ideaData.competitors,
        features: ideaData.features,
        validation_plan: ideaData.validationPlan,
        // Save the new scored market analysis format
        market_analysis: ideaData.marketGapScoringAnalysis as any,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      toast.error('Failed to save project. Please try again.');
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
