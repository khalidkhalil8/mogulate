
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from './Header';

interface ValidationPlanPageProps {
  initialValidationPlan?: string;
  onValidationPlanSubmit: (validationPlan: string) => void;
}

const ValidationPlanPage: React.FC<ValidationPlanPageProps> = ({ 
  initialValidationPlan = "", 
  onValidationPlanSubmit 
}) => {
  const [validationPlan, setValidationPlan] = useState(initialValidationPlan);
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationPlan.trim()) {
      onValidationPlanSubmit(validationPlan);
      navigate('/idea/summary');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container-width max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              How Will You Validate Your Idea?
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label 
                  htmlFor="validationPlan" 
                  className="block text-lg font-medium text-charcoal"
                >
                  Outline your plan for testing your idea before investing heavily
                </label>
                <Textarea
                  id="validationPlan"
                  placeholder="Landing page, customer interviews, building an MVP"
                  value={validationPlan}
                  onChange={(e) => setValidationPlan(e.target.value)}
                  className="min-h-[150px] resize-y"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2"
                  disabled={!validationPlan.trim()}
                >
                  <span>Next</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ValidationPlanPage;
