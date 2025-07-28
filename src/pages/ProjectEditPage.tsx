
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { useProjectTodos } from '@/hooks/useProjectTodos';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, List, Users, TrendingUp, MessageSquare, CheckSquare, Plus } from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import ProjectEditDialog from '@/components/project/ProjectEditDialog';
import PageLayout from '@/components/layout/PageLayout';

const ProjectEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();
  const { todos } = useProjectTodos(id || '');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const project = projects.find(p => p.id === id);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center mobile-padding">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Project not found</h2>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="mobile-button"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Helper functions for widget summaries
  const getMarketAnalysisSummary = () => {
    if (!project.market_analysis) return 'Not started';
    
    const analysis = project.market_analysis;
    
    // Check for scoring analysis first
    if (analysis.marketGapScoringAnalysis?.marketGaps?.length > 0) {
      const selectedGapIndex = analysis.selectedGapIndex || 0;
      const selectedGap = analysis.marketGapScoringAnalysis.marketGaps[selectedGapIndex];
      if (selectedGap) {
        return `Focus: ${selectedGap.positioningSuggestion.substring(0, 60)}...`;
      }
    }
    
    // Fallback to legacy analysis
    if (analysis.marketGapAnalysis?.positioningSuggestions?.length > 0) {
      return `Strategy: ${analysis.marketGapAnalysis.positioningSuggestions[0].substring(0, 60)}...`;
    }
    
    return 'Analysis completed';
  };

  const getValidationPlanSummary = () => {
    if (!project.validation_plan || !Array.isArray(project.validation_plan)) {
      return 'Not started';
    }
    
    const nextStep = project.validation_plan.find(step => !step.isDone);
    if (nextStep) {
      return `Next: ${nextStep.title}`;
    }
    
    return 'All steps completed';
  };

  const getFeaturesSummary = () => {
    if (!project.features || !Array.isArray(project.features)) {
      return '0 features added';
    }
    
    const incompleteFeatures = project.features.filter(f => f.status !== 'Done');
    const totalFeatures = project.features.length;
    
    if (incompleteFeatures.length === 0) {
      return `${totalFeatures} features (all complete)`;
    }
    
    return `${incompleteFeatures.length} of ${totalFeatures} features active`;
  };

  const getTodoSummary = () => {
    if (todos.length === 0) {
      return 'No tasks yet';
    }
    
    const nextPendingTask = todos.find(todo => !todo.completed);
    if (nextPendingTask) {
      return `Next: ${nextPendingTask.title}`;
    }
    
    return 'All tasks completed';
  };

  const widgets = [
    {
      title: 'Features',
      icon: List,
      onClick: () => navigate(`/project/${project.id}/features`),
      preview: getFeaturesSummary(),
    },
    {
      title: 'Competitors',
      icon: Users,
      onClick: () => navigate(`/project/${project.id}/competitors`),
      preview: `${project.competitors?.length || 0} competitors tracked`,
    },
    {
      title: 'Market Analysis',
      icon: TrendingUp,
      onClick: () => navigate(`/project/${project.id}/market-analysis`),
      preview: getMarketAnalysisSummary(),
    },
    {
      title: 'Validation Plan',
      icon: CheckSquare,
      onClick: () => navigate(`/project/${project.id}/validation-plan`),
      preview: getValidationPlanSummary(),
    },
    {
      title: 'Feedback Tracking',
      icon: MessageSquare,
      onClick: () => navigate(`/project/${project.id}/feedback-tracking`),
      preview: 'Track user feedback',
    },
    {
      title: 'To-do List',
      icon: Plus,
      onClick: () => navigate(`/project/${project.id}/todos`),
      preview: getTodoSummary(),
    },
  ];

  return (
    <PageLayout>
      <div className="min-h-screen">
        <Helmet>
          <title>{project.title} | Mogulate</title>
        </Helmet>

        <div className="mobile-padding section-spacing">
          <div className="max-w-6xl mx-auto">
            {/* Project Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 leading-tight">
                    {project.title}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed flex-1">
                      {project.idea || 'No description provided'}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditDialogOpen(true)}
                      className="p-2 h-8 w-8 rounded-full hover:bg-gray-100 self-start sm:self-center focus-ring"
                      title="Edit project"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Widgets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {widgets.map((widget) => (
                <Card 
                  key={widget.title}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                  onClick={widget.onClick}
                >
                  <CardContent className="card-spacing">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="p-2 md:p-3 bg-blue-50 rounded-lg">
                        <widget.icon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-base md:text-lg">{widget.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base line-clamp-2">
                      {widget.preview}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <ProjectEditDialog
          project={project}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      </div>
    </PageLayout>
  );
};

export default ProjectEditPage;
