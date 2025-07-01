
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { toast } from '@/components/ui/sonner';
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

  const projectId = searchParams.get('projectId');
  const existingProject = projects.find(p => p.id === projectId);

  const [projectTitle, setProjectTitle] = useState('');
  const [ideaData, setIdeaData] = useState<IdeaData>({
    idea: existingProject?.idea || '',
    competitors: existingProject?.competitors || [],
    marketGaps: existingProject?.market_gaps || '',
    features: existingProject?.features || [],
    validationPlan: existingProject?.validation_plan || '',
    marketGapAnalysis: existingProject?.market_gap_analysis,
  });

  // Warn on exit if project has not been saved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!projectId) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [projectId]);

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
      setProjectTitle(existingProject.title || '');
    }
  }, [existingProject]);

  const handleIdeaSubmit = async (idea: string, title: string) => {
    setIdeaData(prev => ({ ...prev, idea }));
    setProjectTitle(title);
    navigate('/competitors');
  };

  const handleCompetitorsSubmit = async (competitors: Competitor[]) => {
    setIdeaData(prev => ({ ...prev, competitors }));
    navigate('/market-gaps');
  };

  const handleMarketGapsSubmit = async (marketGaps: string, analysis: MarketGapAnalysis | undefined) => {
    setIdeaData(prev => ({ ...prev, marketGaps, marketGapAnalysis: analysis }));
    navigate('/features');
  };

  const handleFeaturesSubmit = async (features: Feature[]) => {
    setIdeaData(prev => ({ ...prev, features }));
    navigate('/validation-plan');
  };

  const handleValidationPlanSubmit = async (validationPlan: string) => {
    setIdeaData(prev => ({ ...prev, validationPlan }));
    navigate('/summary');
  };

  const handleSaveProject = async () => {
    if (!user) {
      toast.error('You must be logged in to save a project');
      return;
    }

    try {
      const newProject = await createProject(projectTitle, ideaData.idea);
      if (!newProject) throw new Error('Project creation failed');

      await updateProject(newProject.id, {
        competitors: ideaData.competitors,
        market_gaps: ideaData.marketGaps,
        features: ideaData.features,
        validation_plan: ideaData.validationPlan,
        market_gap_analysis: ideaData.marketGapAnalysis,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      toast.error('Failed to save project. Please try again.');
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const currentPath = location.pathname;

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
          initialTitle={projectTitle}
          onIdeaSubmit={handleIdeaSubmit}
        />
      );
    case '/':
    default:
      if (!user) {
        return <HomePage />;
      } else {
        navigate('/dashboard');
        return null;
      }
  }
};

export default Index;
