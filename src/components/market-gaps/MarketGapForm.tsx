
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { MarketGapAnalysis } from '@/lib/types';
import MarketGapAnalysisCard from './MarketGapAnalysisCard';

interface MarketGapFormProps {
  marketGaps: string;
  analysis: MarketGapAnalysis | undefined;
  setMarketGaps: (value: string) => void;
  onGetAiSuggestions: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isCompetitorsAvailable: boolean;
}

const MarketGapForm: React.FC<MarketGapFormProps> = ({
  marketGaps,
  analysis,
  setMarketGaps,
  onGetAiSuggestions,
  onSubmit,
  isCompetitorsAvailable,
}) => {
  return (
    <div className="space-y-8">
      {analysis && (
        <div className="space-y-6">
          <MarketGapAnalysisCard analysis={analysis} />
        </div>
      )}
      
      <div className="space-y-4">
        <label 
          htmlFor="marketGaps" 
          className="block text-lg font-medium text-charcoal"
        >
          Detail your unique selling points and how you will solve customer problems 
          better than existing solutions
        </label>
        <Textarea
          id="marketGaps"
          placeholder="Faster delivery than competitors, lower pricing, better user experience"
          value={marketGaps}
          onChange={(e) => setMarketGaps(e.target.value)}
          className="min-h-[150px] resize-y"
          required
        />
      </div>
      
      <div className="flex justify-start">
        <Button
          type="button"
          variant="secondary"
          onClick={onGetAiSuggestions}
          className="flex items-center gap-2"
          disabled={!isCompetitorsAvailable}
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
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>Get AI Suggestions</span>
        </Button>
      </div>
    </div>
  );
};

export default MarketGapForm;
