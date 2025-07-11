
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface CompetitorWelcomeStateProps {
  onGenerateCompetitors: () => void;
  isGenerating: boolean;
}

const CompetitorWelcomeState: React.FC<CompetitorWelcomeStateProps> = ({
  onGenerateCompetitors,
  isGenerating
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Discover Your Competitors</h1>
        <p className="text-gray-600 text-lg mb-8">
          Our AI will find existing solutions in your market. Understanding your competition helps you identify gaps and opportunities for your product positioning.
        </p>
        
        <Button 
          onClick={onGenerateCompetitors}
          disabled={isGenerating}
          className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
        >
          <Search className="h-5 w-5 mr-2" />
          {isGenerating ? 'Finding Competitors...' : 'Find Competitors'}
        </Button>
      </div>
    </div>
  );
};

export default CompetitorWelcomeState;
