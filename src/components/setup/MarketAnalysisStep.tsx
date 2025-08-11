
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
  const [selectedGapIndex, setSelectedGapIndex] = useState<number | undefined>(setupData.selectedGapIndex);

  useEffect(() => {
    setMarketAnalysis(setupData.marketAnalysis);
    setSelectedGapIndex(setupData.selectedGapIndex);
  }, [setupData.marketAnalysis, setupData.selectedGapIndex]);

  const handleNext = () => {
    // Ensure market analysis and selected gap are saved before proceeding
    if (marketAnalysis) {
      updateSetupData({ 
        marketAnalysis,
        selectedGapIndex
      });
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
        updateSetupData({ 
          marketAnalysis: response.analysis,
          selectedGapIndex: undefined
        });
        
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
    updateSetupData({ selectedGapIndex: index });
    console.log('Selected gap index:', index);
  };

  if (!marketAnalysis) {
    return (
      <SetupPageLayout
        title="Discover Market Opportunities"
        description="Our AI will analyze your idea and competitors to identify market gaps, score them across multiple criteria, and recommend the best positioning strategy for your success."
        onBack={onBack}
        showNavigation={false}
      >
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-500 mb-6">
            <Brain className="w-12 h-12 mx-auto mb-2" />
            <p className="mb-2">No market analysis generated yet</p>
            <p className="text-sm">Generate a market analysis to discover opportunities</p>
          </div>
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
            {isAnalyzing ? 'Analyzing Market...' : 'Generate Market Analysis'}
          </Button>
          
          {setupData.competitors.length === 0 && (
            <p className="text-sm text-gray-500 mt-4">
              Add competitors first to enable market analysis
            </p>
          )}
        </div>
      </SetupPageLayout>
    );
  }

  return (
    <SetupPageLayout
      title="Select Your Market Opportunity"
      description="Choose the market opportunity you want to pursue. This will guide your product development strategy."
      onNext={handleNext}
      onBack={onBack}
      nextLabel="Continue"
      canProceed={!isLoading && !!marketAnalysis && selectedGapIndex !== undefined}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        <MarketGapsScoringDisplay
          analysis={marketAnalysis}
          selectedGapIndex={selectedGapIndex}
          onSelectGap={handleSelectGap}
        />

        {selectedGapIndex === undefined && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-medium">
              Please select a market opportunity to continue
            </p>
          </div>
        )}
      </div>
    </SetupPageLayout>
  );
};

export default MarketAnalysisStep;
