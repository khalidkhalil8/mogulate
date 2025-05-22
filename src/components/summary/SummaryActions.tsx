
import React from 'react';
import { Button } from "@/components/ui/button";
import { IdeaData } from '@/lib/types';
import { useCopySummary } from '@/hooks/useCopySummary';

interface SummaryActionsProps {
  data: IdeaData;
  onResetClick: () => void;
}

const SummaryActions: React.FC<SummaryActionsProps> = ({ data, onResetClick }) => {
  const { copySummaryToClipboard } = useCopySummary();
  
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 pt-4">
      <Button 
        onClick={() => copySummaryToClipboard(data)}
        variant="outline" 
        className="border-teal-500 text-teal-700 hover:bg-teal-50"
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
          className="mr-2"
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
        </svg>
        Copy Summary
      </Button>
      
      <Button 
        onClick={onResetClick}
        className="gradient-bg border-none hover:opacity-90 button-transition"
      >
        Enter a New Idea
      </Button>
    </div>
  );
};

export default SummaryActions;
