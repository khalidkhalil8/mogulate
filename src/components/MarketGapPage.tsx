
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingState from './ui/LoadingState';
import { analyzeMarketGapsWithScoring } from '@/lib/api/marketGapsScoring';
import type { Competitor, MarketGapAnalysis } from '@/lib/types';
import type { MarketGapScoringAnalysis } from '@/lib/api/marketGapsScoring';
import { toast } from "@/components/ui/sonner";
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight, Target } from 'lucide-react';
import SetupNavigation from './setup/SetupNavigation';
import MarketGapsScoringDisplay from './market-gaps/MarketGapsScoringDisplay';

interface MarketGapPageProps {
  idea: string;
  competitors: Competitor[];
  initialMarketGaps?: string;
  initialAnalysis?: MarketGapAnalysis;
  onMarketGapsSubmit: (marketGaps: string, analysis: MarketGapAnalysis | undefined, scoringAnalysis?: MarketGapScoringAnalysis, selectedGapIndex?: number) => void;
}

const MarketGapPage: React.FC<MarketGapPageProps> = ({
  idea,
  competitors,
  initialMarketGaps = "",
  initialAnalysis,
  onMarketGapsSubmit
}) => {
  const [scoringAnalysis, setScoringAnalysis] = useState<MarketGapScoringAnalysis | undefined>();
  const [selectedGapIndex, setSelectedGapIndex] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasRunAnalysis, setHasRunAnalysis] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleRunAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeMarketGapsWithScoring(idea, competitors);
      if (result.success && result.analysis) {
        setScoringAnalysis(result.analysis);
        setHasRunAnalysis(true);
        toast.success("Successfully generated market gap analysis with scoring");
      } else {
        toast.error(result.error || "Failed to generate analysis");
      }
    } catch (error) {
      toast.error("Failed to generate analysis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGap = (index: number) => {
    setSelectedGapIndex(index);
  };
  
  const handleNext = () => {
    if (selectedGapIndex === undefined) {
      toast.error("Please select a market opportunity to continue");
      return;
    }
    
    // Save the analysis data and proceed
    onMarketGapsSubmit(initialMarketGaps, initialAnalysis, scoringAnalysis, selectedGapIndex);
  };

  const handleBack = () => {
    // Save current analysis before navigating back
    onMarketGapsSubmit(initialMarketGaps, initialAnalysis, scoringAnalysis, selectedGapIndex);
    navigate('/competitors');
  };
  
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <LoadingState message="Hang tight - our AI is analyzing market opportunities and scoring them" />
          ) : !hasRunAnalysis ? (
            // Initial welcome state
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-bold mb-4">Discover & Score Market Opportunities</h1>
                <p className="text-gray-600 text-lg mb-8">
                  We'll evaluate your project and competitors to uncover market gaps and suggest your strongest positioning.
                </p>
                
                <Button 
                  onClick={handleRunAnalysis}
                  className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
                  disabled={competitors.length === 0}
                >
                  <Target className="h-5 w-5 mr-2" />
                  Run Market Analysis
                </Button>
                
                {competitors.length === 0 && (
                  <p className="text-sm text-gray-500 mt-4">
                    Please add competitors first to run the analysis
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Results state
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Select Your Market Opportunity</h1>
                <p className="text-gray-600">Choose the market opportunity you want to pursue. This will guide your product development strategy.</p>
              </div>
              
              {scoringAnalysis && (
                <MarketGapsScoringDisplay 
                  analysis={scoringAnalysis} 
                  selectedGapIndex={selectedGapIndex}
                  onSelectGap={handleSelectGap}
                />
              )}
              
              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </Button>
                
                <Button 
                  onClick={handleNext}
                  disabled={selectedGapIndex === undefined}
                  className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketGapPage;
