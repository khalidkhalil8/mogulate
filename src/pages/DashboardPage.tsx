import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Target, Users, CheckSquare, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';
import { Project } from '@/hooks/useProjects';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, isLoading, deleteProject } = useProjects();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = () => {
    navigate('/project-setup?step=start');
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject(projectId);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const getProjectStats = (project: Project) => {
    const competitors = Array.isArray(project.competitors) ? project.competitors.length : 0;
    const features = Array.isArray(project.features) ? project.features.length : 0;
    const validationSteps = Array.isArray(project.validation_plan) ? project.validation_plan.length : 0;
    const hasMarketAnalysis = !!project.market_analysis;
    
    return { competitors, features, validationSteps, hasMarketAnalysis };
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your projects...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
              <p className="text-gray-600">
                {projects.length === 0 
                  ? 'Create your first project to get started' 
                  : `${projects.length} project${projects.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <Button
              onClick={handleCreateProject}
              disabled={isCreating}
              className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {isCreating ? 'Creating...' : 'New Project'}
            </Button>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first project to start building and validating your ideas.
              </p>
              <Button
                onClick={handleCreateProject}
                disabled={isCreating}
                className="gradient-bg border-none hover:opacity-90 button-transition"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const stats = getProjectStats(project);
                return (
                  <Card 
                    key={project.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate pr-2">
                            {project.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {new Date(project.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/project/${project.id}/edit`);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Project idea preview */}
                        {project.idea && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {project.idea}
                          </p>
                        )}
                        
                        {/* Project stats */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span>{stats.competitors} competitors</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckSquare className="h-3 w-3 text-gray-400" />
                            <span>{stats.features} features</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-gray-400" />
                            <span>{stats.validationSteps} validation steps</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant={stats.hasMarketAnalysis ? "default" : "secondary"} className="text-xs">
                              {stats.hasMarketAnalysis ? "Analyzed" : "No Analysis"}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Credits used */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-gray-500">Credits used:</span>
                          <Badge variant="outline" className="text-xs">
                            {project.credits_used || 0}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
