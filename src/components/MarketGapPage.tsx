
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingState from './ui/LoadingState';
import { analyzeMarketGapsWithScoring } from '@/lib/api/marketGapsScoring';
import type { Competitor, MarketGapAnalysis } from '@/lib/types';
import type { MarketGapScoringAnalysis } from '@/lib/api/marketGapsScoring';
import { toast } from "@/components/ui/sonner";
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight, Target } from 'lucide-react';
import SetupNavigation from './setup/SetupNavigation';
import MarketGapsScoringDisplay from './market-gaps/MarketGapsScoringDisplay';
import { useProjectData } from '@/hooks/useProjectData';
import { useSetupHandlers } from '@/hooks/useSetupHandlers';

const MarketGapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const {
    existingProject,
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
  } = useProjectData();

  const {
    handleMarketGapsSubmit,
  } = useSetupHandlers({
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
    projectId,
  });

  const [scoringAnalysis, setScoringAnalysis] = useState<MarketGapScoringAnalysis | undefined>();
  const [localSelectedGapIndex, setLocalSelectedGapIndex] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasRunAnalysis, setHasRunAnalysis] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProject } = useProjects();

  // Load existing market analysis data
  useEffect(() => {
    if (ideaData.marketGapScoringAnalysis) {
      console.log('MarketGapPage: Loading existing market analysis');
      setScoringAnalysis(ideaData.marketGapScoringAnalysis);
      setHasRunAnalysis(true);
    }
    
    if (selectedGapIndex !== undefined) {
      setLocalSelectedGapIndex(selectedGapIndex);
    }
  }, [ideaData.marketGapScoringAnalysis, selectedGapIndex]);
  
  const handleRunAnalysis = async () => {
    setIsLoading(true);
    try {
      console.log('MarketGapPage: Running market analysis');
      const result = await analyzeMarketGapsWithScoring(ideaData.idea, ideaData.competitors);
      
      if (result.success && result.analysis) {
        setScoringAnalysis(result.analysis);
        setHasRunAnalysis(true);
        
        // Update local state
        setIdeaData(prev => ({
          ...prev,
          marketGapScoringAnalysis: result.analysis
        }));
        
        // Save to database immediately
        if (projectId && user?.id) {
          try {
            await updateProject(projectId, {
              market_analysis: result.analysis as any
            });
            console.log('MarketGapPage: Market analysis saved to database');
          } catch (error) {
            console.error('MarketGapPage: Error saving market analysis:', error);
          }
        }
        
        toast.success("Successfully generated market gap analysis with scoring");
      } else {
        toast.error(result.error || "Failed to generate analysis");
      }
    } catch (error) {
      console.error('MarketGapPage: Error running analysis:', error);
      toast.error("Failed to generate analysis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGap = (index: number) => {
    setLocalSelectedGapIndex(index);
  };
  
  const handleNext = () => {
    if (localSelectedGapIndex === undefined) {
      toast.error("Please select a market opportunity to continue");
      return;
    }
    
    console.log('MarketGapPage: Proceeding with selected gap index:', localSelectedGapIndex);
    handleMarketGapsSubmit(ideaData.marketGaps || '', ideaData.marketGapAnalysis, scoringAnalysis, localSelectedGapIndex);
  };

  const handleBack = () => {
    // Save current state before navigating back
    if (scoringAnalysis) {
      handleMarketGapsSubmit(ideaData.marketGaps || '', ideaData.marketGapAnalysis, scoringAnalysis, localSelectedGapIndex);
    }
    navigate(`/competitors?projectId=${projectId}`);
  };
  
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <LoadingState message="Hang tight - our AI is analyzing market opportunities and scoring them" />
          ) : !hasRunAnalysis ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-bold mb-4">Discover Market Opportunities</h1>
                <p className="text-gray-600 text-lg mb-8">
                  We'll evaluate your project and competitors to uncover market gaps and suggest your strongest positioning.
                </p>
                
                <Button 
                  onClick={handleRunAnalysis}
                  className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
                  disabled={ideaData.competitors.length === 0}
                >
                  <Target className="h-5 w-5 mr-2" />
                  Run Market Analysis
                </Button>
                
                {ideaData.competitors.length === 0 && (
                  <p className="text-sm text-gray-500 mt-4">
                    Please add competitors first to run the analysis
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Select Your Market Opportunity</h1>
                <p className="text-gray-600">Choose the market opportunity you want to pursue. This will guide your product development strategy.</p>
              </div>
              
              {scoringAnalysis && (
                <MarketGapsScoringDisplay 
                  analysis={scoringAnalysis} 
                  selectedGapIndex={localSelectedGapIndex}
                  onSelectGap={handleSelectGap}
                />
              )}
              
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
                  disabled={localSelectedGapIndex === undefined}
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
