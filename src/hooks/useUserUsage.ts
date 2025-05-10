
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UsageData {
  usedCount: number;
  maxCount: number;
  nextResetDate: string | undefined;
}

export const useUserUsage = (userId: string | undefined, subscriptionStartedAt: string | null | undefined, subscriptionTier: string | null) => {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!userId || !subscriptionTier) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        let nextResetDate: Date | undefined;
        
        // Only calculate next reset date if we have a subscription start date
        if (subscriptionStartedAt) {
          const startDate = new Date(subscriptionStartedAt);
          nextResetDate = new Date(startDate);
          nextResetDate.setDate(nextResetDate.getDate() + 30);
        }
        
        // Count API usage since subscription started
        const { count, error: usageError } = await supabase
          .from("api_usage_logs")
          .select("*", { count: 'exact' })
          .eq("user_id", userId)
          .gte("timestamp", subscriptionStartedAt || '');
          
        if (usageError) {
          console.error("Error fetching API usage:", usageError);
          return;
        }

        // Get max usage based on subscription tier
        const tierLimits = {
          free: 5,
          starter: 20,
          pro: 100
        };
        
        const maxCount = tierLimits[subscriptionTier as keyof typeof tierLimits] || 0;
        
        setUsageData({
          usedCount: count || 0,
          maxCount,
          nextResetDate: nextResetDate?.toLocaleDateString()
        });
      } catch (error) {
        console.error("Error loading usage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageData();
  }, [userId, subscriptionStartedAt, subscriptionTier]);

  return { usageData, isLoading };
};
