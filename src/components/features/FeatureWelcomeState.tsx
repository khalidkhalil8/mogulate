
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
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Define the Core Features of Your Product</h1>
        <p className="text-gray-600 text-lg mb-8">
          Define what your product will do by refining its key features.
        </p>
        
        <Button 
          onClick={onGenerateFeatures}
          disabled={isGenerating}
          className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
        >
          <Settings className="h-5 w-5 mr-2" />
          {isGenerating ? 'Generating Features...' : 'Generate Features with AI'}
        </Button>
      </div>
    </div>
  );
};

export default FeatureWelcomeState;
