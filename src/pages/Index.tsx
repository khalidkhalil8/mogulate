
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import HomePage from '@/components/HomePage';
import IdeaEntryPage from '@/components/IdeaEntryPage';
import CompetitorDiscoveryPage from '@/components/CompetitorDiscoveryPage';
import MarketGapPage from '@/components/MarketGapPage';
import FeatureEntryPage from '@/components/FeatureEntryPage';
import ValidationPlanPage from '@/components/ValidationPlanPage';
import SummaryPage from '@/components/SummaryPage';
import type { IdeaData, Competitor, MarketGapAnalysis, Feature } from '@/lib/types';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createProject } = useProjects();
  
  const [ideaData, setIdeaData] = useState<IdeaData>({
    idea: '',
    competitors: [],
    marketGaps: '',
    features: [],
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
  
  const handleFeaturesSubmit = (features: Feature[]) => {
    setIdeaData(prev => ({ ...prev, features }));
  };
  
  const handleValidationPlanSubmit = (validationPlan: string) => {
    setIdeaData(prev => ({ ...prev, validationPlan }));
  };
  
  const handleSaveProject = async () => {
    if (!ideaData.idea) {
      throw new Error('Project idea is required');
    }
    
    // Create the project with all the collected data
    const project = await createProject(ideaData.idea, ideaData.idea);
    
    if (!project) {
      throw new Error('Failed to create project');
    }
    
    // Update the project with all the additional data
    // Note: This would require updating the project with competitors, market gaps, features, etc.
    // For now, the project is created with the basic idea
  };
  
  const handleReset = () => {
    setIdeaData({
      idea: '',
      competitors: [],
      marketGaps: '',
      features: [],
      validationPlan: '',
    });
  };
  
  // Get the current path from the URL
  const currentPath = location.pathname;
  
  // Show the appropriate component based on the current path
  switch (currentPath) {
    case '/competitors':
      return (
        <CompetitorDiscoveryPage 
          idea={ideaData.idea}
          initialCompetitors={ideaData.competitors}
          onCompetitorsSubmit={handleCompetitorsSubmit}
        />
      );
    case '/market-gaps':
      return (
        <MarketGapPage 
          idea={ideaData.idea}
          competitors={ideaData.competitors}
          initialMarketGaps={ideaData.marketGaps}
          initialAnalysis={ideaData.marketGapAnalysis}
          onMarketGapsSubmit={handleMarketGapsSubmit}
        />
      );
    case '/features':
      return (
        <FeatureEntryPage 
          initialFeatures={ideaData.features}
          onFeaturesSubmit={handleFeaturesSubmit}
        />
      );
    case '/validation-plan':
      return (
        <ValidationPlanPage 
          initialValidationPlan={ideaData.validationPlan}
          onValidationPlanSubmit={handleValidationPlanSubmit}
        />
      );
    case '/summary':
      return (
        <SummaryPage 
          data={ideaData}
          onSaveProject={handleSaveProject}
        />
      );
    case '/idea':
      return (
        <IdeaEntryPage 
          initialIdea={ideaData.idea} 
          onIdeaSubmit={handleIdeaSubmit} 
        />
      );
    case '/':
    default:
      // For the root path, show the home page if user is not logged in, otherwise idea entry
      if (!user) {
        return <HomePage />;
      } else {
        return (
          <IdeaEntryPage 
            initialIdea={ideaData.idea} 
            onIdeaSubmit={handleIdeaSubmit} 
          />
        );
      }
  }
};

export default Index;
