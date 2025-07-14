
import { supabase } from "@/integrations/supabase/client";
import type { Competitor, CompetitorDiscoveryResponse } from "../types";
import { toast } from "@/components/ui/sonner";

export async function fetchCompetitors(idea: string): Promise<{ 
  competitors: Competitor[], 
  tier?: string, 
  remainingUsage?: number,
  nextReset?: string 
}> {
  console.log('fetchCompetitors: Starting request for idea:', idea.substring(0, 100) + '...');
  
  try {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    if (!token) {
      console.error('fetchCompetitors: No authentication token found');
      toast.error("Authentication required", {
        description: "Please sign in to use this feature.",
      });
      return { competitors: [] };
    }

    console.log('fetchCompetitors: Making request to market-insights function');
    
    const { data, error } = await supabase.functions.invoke('market-insights', {
      body: { idea }
    });

    console.log('fetchCompetitors: Function response received', {
      hasData: !!data,
      hasError: !!error,
      dataKeys: data ? Object.keys(data) : []
    });

    if (error) {
      console.error('fetchCompetitors: Supabase function error:', error);
      toast.error("Failed to fetch competitors", {
        description: error.message || "Unknown error occurred",
      });
      return { competitors: [] };
    }

    if (!data) {
      console.error('fetchCompetitors: No data returned from function');
      toast.error("Failed to fetch competitors", {
        description: "No response from server",
      });
      return { competitors: [] };
    }

    if (!data.success) {
      console.error('fetchCompetitors: Function returned error:', data.error);
      toast.error("Failed to fetch competitors", {
        description: data.error || "Unknown error occurred",
      });
      return { competitors: [] };
    }

    const competitors = data.competitors || [];
    console.log('fetchCompetitors: Successfully retrieved competitors:', competitors.length);
    
    return { competitors };
    
  } catch (error) {
    console.error("fetchCompetitors: Unexpected error:", error);
    toast.error("Failed to fetch competitors", {
      description: "An unexpected error occurred. Please check your connection and try again.",
    });
    return { competitors: [] };
  }
}
