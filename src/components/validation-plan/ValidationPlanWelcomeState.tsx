
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
      <Button 
        onClick={onGenerateValidationPlan}
        disabled={isGenerating}
        className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
      >
        {isGenerating ? 'Generating Validation Plan...' : 'Generate Validation Plan'}
      </Button>
    </div>
  );
};

export default ValidationPlanWelcomeState;
