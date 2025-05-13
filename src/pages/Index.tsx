
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
  const { user } = useAuth();
  
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
  
  // Only redirect user to the idea entry page if:
  // 1. They're trying to access a page that requires idea data
  // 2. They don't have idea data
  // 3. They're not on the idea entry or competitors page
  useEffect(() => {
    const currentPath = location.pathname;
    const isIdeaEntryPage = currentPath === '/idea' || currentPath === '/idea/';
    const isCompetitorsPage = currentPath === '/idea/competitors';
    const isMarketGapsPage = currentPath === '/idea/market-gaps';
    
    // Only redirect if:
    // - Not on idea entry page
    // - Not on competitors page 
    // - Not on market gaps page (new fix)
    // - AND the idea is empty
    if (!isIdeaEntryPage && !isCompetitorsPage && !isMarketGapsPage && !ideaData.idea) {
      navigate('/idea');
    }
  }, [location.pathname, ideaData.idea, navigate]);
  
  return (
    <Routes>
      <Route 
        path="/" 
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
