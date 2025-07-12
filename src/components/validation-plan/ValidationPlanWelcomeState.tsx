
import React from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardCheck } from 'lucide-react';

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
        <h1 className="text-3xl font-bold mb-4">Create your Validation Plan</h1>
        <p className="text-gray-600 text-lg mb-8">
          Get actionable steps to test your positioning and features before you invest too heavily.
        </p>
        
        <Button 
          onClick={onGenerateValidationPlan}
          disabled={isGenerating}
          className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
        >
          <ClipboardCheck className="h-5 w-5 mr-2" />
          {isGenerating ? 'Generating Validation Plan...' : 'Generate Validation Plan'}
        </Button>
      </div>
    </div>
  );
};

export default ValidationPlanWelcomeState;
