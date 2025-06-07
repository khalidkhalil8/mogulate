
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { getUsageStatus } from "./usage";

const validTiers = ['free', 'starter', 'pro'];

export const updateSubscription = async (
  userId: string,
  newTier: string
): Promise<boolean> => {
  // Input validation
  if (!userId?.trim()) {
    toast.error("Invalid user ID");
    return false;
  }

  if (!newTier?.trim() || !validTiers.includes(newTier)) {
    toast.error("Invalid subscription tier", {
      description: `Tier must be one of: ${validTiers.join(', ')}`,
    });
    return false;
  }

  try {
    // Rate limiting check (simple implementation)
    const lastCall = localStorage.getItem('last_subscription_update');
    const now = Date.now();
    if (lastCall && (now - parseInt(lastCall)) < 5000) {
      toast.error("Please wait before making another subscription change");
      return false;
    }
    localStorage.setItem('last_subscription_update', now.toString());

    // 1) Get the current access token
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    if (!accessToken) {
      toast.error("You must be logged in to update your subscription");
      return false;
    }

    // 2) Invoke the `update-subscription` function with Authorization header
    const { data, error } = await supabase.functions.invoke("update-subscription", {
      method: "POST",
      body: JSON.stringify({ userId: userId.trim(), newTier: newTier.trim() }),
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (error) {
      console.error("Error calling update-subscription function:", error);
      toast.error("Subscription update failed", {
        description: error.message || "Network error occurred",
      });
      return false;
    }

    if (!data?.success) {
      console.error("Error from update-subscription function:", data?.error);
      toast.error("Subscription update failed", {
        description: data?.error || "An unexpected error occurred",
      });
      return false;
    }

    // 3) Get updated usage after subscription change
    try {
      await getUsageStatus(userId);
    } catch (usageError) {
      console.warn("Failed to update usage status:", usageError);
      // Don't fail the whole operation for this
    }

    toast.success(`Subscription updated`, {
      description: `Your ${newTier} plan is now active`,
    });

    return true;
  } catch (error) {
    console.error("Error updating subscription:", error);
    
    // More specific error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      toast.error("Network error", {
        description: "Please check your internet connection and try again",
      });
    } else {
      toast.error("Subscription update failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
    
    return false;
  }
};
