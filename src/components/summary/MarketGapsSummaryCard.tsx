
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MarketGapAnalysis } from '@/lib/types';

interface MarketGapsSummaryCardProps {
  marketGaps: string;
  marketGapAnalysis?: MarketGapAnalysis;
}

const MarketGapsSummaryCard: React.FC<MarketGapsSummaryCardProps> = ({ marketGaps, marketGapAnalysis }) => {
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
        
        {marketGapAnalysis && (
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
