
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
      description: "Get started with basic idea validation tools",
      features: [
        { text: "5 uses per month" },
        { text: "3 competitors (Name & URL only)" },
        { text: "1 market gap per idea" }
      ],
      popular: false
    },
    {
      tier: "Starter",
      price: "$10",
      description: "Perfect for early-stage entrepreneurs",
      features: [
        { text: "20 uses per month" },
        { text: "3 competitors (Name, URL & descriptions)" },
        { text: "3 market gaps per idea" },
        { text: "1 positioning suggestion per idea" }
      ],
      popular: true
    },
    {
      tier: "Pro",
      price: "$30",
      description: "For serious founders ready to scale",
      features: [
        { text: "100 uses per month" },
        { text: "5 competitors (Name, URL & descriptions)" },
        { text: "3 market gaps per idea" },
        { text: "3 positioning suggestions per idea" }
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" className={`py-16 ${isHomePage ? 'bg-gray-50' : ''} px-4`}>
      <div className="container-width">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the plan that best fits your needs. All plans come with core features to help validate your ideas.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingData.map((plan) => (
            <PricingCard 
              key={plan.tier} 
              tier={plan.tier} 
              price={plan.price}
              description={plan.description}
              features={plan.features}
              popular={plan.popular}
              buttonText={isHomePage ? "Get Started" : currentTier === plan.tier.toLowerCase() ? "Current Plan" : "Switch to This Plan"}
              currentPlan={!isHomePage && currentTier === plan.tier.toLowerCase()}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
