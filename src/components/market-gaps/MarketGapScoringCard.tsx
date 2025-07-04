
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import type { MarketGapWithScore } from '@/lib/api/marketGapsScoring';

interface MarketGapScoringCardProps {
  marketGap: MarketGapWithScore;
  isSelected?: boolean;
  onSelect?: () => void;
}

const MarketGapScoringCard: React.FC<MarketGapScoringCardProps> = ({ 
  marketGap, 
  isSelected = false,
  onSelect
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className={`relative transition-all duration-200 ${
      isSelected 
        ? 'border-teal-500 border-2 bg-teal-50 shadow-lg' 
        : 'hover:shadow-md border-gray-200'
    }`}>
      {isSelected && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-teal-600 text-white flex items-center gap-1">
            <Check className="h-3 w-3" />
            Selected
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Market Gap</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Score:</span>
            <Badge className={`${getScoreColor(marketGap.score)} text-white`}>
              {marketGap.score}/10
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Gap Description:</h4>
          <p className="text-gray-700">{marketGap.gap}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Positioning Suggestion:</h4>
          <p className="text-gray-700">{marketGap.positioningSuggestion}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Score Rationale:</h4>
          <p className="text-gray-600 text-sm">{marketGap.rationale}</p>
        </div>

        {onSelect && (
          <div className="pt-4">
            <Button
              onClick={onSelect}
              className={`w-full ${
                isSelected
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-white border border-teal-600 text-teal-600 hover:bg-teal-50'
              }`}
              variant={isSelected ? 'default' : 'outline'}
            >
              {isSelected ? 'Selected' : 'Select This Opportunity'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketGapScoringCard;
