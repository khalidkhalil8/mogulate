
import React from 'react';
import { useLocation } from 'react-router-dom';
import CompetitorDiscoveryPage from '@/components/CompetitorDiscoveryPage';
import MarketGapPage from '@/components/MarketGapPage';
import FeatureEntryPage from '@/components/FeatureEntryPage';
import ValidationPlanPage from '@/components/ValidationPlanPage';
import SummaryPage from '@/components/SummaryPage';
import IdeaEntryPage from '@/components/IdeaEntryPage';
import type { IdeaData, Competitor, MarketGapAnalysis, Feature } from '@/lib/types';
import type { MarketGapScoringAnalysis } from '@/lib/api/marketGapsScoring';

interface SetupFlowRouterProps {
  ideaData: IdeaData;
  projectTitle: string;
  selectedGapIndex?: number;
  onIdeaSubmit: (idea: string, title: string) => Promise<void>;
  onCompetitorsSubmit: (competitors: Competitor[]) => Promise<void>;
  onMarketGapsSubmit: (
    marketGaps: string, 
    analysis: MarketGapAnalysis | undefined, 
    scoringAnalysis?: MarketGapScoringAnalysis,
    selectedIndex?: number
  ) => Promise<void>;
  onFeaturesSubmit: (features: Feature[]) => Promise<void>;
  onValidationPlanSubmit: (validationPlan: string) => Promise<void>;
  onSaveProject: () => Promise<void>;
}

const SetupFlowRouter: React.FC<SetupFlowRouterProps> = ({
  ideaData,
  projectTitle,
  selectedGapIndex,
  onIdeaSubmit,
  onCompetitorsSubmit,
  onMarketGapsSubmit,
  onFeaturesSubmit,
  onValidationPlanSubmit,
  onSaveProject,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  switch (currentPath) {
    case '/competitors':
      return (
        <CompetitorDiscoveryPage
          idea={ideaData.idea}
          initialCompetitors={ideaData.competitors}
          onCompetitorsSubmit={onCompetitorsSubmit}
        />
      );
    case '/market-gaps':
      return (
        <MarketGapPage
          idea={ideaData.idea}
          competitors={ideaData.competitors}
          initialMarketGaps={ideaData.marketGaps}
          initialAnalysis={ideaData.marketGapAnalysis}
          onMarketGapsSubmit={onMarketGapsSubmit}
        />
      );
    case '/features':
      return (
        <FeatureEntryPage
          initialFeatures={ideaData.features}
          onFeaturesSubmit={onFeaturesSubmit}
          ideaData={ideaData}
          selectedGapIndex={selectedGapIndex}
        />
      );
    case '/validation-plan':
      return (
        <ValidationPlanPage
          initialValidationPlan={ideaData.validationPlan}
          onValidationPlanSubmit={onValidationPlanSubmit}
          ideaData={ideaData}
          selectedGapIndex={selectedGapIndex}
        />
      );
    case '/summary':
      return (
        <SummaryPage
          data={ideaData}
          selectedGapIndex={selectedGapIndex}
          onSaveProject={onSaveProject}
        />
      );
    case '/idea':
      return (
        <IdeaEntryPage
          initialIdea={ideaData.idea}
          initialTitle={projectTitle}
          onIdeaSubmit={onIdeaSubmit}
        />
      );
    default:
      return null;
  }
};

export default SetupFlowRouter;
