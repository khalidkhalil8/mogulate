
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import PricingSection from "@/components/pricing/PricingSection";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const PricingPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  // Redirect non-authenticated users to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h1 className="text-4xl font-bold mb-4">Subscription Plans</h1>
          <p className="text-gray-600">
            Choose the plan that works best for your idea validation needs
          </p>
        </div>
        
        <PricingSection showTitle={false} isHomePage={false} />
      </main>
      
      <footer className="py-8 px-4 border-t">
        <div className="container-width text-center text-gray-500">
          <p>© 2025 TalonIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
