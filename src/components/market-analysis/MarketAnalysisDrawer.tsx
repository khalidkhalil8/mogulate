import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import type { MarketGapAnalysis } from '@/lib/types';

interface MarketAnalysisDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (analysis: MarketGapAnalysis | null, gaps: string) => Promise<boolean>;
  marketAnalysis?: MarketGapAnalysis | null;
  marketGaps?: string;
}

const MarketAnalysisDrawer: React.FC<MarketAnalysisDrawerProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  marketAnalysis,
  marketGaps = '',
}) => {
  const [gaps, setGaps] = useState('');
  const [marketGapsList, setMarketGapsList] = useState<string[]>([]);
  const [positioningSuggestions, setPositioningSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setGaps(marketGaps);
      setMarketGapsList(marketAnalysis?.marketGaps || []);
      setPositioningSuggestions(marketAnalysis?.positioningSuggestions || []);
    }
  }, [marketAnalysis, marketGaps, isOpen]);

  const handleSave = async () => {
    const analysisData: MarketGapAnalysis | null = 
      marketGapsList.length > 0 || positioningSuggestions.length > 0
        ? {
            marketGaps: marketGapsList,
            positioningSuggestions: positioningSuggestions,
          }
        : null;

    const success = await onSave(analysisData, gaps);
    if (success) {
      onOpenChange(false);
    }
  };

  const addMarketGap = () => {
    setMarketGapsList([...marketGapsList, '']);
  };

  const updateMarketGap = (index: number, value: string) => {
    const updated = [...marketGapsList];
    updated[index] = value;
    setMarketGapsList(updated);
  };

  const removeMarketGap = (index: number) => {
    setMarketGapsList(marketGapsList.filter((_, i) => i !== index));
  };

  const addPositioningSuggestion = () => {
    setPositioningSuggestions([...positioningSuggestions, '']);
  };

  const updatePositioningSuggestion = (index: number, value: string) => {
    const updated = [...positioningSuggestions];
    updated[index] = value;
    setPositioningSuggestions(updated);
  };

  const removePositioningSuggestion = (index: number) => {
    setPositioningSuggestions(positioningSuggestions.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Market Analysis</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="marketGaps">Market Gaps Description</Label>
            <Textarea
              id="marketGaps"
              placeholder="Describe your unique selling points and how you'll solve customer problems..."
              value={gaps}
              onChange={(e) => setGaps(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Identified Market Gaps</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMarketGap}>
                Add Gap
              </Button>
            </div>
            {marketGapsList.map((gap, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  placeholder="Describe a market gap..."
                  value={gap}
                  onChange={(e) => updateMarketGap(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMarketGap(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Positioning Suggestions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPositioningSuggestion}>
                Add Suggestion
              </Button>
            </div>
            {positioningSuggestions.map((suggestion, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  placeholder="Describe a positioning suggestion..."
                  value={suggestion}
                  onChange={(e) => updatePositioningSuggestion(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePositioningSuggestion(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MarketAnalysisDrawer;
