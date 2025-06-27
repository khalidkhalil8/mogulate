
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoading } = useAuth();
  const { createProject, updateProject, projects } = useProjects();
  
  // Get project ID from URL params if it exists
  const projectId = searchParams.get('projectId');
  const existingProject = projects.find(p => p.id === projectId);
  
  const [ideaData, setIdeaData] = useState<IdeaData>({
    idea: existingProject?.idea || '',
    competitors: existingProject?.competitors || [],
    marketGaps: existingProject?.market_gaps || '',
    features: existingProject?.features || [],
    validationPlan: existingProject?.validation_plan || '',
    marketGapAnalysis: existingProject?.market_gap_analysis,
  });
  
  // Update ideaData when project loads
  useEffect(() => {
    if (existingProject) {
      setIdeaData({
        idea: existingProject.idea || '',
        competitors: existingProject.competitors || [],
        marketGaps: existingProject.market_gaps || '',
        features: existingProject.features || [],
        validationPlan: existingProject.validation_plan || '',
        marketGapAnalysis: existingProject.market_gap_analysis,
      });
    }
  }, [existingProject]);
  
  const handleIdeaSubmit = async (idea: string, title: string) => {
    setIdeaData(prev => ({ ...prev, idea }));
    
    // Create project if it doesn't exist
    if (!projectId && user) {
      const newProject = await createProject(title, idea);
      if (newProject) {
        setSearchParams({ projectId: newProject.id });
      }
    } else if (projectId) {
      // Update existing project
      await updateProject(projectId, { idea });
    }
  };
  
  const handleCompetitorsSubmit = async (competitors: Competitor[]) => {
    setIdeaData(prev => ({ ...prev, competitors }));
    
    if (projectId) {
      await updateProject(projectId, { competitors });
    }
  };
  
  const handleMarketGapsSubmit = async (marketGaps: string, analysis: MarketGapAnalysis | undefined) => {
    setIdeaData(prev => ({ ...prev, marketGaps, marketGapAnalysis: analysis }));
    
    if (projectId) {
      await updateProject(projectId, { 
        market_gaps: marketGaps,
        market_gap_analysis: analysis 
      });
    }
  };
  
  const handleFeaturesSubmit = async (features: Feature[]) => {
    setIdeaData(prev => ({ ...prev, features }));
    
    if (projectId) {
      await updateProject(projectId, { features });
    }
  };
  
  const handleValidationPlanSubmit = async (validationPlan: string) => {
    setIdeaData(prev => ({ ...prev, validationPlan }));
    
    if (projectId) {
      await updateProject(projectId, { validation_plan: validationPlan });
    }
  };
  
  const handleSaveProject = async () => {
    if (!projectId) {
      throw new Error('No project to save');
    }
    
    // Final save to ensure all data is persisted
    await updateProject(projectId, {
      idea: ideaData.idea,
      competitors: ideaData.competitors,
      market_gaps: ideaData.marketGaps,
      features: ideaData.features,
      validation_plan: ideaData.validationPlan,
      market_gap_analysis: ideaData.marketGapAnalysis,
    });
  };
  
  const handleReset = () => {
    setIdeaData({
      idea: '',
      competitors: [],
      marketGaps: '',
      features: [],
      validationPlan: '',
    });
    setSearchParams({});
  };
  
  // Show loading spinner while auth is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }
  
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
