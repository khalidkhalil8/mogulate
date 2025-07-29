
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Target } from 'lucide-react';
import SetupPageLayout from '@/components/setup/SetupPageLayout';
import MarketGapsScoringDisplay from '@/components/market-gaps/MarketGapsScoringDisplay';
import LoadingState from '@/components/ui/LoadingState';
import { analyzeMarketGapsWithScoring } from '@/lib/api/marketGapsScoring';
import { toast } from '@/components/ui/sonner';
import type { MarketGapScoringAnalysis } from '@/lib/api/marketGapsScoring';

interface ProjectMarketAnalysisStepProps {
  projectData: any;
  updateProjectData: (data: any) => void;
}

const ProjectMarketAnalysisStep: React.FC<ProjectMarketAnalysisStepProps> = ({
  projectData,
  updateProjectData
}) => {
  const [marketAnalysis, setMarketAnalysis] = useState<MarketGapScoringAnalysis | undefined>(
    projectData.marketAnalysis
  );
  const [selectedGapIndex, setSelectedGapIndex] = useState<number | undefined>(
    projectData.selectedGapIndex
  );
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Save to localStorage for persistence
    localStorage.setItem('projectSetupData', JSON.stringify({
      ...projectData,
      marketAnalysis,
      selectedGapIndex
    }));
  }, [marketAnalysis, selectedGapIndex, projectData]);

  const handleRunAnalysis = async () => {
    if (!projectData.idea || !projectData.competitors?.length) {
      toast.error('Please complete previous steps first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await analyzeMarketGapsWithScoring(projectData.idea, projectData.competitors);
      
      if (result.success && result.analysis) {
        setMarketAnalysis(result.analysis);
        toast.success("Successfully generated market gap analysis");
      } else {
        toast.error(result.error || "Failed to generate analysis");
      }
    } catch (error) {
      console.error('Error running analysis:', error);
      toast.error("Failed to generate analysis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGap = (index: number) => {
    setSelectedGapIndex(index);
  };

  const handleNext = () => {
    if (!marketAnalysis || selectedGapIndex === undefined) {
      toast.error("Please select a market opportunity to continue");
      return;
    }
    
    updateProjectData({ marketAnalysis, selectedGapIndex });
    navigate('/project-setup/features');
  };

  const handleBack = () => {
    updateProjectData({ marketAnalysis, selectedGapIndex });
    navigate('/project-setup/competitors');
  };

  if (isLoading) {
    return <LoadingState message="Analyzing market opportunities and scoring them..." />;
  }

  if (!marketAnalysis) {
    return (
      <SetupPageLayout
        title="Discover Market Opportunities"
        description="We'll evaluate your project and competitors to uncover market gaps and suggest your strongest positioning."
        showNavigation={false}
      >
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <Button 
            onClick={handleRunAnalysis}
            className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
            disabled={!projectData.competitors?.length}
          >
            <Target className="h-5 w-5 mr-2" />
            Run Market Analysis
          </Button>
          
          {!projectData.competitors?.length && (
            <p className="text-sm text-gray-500">
              Please add competitors first to run the analysis
            </p>
          )}

          <div className="flex justify-between pt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
            <div />
          </div>
        </div>
      </SetupPageLayout>
    );
  }

  return (
    <SetupPageLayout
      title="Select Your Market Opportunity"
      description="Choose the market opportunity you want to pursue. This will guide your product development strategy."
      onNext={handleNext}
      onBack={handleBack}
      canProceed={selectedGapIndex !== undefined}
    >
      <MarketGapsScoringDisplay 
        analysis={marketAnalysis} 
        selectedGapIndex={selectedGapIndex}
        onSelectGap={handleSelectGap}
      />
    </SetupPageLayout>
  );
};

export default ProjectMarketAnalysisStep;
