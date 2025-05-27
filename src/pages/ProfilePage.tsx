
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import SubscriptionDetails from "@/components/settings/SubscriptionDetails";
import UsageProgress from "@/components/settings/UsageProgress";
import SubscriptionPicker from "@/components/settings/SubscriptionPicker";
import FeatureWaitlists from "@/components/settings/FeatureWaitlists";
import { useUsageData } from "@/hooks/useUsageData";
import { updateSubscription } from "@/lib/api/subscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const ProfilePage = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const { usageData, isLoading: isUsageLoading, refetchUsage } = useUsageData(user?.id);
  
  // Check subscription status on page load - but silently
  useEffect(() => {
    if (user) {
      checkSubscriptionStatusSilently();
    }
  }, [user]);

  const checkSubscriptionStatusSilently = async () => {
    if (!user) return;
    
    setIsCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data) {
        // Refresh user profile to get updated subscription info
        await refreshUserProfile();
        // Refresh usage data
        refetchUsage();
        // Don't show success toast for silent checks
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    setIsCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        toast.error('Failed to check subscription status');
        return;
      }

      if (data) {
        // Refresh user profile to get updated subscription info
        await refreshUserProfile();
        // Refresh usage data
        refetchUsage();
        toast.success('Subscription status updated');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Failed to check subscription status');
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      toast.error("Please login to manage subscription");
      return;
    }

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
        // Refresh user profile after subscription change to update UI
        await refreshUserProfile();
        // Refresh usage data after subscription change
        refetchUsage();
      }
    } finally {
      setIsUpdatingSubscription(false);
    }
  };
  
  // Show alert if user has downgraded and now exceeds their plan limit
  const showAlert = usageData ? usageData.used > usageData.limit : false;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Profile | Mogulate</title>
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
                  subscriptionTier={usageData?.tier || userProfile?.subscription_tier || 'free'} 
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
                        onClick={checkSubscriptionStatus}
                        disabled={isCheckingSubscription}
                        variant="outline"
                      >
                        {isCheckingSubscription ? "Checking..." : "Refresh Status"}
                      </Button>
                      
                      {userProfile?.subscription_tier !== 'free' && (
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
                
                <Card>
                  <CardHeader>
                    <CardTitle>Upgrade Your Plan</CardTitle>
                    <CardDescription>
                      Choose the plan that best fits your needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SubscriptionPicker 
                      currentTier={usageData?.tier || userProfile?.subscription_tier || 'free'}
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
