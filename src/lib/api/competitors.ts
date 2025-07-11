
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

    const { data, error } = await supabase.functions.invoke('market-insights', {
      body: {
        idea
      }
    });

    if (error) {
      console.error('Error calling market-insights function:', error);
      toast.error("Failed to fetch competitors", {
        description: error.message || "Unknown error occurred",
      });
      return { competitors: [] };
    }

    if (!data.success) {
      toast.error("Failed to fetch competitors", {
        description: data.error || "Unknown error occurred",
      });
      return { competitors: [] };
    }

    return { 
      competitors: data.competitors || [] 
    };
  } catch (error) {
    console.error("Error fetching competitors:", error);
    toast.error("Failed to fetch competitors", {
      description: "An unexpected error occurred",
    });
    return { competitors: [] };
  }
}
