
import { supabase } from '@/integrations/supabase/client';

export interface ValidationPlanResponse {
  validationPlan: string;
  success: boolean;
  error?: string;
}

export const generateValidationPlan = async (
  idea: string,
  selectedMarketGap: string,
  competitors: any[],
  features: any[]
): Promise<ValidationPlanResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-validation-plan', {
      body: {
        idea,
        selectedMarketGap,
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
