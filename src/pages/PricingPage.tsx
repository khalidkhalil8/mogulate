
import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PricingSection from "@/components/pricing/PricingSection";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const PricingPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

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
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Subscription Plans</h1>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <p className="text-gray-600 text-center mb-8">
            Choose the plan that works best for your needs
          </p>
        </div>
      </div>
      
      <main className="flex-1 px-6">
        <PricingSection showTitle={false} isHomePage={false} />
        
        <footer className="py-8 px-4 border-t mt-8">
          <div className="max-w-3xl mx-auto text-center text-gray-500">
            <p>© 2025 Mogulate. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default PricingPage;
