
import { supabase } from "@/integrations/supabase/client";
import type { Competitor, MarketGapAnalysisResponse, MarketGapAnalysis } from "../types";
import { toast } from "@/components/ui/sonner";

export async function analyzeMarketGaps(idea: string, competitors: Competitor[]): Promise<{ 
  analysis: MarketGapAnalysis | null, 
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
      return { analysis: null };
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
          competitors,
          action: "analyze-market-gaps",
        }),
      }
    );

    const data: MarketGapAnalysisResponse = await response.json();

    if (!data.success) {
      // Handle subscription limit error specifically
      if (data.error && data.error.includes("monthly limit")) {
        toast.error("Subscription Limit Reached", {
          description: data.error,
          duration: 6000,
        });
      } else {
        toast.error("Failed to analyze market gaps", {
          description: data.error || "Unknown error occurred",
        });
      }
      return { 
        analysis: null, 
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
      analysis: data.analysis, 
      tier: data.tier, 
      remainingUsage: data.remainingUsage,
      nextReset: data.nextReset
    };
  } catch (error) {
    console.error("Error analyzing market gaps:", error);
    toast.error("Failed to analyze market gaps", {
      description: "An unexpected error occurred",
    });
    return { analysis: null };
  }
}
