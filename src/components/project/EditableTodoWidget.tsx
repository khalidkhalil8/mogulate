import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListTodo } from 'lucide-react';
import { useProjectTodos } from '@/hooks/useProjectTodos';

interface EditableTodoWidgetProps {
  projectId: string;
}

const EditableTodoWidget: React.FC<EditableTodoWidgetProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const { todos, isLoading } = useProjectTodos(projectId);

  const pendingTodos = todos.filter(todo => !todo.completed);

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListTodo className="h-5 w-5" />
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ListTodo className="h-5 w-5" />
          Tasks ({todos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant="secondary">No Tasks</Badge>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending:</span>
                <Badge variant="outline">{pendingTodos.length}</Badge>
              </div>
              {pendingTodos.length > 0 && (
                <p className="text-sm text-gray-600">
                  {pendingTodos.length} pending task{pendingTodos.length !== 1 ? 's' : ''}
                </p>
              )}
            </>
          )}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/project/${projectId}/todos`)}
              className="flex-1"
            >
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditableTodoWidget;