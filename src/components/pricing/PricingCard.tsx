
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Check, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface PricingFeature {
  text: string;
  highlight?: boolean;
}

interface PricingCardProps {
  tier: string;
  price: string;
  period?: string;
  description?: string;
  features: PricingFeature[];
  popular?: boolean;
  buttonText?: string;
  currentPlan?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  price,
  period = "",
  description = "",
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
        toast.success("Redirecting to Stripe checkout...");
        
        // Redirect to Stripe checkout in the same tab
        setTimeout(() => {
          console.log(`[PricingCard] Redirecting to: ${data.url}`);
          window.location.href = data.url;
        }, 500);
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
    <Card className={`relative flex flex-col h-full transition-all duration-200 hover:shadow-lg ${
      popular 
        ? 'border-2 border-teal-500 shadow-lg' 
        : currentPlan 
          ? 'border-2 border-teal-300 bg-teal-50' 
          : 'border border-gray-200 hover:border-gray-300'
    }`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star className="h-3 w-3" />
            Most Popular
          </div>
        </div>
      )}
      
      {currentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Check className="h-3 w-3" />
            Current Plan
          </div>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900">{tier}</CardTitle>
        {description && (
          <CardDescription className="text-gray-600 mt-1">{description}</CardDescription>
        )}
        <div className="mt-6">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          {period && <span className="text-gray-600 ml-1">{period}</span>}
        </div>
      </CardHeader>

      <CardContent className="flex-grow px-6">
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                feature.highlight ? 'text-teal-600' : 'text-gray-400'
              }`} />
              <span className={`text-sm ${
                feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-600'
              }`}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="px-6 pt-4">
        <Button
          onClick={handleSubscription}
          className={`w-full py-3 text-base font-medium transition-all duration-200 ${
            popular
              ? "bg-teal-600 hover:bg-teal-700 text-white"
              : currentPlan
              ? "bg-gray-100 text-gray-600 cursor-not-allowed"
              : "bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white"
          }`}
          disabled={currentPlan || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            buttonText
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
