
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { useProjectValidationPlan, ValidationStep } from '@/hooks/useProjectValidationPlan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, CheckSquare, AlertCircle, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import LoadingState from '@/components/ui/LoadingState';
import ValidationPlanDrawer from '@/components/validation-plan/ValidationPlanDrawer';
import ValidationStepCard from '@/components/validation-plan/ValidationStepCard';
import PageLayout from '@/components/layout/PageLayout';

const ProjectValidationPlanPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { validationPlan, isLoading: planLoading, updateValidationPlan } = useProjectValidationPlan(id!);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<(ValidationStep & { id?: string }) | null>(null);

  const project = projects.find(p => p.id === id);

  if (projectsLoading || planLoading) {
    return <LoadingState />;
  }

  if (!id || !project) {
    return (
      <PageLayout>
        <div className="min-h-screen">
          <Helmet>
            <title>Validation Plan - Project Not Found | Mogulate</title>
          </Helmet>
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Project Not Found</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {!id ? 'Invalid project ID provided.' : 'This project may have been deleted or you don\'t have access to it.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Calculate progress
  const completedSteps = validationPlan.filter(step => step.isDone).length;
  const totalSteps = validationPlan.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const handleSaveStep = async (stepData: ValidationStep) => {
    const newSteps = [...validationPlan, { ...stepData, id: crypto.randomUUID() }];
    await updateValidationPlan(newSteps);
    setIsDrawerOpen(false);
  };

  const handleUpdateStep = (stepToUpdate: ValidationStep & { id?: string }) => {
    const updatedSteps = validationPlan.map(step => 
      step === editingStep ? stepToUpdate : step
    );
    updateValidationPlan(updatedSteps);
    setEditingStep(null);
    setIsDrawerOpen(false);
  };

  const handleEditStep = (step: ValidationStep & { id?: string }) => {
    setEditingStep(step);
    setIsDrawerOpen(true);
  };

  const handleAddStep = () => {
    setEditingStep(null);
    setIsDrawerOpen(true);
  };

  const handleToggleCompletion = (stepToToggle: ValidationStep, completed: boolean) => {
    const updatedSteps = validationPlan.map(step => 
      step === stepToToggle ? { ...step, isDone: completed } : step
    );
    updateValidationPlan(updatedSteps);
  };

  const handleDeleteStep = (stepToDelete: ValidationStep) => {
    const updatedSteps = validationPlan.filter(step => step !== stepToDelete);
    updateValidationPlan(updatedSteps);
  };

  return (
    <PageLayout>
      <div className="min-h-screen">
        <Helmet>
          <title>Validation Plan - {project.title} | Mogulate</title>
        </Helmet>

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Project
                </Button>
                
                <Button onClick={handleAddStep} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Step
                </Button>
              </div>
              
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Validation Plan</h1>
                <p className="text-gray-600">
                  Track your validation steps and monitor progress.
                </p>
              </div>

              {/* Progress */}
              {totalSteps > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">
                      {completedSteps} of {totalSteps} steps completed
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-6">
              {validationPlan.length > 0 ? (
                validationPlan.map((step, index) => (
                  <ValidationStepCard
                    key={index}
                    step={{ ...step, id: index.toString() }}
                    onEdit={handleEditStep}
                    onToggleCompletion={(isDone) => handleToggleCompletion(step, isDone)}
                    showActions={true}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <CheckSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">No validation plan available</h2>
                    <p className="text-gray-600 mb-6">
                      Create your first validation step to start tracking your progress.
                    </p>
                    <Button onClick={handleAddStep} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add First Step
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer for adding/editing steps */}
        <ValidationPlanDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onSave={editingStep ? handleUpdateStep : handleSaveStep}
          editingStep={editingStep}
        />
      </div>
    </PageLayout>
  );
};

export default ProjectValidationPlanPage;
