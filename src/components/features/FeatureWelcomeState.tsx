
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface FeatureWelcomeStateProps {
  onGenerateFeatures: () => void;
  isGenerating: boolean;
}

const FeatureWelcomeState: React.FC<FeatureWelcomeStateProps> = ({
  onGenerateFeatures,
  isGenerating
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <Button 
        onClick={onGenerateFeatures}
        disabled={isGenerating}
        className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
      >
        {isGenerating ? 'Generating Features...' : 'Generate Features'}
      </Button>
    </div>
  );
};

export default FeatureWelcomeState;
