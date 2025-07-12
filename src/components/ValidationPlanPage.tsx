
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SetupNavigation from './setup/SetupNavigation';
import ValidationPlanWelcomeState from './validation-plan/ValidationPlanWelcomeState';
import { generateValidationPlan } from '@/lib/api';
import { toast } from './ui/sonner';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Competitor } from '@/lib/types';

interface ValidationPlanPageProps {
  idea: string;
  selectedMarketGap?: string;
  competitors: Competitor[];
  features?: any[];
  initialValidationPlan?: string;
  onValidationPlanSubmit: (validationPlan: string) => void;
}

const ValidationPlanPage: React.FC<ValidationPlanPageProps> = ({
  idea,
  selectedMarketGap,
  competitors,
  features,
  initialValidationPlan = "",
  onValidationPlanSubmit
}) => {
  const [validationPlan, setValidationPlan] = useState(initialValidationPlan);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(!!initialValidationPlan);
  const navigate = useNavigate();

  const handleGenerateValidationPlan = async () => {
    setIsGenerating(true);
    try {
      const result = await generateValidationPlan(
        idea,
        selectedMarketGap || "",
        competitors,
        features || []
      );

      if (result.validationPlan) {
        setValidationPlan(result.validationPlan);
        setHasGenerated(true);
        toast.success("Validation plan generated successfully!");
      } else {
        toast.error("Failed to generate validation plan");
      }
    } catch (error) {
      console.error('Error generating validation plan:', error);
      toast.error("Failed to generate validation plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (!validationPlan.trim()) {
      toast.error("Please provide a validation plan before continuing");
      return;
    }
    
    onValidationPlanSubmit(validationPlan);
  };

  const handleBack = () => {
    // Save current validation plan before navigating back
    if (validationPlan.trim()) {
      onValidationPlanSubmit(validationPlan);
    }
    navigate('/features');
  };

  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {!hasGenerated ? (
            <ValidationPlanWelcomeState
              onGenerateValidationPlan={handleGenerateValidationPlan}
              isGenerating={isGenerating}
            />
          ) : (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Create your Validation Plan</h1>
                <p className="text-gray-600">
                  Get actionable steps to test your positioning and features before you invest too heavily.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Your Validation Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={validationPlan}
                    onChange={(e) => setValidationPlan(e.target.value)}
                    placeholder="Describe how you plan to validate your project..."
                    className="min-h-[300px] resize-none"
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </Button>
                
                <Button 
                  onClick={handleNext}
                  disabled={!validationPlan.trim()}
                  className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationPlanPage;
