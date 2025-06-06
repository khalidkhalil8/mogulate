
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
      console.error(`[SubscriptionPicker] No user ID provided`);
      toast.error("Please login to change subscription");
      return;
    }

    console.log(`[SubscriptionPicker] Attempting to change subscription to: ${tier}`);
    console.log(`[SubscriptionPicker] Current tier: ${normalizedTier}`);
    console.log(`[SubscriptionPicker] User ID: ${userId}`);

    // Free plan - update locally only, no usage tracking
    if (tier.toLowerCase() === "free") {
      console.log(`[SubscriptionPicker] Switching to free plan locally`);
      onChangeSubscription(tier);
      return;
    }
    
    // Paid plans (starter, pro) - MUST redirect to Stripe checkout
    console.log(`[SubscriptionPicker] Processing paid plan: ${tier}`);
    setIsProcessing(tier);
    
    try {
      console.log(`[SubscriptionPicker] Calling create-checkout function for tier: ${tier}`);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          tier: tier.toLowerCase()
        }
      });

      console.log(`[SubscriptionPicker] create-checkout response received`);
      console.log(`[SubscriptionPicker] Response data:`, data);
      console.log(`[SubscriptionPicker] Response error:`, error);

      if (error) {
        console.error(`[SubscriptionPicker] Error from create-checkout:`, error);
        throw new Error(`Checkout failed: ${error.message}`);
      }

      if (data?.url) {
        console.log(`[SubscriptionPicker] Checkout URL received: ${data.url}`);
        toast.success("Redirecting to Stripe checkout...");
        
        // Redirect to Stripe checkout in the same tab
        setTimeout(() => {
          console.log(`[SubscriptionPicker] Redirecting to: ${data.url}`);
          window.location.href = data.url;
        }, 500);
      } else {
        console.error(`[SubscriptionPicker] No checkout URL received in response:`, data);
        throw new Error("No checkout URL received from Stripe. Please check your Stripe configuration.");
      }
    } catch (error) {
      console.error(`[SubscriptionPicker] Failed to create checkout session:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`[SubscriptionPicker] Error details:`, { error, errorMessage });
      toast.error(`Failed to create checkout session: ${errorMessage}`);
    } finally {
      console.log(`[SubscriptionPicker] Process completed, clearing processing state`);
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
        Redirects to Stripe for secure payment processing.
      </CardFooter>
    </Card>
  );
};

export default SubscriptionPicker;
