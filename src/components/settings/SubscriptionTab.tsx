
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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

  // Handle subscription changes with proper JWT token
  const handleSubscriptionChange = async (tier: string) => {
    if (!userId) {
      toast.error("Please login to change subscription");
      return;
    }

    // For free plan, update directly without going through Stripe
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
      return;
    }

    // For paid plans, handle Stripe checkout with proper JWT token
    try {
      // Get current session and access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      console.log('Stripe checkout - session check:', { 
        hasSession: !!session, 
        hasToken: !!accessToken,
        tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none'
      });

      if (!accessToken) {
        toast.error("Authentication required for subscription upgrade");
        return;
      }

      // Call create-checkout function with proper authorization
      console.log('Calling create-checkout function...');
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Create-checkout response:', { data, error });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast.error(`Checkout failed: ${error.message}`);
        return;
      }

      if (data?.url) {
        console.log('Opening Stripe checkout URL:', data.url);
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        console.error('No checkout URL received:', data);
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Unexpected error during checkout:', error);
      toast.error('Failed to initiate checkout process');
    }
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
        <CardContent className="pt-6">
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
