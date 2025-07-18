
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
  selectedGapIndex?: number;
}

const MarketGapsSummaryCard: React.FC<MarketGapsSummaryCardProps> = ({ 
  marketGaps, 
  marketGapAnalysis,
  marketGapScoringAnalysis,
  selectedGapIndex 
}) => {
  // Get the selected gap or fallback to highest scoring
  const getSelectedGap = () => {
    if (!marketGapScoringAnalysis) return null;
    
    if (selectedGapIndex !== undefined && marketGapScoringAnalysis.marketGaps[selectedGapIndex]) {
      return marketGapScoringAnalysis.marketGaps[selectedGapIndex];
    }
    
    // Fallback to highest scoring for legacy projects
    return marketGapScoringAnalysis.marketGaps
      .sort((a, b) => b.score - a.score)[0];
  };

  const selectedGap = getSelectedGap();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Gap & Positioning Strategy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Your Approach:</h3>
          <p className="text-gray-700">{marketGaps}</p>
        </div>
        
        {selectedGap && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                Selected Market Opportunity
                <Badge className="bg-teal-600 text-white text-xs">
                  Score: {selectedGap.score}/10
                </Badge>
              </h3>
              
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-teal-900 mb-1">Market Gap:</h4>
                    <p className="text-teal-800">{selectedGap.gap}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-teal-900 mb-1">Your Positioning Strategy:</h4>
                    <p className="text-teal-800">{selectedGap.positioningSuggestion}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-teal-900 mb-1">Why This Opportunity:</h4>
                    <p className="text-teal-700 text-sm">{selectedGap.rationale}</p>
                  </div>
                </div>
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
