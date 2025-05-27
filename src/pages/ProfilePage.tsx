
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionTab from "@/components/settings/SubscriptionTab";
import FeatureWaitlists from "@/components/settings/FeatureWaitlists";
import { useUsageData } from "@/hooks/useUsageData";
import { updateSubscription } from "@/lib/api/subscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const ProfilePage = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
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
              <SubscriptionTab
                usageData={usageData}
                isUsageLoading={isUsageLoading}
                userSubscriptionTier={userProfile?.subscription_tier}
                isUpdatingSubscription={isUpdatingSubscription}
                isCheckingSubscription={isCheckingSubscription}
                userId={user?.id}
                onChangeSubscription={handleChangeSubscription}
                onRefreshStatus={checkSubscriptionStatus}
              />
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
