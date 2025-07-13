import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import SetupNavigation from './setup/SetupNavigation';
import ValidationPlanWelcomeState from './validation-plan/ValidationPlanWelcomeState';
import ValidationStepCard from './validation-plan/ValidationStepCard';
import ValidationPlanDrawer from './validation-plan/ValidationPlanDrawer';
import { generateValidationPlan } from '@/lib/api';
import { toast } from './ui/sonner';
import type { IdeaData } from '@/lib/types';

interface ValidationStepData {
  title: string;
  description: string;
  method: string;
  priority: 'High' | 'Medium' | 'Low';
  is_completed: boolean;
}

interface ValidationPlanPageProps {
  initialValidationPlan?: string;
  onValidationPlanSubmit: (validationPlan: string) => Promise<void>;
  ideaData: IdeaData;
  selectedGapIndex?: number;
}

const ValidationPlanPage: React.FC<ValidationPlanPageProps> = ({
  initialValidationPlan = "",
  onValidationPlanSubmit,
  ideaData,
  selectedGapIndex
}) => {
  const [validationSteps, setValidationSteps] = useState<ValidationStepData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(!!initialValidationPlan);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ValidationStepData | null>(null);
  const navigate = useNavigate();

  // Get the selected market gap positioning suggestion based on the index
  const selectedPositioningSuggestion = selectedGapIndex !== undefined && 
    ideaData.marketGapScoringAnalysis?.marketGaps?.[selectedGapIndex]?.positioningSuggestion || '';

  // Parse initial validation plan into steps if it exists
  React.useEffect(() => {
    if (initialValidationPlan && !hasGenerated) {
      const parsedSteps = parseValidationPlan(initialValidationPlan);
      setValidationSteps(parsedSteps);
      setHasGenerated(true);
    }
  }, [initialValidationPlan, hasGenerated]);

  const parseValidationPlan = (planText: string): ValidationStepData[] => {
    // Parse the formatted validation plan text into individual steps
    const steps: ValidationStepData[] = [];
    const stepSections = planText.split(/Step \d+:/);
    
    stepSections.forEach((section, index) => {
      if (index === 0 || !section.trim()) return; // Skip empty first section
      
      const lines = section.trim().split('\n').filter(line => line.trim());
      let title = '';
      let description = '';
      let method = '';
      let priority: 'High' | 'Medium' | 'Low' = 'Medium';
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!title && trimmedLine) {
          title = trimmedLine;
        } else if (trimmedLine.startsWith('Goal/Description:')) {
          description = trimmedLine.replace('Goal/Description:', '').trim();
        } else if (trimmedLine.startsWith('Tool/Method:')) {
          method = trimmedLine.replace('Tool/Method:', '').trim();
        } else if (trimmedLine.startsWith('Priority:')) {
          const priorityText = trimmedLine.replace('Priority:', '').trim();
          if (['High', 'Medium', 'Low'].includes(priorityText)) {
            priority = priorityText as 'High' | 'Medium' | 'Low';
          }
        }
      });
      
      if (title) {
        steps.push({
          title,
          description,
          method,
          priority,
          is_completed: false
        });
      }
    });
    
    return steps;
  };

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
        const parsedSteps = parseValidationPlan(result.validationPlan);
        setValidationSteps(parsedSteps);
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
      `Step ${index + 1}: ${step.title}\nGoal/Description: ${step.description}\nTool/Method: ${step.method}\nPriority: ${step.priority}`
    ).join('\n\n');
  };

  const handleAddStep = () => {
    setEditingStep(null);
    setIsDrawerOpen(true);
  };

  const handleEditStep = (step: ValidationStepData) => {
    setEditingStep(step);
    setIsDrawerOpen(true);
  };

  const handleSaveStep = async (stepData: Omit<ValidationStepData, 'is_completed'>) => {
    const newStep = { ...stepData, is_completed: false };
    
    if (editingStep) {
      // Update existing step
      setValidationSteps(prev => 
        prev.map(step => step === editingStep ? newStep : step)
      );
    } else {
      // Add new step
      setValidationSteps(prev => [...prev, newStep]);
    }
    
    toast.success(editingStep ? 'Step updated successfully' : 'Step added successfully');
    return true;
  };

  const handleToggleCompletion = (stepToToggle: ValidationStepData, completed: boolean) => {
    setValidationSteps(prev => 
      prev.map(step => 
        step === stepToToggle ? { ...step, is_completed: completed } : step
      )
    );
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

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Validation Steps</h2>
                  <p className="text-gray-600 text-sm">
                    {validationSteps.length} step{validationSteps.length !== 1 ? 's' : ''} defined
                  </p>
                </div>
                <Button 
                  onClick={handleAddStep}
                  className="flex items-center gap-2"
                >
                  <Plus size={18} />
                  <span>Add Step</span>
                </Button>
              </div>

              <div className="space-y-4">
                {validationSteps.length > 0 ? (
                  validationSteps.map((step, index) => (
                    <ValidationStepCard
                      key={index}
                      step={{
                        id: index.toString(),
                        project_id: '',
                        user_id: '',
                        title: step.title,
                        description: step.description,
                        method: step.method,
                        priority: step.priority,
                        is_completed: step.is_completed,
                        created_at: '',
                        updated_at: ''
                      }}
                      onEdit={() => handleEditStep(step)}
                      onToggleCompletion={(_, completed) => handleToggleCompletion(step, completed)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">No validation steps defined yet.</p>
                    <Button onClick={handleAddStep} variant="outline">
                      <Plus size={18} className="mr-2" />
                      Add Your First Step
                    </Button>
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

      <ValidationPlanDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSave={handleSaveStep}
        onUpdate={async (id, stepData) => {
          // Handle update by finding and updating the step
          if (editingStep) {
            const newStep = { ...editingStep, ...stepData, is_completed: stepData.is_completed ?? editingStep.is_completed };
            setValidationSteps(prev => 
              prev.map(step => step === editingStep ? newStep : step)
            );
            toast.success('Step updated successfully');
            return true;
          }
          return false;
        }}
        editingStep={editingStep ? {
          id: editingStep.title, // Use title as temp ID
          project_id: '',
          user_id: '',
          title: editingStep.title,
          description: editingStep.description,
          method: editingStep.method,
          priority: editingStep.priority,
          is_completed: editingStep.is_completed,
          created_at: '',
          updated_at: ''
        } : null}
        projectId="temp"
      />
    </div>
  );
};

export default ValidationPlanPage;
