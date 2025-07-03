
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { useProjectValidationPlan } from '@/hooks/useProjectValidationPlan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Plus, CheckSquare, Sparkles } from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import ValidationPlanDrawer from '@/components/validation-plan/ValidationPlanDrawer';
import ValidationPlanRegenerateModal from '@/components/validation-plan/ValidationPlanRegenerateModal';
import PageLayout from '@/components/layout/PageLayout';

interface ValidationStep {
  id: string;
  title: string;
  description: string;
  tool: string;
  priority: 'High' | 'Medium' | 'Low';
}

const ProjectValidationPlanPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { validationPlan, isLoading, updateValidationPlan } = useProjectValidationPlan(id!);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ValidationStep | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
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

  // Parse validation plan into structured steps
  const parseValidationSteps = (): ValidationStep[] => {
    if (!validationPlan) return [];
    
    try {
      const stepBlocks = validationPlan.split('\n\n').filter(block => block.trim());
      const parsedSteps: ValidationStep[] = [];
      
      stepBlocks.forEach((block, index) => {
        const lines = block.split('\n');
        const titleLine = lines.find(line => line.startsWith('Step '));
        const descLine = lines.find(line => line.startsWith('Goal/Description: '));
        const toolLine = lines.find(line => line.startsWith('Tool/Method: '));
        const priorityLine = lines.find(line => line.startsWith('Priority: '));
        
        if (titleLine) {
          const title = titleLine.replace(/^Step \d+: /, '');
          const description = descLine ? descLine.replace('Goal/Description: ', '') : '';
          const tool = toolLine ? toolLine.replace('Tool/Method: ', '') : '';
          const priority = priorityLine ? priorityLine.replace('Priority: ', '') as 'High' | 'Medium' | 'Low' : 'Medium';
          
          parsedSteps.push({
            id: (index + 1).toString(),
            title,
            description,
            tool,
            priority
          });
        }
      });
      
      return parsedSteps;
    } catch (error) {
      console.error('Error parsing validation plan:', error);
      return [];
    }
  };

  const validationSteps = parseValidationSteps();

  const handleSave = async (plan: string) => {
    return await updateValidationPlan(plan);
  };

  const handleEditStep = (step: ValidationStep) => {
    setEditingStep(step);
    setIsDrawerOpen(true);
  };

  const handleAddStep = () => {
    setEditingStep(null);
    setIsDrawerOpen(true);
  };

  const handleRegenerateWithAI = async () => {
    setIsRegenerating(true);
    try {
      // Simulate AI generation for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiGeneratedPlan = `Step 1: Create Landing Page
Goal/Description: Build a simple landing page to gauge initial interest and collect email signups
Tool/Method: Webflow, Framer, or HTML/CSS
Priority: High

Step 2: Run Social Media Survey
Goal/Description: Post targeted questions on relevant social media groups to validate problem-solution fit
Tool/Method: LinkedIn, Reddit, Facebook Groups
Priority: High

Step 3: Conduct User Interviews
Goal/Description: Interview 10-15 potential customers to understand their pain points and willingness to pay
Tool/Method: Zoom, Google Meet, Calendly
Priority: Medium

Step 4: Create MVP Prototype
Goal/Description: Build a minimal version to test core functionality with early users
Tool/Method: Figma, No-code tools, or basic development
Priority: Medium`;

      await updateValidationPlan(aiGeneratedPlan);
    } catch (error) {
      console.error('Error regenerating validation plan:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

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
                    These steps help you validate your idea before committing resources.
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
            </div>

            {/* Content */}
            {validationSteps.length > 0 ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Button
                    onClick={() => setIsRegenerateModalOpen(true)}
                    variant="outline"
                    className="gap-2"
                    disabled={isRegenerating}
                  >
                    <Sparkles className="h-4 w-4" />
                    Regenerate with AI
                  </Button>
                </div>

                <div className="grid gap-4">
                  {validationSteps.map((step, index) => (
                    <Card key={step.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-bold">
                            {step.title}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(step.priority)}>
                              {step.priority}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStep(step)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Goal/Description:</p>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Tool/Method:</p>
                          <p className="text-gray-600 text-sm">
                            {step.tool}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckSquare className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No validation plan yet
                  </h3>
                  <p className="text-gray-600 text-center mb-6 max-w-md">
                    Create validation steps to define how you'll test and validate your business idea.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddStep}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Step
                    </Button>
                    <Button
                      onClick={() => setIsRegenerateModalOpen(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate with AI
                    </Button>
                  </div>
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
          editingStep={editingStep}
          isEditing={!!editingStep}
        />

        <ValidationPlanRegenerateModal
          isOpen={isRegenerateModalOpen}
          onOpenChange={setIsRegenerateModalOpen}
          onConfirm={handleRegenerateWithAI}
          isLoading={isRegenerating}
        />
      </div>
    </PageLayout>
  );
};

export default ProjectValidationPlanPage;
