
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useTodos, TodoItem } from '@/hooks/useTodos';
import { Plus, Trash2, Check, X } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface TodoListProps {
  projectId: string;
}

const TodoList: React.FC<TodoListProps> = ({ projectId }) => {
  const { todos, isLoading, addTodo, updateTodo, deleteTodo } = useTodos(projectId);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      const success = await addTodo(newTodoTitle);
      if (success) {
        setNewTodoTitle('');
      }
    }
  };

  const handleToggleComplete = async (todo: TodoItem) => {
    await updateTodo(todo.id, { completed: !todo.completed });
  };

  const handleStartEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  const handleSaveEdit = async () => {
    if (editingId && editingTitle.trim()) {
      const success = await updateTodo(editingId, { title: editingTitle.trim() });
      if (success) {
        setEditingId(null);
        setEditingTitle('');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteTodo(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add new todo form */}
      <form onSubmit={handleAddTodo} className="flex gap-2">
        <Input
          ref={inputRef}
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1"
        />
        <Button type="submit" disabled={!newTodoTitle.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* Todo list */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No todos yet. Add one above to get started!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => handleToggleComplete(todo)}
                className="flex-shrink-0"
              />
              
              {editingId === todo.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    ref={editInputRef}
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit();
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveEdit}
                    disabled={!editingTitle.trim()}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span
                    className={`flex-1 cursor-pointer ${
                      todo.completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-900'
                    }`}
                    onClick={() => handleStartEdit(todo)}
                  >
                    {todo.title}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {todos.length > 0 && (
        <div className="text-sm text-gray-500 pt-2 border-t">
          {todos.filter(t => t.completed).length} of {todos.length} completed
        </div>
      )}
    </div>
  );
};

export default TodoList;
