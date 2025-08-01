
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface ValidationStep {
  title: string;
  goal: string;
  method: string;
  priority: 'High' | 'Medium' | 'Low';
  isDone: boolean;
}

export const useProjectValidationPlan = (projectId: string) => {
  const [validationPlan, setValidationPlan] = useState<ValidationStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchValidationPlan = async () => {
    if (!user?.id || !projectId) {
      setIsLoading(false);
      return;
    }

    try {
      // First try to get from normalized table
      const { data: normalizedData, error: normalizedError } = await supabase
        .from('project_validation_steps')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (normalizedError) {
        console.error('Error fetching validation steps from normalized table:', normalizedError);
        toast.error('Failed to load validation plan');
        return;
      }

      // Convert normalized data to ValidationStep format
      if (normalizedData && normalizedData.length > 0) {
        const validationSteps: ValidationStep[] = normalizedData.map(step => ({
          title: step.title,
          goal: step.goal || '',
          method: step.method || '',
          priority: step.priority as 'High' | 'Medium' | 'Low',
          isDone: step.is_done || false,
        }));
        setValidationPlan(validationSteps);
        return;
      }

      // Fallback: Check if data exists in JSONB format (legacy)
      const { data: legacyData, error: legacyError } = await supabase
        .from('projects')
        .select('validation_plan')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (legacyError) {
        console.error('Error fetching legacy validation plan:', legacyError);
        setValidationPlan([]);
        return;
      }

      // Parse legacy JSONB data
      const planData = legacyData?.validation_plan;
      if (Array.isArray(planData)) {
        setValidationPlan(planData as unknown as ValidationStep[]);
      } else {
        setValidationPlan([]);
      }
    } catch (error) {
      console.error('Error fetching validation plan:', error);
      toast.error('Failed to load validation plan');
    } finally {
      setIsLoading(false);
    }
  };

  const updateValidationPlan = async (plan: ValidationStep[]) => {
    if (!user?.id) {
      toast.error('You must be logged in to update validation plan');
      return false;
    }

    try {
      // Clear existing steps first
      await supabase
        .from('project_validation_steps')
        .delete()
        .eq('project_id', projectId);

      // Insert new steps
      if (plan.length > 0) {
        const { error } = await supabase
          .from('project_validation_steps')
          .insert(
            plan.map(step => ({
              project_id: projectId,
              title: step.title,
              goal: step.goal || '',
              method: step.method || '',
              priority: step.priority,
              is_done: step.isDone || false,
              is_ai_generated: false,
            }))
          );

        if (error) {
          console.error('Error updating validation plan:', error);
          toast.error('Failed to update validation plan');
          return false;
        }
      }

      setValidationPlan(plan);
      toast.success('Validation plan updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating validation plan:', error);
      toast.error('Failed to update validation plan');
      return false;
    }
  };

  const addValidationStep = async (step: ValidationStep) => {
    if (!user?.id) {
      toast.error('You must be logged in to add validation steps');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('project_validation_steps')
        .insert({
          project_id: projectId,
          title: step.title,
          goal: step.goal || '',
          method: step.method || '',
          priority: step.priority,
          is_done: step.isDone || false,
          is_ai_generated: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding validation step:', error);
        toast.error('Failed to add validation step');
        return false;
      }

      const newStep: ValidationStep = {
        title: data.title,
        goal: data.goal || '',
        method: data.method || '',
        priority: data.priority as 'High' | 'Medium' | 'Low',
        isDone: data.is_done || false,
      };

      setValidationPlan(prev => [...prev, newStep]);
      toast.success('Validation step added successfully');
      return true;
    } catch (error) {
      console.error('Error adding validation step:', error);
      toast.error('Failed to add validation step');
      return false;
    }
  };

  const updateValidationStep = async (stepIndex: number, updates: Partial<ValidationStep>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update validation steps');
      return false;
    }

    const currentPlan = [...validationPlan];
    const updatedStep = { ...currentPlan[stepIndex], ...updates };
    currentPlan[stepIndex] = updatedStep;

    return updateValidationPlan(currentPlan);
  };

  useEffect(() => {
    fetchValidationPlan();
  }, [user?.id, projectId]);

  return {
    validationPlan,
    isLoading,
    updateValidationPlan,
    addValidationStep,
    updateValidationStep,
    refetchValidationPlan: fetchValidationPlan,
  };
};
