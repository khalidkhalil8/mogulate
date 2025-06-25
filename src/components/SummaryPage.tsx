
import React from 'react';
import { IdeaData } from '@/lib/types';
import IdeaSummaryCard from './summary/IdeaSummaryCard';
import CompetitorsSummaryCard from './summary/CompetitorsSummaryCard';
import MarketGapsSummaryCard from './summary/MarketGapsSummaryCard';
import ValidationPlanSummaryCard from './summary/ValidationPlanSummaryCard';
import SummaryActions from './summary/SummaryActions';
import SetupNavigation from './setup/SetupNavigation';

interface SummaryPageProps {
  data: IdeaData;
  onSaveProject: () => Promise<void>;
}

const SummaryPage: React.FC<SummaryPageProps> = ({ data, onSaveProject }) => {
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
            />
            <ValidationPlanSummaryCard validationPlan={data.validationPlan} />
            
            <SummaryActions 
              data={data} 
              onSaveProject={onSaveProject} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
