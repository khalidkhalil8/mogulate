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
      <Button 
        onClick={onFindCompetitors} 
        disabled={isLoading}
      >
        {isLoading ? 'Finding...' : 'Run Competitor Discovery'}
      </Button>
    </div>
  );
};

export default CompetitorWelcomeState;
