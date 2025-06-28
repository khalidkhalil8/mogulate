
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import TodoList from '@/components/todos/TodoList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ProjectTodoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <PageLayout>
        <div className="p-6">
          <div className="text-center text-red-600">
            Project ID not found
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
            
            <h1 className="text-3xl font-bold text-gray-900">Project Todo List</h1>
            <p className="text-gray-600 mt-2">
              Keep track of tasks and action items for your project
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
