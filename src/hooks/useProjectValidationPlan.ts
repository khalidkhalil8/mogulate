
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
      const { data, error } = await supabase
        .from('projects')
        .select('validation_plan')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching validation plan:', error);
        toast.error('Failed to load validation plan');
        return;
      }

      const planData = data?.validation_plan;
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
      const { error } = await supabase
        .from('projects')
        .update({
          validation_plan: plan as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating validation plan:', error);
        toast.error('Failed to update validation plan');
        return false;
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

  useEffect(() => {
    fetchValidationPlan();
  }, [user?.id, projectId]);

  return {
    validationPlan,
    isLoading,
    updateValidationPlan,
    refetchValidationPlan: fetchValidationPlan,
  };
};
