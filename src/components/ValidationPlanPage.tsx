
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SetupNavigation from './setup/SetupNavigation';

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
    onValidationPlanSubmit(validationPlan);
    navigate('/summary');
  };
  
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">How Will You Validate Your Idea?</h1>
          </div>
          
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
              />
            </div>
            
            <div className="flex justify-between">
              <Button
                type="button" 
                variant="outline"
                onClick={() => navigate('/market-gaps')}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </Button>
              
              <Button 
                type="submit" 
                className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2"
              >
                <span>Next</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ValidationPlanPage;
