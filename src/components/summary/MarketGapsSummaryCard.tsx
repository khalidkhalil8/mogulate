
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  console.log('MarketGapsSummaryCard: Props received:', {
    hasMarketGapScoringAnalysis: !!marketGapScoringAnalysis,
    marketGapsLength: marketGapScoringAnalysis?.marketGaps?.length || 0,
    selectedGapIndex,
    selectedGapIndexType: typeof selectedGapIndex
  });

  // Get the selected gap based on saved selectedGapIndex
  const getSelectedGap = () => {
    if (!marketGapScoringAnalysis?.marketGaps?.length) {
      console.log('MarketGapsSummaryCard: No market gaps available');
      return null;
    }
    
    // Use the selectedGapIndex from database if available and valid
    if (selectedGapIndex !== undefined && selectedGapIndex >= 0 && marketGapScoringAnalysis.marketGaps[selectedGapIndex]) {
      console.log('MarketGapsSummaryCard: Using selected gap at index:', selectedGapIndex);
      return marketGapScoringAnalysis.marketGaps[selectedGapIndex];
    }
    
    console.log('MarketGapsSummaryCard: No valid selected gap index');
    return null;
  };

  const selectedGap = getSelectedGap();
  console.log('MarketGapsSummaryCard: Selected gap:', selectedGap);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Gap & Positioning Strategy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedGap ? (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-medium text-teal-900">Selected Market Opportunity</h3>
              <Badge className="bg-teal-600 text-white text-xs">
                Score: {selectedGap.score}/10
              </Badge>
            </div>
            
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
        ) : marketGapScoringAnalysis?.marketGaps?.length ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Market analysis completed but no opportunity was selected. Please return to the market analysis step to select your preferred opportunity.
            </p>
          </div>
        ) : marketGapAnalysis ? (
          <div className="space-y-4">
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
          </div>
        ) : (
          <p className="text-gray-500">No market analysis available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketGapsSummaryCard;
