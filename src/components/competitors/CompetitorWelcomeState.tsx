
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface CompetitorWelcomeStateProps {
  onFindCompetitors: () => void;
  onAddManually: () => void;
  isLoading: boolean;
}

const CompetitorWelcomeState: React.FC<CompetitorWelcomeStateProps> = ({
  onFindCompetitors,
  onAddManually,
  isLoading
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Discover Your Competitors</h1>
        <p className="text-gray-600 text-lg mb-8">
          Our AI will find existing solutions in your market. Understanding your competition helps you identify gaps and opportunities for your product positioning.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={onFindCompetitors}
            disabled={isLoading}
            className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
          >
            <Search className="h-5 w-5 mr-2" />
            {isLoading ? 'Finding Competitors...' : 'Find Competitors'}
          </Button>
          
          <Button 
            onClick={onAddManually}
            variant="outline"
            className="text-lg px-8 py-3"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Manually
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompetitorWelcomeState;
