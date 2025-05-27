
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface SubscriptionPickerProps {
  currentTier: string;
  isUpdating?: boolean;
  userId?: string;
  onChangeSubscription: (tier: string) => void;
}

const SubscriptionPicker: React.FC<SubscriptionPickerProps> = ({
  currentTier,
  isUpdating = false,
  userId,
  onChangeSubscription
}) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Normalize tier to lowercase to ensure consistent comparison
  const normalizedTier = currentTier.toLowerCase();
  
  const handleSubscriptionChange = async (tier: string) => {
    if (!userId) {
      toast.error("Please login to change subscription");
      return;
    }

    // Free plan - update locally
    if (tier.toLowerCase() === "free") {
      onChangeSubscription(tier);
      return;
    }
    
    // Paid plans - redirect to Stripe checkout
    setIsProcessing(tier);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          tier: tier.toLowerCase(),
          priceId: null // We're creating the price dynamically in the function
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        toast.success("Redirecting to Stripe checkout...");
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      toast.error("Failed to create checkout session");
      console.error("Error creating checkout:", error);
    } finally {
      setIsProcessing(null);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Subscription</CardTitle>
        <CardDescription>Upgrade or change your current plan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {normalizedTier !== "free" && (
            <div className="flex justify-between items-center p-4 border rounded-md">
              <div>
                <p className="font-medium">Free Plan</p>
                <p className="text-sm text-gray-500">5 uses per month</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleSubscriptionChange("free")}
                disabled={isUpdating || normalizedTier === "free" || isProcessing !== null}
              >
                {isProcessing === "free" ? "Processing..." : "Switch to Free"}
              </Button>
            </div>
          )}
          
          {normalizedTier !== "starter" && (
            <div className="flex justify-between items-center p-4 border rounded-md bg-gray-50">
              <div>
                <p className="font-medium">Starter Plan</p>
                <p className="text-sm text-gray-500">20 uses per month - $10/month</p>
              </div>
              <Button 
                onClick={() => handleSubscriptionChange("starter")}
                disabled={isUpdating || normalizedTier === "starter" || isProcessing !== null}
              >
                {isProcessing === "starter" ? "Processing..." : normalizedTier === "pro" ? "Switch to Starter" : "Upgrade to Starter"}
              </Button>
            </div>
          )}
          
          {normalizedTier !== "pro" && (
            <div className="flex justify-between items-center p-4 border rounded-md bg-blue-50">
              <div>
                <p className="font-medium">Pro Plan</p>
                <p className="text-sm text-gray-500">100 uses per month - $30/month</p>
              </div>
              <Button 
                onClick={() => handleSubscriptionChange("pro")}
                disabled={isUpdating || normalizedTier === "pro" || isProcessing !== null}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing === "pro" ? "Processing..." : "Upgrade to Pro"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Paid plans will redirect you to Stripe for secure payment processing.
      </CardFooter>
    </Card>
  );
};

export default SubscriptionPicker;
