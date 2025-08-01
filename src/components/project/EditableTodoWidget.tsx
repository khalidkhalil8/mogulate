import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ListTodo, Plus, Edit, Trash2 } from 'lucide-react';
import { useProjectTodos, type Todo } from '@/hooks/useProjectTodos';
import TodoEditDialog from './TodoEditDialog';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

interface EditableTodoWidgetProps {
  projectId: string;
}

const EditableTodoWidget: React.FC<EditableTodoWidgetProps> = ({ projectId }) => {
  const { todos, isLoading, addTodo, updateTodo, removeTodo } = useProjectTodos(projectId);
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; todo?: Todo }>({ isOpen: false });
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; todo?: Todo }>({ isOpen: false });

  const toggleTodoCompletion = async (todo: Todo) => {
    await updateTodo(todo.id, { completed: !todo.completed });
  };

  const handleSaveTodo = async (title: string) => {
    if (editDialog.todo) {
      return await updateTodo(editDialog.todo.id, { title });
    } else {
      return await addTodo(title);
    }
  };

  const handleDeleteTodo = async () => {
    if (!deleteDialog.todo) return;
    const success = await removeTodo(deleteDialog.todo.id);
    if (success) {
      setDeleteDialog({ isOpen: false });
    }
  };

  const completedTodos = todos.filter(todo => todo.completed);
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
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListTodo className="h-5 w-5" />
              Tasks ({todos.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialog({ isOpen: true })}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {todos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No tasks yet. Click "Add" to create your first task.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Pending Tasks */}
              {pendingTodos.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Pending ({pendingTodos.length})</h4>
                  <div className="space-y-2">
                    {pendingTodos.map((todo) => (
                      <div key={todo.id} className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodoCompletion(todo)}
                        />
                        <span className="flex-1 text-sm">{todo.title}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditDialog({ isOpen: true, todo })}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ isOpen: true, todo })}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Tasks */}
              {completedTodos.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Completed ({completedTodos.length})</h4>
                  <div className="space-y-2">
                    {completedTodos.map((todo) => (
                      <div key={todo.id} className="flex items-center gap-3 p-2 bg-green-50 border border-green-200 rounded-lg opacity-75">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodoCompletion(todo)}
                        />
                        <span className="flex-1 text-sm line-through text-gray-600">{todo.title}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditDialog({ isOpen: true, todo })}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ isOpen: true, todo })}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <TodoEditDialog
        isOpen={editDialog.isOpen}
        onOpenChange={(open) => setEditDialog({ isOpen: open })}
        onSave={handleSaveTodo}
        todo={editDialog.todo}
      />

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Task"
        description={`Are you sure you want to delete "${deleteDialog.todo?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteTodo}
        onCancel={() => setDeleteDialog({ isOpen: false })}
        variant="destructive"
        confirmText="Delete"
      />
    </>
  );
};

export default EditableTodoWidget;