
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { MarketGapAnalysis } from '@/lib/types';

interface MarketGapAnalysisCardProps {
  analysis: MarketGapAnalysis;
}

const MarketGapAnalysisCard: React.FC<MarketGapAnalysisCardProps> = ({ analysis }) => {
  return (
    <Card className="bg-teal-50 border-teal-100">
      <CardHeader>
        <CardTitle className="text-xl">AI Market Gap Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2 text-teal-800">Identified Market Gaps:</h3>
          <ul className="list-disc pl-5 space-y-2">
            {analysis.marketGaps.map((gap, index) => (
              <li key={index} className="text-gray-700">{gap}</li>
            ))}
          </ul>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-2 text-teal-800">Positioning Suggestions:</h3>
          <ul className="list-disc pl-5 space-y-2">
            {analysis.positioningSuggestions.map((suggestion, index) => (
              <li key={index} className="text-gray-700">{suggestion}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketGapAnalysisCard;
