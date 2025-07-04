
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MarketGapAnalysis } from '@/lib/types';
import type { MarketGapScoringAnalysis } from '@/lib/api/marketGapsScoring';

interface MarketGapsSummaryCardProps {
  marketGaps: string;
  marketGapAnalysis?: MarketGapAnalysis;
  marketGapScoringAnalysis?: MarketGapScoringAnalysis;
}

const MarketGapsSummaryCard: React.FC<MarketGapsSummaryCardProps> = ({ 
  marketGaps, 
  marketGapAnalysis,
  marketGapScoringAnalysis 
}) => {
  const highestScoringGap = marketGapScoringAnalysis?.marketGaps
    ?.sort((a, b) => b.score - a.score)[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Gaps & Differentiation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Your Approach:</h3>
          <p className="text-gray-700">{marketGaps}</p>
        </div>
        
        {marketGapScoringAnalysis && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                AI-Scored Market Opportunities
                <Badge className="bg-teal-600 text-white text-xs">
                  New Analysis
                </Badge>
              </h3>
              
              {highestScoringGap && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-teal-600 text-white">
                      Top Opportunity (Score: {highestScoringGap.score}/10)
                    </Badge>
                  </div>
                  <p className="text-teal-800 font-medium mb-2">{highestScoringGap.gap}</p>
                  <p className="text-teal-700 text-sm">
                    <strong>Positioning:</strong> {highestScoringGap.positioningSuggestion}
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                {marketGapScoringAnalysis.marketGaps.map((gap, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Market Gap {index + 1}</span>
                      <Badge className={`${gap.score >= 8 ? 'bg-green-500' : gap.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                        {gap.score}/10
                      </Badge>
                    </div>
                    <p className="text-gray-700 text-sm mb-1">{gap.gap}</p>
                    <p className="text-gray-600 text-xs">{gap.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {marketGapAnalysis && !marketGapScoringAnalysis && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium mb-2">AI-Identified Market Gaps:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {marketGapAnalysis.marketGaps.map((gap, index) => (
                  <li key={index} className="text-gray-700">{gap}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">AI-Suggested Positioning:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {marketGapAnalysis.positioningSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-gray-700">{suggestion}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketGapsSummaryCard;
