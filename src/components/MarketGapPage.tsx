
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
import { Target } from 'lucide-react';
import MarketGapsScoringDisplay from './market-gaps/MarketGapsScoringDisplay';
import { useProjectData } from '@/hooks/useProjectData';
import { useSetupHandlers } from '@/hooks/useSetupHandlers';
import SetupPageLayout from './setup/SetupPageLayout';

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

  if (isLoading) {
    return <LoadingState message="Hang tight - our AI is analyzing market opportunities and scoring them" />;
  }

  if (!hasRunAnalysis) {
    return (
      <SetupPageLayout
        title="Discover Market Opportunities"
        description="We'll evaluate your project and competitors to uncover market gaps and suggest your strongest positioning."
        showNavigation={false}
      >
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
          <Button 
            onClick={handleRunAnalysis}
            className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
            disabled={ideaData.competitors.length === 0}
          >
            <Target className="h-5 w-5 mr-2" />
            Run Market Analysis
          </Button>
          
          {ideaData.competitors.length === 0 && (
            <p className="text-sm text-gray-500">
              Please add competitors first to run the analysis
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
      onBack={handleBack}
      onNext={handleNext}
      canProceed={localSelectedGapIndex !== undefined}
    >
      {scoringAnalysis && (
        <MarketGapsScoringDisplay 
          analysis={scoringAnalysis} 
          selectedGapIndex={localSelectedGapIndex}
          onSelectGap={handleSelectGap}
        />
      )}
    </SetupPageLayout>
  );
};

export default MarketGapPage;
