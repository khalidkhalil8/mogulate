
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Target } from 'lucide-react';
import SetupPageLayout from '@/components/setup/SetupPageLayout';
import { generateValidationPlan } from '@/lib/api/validationPlan';
import { toast } from '@/components/ui/sonner';

interface ValidationStepData {
  title: string;
  goal: string;
  method: string;
  priority: 'High' | 'Medium' | 'Low';
  isDone: boolean;
}

interface ProjectValidationStepProps {
  projectData: any;
  updateProjectData: (data: any) => void;
}

const ProjectValidationStep: React.FC<ProjectValidationStepProps> = ({
  projectData,
  updateProjectData
}) => {
  const [validationSteps, setValidationSteps] = useState<ValidationStepData[]>(
    projectData.validationPlan || []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Save to localStorage for persistence
    localStorage.setItem('projectSetupData', JSON.stringify({
      ...projectData,
      validationPlan: validationSteps
    }));
  }, [validationSteps, projectData]);

  const getPositioningSuggestion = () => {
    if (!projectData.marketAnalysis?.marketGaps || !projectData.marketAnalysis.marketGaps.length) {
      return null;
    }

    const marketGaps = projectData.marketAnalysis.marketGaps;
    
    if (projectData.selectedGapIndex !== undefined && marketGaps[projectData.selectedGapIndex]) {
      return marketGaps[projectData.selectedGapIndex].positioningSuggestion;
    }
    
    const bestGap = marketGaps.reduce((best: any, current: any) => 
      current.score > best.score ? current : best
    );
    
    return bestGap?.positioningSuggestion || null;
  };

  const handleGenerateValidationPlan = async () => {
    const selectedPositioningSuggestion = getPositioningSuggestion();
    
    if (!selectedPositioningSuggestion) {
      toast.error("No positioning suggestion available. Please complete the market analysis first.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateValidationPlan(
        projectData.idea,
        selectedPositioningSuggestion,
        projectData.competitors,
        projectData.features
      );

      if (result.success && result.validationPlan) {
        setValidationSteps(result.validationPlan);
        toast.success("Validation plan generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate validation plan");
      }
    } catch (error) {
      console.error('Error generating validation plan:', error);
      toast.error("Failed to generate validation plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    updateProjectData({ validationPlan: validationSteps });
    navigate('/project-setup/summary');
  };

  const handleBack = () => {
    updateProjectData({ validationPlan: validationSteps });
    navigate('/project-setup/features');
  };

  const canProceed = validationSteps.length > 0;

  if (validationSteps.length === 0) {
    return (
      <SetupPageLayout
        title="Generate Validation Plan"
        description="Get actionable steps to test your positioning and features before you invest too heavily."
        showNavigation={false}
      >
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <Button 
            onClick={handleGenerateValidationPlan}
            className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
            disabled={isGenerating}
          >
            <Target className="h-5 w-5 mr-2" />
            {isGenerating ? 'Generating Plan...' : 'Generate Validation Plan'}
          </Button>
          
          <p className="text-sm text-gray-500">
            This will create 3-5 validation steps based on your features and market positioning
          </p>

          <div className="flex justify-between pt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
            <div />
          </div>
        </div>
      </SetupPageLayout>
    );
  }

  return (
    <SetupPageLayout
      title="Your Validation Plan"
      description="Review your validation steps and proceed to the summary."
      onNext={handleNext}
      onBack={handleBack}
      canProceed={canProceed}
    >
      <div className="space-y-4">
        {validationSteps.map((step, index) => (
          <div key={index} className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Goal:</span>
                    <p className="text-gray-600 mt-1">{step.goal}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Method:</span>
                    <p className="text-gray-600 mt-1">{step.method}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Priority:</span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      step.priority === 'High' ? 'bg-red-100 text-red-800' :
                      step.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {step.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SetupPageLayout>
  );
};

export default ProjectValidationStep;
