// src/components/competitors/CompetitorWelcomeState.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface CompetitorWelcomeStateProps {
  onFindCompetitors: () => void;
  isLoading: boolean;
}

const CompetitorWelcomeState: React.FC<CompetitorWelcomeStateProps> = ({
  onFindCompetitors,
  isLoading
}) => {
  return (
    <div className="text-center mt-24">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Discover Your Competitors</h1>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Our AI will find existing solutions in your market. Understanding your competition helps you identify gaps and opportunities for your product positioning.
      </p>
      <div className="flex justify-center gap-4">
        <Button 
          onClick={onFindCompetitors} 
          disabled={isLoading}
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? 'Finding...' : 'Find Competitors'}
        </Button>
      </div>
    </div>
  );
};

export default CompetitorWelcomeState;
