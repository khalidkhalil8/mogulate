
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface PricingFeature {
  text: string;
}

interface PricingCardProps {
  tier: string;
  price: string;
  features: PricingFeature[];
  popular?: boolean;
  buttonText?: string;
  currentPlan?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  price,
  features,
  popular = false,
  buttonText = "Choose Plan",
  currentPlan = false,
}) => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubscription = async () => {
    if (!user) {
      console.error(`[PricingCard] No user found when attempting subscription`);
      toast.error("Please login to subscribe");
      return;
    }

    console.log(`[PricingCard] Attempting subscription to: ${tier}`);
    console.log(`[PricingCard] User ID: ${user.id}`);

    // Free plan - update locally
    if (tier.toLowerCase() === "free") {
      console.log(`[PricingCard] Processing free plan locally`);
      setIsLoading(true);
      try {
        const success = await updateSubscription(user.id, "free");
        if (success) {
          toast.success("Successfully switched to Free plan");
          await refreshUserProfile();
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Paid plans - redirect to Stripe checkout
    console.log(`[PricingCard] Processing paid plan: ${tier}`);
    setIsLoading(true);
    
    try {
      console.log(`[PricingCard] Calling create-checkout function for tier: ${tier}`);
      console.log(`[PricingCard] Function invocation starting...`);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          tier: tier.toLowerCase(),
          priceId: null // We're creating the price dynamically in the function
        }
      });

      console.log(`[PricingCard] create-checkout response received`);
      console.log(`[PricingCard] Response data:`, data);
      console.log(`[PricingCard] Response error:`, error);

      if (error) {
        console.error(`[PricingCard] Error from create-checkout:`, error);
        throw new Error(`Checkout failed: ${error.message}`);
      }

      if (data?.url) {
        console.log(`[PricingCard] Checkout URL received: ${data.url}`);
        console.log(`[PricingCard] Attempting to redirect to Stripe checkout...`);
        
        // Try multiple redirect methods for better compatibility
        try {
          window.open(data.url, '_blank');
          console.log(`[PricingCard] Redirect successful via window.open`);
          toast.success("Redirecting to Stripe checkout...");
        } catch (redirectError) {
          console.error(`[PricingCard] window.open failed, trying location.href:`, redirectError);
          window.location.href = data.url;
        }
      } else {
        console.error(`[PricingCard] No checkout URL received in response:`, data);
        throw new Error("No checkout URL received from Stripe. Please check your Stripe configuration.");
      }
    } catch (error) {
      console.error(`[PricingCard] Failed to create checkout session:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`[PricingCard] Error details:`, { error, errorMessage });
      toast.error(`Failed to create checkout session: ${errorMessage}`);
    } finally {
      console.log(`[PricingCard] Process completed, clearing loading state`);
      setIsLoading(false);
    }
  };

  // Helper function for free plan updates
  const updateSubscription = async (userId: string, newTier: string): Promise<boolean> => {
    try {
      console.log(`[PricingCard] Updating subscription locally for user ${userId} to ${newTier}`);
      
      const { data, error } = await supabase.functions.invoke('update-subscription', {
        body: { userId, newTier }
      });

      if (error) {
        console.error('Error calling update-subscription function:', error);
        toast.error('Subscription update failed');
        return false;
      }

      if (!data.success) {
        console.error('Error from update-subscription function:', data.error);
        toast.error('Subscription update failed');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Subscription update failed');
      return false;
    }
  };

  return (
    <Card className={`flex flex-col border-2 ${popular ? 'border-teal-500' : 'border-gray-200'} ${currentPlan ? 'bg-teal-50' : ''}`}>
      {popular && (
        <div className="bg-teal-500 text-white text-center py-1 text-sm font-medium">
          POPULAR CHOICE
        </div>
      )}
      {currentPlan && (
        <div className="bg-teal-600 text-white text-center py-1 text-sm font-medium">
          YOUR CURRENT PLAN
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{tier}</CardTitle>
        <div className="mt-4">
          <span className="text-3xl font-bold">{price}</span>
          {price !== "$0" && <span className="text-gray-500 ml-1">/month</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle className="text-teal-500" size={18} />
              <span className="text-sm">{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubscription}
          className={`w-full ${
            popular
              ? "bg-teal-600 hover:bg-teal-700"
              : currentPlan
              ? "bg-gray-500 hover:bg-gray-600"
              : ""
          }`}
          disabled={currentPlan || isLoading}
        >
          {isLoading ? "Processing..." : currentPlan ? "Current Plan" : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
