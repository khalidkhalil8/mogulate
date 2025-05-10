
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { updateSubscription } from "@/lib/api/subscription";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

interface UsageData {
  usedCount: number;
  maxCount: number;
  nextResetDate: string;
}

const Settings = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Fetch usage data
  useEffect(() => {
    const fetchUsageData = async () => {
      if (!user || !userProfile) return;
      
      setIsLoading(true);
      
      try {
        // Get user profile data including subscription info
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("subscription_started_at, subscription_tier")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile data:", profileError);
          return;
        }

        const startDate = new Date(profileData.subscription_started_at);
        const nextResetDate = new Date(startDate);
        nextResetDate.setDate(nextResetDate.getDate() + 30);
        
        // Count API usage since subscription started
        const { count, error: usageError } = await supabase
          .from("api_usage_logs")
          .select("*", { count: 'exact' })
          .eq("user_id", user.id)
          .gte("timestamp", profileData.subscription_started_at);
          
        if (usageError) {
          console.error("Error fetching API usage:", usageError);
          return;
        }

        // Get max usage based on subscription tier
        const tierLimits = {
          free: 5,
          starter: 20,
          pro: 100
        };
        
        const maxCount = tierLimits[profileData.subscription_tier as keyof typeof tierLimits] || 0;
        
        setUsageData({
          usedCount: count || 0,
          maxCount,
          nextResetDate: nextResetDate.toLocaleDateString()
        });

      } catch (error) {
        console.error("Error loading usage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageData();
  }, [user, userProfile]);

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
            <div className="h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Plan Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Overview</CardTitle>
                <CardDescription>Your current subscription details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Plan</span>
                    <span className="font-medium capitalize">{userProfile.subscription_tier} Plan</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Next Reset Date</span>
                    <span className="font-medium">{usageData?.nextResetDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage This Cycle - Changed title from "API Usage" to "Plan Usage" */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Usage</CardTitle>
                <CardDescription>Your usage for this billing cycle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Uses Remaining</span>
                    <span className="font-medium">
                      {usageData?.usedCount} / {usageData?.maxCount}
                    </span>
                  </div>
                  
                  <Progress 
                    value={usageData ? (usageData.usedCount / usageData.maxCount) * 100 : 0} 
                    className="h-2"
                  />
                  
                  <p className="text-sm text-gray-500">
                    {usageData && usageData.maxCount > usageData.usedCount 
                      ? `You have ${usageData.maxCount - usageData.usedCount} uses remaining this cycle.`
                      : "You've used all your available uses for this cycle."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Change Subscription */}
            <Card>
              <CardHeader>
                <CardTitle>Change Subscription</CardTitle>
                <CardDescription>Upgrade or change your current plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userProfile.subscription_tier !== "free" && (
                    <div className="flex justify-between items-center p-4 border rounded-md">
                      <div>
                        <p className="font-medium">Free Plan</p>
                        <p className="text-sm text-gray-500">5 uses per month</p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => handleSubscriptionChange("free")}
                        disabled={isUpdating || userProfile.subscription_tier === "free"}
                      >
                        Switch to Free
                      </Button>
                    </div>
                  )}
                  
                  {userProfile.subscription_tier !== "starter" && (
                    <div className="flex justify-between items-center p-4 border rounded-md bg-gray-50">
                      <div>
                        <p className="font-medium">Starter Plan</p>
                        <p className="text-sm text-gray-500">20 uses per month</p>
                      </div>
                      <Button 
                        onClick={() => handleSubscriptionChange("starter")}
                        disabled={isUpdating || userProfile.subscription_tier === "starter"}
                      >
                        {userProfile.subscription_tier === "pro" ? "Switch to Starter" : "Upgrade to Starter"}
                      </Button>
                    </div>
                  )}
                  
                  {userProfile.subscription_tier !== "pro" && (
                    <div className="flex justify-between items-center p-4 border rounded-md bg-blue-50">
                      <div>
                        <p className="font-medium">Pro Plan</p>
                        <p className="text-sm text-gray-500">100 uses per month</p>
                      </div>
                      <Button 
                        onClick={() => handleSubscriptionChange("pro")}
                        disabled={isUpdating || userProfile.subscription_tier === "pro"}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                Changing your subscription will reset your billing cycle.
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
