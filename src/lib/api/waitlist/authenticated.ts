
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import type { FeatureWaitlist } from "./types";

/**
 * Joins the unified feature waitlist for authenticated users
 */
export const joinFeatureWaitlist = async (): Promise<boolean> => {
  try {
    // Get the current user's ID first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Authentication required', {
        description: 'You must be logged in to join the waitlist'
      });
      return false;
    }

    // Check if user is already on the waitlist using the new view
    const { data: existingEntry, error: checkError } = await supabase
      .from('feature_waitlists_with_emails')
      .select('id')
      .eq('user_id', user.id)
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

    // Add user to waitlist with their email from auth
    const { error } = await supabase
      .from('feature_waitlists')
      .insert({ 
        user_id: user.id,
        email: user.email // Store the user's email directly
      });

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('feature_waitlists_with_emails')
      .select('id')
      .eq('user_id', user.id)
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('feature_waitlists_with_emails')
      .select('id, user_id, email, joined_at, user_type')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user waitlist:', error);
      return null;
    }

    // If no data is found, return null
    if (!data) {
      return null;
    }

    return data as FeatureWaitlist;
  } catch (error) {
    console.error('Error fetching user waitlist:', error);
    return null;
  }
};
