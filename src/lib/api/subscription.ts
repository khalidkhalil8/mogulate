
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { getUsageStatus } from "./usage";

export const updateSubscription = async (
  userId: string,
  newTier: string
): Promise<boolean> => {
  try {
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
      body: JSON.stringify({ userId, newTier }),
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (error) {
      console.error("Error calling update-subscription function:", error);
      toast.error("Subscription update failed", {
        description: error.message,
      });
      return false;
    }

    if (!data.success) {
      console.error("Error from update-subscription function:", data.error);
      toast.error("Subscription update failed", {
        description: data.error || "An unexpected error occurred",
      });
      return false;
    }

    // 3) Get updated usage after subscription change
    await getUsageStatus(userId);

    toast.success(`Subscription updated`, {
      description: `Your ${newTier} plan is now active`,
    });

    return true;
  } catch (error) {
    console.error("Error updating subscription:", error);
    toast.error("Subscription update failed", {
      description: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
};
