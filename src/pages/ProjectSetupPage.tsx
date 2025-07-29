import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { useProjectLimits } from '@/hooks/useProjectLimits';
import { toast } from '@/components/ui/sonner';
import ProjectStartStep from '@/components/setup/ProjectStartStep';
import CompetitorDiscoveryStep from '@/components/setup/CompetitorDiscoveryStep';
import MarketAnalysisStep from '@/components/setup/MarketAnalysisStep';
import FeatureGenerationStep from '@/components/setup/FeatureGenerationStep';
import ValidationPlanStep from '@/components/setup/ValidationPlanStep';
import SetupSummaryStep from '@/components/setup/SetupSummaryStep';
import ProjectLimitUpgrade from '@/components/projects/ProjectLimitUpgrade';
import SetupPageLayout from '@/components/setup/SetupPageLayout';
import { Competitor, Feature, ValidationStep, MarketGapScoringAnalysis } from '@/lib/types';

export interface ProjectSetupData {
  title: string;
  description: string;
  competitors: Competitor[];
  marketAnalysis?: MarketGapScoringAnalysis;
  features: Feature[];
  validationPlan: ValidationStep[];
}

const SETUP_STEPS = [
  { id: 'start', name: 'Start Project', component: ProjectStartStep },
  { id: 'competitors', name: 'Competitor Discovery', component: CompetitorDiscoveryStep },
  { id: 'market-analysis', name: 'Market Analysis', component: MarketAnalysisStep },
  { id: 'features', name: 'Feature Generation', component: FeatureGenerationStep },
  { id: 'validation-plan', name: 'Validation Plan', component: ValidationPlanStep },
  { id: 'summary', name: 'Summary', component: SetupSummaryStep },
];

const ProjectSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { createProject, updateProject, projects } = useProjects();
  const { canCreateProject, isAtLimit, currentTier, projectLimit, currentProjectCount } = useProjectLimits();

  const currentStep = searchParams.get('step') || 'start';
  const projectId = searchParams.get('projectId');
  const stepIndex = SETUP_STEPS.findIndex(step => step.id === currentStep);

  const [setupData, setSetupData] = useState<ProjectSetupData>({
    title: '',
    description: '',
    competitors: [],
    features: [],
    validationPlan: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load existing project data if editing
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const existingProject = projects.find(p => p.id === projectId);
      if (existingProject) {
        console.log('Loading existing project:', existingProject);
        setSetupData({
          title: existingProject.title || '',
          description: existingProject.idea || '',
          competitors: existingProject.competitors || [],
          features: existingProject.features || [],
          validationPlan: existingProject.validation_plan || [],
          marketAnalysis: existingProject.market_analysis || undefined,
        });
      }
    }
  }, [projectId, projects]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(`project-setup-${projectId || 'new'}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setSetupData(prev => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.error('Error loading setup data:', error);
      }
    }
  }, [projectId]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`project-setup-${projectId || 'new'}`, JSON.stringify(setupData));
  }, [setupData, projectId]);

  const updateSetupData = (updates: Partial<ProjectSetupData>) => {
    setSetupData(prev => {
      const newData = { ...prev, ...updates };
      console.log('Updating setup data:', updates);
      
      // If we're updating market analysis and have a projectId, save immediately
      if (updates.marketAnalysis && projectId && user?.id) {
        updateProject(projectId, {
          market_analysis: updates.marketAnalysis as any
        }).catch(error => {
          console.error('Error saving market analysis:', error);
        });
      }
      
      return newData;
    });
  };

  const navigateToStep = (stepId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('step', stepId);
    setSearchParams(params);
  };

  const handleNext = async () => {
    const nextStepIndex = stepIndex + 1;
    if (nextStepIndex < SETUP_STEPS.length) {
      navigateToStep(SETUP_STEPS[nextStepIndex].id);
    }
  };

  const handleBack = () => {
    const prevStepIndex = stepIndex - 1;
    if (prevStepIndex >= 0) {
      navigateToStep(SETUP_STEPS[prevStepIndex].id);
    }
  };

  const handleSaveProject = async () => {
    if (!user) {
      toast.error('You must be logged in to save a project');
      return;
    }

    setIsLoading(true);
    try {
      let currentProjectId = projectId;

      if (!currentProjectId) {
        const newProject = await createProject(setupData.title, setupData.description);
        if (!newProject) throw new Error('Project creation failed');
        currentProjectId = newProject.id;
      }

      // Save all setup data to the project, including market analysis
      const updateData = {
        title: setupData.title,
        idea: setupData.description,
        competitors: setupData.competitors,
        features: setupData.features,
        validation_plan: setupData.validationPlan,
      };

      // Only include market_analysis if it exists
      if (setupData.marketAnalysis) {
        (updateData as any).market_analysis = setupData.marketAnalysis;
      }

      await updateProject(currentProjectId, updateData);

      // Clear localStorage after successful save
      localStorage.removeItem(`project-setup-${projectId || 'new'}`);

      toast.success('Project saved successfully! 🎉');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if user can proceed based on current step requirements
  const canProceed = () => {
    switch (currentStep) {
      case 'start':
        return setupData.title.trim() !== '' && setupData.description.trim() !== '';
      case 'summary':
        return setupData.title.trim() !== '' && setupData.description.trim() !== '';
      default:
        return true;
    }
  };

  // Show upgrade prompt if at limit
  if (isAtLimit && !projectId) {
    return (
      <SetupPageLayout
        title="Project Limit Reached"
        description="Upgrade your plan to create more projects"
        showNavigation={false}
      >
        <div className="max-w-2xl mx-auto">
          <ProjectLimitUpgrade 
            currentTier={currentTier}
            projectLimit={projectLimit}
            currentProjectCount={currentProjectCount}
          />
        </div>
      </SetupPageLayout>
    );
  }

  const CurrentStepComponent = SETUP_STEPS[stepIndex]?.component;

  if (!CurrentStepComponent) {
    return (
      <SetupPageLayout
        title="Step Not Found"
        description="The requested setup step was not found."
        showNavigation={false}
      >
        <div className="text-center">
          <button
            onClick={() => navigateToStep('start')}
            className="text-blue-600 hover:text-blue-800"
          >
            Return to Start
          </button>
        </div>
      </SetupPageLayout>
    );
  }

  // Handle the start step without progress indicator
  if (currentStep === 'start') {
    return (
      <CurrentStepComponent
        setupData={setupData}
        updateSetupData={updateSetupData}
        onNext={handleNext}
        isLoading={isLoading}
        canProceed={canProceed()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Progress indicator */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Step {stepIndex + 1} of {SETUP_STEPS.length}</span>
            <div className="flex space-x-2">
              {SETUP_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full ${
                    index <= stepIndex ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <CurrentStepComponent
        setupData={setupData}
        updateSetupData={updateSetupData}
        onNext={handleNext}
        onBack={stepIndex > 0 ? handleBack : undefined}
        onSave={currentStep === 'summary' ? handleSaveProject : undefined}
        isLoading={isLoading}
        canProceed={canProceed()}
      />
    </div>
  );
};

export default ProjectSetupPage;
