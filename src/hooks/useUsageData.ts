
import { useEffect, useState, useCallback } from "react";
import { getUsageStatus, UsageStatus } from "@/lib/api/usage";

export const useUsageData = (userId: string | undefined) => {
  const [usageData, setUsageData] = useState<UsageStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsageData = useCallback(async () => {
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
  }, [userId]);

  // Fetch usage data on mount and when userId changes
  useEffect(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  return { usageData, isLoading, refetchUsage: fetchUsageData };
};
