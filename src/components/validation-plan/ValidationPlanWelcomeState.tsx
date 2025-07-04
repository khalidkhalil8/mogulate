
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface ValidationPlanWelcomeStateProps {
  onGenerateValidationPlan: () => void;
  isGenerating: boolean;
}

const ValidationPlanWelcomeState: React.FC<ValidationPlanWelcomeStateProps> = ({
  onGenerateValidationPlan,
  isGenerating
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Generate Your Validation Plan</h1>
        <p className="text-gray-600 text-lg mb-8">
          Our AI will analyze your selected market positioning and planned features to suggest 
          three strategic validation steps that will help you test your assumptions before investing 
          significant time and resources.
        </p>
        
        <Button 
          onClick={onGenerateValidationPlan}
          disabled={isGenerating}
          className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          {isGenerating ? 'Generating Validation Plan...' : 'Generate Validation Plan with AI'}
        </Button>
        
        <p className="text-sm text-gray-500 mt-4">
          Validation steps will be based on your market positioning and features
        </p>
      </div>
    </div>
  );
};

export default ValidationPlanWelcomeState;
