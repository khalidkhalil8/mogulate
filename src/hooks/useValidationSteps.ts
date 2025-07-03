
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface ValidationStep {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string | null;
  method: string | null;
  priority: 'High' | 'Medium' | 'Low';
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useValidationSteps = (projectId: string) => {
  const [validationSteps, setValidationSteps] = useState<ValidationStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchValidationSteps = async () => {
    if (!user?.id || !projectId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('validation_steps')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching validation steps:', error);
        toast.error('Failed to load validation steps');
        return;
      }

      setValidationSteps(data || []);
    } catch (error) {
      console.error('Error fetching validation steps:', error);
      toast.error('Failed to load validation steps');
    } finally {
      setIsLoading(false);
    }
  };

  const createValidationStep = async (step: Omit<ValidationStep, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      toast.error('You must be logged in to create validation steps');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('validation_steps')
        .insert({
          ...step,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating validation step:', error);
        toast.error('Failed to create validation step');
        return false;
      }

      setValidationSteps(prev => [...prev, data]);
      toast.success('Validation step created successfully');
      return true;
    } catch (error) {
      console.error('Error creating validation step:', error);
      toast.error('Failed to create validation step');
      return false;
    }
  };

  const updateValidationStep = async (id: string, updates: Partial<ValidationStep>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update validation steps');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('validation_steps')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating validation step:', error);
        toast.error('Failed to update validation step');
        return false;
      }

      setValidationSteps(prev => 
        prev.map(step => step.id === id ? data : step)
      );
      return true;
    } catch (error) {
      console.error('Error updating validation step:', error);
      toast.error('Failed to update validation step');
      return false;
    }
  };

  const deleteValidationStep = async (id: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to delete validation steps');
      return false;
    }

    try {
      const { error } = await supabase
        .from('validation_steps')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting validation step:', error);
        toast.error('Failed to delete validation step');
        return false;
      }

      setValidationSteps(prev => prev.filter(step => step.id !== id));
      toast.success('Validation step deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting validation step:', error);
      toast.error('Failed to delete validation step');
      return false;
    }
  };

  const toggleStepCompletion = async (id: string, is_completed: boolean) => {
    return await updateValidationStep(id, { is_completed });
  };

  useEffect(() => {
    fetchValidationSteps();
  }, [user?.id, projectId]);

  return {
    validationSteps,
    isLoading,
    createValidationStep,
    updateValidationStep,
    deleteValidationStep,
    toggleStepCompletion,
    refetchValidationSteps: fetchValidationSteps,
  };
};
