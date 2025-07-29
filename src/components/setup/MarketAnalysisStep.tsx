
import React, { useState, useEffect } from 'react';
import SetupPageLayout from './SetupPageLayout';
import { ProjectSetupData } from '@/pages/ProjectSetupPage';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { analyzeMarketGapsWithScoring } from '@/lib/api/marketGapsScoring';
import { toast } from '@/components/ui/sonner';
import MarketGapsScoringDisplay from '@/components/market-gaps/MarketGapsScoringDisplay';

interface MarketAnalysisStepProps {
  setupData: ProjectSetupData;
  updateSetupData: (updates: Partial<ProjectSetupData>) => void;
  onNext: () => void;
  onBack?: () => void;
  canProceed: boolean;
  isLoading: boolean;
}

const MarketAnalysisStep: React.FC<MarketAnalysisStepProps> = ({
  setupData,
  updateSetupData,
  onNext,
  onBack,
  canProceed,
  isLoading,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState(setupData.marketAnalysis);
  const [selectedGapIndex, setSelectedGapIndex] = useState<number | undefined>();

  useEffect(() => {
    setMarketAnalysis(setupData.marketAnalysis);
  }, [setupData.marketAnalysis]);

  const handleNext = () => {
    // Save the market analysis data to setupData before proceeding
    updateSetupData({ marketAnalysis });
    onNext();
  };

  const handleAnalyzeMarket = async () => {
    if (!setupData.description.trim()) {
      toast.error('Please add a project description first');
      return;
    }

    if (setupData.competitors.length === 0) {
      toast.error('Please add competitors first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await analyzeMarketGapsWithScoring(
        setupData.description,
        setupData.competitors
      );

      if (response.success && response.analysis) {
        setMarketAnalysis(response.analysis);
        setSelectedGapIndex(undefined);
        
        // Immediately save to setupData
        updateSetupData({ marketAnalysis: response.analysis });
        
        toast.success('Market analysis completed successfully');
      } else {
        toast.error(response.error || 'Failed to analyze market');
      }
    } catch (error) {
      console.error('Error analyzing market:', error);
      toast.error('Failed to analyze market');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectGap = (index: number) => {
    setSelectedGapIndex(index);
    console.log('Selected gap index:', index);
  };

  return (
    <SetupPageLayout
      title="Market Analysis"
      description="Discover market gaps and positioning opportunities for your project"
      onNext={handleNext}
      onBack={onBack}
      nextLabel="Continue"
      canProceed={!isLoading}
      isLoading={isLoading}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <Button
            onClick={handleAnalyzeMarket}
            disabled={isAnalyzing || !setupData.description.trim() || setupData.competitors.length === 0}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            {isAnalyzing ? 'Analyzing Market...' : 'Analyze Market'}
          </Button>
          
          {setupData.competitors.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Add competitors first to enable market analysis
            </p>
          )}
        </div>

        {marketAnalysis && (
          <MarketGapsScoringDisplay
            analysis={marketAnalysis}
            selectedGapIndex={selectedGapIndex}
            onSelectGap={handleSelectGap}
          />
        )}

        {!marketAnalysis && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-4">
              <Brain className="w-12 h-12 mx-auto mb-2" />
              <p>No market analysis yet</p>
              <p className="text-sm">Click the button above to analyze market opportunities</p>
            </div>
          </div>
        )}
      </div>
    </SetupPageLayout>
  );
};

export default MarketAnalysisStep;
