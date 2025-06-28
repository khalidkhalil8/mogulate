
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { useProjectValidationPlan } from '@/hooks/useProjectValidationPlan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Plus, CheckSquare } from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import ValidationPlanDrawer from '@/components/validation-plan/ValidationPlanDrawer';
import PageLayout from '@/components/layout/PageLayout';

const ProjectValidationPlanPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { validationPlan, isLoading, updateValidationPlan } = useProjectValidationPlan(id!);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
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

  const handleSave = async (plan: string) => {
    return await updateValidationPlan(plan);
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
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Validation Plan</h1>
                  <p className="text-gray-600">
                    Define how you'll validate your business idea before full investment
                  </p>
                </div>
                
                <Button
                  onClick={() => setIsDrawerOpen(true)}
                  className="gap-2"
                >
                  {validationPlan ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {validationPlan ? 'Edit Plan' : 'Add Plan'}
                </Button>
              </div>
            </div>

            {/* Content */}
            {validationPlan ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-green-600" />
                    Your Validation Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {validationPlan}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckSquare className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No validation plan yet
                  </h3>
                  <p className="text-gray-600 text-center mb-6 max-w-md">
                    Create a validation plan to define the steps you'll take to test and validate your business idea.
                  </p>
                  <Button
                    onClick={() => setIsDrawerOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Validation Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <ValidationPlanDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onSave={handleSave}
          validationPlan={validationPlan}
        />
      </div>
    </PageLayout>
  );
};

export default ProjectValidationPlanPage;
