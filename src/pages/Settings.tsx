
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { updateSubscription } from "@/lib/api/subscription";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Import our components
import SubscriptionDetails from "@/components/settings/SubscriptionDetails";
import UsageProgress from "@/components/settings/UsageProgress";
import SubscriptionPicker from "@/components/settings/SubscriptionPicker";
import { useUserUsage } from "@/hooks/useUserUsage";

const Settings = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);
  
  // Safely access userProfile properties, handling the case where some might be missing
  const subscriptionStartedAt = userProfile?.subscription_started_at;
  const subscriptionTier = userProfile?.subscription_tier || 'free';
  
  const { usageData, isLoading } = useUserUsage(
    user?.id,
    subscriptionStartedAt,
    subscriptionTier
  );

  const handleSubscriptionChange = async (newTier: string) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const success = await updateSubscription(user.id, newTier);
      if (success) {
        // Refresh the page to update usage data
        window.location.reload();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="md" color="border-blue-500" />
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Plan Overview */}
            <SubscriptionDetails 
              subscriptionTier={userProfile.subscription_tier}
              nextResetDate={usageData?.nextResetDate}
            />

            {/* Usage This Cycle */}
            {usageData && (
              <UsageProgress
                usedCount={usageData.usedCount}
                maxCount={usageData.maxCount}
              />
            )}

            {/* Change Subscription */}
            <SubscriptionPicker
              currentTier={userProfile.subscription_tier}
              isUpdating={isUpdating}
              onChangeSubscription={handleSubscriptionChange}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
