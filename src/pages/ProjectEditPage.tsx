
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, List, Users, TrendingUp, MessageSquare, CheckSquare, Plus } from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import ProjectEditDialog from '@/components/project/ProjectEditDialog';

const ProjectEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const project = projects.find(p => p.id === id);
  
  if (isLoading) {
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

  const widgets = [
    {
      title: 'Features',
      icon: List,
      onClick: () => navigate(`/project/${project.id}/features`),
      preview: `${project.features?.length || 0} features added`,
    },
    {
      title: 'Competitors',
      icon: Users,
      onClick: () => navigate('/competitors'),
      preview: `${project.competitors?.length || 0} competitors tracked`,
    },
    {
      title: 'Market Analysis',
      icon: TrendingUp,
      onClick: () => navigate('/market-gaps'),
      preview: project.market_gaps ? 'Analysis completed' : 'Not started',
    },
    {
      title: 'Feedback Tracking',
      icon: MessageSquare,
      onClick: () => {}, // Placeholder for future implementation
      preview: 'Coming soon',
      disabled: true,
    },
    {
      title: 'Validation Plan',
      icon: CheckSquare,
      onClick: () => navigate('/validation-plan'),
      preview: project.validation_plan ? 'Plan created' : 'Not started',
    },
    {
      title: 'To-do List',
      icon: Plus,
      onClick: () => {}, // Placeholder for future implementation
      preview: 'Coming soon',
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{project.title} | Mogulate</title>
      </Helmet>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Project Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600 text-lg">
                    {project.idea || 'No description provided'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="p-1 h-8 w-8 rounded-full hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Project Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {widgets.map((widget) => (
              <Card 
                key={widget.title}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  widget.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={widget.disabled ? undefined : widget.onClick}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <widget.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg">{widget.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
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
  );
};

export default ProjectEditPage;
