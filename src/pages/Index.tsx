
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
  
  // Determine which component to show based on the current path
  const currentPath = location.pathname;
  
  // Prevent access to steps if idea is empty
  useEffect(() => {
    if (currentPath !== '/idea' && !ideaData.idea) {
      navigate('/idea');
    }
  }, [currentPath, ideaData.idea, navigate]);
  
  // Render the correct component based on the current path
  if (currentPath === '/competitors') {
    return (
      <CompetitorDiscoveryPage 
        idea={ideaData.idea}
        initialCompetitors={ideaData.competitors}
        onCompetitorsSubmit={handleCompetitorsSubmit}
      />
    );
  } else if (currentPath === '/market-gaps') {
    return (
      <MarketGapPage 
        idea={ideaData.idea}
        competitors={ideaData.competitors}
        initialMarketGaps={ideaData.marketGaps}
        initialAnalysis={ideaData.marketGapAnalysis}
        onMarketGapsSubmit={handleMarketGapsSubmit}
      />
    );
  } else if (currentPath === '/validation-plan') {
    return (
      <ValidationPlanPage 
        initialValidationPlan={ideaData.validationPlan}
        onValidationPlanSubmit={handleValidationPlanSubmit}
      />
    );
  } else if (currentPath === '/summary') {
    return (
      <SummaryPage 
        data={ideaData}
        onReset={handleReset}
      />
    );
  } else {
    // Default to idea entry page
    return (
      <IdeaEntryPage 
        initialIdea={ideaData.idea} 
        onIdeaSubmit={handleIdeaSubmit} 
      />
    );
  }
};

export default Index;
