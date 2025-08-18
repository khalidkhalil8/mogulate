
import React, { useState, useEffect } from 'react';
import SetupPageLayout from './SetupPageLayout';
import { ProjectSetupData } from '@/pages/ProjectSetupPage';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle, Loader2 } from 'lucide-react';
import { generateValidationPlan } from '@/lib/api/validationPlan';
import { toast } from '@/components/ui/sonner';
import { ValidationStep } from '@/lib/types';
import ValidationStepCard from '@/components/validation-plan/ValidationStepCard';

interface ValidationPlanStepProps {
  setupData: ProjectSetupData;
  updateSetupData: (updates: Partial<ProjectSetupData>) => void;
  onNext: () => void;
  onBack?: () => void;
  canProceed: boolean;
  isLoading: boolean;
}

const ValidationPlanStep: React.FC<ValidationPlanStepProps> = ({
  setupData,
  updateSetupData,
  onNext,
  onBack,
  canProceed,
  isLoading,
}) => {
  const [validationPlan, setValidationPlan] = useState<ValidationStep[]>(setupData.validationPlan);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setValidationPlan(setupData.validationPlan);
  }, [setupData.validationPlan]);

  const handleNext = () => {
    updateSetupData({ validationPlan });
    onNext();
  };

  const handleGenerateValidationPlan = async () => {
    if (!setupData.description.trim()) {
      toast.error('Please add a project description first');
      return;
    }

    setIsGenerating(true);
    try {
      const positioningSuggestion = setupData.marketAnalysis?.marketGaps?.[0]?.positioningSuggestion || '';
      
      const response = await generateValidationPlan(
        setupData.description,
        positioningSuggestion,
        setupData.competitors,
        setupData.features
      );

      if (response.success && response.validationPlan) {
        setValidationPlan(response.validationPlan);
        toast.success('Validation plan generated successfully');
      } else {
        toast.error(response.error || 'Failed to generate validation plan');
      }
    } catch (error) {
      console.error('Error generating validation plan:', error);
      toast.error('Failed to generate validation plan');
    } finally {
      setIsGenerating(false);
    }
  };

  // Remove manual add/edit functionality during setup

  if (validationPlan.length === 0) {
    return (
      <SetupPageLayout
        title="Validation Plan"
        description="Create a plan to validate your project idea with real users"
        onNext={handleNext}
        onBack={onBack}
        nextLabel="Continue"
        canProceed={!isLoading}
        isLoading={isLoading}
        showNavigation={false}
      >
        <div className="flex justify-center py-12">
          <Button
            onClick={handleGenerateValidationPlan}
            disabled={isGenerating || !setupData.description.trim() || setupData.features.length === 0}
            className="nav-button bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {isGenerating ? 'Generating Plan...' : 'Generate Validation Plan'}
          </Button>
        </div>
        
        {setupData.features.length === 0 && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Add features first to generate a relevant validation plan
          </p>
        )}
      </SetupPageLayout>
    );
  }

  return (
    <SetupPageLayout
      title="Validation Plan"
      description="Create a plan to validate your project idea with real users"
      onNext={handleNext}
      onBack={onBack}
      nextLabel="Continue"
      canProceed={!isLoading}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">
            Validation Steps ({validationPlan.length})
          </h3>
          <div className="space-y-4">
            {validationPlan.map((step, index) => (
              <SetupValidationStepCard
                key={index}
                step={step}
                stepNumber={index + 1}
              />
            ))}
          </div>
        </div>
      </div>
    </SetupPageLayout>
  );
};

// Setup-specific card without checkboxes
const SetupValidationStepCard: React.FC<{ step: ValidationStep; stepNumber: number }> = ({
  step,
  stepNumber
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {stepNumber}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold">
                {step.title}
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(step.priority)}`}>
                {step.priority}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {step.goal && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Goal/Description:</p>
            <div className="text-gray-700 min-h-[3rem] p-3 bg-gray-50 rounded border">
              {step.goal}
            </div>
          </div>
        )}
        {step.method && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Tool/Method:</p>
            <div className="text-gray-700 min-h-[3rem] p-3 bg-gray-50 rounded border">
              {step.method}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationPlanStep;
