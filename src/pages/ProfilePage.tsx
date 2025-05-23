
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionDetails from "@/components/settings/SubscriptionDetails";
import UsageProgress from "@/components/settings/UsageProgress";
import SubscriptionPicker from "@/components/settings/SubscriptionPicker";
import FeatureWaitlists from "@/components/settings/FeatureWaitlists";
import { useUserUsage } from "@/hooks/useUserUsage";
import { updateSubscription } from "@/lib/api/subscription";
import { toast } from "@/components/ui/sonner";

const ProfilePage = () => {
  const { user, userProfile } = useAuth();
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const { usageData, isLoading: isUsageLoading } = useUserUsage(
    user?.id, 
    userProfile?.subscription_started_at,
    userProfile?.subscription_tier
  );
  
  const handleChangeSubscription = async (newTier: string) => {
    if (!user?.id) {
      toast.error("You need to be logged in to change your subscription");
      return;
    }
    
    setIsUpdatingSubscription(true);
    try {
      const success = await updateSubscription(user.id, newTier);
      if (success) {
        toast.success(`Subscription updated to ${newTier} plan`);
        // The auth context should refresh automatically to reflect the new subscription
      }
    } finally {
      setIsUpdatingSubscription(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Profile | Idea Validator</title>
      </Helmet>
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container-width max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          
          <Tabs defaultValue="subscription">
            <TabsList className="mb-4">
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="features">Feature Waitlists</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription">
              <div className="space-y-6">
                <SubscriptionDetails 
                  subscriptionTier={userProfile?.subscription_tier || 'free'} 
                  nextResetDate={usageData?.nextResetDate}
                  usageData={usageData}
                  isLoading={isUsageLoading}
                />
                
                {usageData && !isUsageLoading && (
                  <UsageProgress 
                    usedCount={usageData.usedCount}
                    maxCount={usageData.maxCount}
                  />
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle>Upgrade Your Plan</CardTitle>
                    <CardDescription>
                      Choose the plan that best fits your needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SubscriptionPicker 
                      currentTier={userProfile?.subscription_tier || 'free'}
                      isUpdating={isUpdatingSubscription}
                      userId={user?.id}
                      onChangeSubscription={handleChangeSubscription}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="features">
              <FeatureWaitlists />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
