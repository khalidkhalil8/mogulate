
import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import HomePage from '@/components/HomePage';
import IdeaEntryPage from '@/components/IdeaEntryPage';
import CompetitorDiscoveryPage from '@/components/CompetitorDiscoveryPage';
import MarketGapPage from '@/components/MarketGapPage';
import ValidationPlanPage from '@/components/ValidationPlanPage';
import SummaryPage from '@/components/SummaryPage';
import type { IdeaData, Competitor, MarketGapAnalysis } from '@/lib/types';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [ideaData, setIdeaData] = useState<IdeaData>({
    idea: '',
    competitors: [],
    marketGaps: '',
    validationPlan: '',
  });
  
  const handleIdeaSubmit = (idea: string) => {
    setIdeaData(prev => ({ ...prev, idea }));
  };
  
  const handleCompetitorsSubmit = (competitors: Competitor[]) => {
    setIdeaData(prev => ({ ...prev, competitors }));
  };
  
  const handleMarketGapsSubmit = (marketGaps: string, analysis: MarketGapAnalysis | undefined) => {
    setIdeaData(prev => ({ ...prev, marketGaps, marketGapAnalysis: analysis }));
  };
  
  const handleValidationPlanSubmit = (validationPlan: string) => {
    setIdeaData(prev => ({ ...prev, validationPlan }));
  };
  
  const handleReset = () => {
    setIdeaData({
      idea: '',
      competitors: [],
      marketGaps: '',
      validationPlan: '',
    });
  };
  
  // Check if user is trying to access a page without completing previous steps
  React.useEffect(() => {
    if (location.pathname === '/competitors' && !ideaData.idea) {
      navigate('/idea');
    } else if (location.pathname === '/market-gaps' && (!ideaData.idea || ideaData.competitors.length === 0)) {
      navigate('/idea');
    } else if (location.pathname === '/validation-plan' && (!ideaData.idea || ideaData.competitors.length === 0 || !ideaData.marketGaps)) {
      navigate('/idea');
    } else if (location.pathname === '/summary' && (!ideaData.idea || ideaData.competitors.length === 0 || !ideaData.marketGaps || !ideaData.validationPlan)) {
      navigate('/idea');
    }
  }, [location.pathname, ideaData, navigate]);
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/idea" 
        element={
          <IdeaEntryPage 
            initialIdea={ideaData.idea} 
            onIdeaSubmit={handleIdeaSubmit} 
          />
        } 
      />
      <Route 
        path="/competitors" 
        element={
          <CompetitorDiscoveryPage 
            idea={ideaData.idea}
            initialCompetitors={ideaData.competitors}
            onCompetitorsSubmit={handleCompetitorsSubmit}
          />
        } 
      />
      <Route 
        path="/market-gaps" 
        element={
          <MarketGapPage 
            idea={ideaData.idea}
            competitors={ideaData.competitors}
            initialMarketGaps={ideaData.marketGaps}
            initialAnalysis={ideaData.marketGapAnalysis}
            onMarketGapsSubmit={handleMarketGapsSubmit}
          />
        } 
      />
      <Route 
        path="/validation-plan" 
        element={
          <ValidationPlanPage 
            initialValidationPlan={ideaData.validationPlan}
            onValidationPlanSubmit={handleValidationPlanSubmit}
          />
        } 
      />
      <Route 
        path="/summary" 
        element={
          <SummaryPage 
            data={ideaData}
            onReset={handleReset}
          />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Index;
