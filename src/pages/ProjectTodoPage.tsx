
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import PageLayout from '@/components/layout/PageLayout';
import TodoList from '@/components/todos/TodoList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, Home } from 'lucide-react';

const ProjectTodoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();

  const project = projects.find(p => p.id === id);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!id || !project) {
    return (
      <PageLayout>
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
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/project/${id}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Project
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900">Project Tasks</h1>
            <p className="text-gray-600 mt-2">
              Keep track of key actions and milestones for this project.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TodoList projectId={id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProjectTodoPage;
