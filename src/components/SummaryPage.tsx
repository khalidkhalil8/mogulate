
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import IdeaSummaryCard from './summary/IdeaSummaryCard';
import CompetitorsSummaryCard from './summary/CompetitorsSummaryCard';
import MarketGapsSummaryCard from './summary/MarketGapsSummaryCard';
import ValidationPlanSummaryCard from './summary/ValidationPlanSummaryCard';
import SummaryActions from './summary/SummaryActions';
import SetupNavigation from './setup/SetupNavigation';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { useProjectData } from '@/hooks/useProjectData';
import { useSetupHandlers } from '@/hooks/useSetupHandlers';

const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
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
    handleSaveProject,
  } = useSetupHandlers({
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
    projectId,
  });

  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-center">Summary</h1>
            <p className="text-gray-600 text-center">
              Here is everything we've discovered. Now it is time to grow your project.
            </p>
          </div>
          
          <div className="space-y-8">
            <IdeaSummaryCard idea={ideaData.idea} />
            <CompetitorsSummaryCard competitors={ideaData.competitors} />
            <MarketGapsSummaryCard 
              marketGaps={ideaData.marketGaps} 
              marketGapAnalysis={ideaData.marketGapAnalysis}
              marketGapScoringAnalysis={ideaData.marketGapScoringAnalysis}
              selectedGapIndex={selectedGapIndex}
            />
            <ValidationPlanSummaryCard validationPlan={ideaData.validationPlan} />
            
            <div className="flex justify-between items-center pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/validation-plan')}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </Button>
              
              <SummaryActions 
                data={ideaData} 
                onSaveProject={handleSaveProject} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
