import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SetupNavigation from './setup/SetupNavigation';
import ValidationPlanWelcomeState from './validation-plan/ValidationPlanWelcomeState';
import { generateValidationPlan } from '@/lib/api';
import { toast } from './ui/sonner';
import { useProjectData } from '@/hooks/useProjectData';
import { useSetupHandlers } from '@/hooks/useSetupHandlers';

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
    if (!ideaData.marketGapScoringAnalysis?.marketGaps) {
      return null;
    }

    const marketGaps = ideaData.marketGapScoringAnalysis.marketGaps;
    
    // If a specific gap is selected, use that
    if (selectedGapIndex !== undefined && marketGaps[selectedGapIndex]) {
      return marketGaps[selectedGapIndex].positioningSuggestion;
    }
    
    // Otherwise, use the highest scoring gap
    const bestGap = marketGaps.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return bestGap?.positioningSuggestion || null;
  };

  const selectedPositioningSuggestion = getPositioningSuggestion();

  const handleGenerateValidationPlan = async () => {
    if (!selectedPositioningSuggestion) {
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

  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {validationSteps.length === 0 ? (
            <ValidationPlanWelcomeState
              onGenerateValidationPlan={handleGenerateValidationPlan}
              isGenerating={isGenerating}
            />
          ) : (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Create your Validation Plan</h1>
                <p className="text-gray-600">
                  Get actionable steps to test your positioning and features before you invest too heavily.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Validation Steps</h2>
                <p className="text-gray-600 text-sm">
                  {validationSteps.length} step{validationSteps.length !== 1 ? 's' : ''} defined
                </p>
              </div>

              <div className="space-y-4">
                {validationSteps.length > 0 ? (
                  validationSteps.map((step, index) => (
                    <div key={index} className="bg-white border rounded-lg p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {step.title}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Goal:</span>
                              <p className="text-gray-600 mt-1">{step.goal}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Method:</span>
                              <p className="text-gray-600 mt-1">{step.method}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Priority:</span>
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
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">No validation steps defined yet.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </Button>
                
                <Button 
                  onClick={handleNext}
                  disabled={validationSteps.length === 0}
                  className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationPlanPage;
