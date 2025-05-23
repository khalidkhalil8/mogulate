
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export interface FeatureWaitlist {
  id: string;
  user_id: string;
  joined_at: string;
}

/**
 * Joins the unified feature waitlist
 */
export const joinFeatureWaitlist = async (): Promise<boolean> => {
  try {
    const { data: existingEntry, error: checkError } = await supabase
      .from('feature_waitlists')
      .select('id')
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking waitlist entry:', checkError);
      return false;
    }

    // If user is already in the waitlist, return true
    if (existingEntry) {
      toast.info('Already on waitlist', {
        description: `You're already on the waitlist for upcoming features`
      });
      return true;
    }

    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Authentication required', {
        description: 'You must be logged in to join the waitlist'
      });
      return false;
    }

    const { error } = await supabase
      .from('feature_waitlists')
      .insert({ user_id: user.id });

    if (error) {
      console.error('Error joining waitlist:', error);
      toast.error('Could not join waitlist', {
        description: error.message
      });
      return false;
    }

    toast.success('Joined waitlist', {
      description: `You've been added to the waitlist for upcoming features`
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
 * Leaves the feature waitlist
 */
export const leaveFeatureWaitlist = async (): Promise<boolean> => {
  try {
    // Get the current user's ID first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Authentication required', {
        description: 'You must be logged in to leave the waitlist'
      });
      return false;
    }
    
    // Then use the user ID in the delete query
    const { error } = await supabase
      .from('feature_waitlists')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error leaving waitlist:', error);
      toast.error('Could not leave waitlist', {
        description: error.message
      });
      return false;
    }

    toast.success('Left waitlist', {
      description: `You've been removed from the features waitlist`
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
 * Checks if the user is on the feature waitlist
 */
export const isOnFeatureWaitlist = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('feature_waitlists')
      .select('id')
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
 * Gets the user's waitlist entry if they are on it
 */
export const getUserWaitlistEntry = async (): Promise<FeatureWaitlist | null> => {
  try {
    const { data, error } = await supabase
      .from('feature_waitlists')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching user waitlist:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user waitlist:', error);
    return null;
  }
};
