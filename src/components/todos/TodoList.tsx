
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { useTodos } from '@/hooks/useTodos';
import { toast } from '@/components/ui/sonner';

interface TodoListProps {
  projectId: string;
}

const TodoList: React.FC<TodoListProps> = ({ projectId }) => {
  const { todos, isLoading, addTodo, updateTodo, deleteTodo } = useTodos(projectId);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [editingTodo, setEditingTodo] = useState<{ id: string; title: string } | null>(null);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const success = await addTodo(newTodoTitle);
    if (success) {
      setNewTodoTitle('');
      toast.success('Task added successfully');
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    const success = await updateTodo(id, { completed: !completed });
    if (success) {
      toast.success(completed ? 'Task marked as incomplete' : 'Task completed');
    }
  };

  const handleStartEdit = (id: string, title: string) => {
    setEditingTodo({ id, title });
  };

  const handleSaveEdit = async () => {
    if (!editingTodo || !editingTodo.title.trim()) return;

    const success = await updateTodo(editingTodo.id, { title: editingTodo.title.trim() });
    if (success) {
      setEditingTodo(null);
      toast.success('Task updated successfully');
    }
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  const handleDeleteTodo = async (id: string) => {
    const success = await deleteTodo(id);
    if (success) {
      toast.success('Task deleted successfully');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Todo Form */}
      <form onSubmit={handleAddTodo} className="flex gap-2">
        <Input
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1"
        />
        <Button type="submit" disabled={!newTodoTitle.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </form>

      {/* Todo List */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks yet. Add your first task above.
          </div>
        ) : (
          todos.map((todo) => (
            <Card key={todo.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleComplete(todo.id, todo.completed)}
                  />
                  
                  {editingTodo?.id === todo.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={editingTodo.title}
                        onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={!editingTodo.title.trim()}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span
                        className={`flex-1 ${
                          todo.completed
                            ? 'line-through text-gray-500'
                            : 'text-gray-900'
                        }`}
                      >
                        {todo.title}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(todo.id, todo.title)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;
