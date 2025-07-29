
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SetupPageLayout from '@/components/setup/SetupPageLayout';
import IdeaSummaryCard from '@/components/summary/IdeaSummaryCard';
import CompetitorsSummaryCard from '@/components/summary/CompetitorsSummaryCard';
import MarketGapsSummaryCard from '@/components/summary/MarketGapsSummaryCard';
import ValidationPlanSummaryCard from '@/components/summary/ValidationPlanSummaryCard';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

interface ProjectSummaryStepProps {
  projectData: any;
  updateProjectData: (data: any) => void;
  onProjectSaved: () => void;
}

const ProjectSummaryStep: React.FC<ProjectSummaryStepProps> = ({
  projectData,
  updateProjectData,
  onProjectSaved
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProject, updateProject } = useProjects();

  const handleSaveProject = async () => {
    if (!user) {
      toast.error('You must be logged in to save a project');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Creating project with data:', {
        title: projectData.title,
        idea: projectData.idea ? 'present' : 'empty',
        competitors: projectData.competitors?.length || 0,
        features: projectData.features?.length || 0,
        validationPlan: projectData.validationPlan?.length || 0,
        hasMarketAnalysis: !!projectData.marketAnalysis,
      });

      const project = await createProject(projectData.title, projectData.idea);
      if (!project) {
        throw new Error('Project creation failed');
      }

      // Update the project with all the collected data
      await updateProject(project.id, {
        title: projectData.title,
        idea: projectData.idea,
        competitors: projectData.competitors || [],
        features: projectData.features || [],
        validation_plan: projectData.validationPlan || [],
        market_analysis: projectData.marketAnalysis || null,
      });

      toast.success('Project saved successfully! 🎉');
      onProjectSaved(); // Clear localStorage
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/project-setup/validation');
  };

  return (
    <SetupPageLayout
      title="Project Summary"
      description="Here is everything we've discovered. Now it's time to save your project."
      showNavigation={false}
    >
      <div className="space-y-8">
        <IdeaSummaryCard idea={projectData.idea} />
        
        <CompetitorsSummaryCard competitors={projectData.competitors || []} />
        
        <MarketGapsSummaryCard 
          marketGaps="" 
          marketGapAnalysis={undefined}
          marketGapScoringAnalysis={projectData.marketAnalysis}
          selectedGapIndex={projectData.selectedGapIndex}
        />
        
        <ValidationPlanSummaryCard validationPlan={projectData.validationPlan || []} />
        
        <div className="flex justify-between items-center pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
            disabled={isSaving}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </Button>
          
          <Button 
            onClick={handleSaveProject}
            disabled={isSaving}
            className="gradient-bg border-none hover:opacity-90 button-transition px-8 py-3"
          >
            {isSaving ? 'Saving...' : 'Save Project'}
          </Button>
        </div>
      </div>
    </SetupPageLayout>
  );
};

export default ProjectSummaryStep;
