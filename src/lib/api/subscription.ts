
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const updateSubscription = async (
  userId: string,
  newTier: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('update-subscription', {
      body: { 
        userId,
        newTier
      },
      method: 'POST'
    });

    if (error) {
      console.error('Error calling update-subscription function:', error);
      toast.error('Failed to update subscription. Please try again.', {
        description: error.message
      });
      return false;
    }

    if (!data.success) {
      console.error('Error from update-subscription function:', data.error);
      toast.error('Failed to update subscription. Please try again.', {
        description: data.error || 'An unexpected error occurred'
      });
      return false;
    }

    toast.success(`Subscription updated to ${newTier} successfully`, {
      description: "Your new subscription benefits are now active"
    });
    
    return true;
  } catch (error) {
    console.error('Error updating subscription:', error);
    toast.error('Failed to update subscription. Please try again.', {
      description: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
};
