import React from "react";
import PricingCard from "./PricingCard";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

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
        { text: "1 project", highlight: false },
        { text: "4 credits per project", highlight: false },
        { text: "3 competitors discovery", highlight: false },
        { text: "Market gap analysis", highlight: false },
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
        { text: "5 projects", highlight: true },
        { text: "10 credits per project", highlight: true },
        { text: "Enhanced competitor analysis", highlight: true },
        { text: "3 market gaps per analysis", highlight: true },
        { text: "Positioning suggestions", highlight: true },
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
        { text: "Unlimited projects", highlight: true },
        { text: "Unlimited credits", highlight: true },
        { text: "Advanced competitor insights", highlight: true },
        { text: "Comprehensive market analysis", highlight: true },
        { text: "Multiple positioning strategies", highlight: true },
        { text: "Advanced analytics", highlight: true },
        { text: "Priority support", highlight: false }
      ],
      popular: true,
      cta: "Start Free Trial"
    }
  ];

  return (
    <section className={`${isHomePage ? 'section-spacing bg-gray-50 mobile-padding' : 'py-8'}`}>
      <div className="container-width">
        {showTitle && (
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose the plan that best fits your needs.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
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
