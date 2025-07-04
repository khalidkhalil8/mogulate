
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MarketGapScoringCard from './MarketGapScoringCard';
import type { MarketGapScoringAnalysis } from '@/lib/api/marketGapsScoring';

interface MarketGapsScoringDisplayProps {
  analysis: MarketGapScoringAnalysis;
}

const MarketGapsScoringDisplay: React.FC<MarketGapsScoringDisplayProps> = ({ analysis }) => {
  // Sort market gaps by score (highest first)
  const sortedGaps = [...analysis.marketGaps].sort((a, b) => b.score - a.score);
  const highestScoringGap = sortedGaps[0];

  return (
    <div className="space-y-6">
      {/* Recommendation Message */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">i</span>
            </div>
            <div>
              <p className="text-blue-800 font-medium mb-1">
                AI Recommendation
              </p>
              <p className="text-blue-700 text-sm">
                We recommend focusing on the highest-scoring opportunity based on market size, 
                competition, feasibility, and idea fit analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Gaps Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {sortedGaps.map((gap, index) => (
          <MarketGapScoringCard
            key={index}
            marketGap={gap}
            isHighestScoring={gap === highestScoringGap}
          />
        ))}
      </div>

      {/* Highest Scoring Gap Highlight */}
      {highestScoringGap && (
        <Card className="bg-teal-50 border-teal-200">
          <CardHeader>
            <CardTitle className="text-teal-800 flex items-center gap-2">
              <Badge className="bg-teal-600 text-white">
                Recommended Focus
              </Badge>
              Top Market Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-teal-900 mb-1">Market Gap:</h4>
                <p className="text-teal-800">{highestScoringGap.gap}</p>
              </div>
              <div>
                <h4 className="font-medium text-teal-900 mb-1">Recommended Positioning:</h4>
                <p className="text-teal-800 font-medium">{highestScoringGap.positioningSuggestion}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketGapsScoringDisplay;
