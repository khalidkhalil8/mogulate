
import React from "react";
import PricingCard from "./PricingCard";
import { useAuth } from "@/context/AuthContext";

interface PricingSectionProps {
  showTitle?: boolean;
  isHomePage?: boolean;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  showTitle = true,
  isHomePage = false,
}) => {
  const { userProfile } = useAuth();
  const currentTier = userProfile?.subscription_tier || "free";
  
  const pricingData = [
    {
      tier: "Free",
      price: "$0",
      period: "",
      description: "Perfect for getting started",
      features: [
        { text: "5 uses per month", highlight: false },
        { text: "3 competitors (Name & URL only)", highlight: false },
        { text: "1 market gap per idea", highlight: false },
        { text: "Basic support", highlight: false }
      ],
      popular: false,
      cta: "Get Started"
    },
    {
      tier: "Starter",
      price: "$10",
      period: "/month",
      description: "Great for entrepreneurs and small teams",
      features: [
        { text: "20 uses per month", highlight: true },
        { text: "3 competitors (Name, URL & descriptions)", highlight: true },
        { text: "3 market gaps per idea", highlight: true },
        { text: "1 positioning suggestion per idea", highlight: true },
        { text: "Priority support", highlight: false }
      ],
      popular: false,
      cta: "Start Free Trial"
    },
    {
      tier: "Pro",
      price: "$30",
      period: "/month",
      description: "For serious businesses and agencies",
      features: [
        { text: "100 uses per month", highlight: true },
        { text: "5 competitors (Name, URL & descriptions)", highlight: true },
        { text: "3 market gaps per idea", highlight: true },
        { text: "3 positioning suggestions per idea", highlight: true },
        { text: "Advanced analytics", highlight: true },
        { text: "Priority support", highlight: false }
      ],
      popular: true,
      cta: "Start Free Trial"
    }
  ];

  return (
    <section className={`${isHomePage ? 'py-16 bg-gray-50' : 'py-8'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that best fits your needs. All plans include a 14-day free trial.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {pricingData.map((plan) => (
            <PricingCard 
              key={plan.tier} 
              tier={plan.tier} 
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              popular={plan.popular}
              buttonText={
                isHomePage 
                  ? plan.cta 
                  : currentTier === plan.tier.toLowerCase() 
                    ? "Current Plan" 
                    : "Switch to This Plan"
              }
              currentPlan={!isHomePage && currentTier === plan.tier.toLowerCase()}
            />
          ))}
        </div>

        {!isHomePage && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Need a custom plan? We'd love to help you find the perfect solution.
            </p>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;
