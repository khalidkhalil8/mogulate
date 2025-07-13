
import { supabase } from '@/integrations/supabase/client';

export interface ValidationStep {
  title: string;
  goal: string;
  method: string;
  priority: 'High' | 'Medium' | 'Low';
  isDone: boolean;
}

export interface ValidationPlanResponse {
  validationPlan: ValidationStep[];
  success: boolean;
  error?: string;
}

export const generateValidationPlan = async (
  idea: string,
  positioningSuggestion: string,
  competitors: any[],
  features: any[]
): Promise<ValidationPlanResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-validation-plan', {
      body: {
        idea,
        positioningSuggestion,
        competitors,
        features
      }
    });

    if (error) {
      console.error('Error generating validation plan:', error);
    return {
      validationPlan: [],
      success: false,
      error: error.message
    };
    }

    // Handle the response format - edge function returns validationSteps array
    if (data.validationSteps && Array.isArray(data.validationSteps)) {
      const steps: ValidationStep[] = data.validationSteps.map((step: any) => ({
        title: step.title || '',
        goal: step.description || '',
        method: step.tool || '',
        priority: step.priority || 'Medium',
        isDone: false
      }));

      return {
        validationPlan: steps,
        success: true
      };
    }

    return {
      validationPlan: data.validationPlan || [],
      success: true
    };
  } catch (error) {
    console.error('Error generating validation plan:', error);
    return {
      validationPlan: [],
      success: false,
      error: 'Failed to generate validation plan'
    };
  }
};
