
import { supabase } from "@/integrations/supabase/client";
import type { Competitor, CompetitorDiscoveryResponse } from "../types";
import { toast } from "@/components/ui/sonner";

export async function fetchCompetitors(idea: string): Promise<{ 
  competitors: Competitor[], 
  tier?: string, 
  remainingUsage?: number,
  nextReset?: string 
}> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    if (!token) {
      toast.error("Authentication required", {
        description: "Please sign in to use this feature.",
      });
      return { competitors: [] };
    }

    const response = await fetch(
      `https://thpsoempfyxnjhaflyha.supabase.co/functions/v1/idea-analysis`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idea,
          action: "discover-competitors",
        }),
      }
    );

    const data: CompetitorDiscoveryResponse = await response.json();

    if (!data.success) {
      // Handle subscription limit error specifically
      if (data.error && data.error.includes("monthly limit")) {
        toast.error("Subscription Limit Reached", {
          description: data.error,
          duration: 6000,
        });
      } else {
        toast.error("Failed to fetch competitors", {
          description: data.error || "Unknown error occurred",
        });
      }
      return { 
        competitors: [], 
        tier: data.tier, 
        remainingUsage: data.remainingUsage,
        nextReset: data.nextReset
      };
    }

    // Show remaining usage as toast if less than 20% of limit remains
    const tierLimit = data.tier === 'free' ? 5 : data.tier === 'starter' ? 20 : 100;
    const remainingPercentage = (data.remainingUsage || 0) / tierLimit;
    
    if (remainingPercentage <= 0.2 && remainingPercentage > 0) {
      toast.warning("Usage limit approaching", {
        description: `You have ${data.remainingUsage} API calls remaining this cycle.`,
      });
    }

    return { 
      competitors: data.competitors, 
      tier: data.tier, 
      remainingUsage: data.remainingUsage,
      nextReset: data.nextReset
    };
  } catch (error) {
    console.error("Error fetching competitors:", error);
    toast.error("Failed to fetch competitors", {
      description: "An unexpected error occurred",
    });
    return { competitors: [] };
  }
}
