import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SetupNavigation from './setup/SetupNavigation';
import ValidationPlanWelcomeState from './validation-plan/ValidationPlanWelcomeState';
import { generateValidationPlan } from '@/lib/api';
import { toast } from './ui/sonner';
import type { IdeaData } from '@/lib/types';

interface ValidationStepData {
  title: string;
  goal: string;
  method: string;
  priority: 'High' | 'Medium' | 'Low';
  isDone: boolean;
}

interface ValidationPlanPageProps {
  initialValidationPlan?: Array<{
    title: string;
    goal: string;
    method: string;
    priority: 'High' | 'Medium' | 'Low';
    isDone: boolean;
  }>;
  onValidationPlanSubmit: (validationPlan: any) => Promise<void>;
  ideaData: IdeaData;
  selectedGapIndex?: number;
}

const ValidationPlanPage: React.FC<ValidationPlanPageProps> = ({
  initialValidationPlan = [],
  onValidationPlanSubmit,
  ideaData,
  selectedGapIndex
}) => {
  const [validationSteps, setValidationSteps] = useState<ValidationStepData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(!!initialValidationPlan);
  const navigate = useNavigate();

  // Get the selected market gap positioning suggestion based on the index
  const selectedPositioningSuggestion = selectedGapIndex !== undefined && 
    ideaData.marketGapScoringAnalysis?.marketGaps?.[selectedGapIndex]?.positioningSuggestion || '';

  // Parse initial validation plan into steps if it exists
  React.useEffect(() => {
    if (initialValidationPlan && initialValidationPlan.length > 0 && !hasGenerated) {
      setValidationSteps(initialValidationPlan);
      setHasGenerated(true);
    }
  }, [initialValidationPlan, hasGenerated]);

  // No longer need parseValidationPlan since API returns ValidationStep[] directly

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
        setHasGenerated(true);
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

  const convertStepsToString = (steps: ValidationStepData[]): string => {
    return steps.map((step, index) => 
      `Step ${index + 1}: ${step.title}\nGoal/Description: ${step.goal}\nTool/Method: ${step.method}\nPriority: ${step.priority}`
    ).join('\n\n');
  };


  const handleNext = () => {
    if (validationSteps.length === 0) {
      toast.error("Please add at least one validation step before continuing");
      return;
    }
    
    const validationPlanString = convertStepsToString(validationSteps);
    onValidationPlanSubmit(validationPlanString);
  };

  const handleBack = () => {
    // Save current validation plan before navigating back
    if (validationSteps.length > 0) {
      const validationPlanString = convertStepsToString(validationSteps);
      onValidationPlanSubmit(validationPlanString);
    }
    navigate('/features');
  };

  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {!hasGenerated ? (
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
