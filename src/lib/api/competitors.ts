
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Competitor, CompetitorDiscoveryResponse } from "../types";

export const findCompetitors = async (idea: string): Promise<Competitor[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('idea-analysis', {
      body: { 
        idea,
        action: 'discover-competitors'
      },
      method: 'POST'
    });

    if (error) {
      console.error('Error calling discover-competitors function:', error);
      toast.error('Failed to fetch competitors. Please try again.', {
        description: error.message
      });
      return [];
    }

    const response = data as CompetitorDiscoveryResponse;
    
    if (!response.success) {
      console.error('Error from discover-competitors function:', response.error);
      
      // Special handling for subscription limit errors
      if (response.error?.includes('limit reached')) {
        toast.error(`Monthly usage limit reached for your ${response.tier || 'current'} plan`, {
          description: 'Please upgrade your subscription to continue using this feature.'
        });
      } else {
        toast.error('Failed to fetch competitors. Please try again.', {
          description: response.error
        });
      }
      return [];
    }

    return response.competitors || [];
  } catch (error) {
    console.error('Error fetching competitors:', error);
    toast.error('Failed to fetch competitors. Please try again.', {
      description: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
};
