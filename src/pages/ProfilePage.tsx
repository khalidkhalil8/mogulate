import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
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

  // Optional: log userProfile to confirm the tier in the console
  useEffect(() => {
    console.log("Current userProfile:", userProfile);
  }, [userProfile]);

  // Check subscription status on page load – but silently
  useEffect(() => {
    if (user) {
      checkSubscriptionStatusSilently();
    }
  }, [user]);

  const checkSubscriptionStatusSilently = async () => {
    if (!user) return;

    setIsCheckingSubscription(true);
    try {
      // Get current access token with detailed logging
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      console.log('Session check:', { 
        hasSession: !!session, 
        hasToken: !!accessToken,
        tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none'
      });
      
      if (!accessToken) {
        console.error("No Supabase session; skipping check-subscription");
        setIsCheckingSubscription(false);
        return;
      }

      // Invoke check-subscription with proper Authorization header
      console.log('Calling check-subscription function...');
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log('Check-subscription response:', { data, error });

      if (error) {
        console.error("Error checking subscription:", error);
        return;
      }

      if (data) {
        // Refresh user profile to get updated subscription info
        await refreshUserProfile();
        // Refresh usage data
        refetchUsage();
        // No success toast for silent checks
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    setIsCheckingSubscription(true);
    try {
      // Get current access token with detailed logging
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      console.log('Manual subscription check:', { 
        hasSession: !!session, 
        hasToken: !!accessToken,
        tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none'
      });
      
      if (!accessToken) {
        toast.error("You must be logged in to check subscription status");
        setIsCheckingSubscription(false);
        return;
      }

      // Invoke check-subscription with proper Authorization header
      console.log('Calling check-subscription function manually...');
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log('Manual check-subscription response:', { data, error });

      if (error) {
        console.error("Error checking subscription:", error);
        toast.error("Failed to check subscription status");
        return;
      }

      if (data) {
        // Refresh user profile to get updated subscription info
        await refreshUserProfile();
        // Refresh usage data
        refetchUsage();
        toast.success("Subscription status updated");
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast.error("Failed to check subscription status");
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
        // Refresh user profile after subscription change to update UI
        await refreshUserProfile();
        // Refresh usage data
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

      <main className="flex-1 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>

          <Tabs defaultValue="subscription">
            <TabsList className="mb-4">
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="features">Feature Waitlist</TabsTrigger>
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
