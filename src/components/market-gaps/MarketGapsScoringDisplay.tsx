
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MarketGapScoringCard from './MarketGapScoringCard';
import type { MarketGapScoringAnalysis } from '@/lib/api/marketGapsScoring';

interface MarketGapsScoringDisplayProps {
  analysis: MarketGapScoringAnalysis;
  selectedGapIndex?: number;
  onSelectGap: (index: number) => void;
  showOnlySelected?: boolean;
}

const MarketGapsScoringDisplay: React.FC<MarketGapsScoringDisplayProps> = ({ 
  analysis, 
  selectedGapIndex,
  onSelectGap,
  showOnlySelected = false
}) => {
  // Sort market gaps by score (highest first)
  const sortedGaps = [...analysis.marketGaps].sort((a, b) => b.score - a.score);
  
  // If showOnlySelected is true and we have a selected gap, show only that one
  const gapsToShow = showOnlySelected && selectedGapIndex !== undefined 
    ? [analysis.marketGaps[selectedGapIndex]].filter(Boolean)
    : sortedGaps;

  return (
    <div className="space-y-6">
      {/* Updated Recommendation Message */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">i</span>
            </div>
            <div>
              <p className="text-blue-800 font-medium mb-1">
                {showOnlySelected ? 'Selected Market Opportunity' : 'Market Opportunity Selection'}
              </p>
              <p className="text-blue-700 text-sm">
                {showOnlySelected 
                  ? 'This is your selected market opportunity based on scoring and alignment with your project goals.'
                  : 'Your market opportunities were scored based on market size, competition, ease of implementation, and alignment with your idea. We recommend focusing on the highest-scoring opportunity.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Gaps Grid */}
      <div className={`grid gap-6 ${showOnlySelected ? 'md:grid-cols-1' : 'md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
        {gapsToShow.map((gap, index) => {
          const originalIndex = analysis.marketGaps.indexOf(gap);
          const isSelected = selectedGapIndex === originalIndex;
          
          return (
            <MarketGapScoringCard
              key={originalIndex}
              marketGap={gap}
              isSelected={isSelected}
              onSelect={() => onSelectGap(originalIndex)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MarketGapsScoringDisplay;
