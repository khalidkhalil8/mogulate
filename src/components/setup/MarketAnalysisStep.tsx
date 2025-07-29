
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
    // Ensure market analysis is saved before proceeding
    if (marketAnalysis) {
      updateSetupData({ marketAnalysis });
    }
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
        
        // Immediately save to setupData to ensure persistence
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
      canProceed={!isLoading && !!marketAnalysis}
      isLoading={isLoading}
    >
      <div className="space-y-8">
        {!marketAnalysis && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Market Analysis Available
              </h3>
              <p className="text-gray-600 mb-6">
                Run the analysis to discover market gaps and positioning strategies.
              </p>
            </div>
            
            <Button
              onClick={handleAnalyzeMarket}
              disabled={isAnalyzing || !setupData.description.trim() || setupData.competitors.length === 0}
              className="px-8 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Brain className="w-5 h-5" />
              )}
              {isAnalyzing ? 'Analyzing Market...' : 'Run Analysis'}
            </Button>
            
            {setupData.competitors.length === 0 && (
              <p className="text-sm text-gray-500 mt-4">
                Add competitors first to enable market analysis
              </p>
            )}
          </div>
        )}

        {marketAnalysis && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Button
                onClick={handleAnalyzeMarket}
                disabled={isAnalyzing}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                {isAnalyzing ? 'Running Analysis...' : 'Run New Analysis'}
              </Button>
            </div>

            <MarketGapsScoringDisplay
              analysis={marketAnalysis}
              selectedGapIndex={selectedGapIndex}
              onSelectGap={handleSelectGap}
            />
          </div>
        )}
      </div>
    </SetupPageLayout>
  );
};

export default MarketAnalysisStep;
