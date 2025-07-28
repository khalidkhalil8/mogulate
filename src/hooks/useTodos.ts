
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export const useTodos = (projectId: string) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchTodos = async () => {
    if (!user?.id || !projectId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('todo_items')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching todos:', error);
        toast.error('Failed to load tasks');
        return;
      }

      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (title: string) => {
    if (!user?.id || !title.trim()) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('todo_items')
        .insert({
          title: title.trim(),
          project_id: projectId,
          user_id: user.id,
        });

      if (error) {
        console.error('Error adding todo:', error);
        toast.error('Failed to add task');
        return false;
      }

      await fetchTodos();
      return true;
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Failed to add task');
      return false;
    }
  };

  const updateTodo = async (id: string, updates: Partial<Pick<TodoItem, 'title' | 'completed'>>) => {
    if (!user?.id) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('todo_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating todo:', error);
        toast.error('Failed to update task');
        return false;
      }

      await fetchTodos();
      return true;
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error('Failed to update task');
      return false;
    }
  };

  const deleteTodo = async (id: string) => {
    if (!user?.id) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('todo_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting todo:', error);
        toast.error('Failed to delete task');
        return false;
      }

      await fetchTodos();
      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete task');
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
    deleteTodo,
    refetchTodos: fetchTodos,
  };
};
