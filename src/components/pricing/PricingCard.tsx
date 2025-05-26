
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
      toast.error("Please login to subscribe");
      return;
    }

    // Free plan - update locally
    if (tier.toLowerCase() === "free") {
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
    
    setIsLoading(true);
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
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      toast.error("Failed to create checkout session");
      console.error("Error creating checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for free plan updates
  const updateSubscription = async (userId: string, newTier: string): Promise<boolean> => {
    try {
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
