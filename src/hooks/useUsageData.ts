
import { useEffect, useState, useCallback } from "react";
import { getUsageStatus, UsageStatus } from "@/lib/api/usage";

export const useUsageData = (userId: string | undefined) => {
  const [usageData, setUsageData] = useState<UsageStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Set to false since we're not loading

  const fetchUsageData = useCallback(async () => {
    // Temporarily disabled - return early to prevent API calls
    console.log('Usage data fetching temporarily disabled');
    return;
    
    // Original code commented out but kept for easy re-enabling
    /*
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const data = await getUsageStatus(userId);
      if (data) {
        setUsageData(data);
      }
    } catch (error) {
      console.error("Error loading usage data:", error);
    } finally {
      setIsLoading(false);
    }
    */
  }, [userId]);

  // Don't fetch usage data on mount - temporarily disabled
  useEffect(() => {
    // fetchUsageData(); // Commented out to disable fetching
  }, [fetchUsageData]);

  return { usageData, isLoading, refetchUsage: fetchUsageData };
};
