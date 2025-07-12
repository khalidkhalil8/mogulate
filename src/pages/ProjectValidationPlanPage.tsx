
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { useValidationSteps, ValidationStep } from '@/hooks/useValidationSteps';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, CheckSquare } from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import ValidationPlanDrawer from '@/components/validation-plan/ValidationPlanDrawer';
import ValidationStepCard from '@/components/validation-plan/ValidationStepCard';
import PageLayout from '@/components/layout/PageLayout';

const ProjectValidationPlanPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading } = useProjects();
  const {
    validationSteps,
    isLoading,
    createValidationStep,
    updateValidationStep,
    deleteValidationStep,
    toggleStepCompletion,
  } = useValidationSteps(id!);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ValidationStep | null>(null);
  
  const project = projects.find(p => p.id === id);
  
  if (projectsLoading || isLoading) {
    return <LoadingState />;
  }
  
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Project not found</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const completedSteps = validationSteps.filter(step => step.is_completed).length;
  const totalSteps = validationSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const handleSaveStep = async (stepData: Omit<ValidationStep, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    return await createValidationStep(stepData);
  };

  const handleUpdateStep = async (id: string, stepData: Partial<ValidationStep>) => {
    return await updateValidationStep(id, stepData);
  };

  const handleEditStep = (step: ValidationStep) => {
    setEditingStep(step);
    setIsDrawerOpen(true);
  };

  const handleAddStep = () => {
    setEditingStep(null);
    setIsDrawerOpen(true);
  };

  const handleToggleCompletion = async (id: string, completed: boolean) => {
    await toggleStepCompletion(id, completed);
  };

  return (
    <PageLayout>
      <div className="min-h-screen">
        <Helmet>
          <title>Your Validation Plan - {project.title} | Mogulate</title>
        </Helmet>

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Project
                </Button>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Your Validation Plan</h1>
                  <p className="text-gray-600">
                    Track how you'll validate your project through actionable steps. Mark them complete as you make progress.
                  </p>
                </div>
                
                <Button
                  onClick={handleAddStep}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Step
                </Button>
              </div>

              {/* Progress Indicator */}
              {totalSteps > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress: {completedSteps} of {totalSteps} steps completed
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}
            </div>

            {/* Content */}
            {validationSteps.length > 0 ? (
              <div className="space-y-4">
                {validationSteps.map((step) => (
                  <ValidationStepCard
                    key={step.id}
                    step={step}
                    onEdit={handleEditStep}
                    onToggleCompletion={handleToggleCompletion}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-center mb-6 max-w-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No validation steps yet
                    </h3>
                    <p className="text-gray-600">
                      Validation steps are created during the project setup process. If you haven't completed the setup flow, you can start a new project to generate a validation plan, or manually add steps here.
                    </p>
                  </div>
                  <Button
                    onClick={handleAddStep}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add First Step
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <ValidationPlanDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onSave={handleSaveStep}
          onUpdate={handleUpdateStep}
          editingStep={editingStep}
          projectId={id!}
        />
      </div>
    </PageLayout>
  );
};

export default ProjectValidationPlanPage;
