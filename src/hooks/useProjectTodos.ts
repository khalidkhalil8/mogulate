import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useProjectTodos = (projectId: string) => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTodos = async () => {
    if (!user?.id || !projectId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('todo_items')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching todos:', error);
        toast.error('Failed to load todos');
        return;
      }

      setTodos(data || []);
    } catch (error) {
      console.error('Error in fetchTodos:', error);
      toast.error('Failed to load todos');
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (title: string) => {
    if (!user?.id || !projectId || !title.trim()) return false;

    try {
      const { data, error } = await supabase
        .from('todo_items')
        .insert({
          project_id: projectId,
          user_id: user.id,
          title: title.trim(),
          completed: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding todo:', error);
        toast.error('Failed to add todo');
        return false;
      }

      setTodos(prev => [data, ...prev]);
      toast.success('Todo added successfully');
      return true;
    } catch (error) {
      console.error('Error in addTodo:', error);
      toast.error('Failed to add todo');
      return false;
    }
  };

  const updateTodo = async (todoId: string, updates: { title?: string; completed?: boolean }) => {
    if (!user?.id || !projectId) return false;

    try {
      const { error } = await supabase
        .from('todo_items')
        .update(updates)
        .eq('id', todoId)
        .eq('user_id', user.id)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error updating todo:', error);
        toast.error('Failed to update todo');
        return false;
      }

      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? { ...todo, ...updates } : todo
      ));
      
      if (updates.completed !== undefined) {
        toast.success(updates.completed ? 'Todo completed!' : 'Todo reopened');
      } else {
        toast.success('Todo updated successfully');
      }
      return true;
    } catch (error) {
      console.error('Error in updateTodo:', error);
      toast.error('Failed to update todo');
      return false;
    }
  };

  const removeTodo = async (todoId: string) => {
    if (!user?.id || !projectId) return false;

    try {
      const { error } = await supabase
        .from('todo_items')
        .delete()
        .eq('id', todoId)
        .eq('user_id', user.id)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error removing todo:', error);
        toast.error('Failed to remove todo');
        return false;
      }

      setTodos(prev => prev.filter(todo => todo.id !== todoId));
      toast.success('Todo removed successfully');
      return true;
    } catch (error) {
      console.error('Error in removeTodo:', error);
      toast.error('Failed to remove todo');
      return false;
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [user?.id, projectId]);

  return {
    todos,
    isLoading,
    addTodo,
    updateTodo,
    removeTodo,
    refetchTodos: fetchTodos,
  };
};