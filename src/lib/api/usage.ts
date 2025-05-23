
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface UsageStatus {
  tier: string;
  used: number;
  limit: number;
  remaining: number;
  nextReset: string;
}

export const getUsageStatus = async (
  userId: string
): Promise<UsageStatus | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-usage-status', {
      body: { userId },
      method: 'POST'
    });

    if (error) {
      console.error('Error calling get-usage-status function:', error);
      toast.error('Failed to fetch usage data', {
        description: error.message
      });
      return null;
    }

    if (!data.success) {
      console.error('Error from get-usage-status function:', data.error);
      toast.error('Failed to fetch usage data', {
        description: data.error || 'An unexpected error occurred'
      });
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('Error getting usage status:', error);
    toast.error('Failed to fetch usage data', {
      description: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
};
