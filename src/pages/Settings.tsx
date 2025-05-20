
import React from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionDetails from "@/components/settings/SubscriptionDetails";
import SubscriptionPicker from "@/components/settings/SubscriptionPicker";
import FeatureWaitlists from "@/components/settings/FeatureWaitlists";
import { useUserUsage } from "@/hooks/useUserUsage";

const Settings = () => {
  const { user, userProfile } = useAuth();
  const { usageData, isLoading: isUsageLoading } = useUserUsage(
    user?.id, 
    userProfile?.subscription_started_at,
    userProfile?.subscription_tier
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Settings | Idea Validator</title>
      </Helmet>
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container-width max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          
          <Tabs defaultValue="subscription">
            <TabsList className="mb-4">
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="features">Feature Waitlists</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription">
              <div className="space-y-6">
                <SubscriptionDetails 
                  subscriptionTier={userProfile?.subscription_tier || 'free'} 
                  startDate={userProfile?.subscription_started_at} 
                  usageData={usageData}
                  isLoading={isUsageLoading}
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
                      currentTier={userProfile?.subscription_tier || 'free'} 
                      userId={user?.id || ''}
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

export default Settings;
