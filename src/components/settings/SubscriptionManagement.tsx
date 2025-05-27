
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface SubscriptionManagementProps {
  userSubscriptionTier?: string;
  onRefreshStatus: () => Promise<void>;
  isCheckingSubscription: boolean;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  userSubscriptionTier,
  onRefreshStatus,
  isCheckingSubscription
}) => {
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);

  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open Stripe customer portal in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error) {
      toast.error("Failed to open subscription management");
      console.error("Error opening customer portal:", error);
    } finally {
      setIsManagingSubscription(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>
          Manage your subscription and billing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button
            onClick={onRefreshStatus}
            disabled={isCheckingSubscription}
            variant="outline"
          >
            {isCheckingSubscription ? "Checking..." : "Refresh Status"}
          </Button>
          
          {userSubscriptionTier !== 'free' && (
            <Button
              onClick={handleManageSubscription}
              disabled={isManagingSubscription}
            >
              {isManagingSubscription ? "Opening..." : "Manage Subscription"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagement;
