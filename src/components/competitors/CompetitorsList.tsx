
import React from 'react';
import { Button } from "@/components/ui/button";
import CompetitorCard from './CompetitorCard';
import type { Competitor } from '@/lib/types';

interface CompetitorsListProps {
  competitors: Competitor[];
  onAddCompetitor: () => void;
  onUpdateCompetitor: (id: string, field: keyof Competitor, value: string) => void;
  onRemoveCompetitor: (id: string) => void;
}

const CompetitorsList: React.FC<CompetitorsListProps> = ({
  competitors,
  onAddCompetitor,
  onUpdateCompetitor,
  onRemoveCompetitor
}) => {
  return (
    <div className="space-y-6">
      {competitors.map((competitor, index) => (
        <CompetitorCard 
          key={competitor.id}
          competitor={competitor}
          index={index}
          onUpdate={onUpdateCompetitor}
          onRemove={onRemoveCompetitor}
        />
      ))}
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={onAddCompetitor}
        className="w-full py-6 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Add More</span>
      </Button>
    </div>
  );
};

export default CompetitorsList;
