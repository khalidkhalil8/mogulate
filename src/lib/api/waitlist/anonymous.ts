
import { toast } from "@/components/ui/sonner";

/**
 * Joins anonymous waitlist via Edge Function
 */
export const joinAnonymousWaitlist = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch('/functions/v1/join-anonymous-waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      toast.error('Could not join waitlist', {
        description: result.error || 'An unexpected error occurred'
      });
      return false;
    }

    if (result.alreadyJoined) {
      toast.info('Already on waitlist', {
        description: 'This email is already on the waitlist for upcoming features'
      });
    } else {
      toast.success('Joined waitlist', {
        description: "You've been added to the waitlist for upcoming features"
      });
    }

    return true;
  } catch (error) {
    console.error('Error joining anonymous waitlist:', error);
    toast.error('Could not join waitlist', {
      description: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
    return false;
  }
};
