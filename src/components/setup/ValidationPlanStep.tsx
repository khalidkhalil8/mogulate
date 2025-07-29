
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

  const handleAddManualStep = () => {
    const newStep: ValidationStep = {
      title: 'Custom Validation Step',
      goal: 'Define your validation goal',
      method: 'Choose your validation method',
      priority: 'Medium',
      isDone: false,
    };

    setValidationPlan([...validationPlan, newStep]);
  };

  const handleUpdateStep = (stepIndex: number, updates: Partial<ValidationStep>) => {
    const updatedPlan = validationPlan.map((step, index) =>
      index === stepIndex ? { ...step, ...updates } : step
    );
    setValidationPlan(updatedPlan);
  };

  const handleRemoveStep = (stepIndex: number) => {
    const updatedPlan = validationPlan.filter((_, index) => index !== stepIndex);
    setValidationPlan(updatedPlan);
  };

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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleGenerateValidationPlan}
            disabled={isGenerating || !setupData.description.trim()}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Validation Plan'}
          </Button>

          <Button
            variant="outline"
            onClick={handleAddManualStep}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Custom Step
          </Button>
        </div>

        {validationPlan.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">
              Validation Steps ({validationPlan.length})
            </h3>
            <div className="space-y-4">
              {validationPlan.map((step, index) => (
                <ValidationStepCard
                  key={index}
                  step={step}
                  onToggleCompletion={(isDone) => handleUpdateStep(index, { isDone })}
                  onEdit={(updates) => handleUpdateStep(index, updates)}
                  showActions={true}
                />
              ))}
            </div>
          </div>
        )}

        {validationPlan.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-4">
              <CheckCircle className="w-12 h-12 mx-auto mb-2" />
              <p>No validation steps yet</p>
              <p className="text-sm">Use the buttons above to generate or add validation steps</p>
            </div>
          </div>
        )}
      </div>
    </SetupPageLayout>
  );
};

export default ValidationPlanStep;
