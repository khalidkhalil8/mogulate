
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { IdeaData } from '@/lib/types';
import ConfirmationDialog from './ui/ConfirmationDialog';
import IdeaSummaryCard from './summary/IdeaSummaryCard';
import CompetitorsSummaryCard from './summary/CompetitorsSummaryCard';
import MarketGapsSummaryCard from './summary/MarketGapsSummaryCard';
import ValidationPlanSummaryCard from './summary/ValidationPlanSummaryCard';
import SummaryActions from './summary/SummaryActions';

interface SummaryPageProps {
  data: IdeaData;
  onReset: () => void;
}

const SummaryPage: React.FC<SummaryPageProps> = ({ data, onReset }) => {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleResetConfirm = () => {
    onReset();
    setIsResetDialogOpen(false);
    navigate('/idea');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container-width max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
              Summary
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Here is your idea and everything we found - ready to take action?
            </p>
            
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
                onResetClick={() => setIsResetDialogOpen(true)} 
              />
            </div>
          </div>
        </div>
      </main>
      
      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        title="Start a New Idea?"
        description="Your data will not be saved if you enter a new idea. Please copy your summary if you wish to keep it!"
        confirmText="Continue"
        cancelText="Cancel"
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetDialogOpen(false)}
        variant="destructive"
      />
    </div>
  );
};

export default SummaryPage;
