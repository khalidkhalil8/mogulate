import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IdeaData } from '@/lib/types';
import IdeaSummaryCard from './summary/IdeaSummaryCard';
import CompetitorsSummaryCard from './summary/CompetitorsSummaryCard';
import MarketGapsSummaryCard from './summary/MarketGapsSummaryCard';
import ValidationPlanSummaryCard from './summary/ValidationPlanSummaryCard';
import SummaryActions from './summary/SummaryActions';
import SetupNavigation from './setup/SetupNavigation';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface SummaryPageProps {
  data: IdeaData;
  onSaveProject: () => Promise<void>;
}

const SummaryPage: React.FC<SummaryPageProps> = ({ data, onSaveProject }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-center">Summary</h1>
            <p className="text-gray-600 text-center">
              Here is your idea and everything we found - ready to take action?
            </p>
          </div>
          
          <div className="space-y-8">
            <IdeaSummaryCard idea={data.idea} />
            <CompetitorsSummaryCard competitors={data.competitors} />
            <MarketGapsSummaryCard 
              marketGaps={data.marketGaps} 
              marketGapAnalysis={data.marketGapAnalysis}
              marketGapScoringAnalysis={data.marketGapScoringAnalysis}
            />
            <ValidationPlanSummaryCard validationPlan={data.validationPlan} />
            
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
                data={data} 
                onSaveProject={onSaveProject} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
