
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
  const { user, refreshUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubscription = async () => {
    if (!user) {
      console.error(`[PricingCard] No user found when attempting subscription`);
      toast.error("Please login to subscribe");
      return;
    }

    console.log(`[PricingCard] Attempting subscription to: ${tier}`);
    console.log(`[PricingCard] User ID: ${user.id}`);

    // Free plan - update locally without usage tracking
    if (tier.toLowerCase() === "free") {
      console.log(`[PricingCard] Processing free plan locally`);
      setIsLoading(true);
      try {
        // Direct database update for free plan without usage tracking
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_tier: 'free',
            subscription_started_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating to free plan:', error);
          toast.error('Failed to switch to free plan');
          return;
        }

        toast.success("Successfully switched to Free plan");
        await refreshUserProfile();
      } catch (error) {
        console.error('Unexpected error switching to free plan:', error);
        toast.error('Failed to switch to free plan');
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
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          tier: tier.toLowerCase()
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
        console.log(`[PricingCard] URL length: ${data.url.length}`);
        console.log(`[PricingCard] URL starts with: ${data.url.substring(0, 50)}...`);
        
        // Try opening in a new tab first to see if that works better
        const newTab = window.open(data.url, '_blank');
        
        if (newTab) {
          console.log(`[PricingCard] Successfully opened checkout in new tab`);
          toast.success("Stripe checkout opened in new tab");
        } else {
          console.log(`[PricingCard] Popup blocked, trying same tab redirect`);
          toast.success("Redirecting to Stripe checkout...");
          
          // Fallback to same tab redirect
          setTimeout(() => {
            console.log(`[PricingCard] Redirecting to: ${data.url}`);
            window.location.href = data.url;
          }, 500);
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
