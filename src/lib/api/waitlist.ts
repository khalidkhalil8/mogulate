
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export interface FeatureWaitlist {
  id: string;
  user_id: string;
  feature_name: string;
  joined_at: string;
}

/**
 * Joins a feature waitlist
 */
export const joinFeatureWaitlist = async (
  featureName: string
): Promise<boolean> => {
  try {
    const { data: existingEntry, error: checkError } = await supabase
      .from('feature_waitlists')
      .select('id')
      .eq('feature_name', featureName)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking waitlist entry:', checkError);
      return false;
    }

    // If user is already in the waitlist, return true
    if (existingEntry) {
      toast.info('Already on waitlist', {
        description: `You're already on the waitlist for this feature`
      });
      return true;
    }

    // Get the current user's ID - fix: need to provide user_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Authentication required', {
        description: 'You must be logged in to join a waitlist'
      });
      return false;
    }

    const { error } = await supabase
      .from('feature_waitlists')
      .insert({ 
        feature_name: featureName,
        user_id: user.id 
      });

    if (error) {
      console.error('Error joining waitlist:', error);
      toast.error('Could not join waitlist', {
        description: error.message
      });
      return false;
    }

    toast.success('Joined waitlist', {
      description: `You've been added to the ${featureName} waitlist`
    });
    return true;
  } catch (error) {
    console.error('Error joining waitlist:', error);
    toast.error('Could not join waitlist', {
      description: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
    return false;
  }
};

/**
 * Leaves a feature waitlist
 */
export const leaveFeatureWaitlist = async (
  featureName: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('feature_waitlists')
      .delete()
      .eq('feature_name', featureName);

    if (error) {
      console.error('Error leaving waitlist:', error);
      toast.error('Could not leave waitlist', {
        description: error.message
      });
      return false;
    }

    toast.success('Left waitlist', {
      description: `You've been removed from the ${featureName} waitlist`
    });
    return true;
  } catch (error) {
    console.error('Error leaving waitlist:', error);
    toast.error('Could not leave waitlist', {
      description: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
    return false;
  }
};

/**
 * Checks if the user is on a specific feature waitlist
 */
export const isOnFeatureWaitlist = async (
  featureName: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('feature_waitlists')
      .select('id')
      .eq('feature_name', featureName)
      .maybeSingle();

    if (error) {
      console.error('Error checking waitlist status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking waitlist status:', error);
    return false;
  }
};

/**
 * Gets all feature waitlists for the current user
 */
export const getUserWaitlists = async (): Promise<FeatureWaitlist[]> => {
  try {
    const { data, error } = await supabase
      .from('feature_waitlists')
      .select('*');

    if (error) {
      console.error('Error fetching user waitlists:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user waitlists:', error);
    return [];
  }
};
