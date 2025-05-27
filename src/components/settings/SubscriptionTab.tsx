
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SubscriptionDetails from "@/components/settings/SubscriptionDetails";
import UsageProgress from "@/components/settings/UsageProgress";
import SubscriptionPicker from "@/components/settings/SubscriptionPicker";
import SubscriptionManagement from "@/components/settings/SubscriptionManagement";
import { UsageStatus } from "@/lib/api/usage";

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
            onChangeSubscription={onChangeSubscription}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionTab;
