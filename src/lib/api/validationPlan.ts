
import { supabase } from '@/integrations/supabase/client';

export interface ValidationPlanResponse {
  validationPlan: string;
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
        validationPlan: '',
        success: false,
        error: error.message
      };
    }

    // Handle the response format - edge function returns validationSteps array
    if (data.validationSteps && Array.isArray(data.validationSteps)) {
      // Convert validation steps array to formatted string
      const formattedPlan = data.validationSteps.map((step: any, index: number) => 
        `Step ${index + 1}: ${step.title}\nGoal/Description: ${step.description}\nTool/Method: ${step.tool}\nPriority: ${step.priority}`
      ).join('\n\n');

      return {
        validationPlan: formattedPlan,
        success: true
      };
    }

    return {
      validationPlan: data.validationPlan || '',
      success: true
    };
  } catch (error) {
    console.error('Error generating validation plan:', error);
    return {
      validationPlan: '',
      success: false,
      error: 'Failed to generate validation plan'
    };
  }
};
