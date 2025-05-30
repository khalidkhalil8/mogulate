
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SubscriptionDetails from "@/components/settings/SubscriptionDetails";
import UsageProgress from "@/components/settings/UsageProgress";
import SubscriptionPicker from "@/components/settings/SubscriptionPicker";
import SubscriptionManagement from "@/components/settings/SubscriptionManagement";
import { UsageStatus } from "@/lib/api/usage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface SubscriptionTabProps {
  usageData: UsageStatus | null;
  isUsageLoading: boolean;
  userSubscriptionTier?: string;
  isUpdatingSubscription: boolean;
  isCheckingSubscription: boolean;
  userId?: string;
  onChangeSubscription: (tier: string) => Promise<void>;
  onRefreshStatus: () => Promise<void>;
}

const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
  usageData,
  isUsageLoading,
  userSubscriptionTier,
  isUpdatingSubscription,
  isCheckingSubscription,
  userId,
  onChangeSubscription,
  onRefreshStatus
}) => {
  // Show alert if user has downgraded and now exceeds their plan limit
  const showAlert = usageData ? usageData.used > usageData.limit : false;

  // Handle subscription changes without usage tracking
  const handleSubscriptionChange = async (tier: string) => {
    if (!userId) {
      toast.error("Please login to change subscription");
      return;
    }

    // For free plan, update directly without going through the usage-tracking update function
    if (tier.toLowerCase() === "free") {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_tier: 'free',
            subscription_started_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating to free plan:', error);
          toast.error('Failed to switch to free plan');
          return;
        }

        toast.success("Successfully switched to Free plan");
        // Refresh the usage data after subscription change
        await onRefreshStatus();
      } catch (error) {
        console.error('Unexpected error switching to free plan:', error);
        toast.error('Failed to switch to free plan');
      }
    }
    // For paid plans, the components will handle Stripe checkout
  };

  return (
    <div className="space-y-6">
      <SubscriptionDetails 
        subscriptionTier={usageData?.tier || userSubscriptionTier || 'free'} 
        usageData={usageData}
        isLoading={isUsageLoading}
      />
      
      {usageData && !isUsageLoading && (
        <UsageProgress 
          usedCount={usageData.used}
          maxCount={usageData.limit}
          showAlert={showAlert}
        />
      )}

      <SubscriptionManagement
        userSubscriptionTier={userSubscriptionTier}
        onRefreshStatus={onRefreshStatus}
        isCheckingSubscription={isCheckingSubscription}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Upgrade Your Plan</CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionPicker 
            currentTier={usageData?.tier || userSubscriptionTier || 'free'}
            isUpdating={isUpdatingSubscription}
            userId={userId}
            onChangeSubscription={handleSubscriptionChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionTab;
