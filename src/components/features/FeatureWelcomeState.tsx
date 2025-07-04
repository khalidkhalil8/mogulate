
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

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
        <h1 className="text-3xl font-bold mb-4">Generate & Define Product Features</h1>
        <p className="text-gray-600 text-lg mb-8">
          Our AI will analyze your selected market positioning to suggest three strategic features 
          that align with your competitive advantage and target market needs.
        </p>
        
        <Button 
          onClick={onGenerateFeatures}
          disabled={isGenerating}
          className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
        >
          <Lightbulb className="h-5 w-5 mr-2" />
          {isGenerating ? 'Generating Features...' : 'Generate Features with AI'}
        </Button>
        
        <p className="text-sm text-gray-500 mt-4">
          Features will be based on your selected market positioning
        </p>
      </div>
    </div>
  );
};

export default FeatureWelcomeState;
