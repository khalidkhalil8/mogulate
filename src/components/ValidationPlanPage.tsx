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
import type { IdeaData } from '@/lib/types';

interface ValidationPlanPageProps {
  initialValidationPlan?: string;
  onValidationPlanSubmit: (validationPlan: string) => Promise<void>;
  ideaData: IdeaData;
  selectedGapIndex?: number;
}

const ValidationPlanPage: React.FC<ValidationPlanPageProps> = ({
  initialValidationPlan = "",
  onValidationPlanSubmit,
  ideaData,
  selectedGapIndex
}) => {
  const [validationPlan, setValidationPlan] = useState(initialValidationPlan);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(!!initialValidationPlan);
  const navigate = useNavigate();

  // Get the selected market gap positioning suggestion based on the index
  const selectedPositioningSuggestion = selectedGapIndex !== undefined && 
    ideaData.marketGapScoringAnalysis?.marketGaps?.[selectedGapIndex]?.positioningSuggestion || '';

  const handleGenerateValidationPlan = async () => {
    if (!selectedPositioningSuggestion) {
      toast.error("No positioning suggestion available. Please complete the market gap analysis first.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateValidationPlan(
        ideaData.idea,
        selectedPositioningSuggestion,
        ideaData.competitors,
        ideaData.features
      );

      if (result.success && result.validationPlan) {
        setValidationPlan(result.validationPlan);
        setHasGenerated(true);
        toast.success("Validation plan generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate validation plan");
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
