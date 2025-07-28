import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Target } from 'lucide-react';
import { generateValidationPlan } from '@/lib/api';
import { toast } from './ui/sonner';
import { useProjectData } from '@/hooks/useProjectData';
import { useSetupHandlers } from '@/hooks/useSetupHandlers';
import SetupPageLayout from './setup/SetupPageLayout';

interface ValidationStepData {
  title: string;
  goal: string;
  method: string;
  priority: 'High' | 'Medium' | 'Low';
  isDone: boolean;
}

const ValidationPlanPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const {
    existingProject,
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
  } = useProjectData();

  const {
    handleValidationPlanSubmit,
  } = useSetupHandlers({
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
    projectId,
  });

  const [validationSteps, setValidationSteps] = useState<ValidationStepData[]>(ideaData.validationPlan || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // Get the positioning suggestion from market analysis
  const getPositioningSuggestion = () => {
    console.log('ValidationPlanPage: Getting positioning suggestion', {
      hasMarketAnalysis: !!ideaData.marketGapScoringAnalysis,
      selectedGapIndex,
      marketGapsCount: ideaData.marketGapScoringAnalysis?.marketGaps?.length || 0
    });

    if (!ideaData.marketGapScoringAnalysis?.marketGaps || ideaData.marketGapScoringAnalysis.marketGaps.length === 0) {
      console.log('ValidationPlanPage: No market gaps available');
      return null;
    }

    const marketGaps = ideaData.marketGapScoringAnalysis.marketGaps;
    
    // If a specific gap is selected, use that
    if (selectedGapIndex !== undefined && marketGaps[selectedGapIndex]) {
      console.log('ValidationPlanPage: Using selected gap at index', selectedGapIndex);
      return marketGaps[selectedGapIndex].positioningSuggestion;
    }
    
    // Otherwise, use the highest scoring gap
    const bestGap = marketGaps.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    console.log('ValidationPlanPage: Using best gap with score', bestGap?.score);
    return bestGap?.positioningSuggestion || null;
  };

  const selectedPositioningSuggestion = getPositioningSuggestion();

  const handleGenerateValidationPlan = async () => {
    console.log('ValidationPlanPage: Generating validation plan', {
      hasPositioningSuggestion: !!selectedPositioningSuggestion,
      ideaLength: ideaData.idea?.length || 0,
      competitorsCount: ideaData.competitors?.length || 0,
      featuresCount: ideaData.features?.length || 0
    });

    if (!selectedPositioningSuggestion) {
      console.error('ValidationPlanPage: No positioning suggestion available');
      toast.error("No positioning suggestion available. Please complete the market gap analysis first.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateValidationPlan(
        ideaData.idea,
        selectedPositioningSuggestion,
        ideaData.competitors,
        ideaData.features
      );

      if (result.success && result.validationPlan) {
        console.log('ValidationPlanPage: Successfully generated validation plan');
        setValidationSteps(result.validationPlan);
        toast.success("Validation plan generated successfully!");
      } else {
        console.error('ValidationPlanPage: Failed to generate validation plan', result.error);
        toast.error(result.error || "Failed to generate validation plan");
      }
    } catch (error) {
      console.error('ValidationPlanPage: Error generating validation plan:', error);
      toast.error("Failed to generate validation plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (validationSteps.length === 0) {
      toast.error("Please add at least one validation step before continuing");
      return;
    }
    
    handleValidationPlanSubmit(validationSteps);
    navigate('/summary');
  };

  const handleBack = () => {
    if (validationSteps.length > 0) {
      handleValidationPlanSubmit(validationSteps);
    }
    navigate('/features');
  };

  // Check if we have market analysis data
  const hasMarketAnalysis = ideaData.marketGapScoringAnalysis?.marketGaps && 
                           ideaData.marketGapScoringAnalysis.marketGaps.length > 0;

  if (!hasMarketAnalysis) {
    return (
      <SetupPageLayout
        title="Market Analysis Required"
        description="You need to complete the market gap analysis before generating a validation plan."
        showNavigation={false}
      >
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
          <Button 
            onClick={() => navigate(`/market-gaps?projectId=${projectId}`)}
            className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
          >
            Go to Market Analysis
          </Button>
        </div>
      </SetupPageLayout>
    );
  }

  if (validationSteps.length === 0) {
    return (
      <SetupPageLayout
        title="Generate Validation Plan"
        description="Get actionable steps to test your positioning and features before you invest too heavily."
        showNavigation={false}
      >
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
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
        </div>
      </SetupPageLayout>
    );
  }

  return (
    <SetupPageLayout
      title="Your Validation Plan"
      description="Review your validation steps and proceed to the summary."
      onBack={handleBack}
      onNext={handleNext}
      canProceed={validationSteps.length > 0}
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

export default ValidationPlanPage;
