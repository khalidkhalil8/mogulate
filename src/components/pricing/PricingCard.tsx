
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle } from "lucide-react";
import { updateSubscription } from "@/lib/api/subscription";
import { toast } from "@/components/ui/sonner";

interface PricingFeature {
  text: string;
}

interface PricingCardProps {
  tier: string;
  price: string;
  description: string;
  features: PricingFeature[];
  popular?: boolean;
  buttonText?: string;
  currentPlan?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  price,
  description,
  features,
  popular = false,
  buttonText = "Choose Plan",
  currentPlan = false,
}) => {
  const { user, userProfile } = useAuth();
  
  const handleSubscription = async () => {
    if (!user) {
      toast.error("Please login to change subscription");
      return;
    }
    
    try {
      const success = await updateSubscription(user.id, tier.toLowerCase());
      if (success) {
        toast.success(`Successfully changed subscription to ${tier}`);
      }
    } catch (error) {
      toast.error("Failed to update subscription");
      console.error("Error updating subscription:", error);
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
          {price !== "Free" && <span className="text-gray-500 ml-1">/month</span>}
        </div>
        <CardDescription className="mt-4">{description}</CardDescription>
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
          disabled={currentPlan}
        >
          {currentPlan ? "Current Plan" : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
