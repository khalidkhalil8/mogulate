
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { useValidationSteps, ValidationStep } from '@/hooks/useValidationSteps';
import { useProjectValidationPlan } from '@/hooks/useProjectValidationPlan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, CheckSquare, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  const { validationPlan, isLoading: planLoading } = useProjectValidationPlan(id!);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ValidationStep | null>(null);
  
  const project = projects.find(p => p.id === id);
  
  if (projectsLoading || isLoading || planLoading) {
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
  const hasValidationPlan = validationPlan && validationPlan.trim().length > 0;
  const hasValidationSteps = validationSteps.length > 0;

  // Parse the validation plan text into steps for display
  const parseValidationPlan = (plan: string) => {
    const steps = plan.split(/Step \d+:/).filter(step => step.trim().length > 0);
    return steps.map((step, index) => {
      const lines = step.trim().split('\n').filter(line => line.trim().length > 0);
      const title = lines[0]?.trim() || `Step ${index + 1}`;
      const goal = lines.find(line => line.startsWith('Goal/Description:'))?.replace('Goal/Description:', '').trim() || '';
      const method = lines.find(line => line.startsWith('Tool/Method:'))?.replace('Tool/Method:', '').trim() || '';
      const priority = lines.find(line => line.startsWith('Priority:'))?.replace('Priority:', '').trim() || 'Medium';
      
      return { title, goal, method, priority };
    });
  };

  const parsedPlanSteps = hasValidationPlan ? parseValidationPlan(validationPlan) : [];

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
            {hasValidationSteps ? (
              // Individual validation steps (post-project creation)
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
            ) : hasValidationPlan ? (
              // Original validation plan from setup
              <div className="space-y-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <FileText className="text-white text-xs" />
                      </div>
                      <div>
                        <p className="text-blue-800 font-medium mb-1">
                          Generated Validation Plan
                        </p>
                        <p className="text-blue-700 text-sm">
                          This validation plan was generated during your project setup. You can review the steps below and create individual tasks by clicking "Add Step" to track your progress.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  {parsedPlanSteps.map((step, index) => (
                    <Card key={index} className="border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{step.title}</CardTitle>
                          <Badge 
                            variant={step.priority === 'High' ? 'default' : step.priority === 'Medium' ? 'secondary' : 'outline'}
                            className={step.priority === 'High' ? 'bg-red-100 text-red-800' : step.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {step.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {step.goal && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Goal:</h4>
                            <p className="text-gray-700 text-sm">{step.goal}</p>
                          </div>
                        )}
                        {step.method && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Method:</h4>
                            <p className="text-gray-700 text-sm">{step.method}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-center mb-6 max-w-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No validation plan available
                    </h3>
                    <p className="text-gray-600">
                      Validation plans are created during the project setup process. If you haven't completed the setup flow, you can start a new project to generate a validation plan, or manually add steps here.
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
