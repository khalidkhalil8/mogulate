
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import IdeaEntryPage from '../IdeaEntryPage';
import CompetitorDiscoveryPage from '../CompetitorDiscoveryPage';
import MarketGapPage from '../MarketGapPage';
import FeatureEntryPage from '../FeatureEntryPage';
import ValidationPlanPage from '../ValidationPlanPage';
import SummaryPage from '../SummaryPage';
import { useProjectData } from '@/hooks/useProjectData';
import { useSetupHandlers } from '@/hooks/useSetupHandlers';

const SetupFlowRouter: React.FC = () => {
  const {
    projectId,
    existingProject,
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
  } = useProjectData();

  const {
    handleIdeaSubmit,
    handleCompetitorsSubmit,
    handleMarketGapsSubmit,
    handleFeaturesSubmit,
    handleValidationPlanSubmit,
    handleSaveProject,
    handleReset,
  } = useSetupHandlers({
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
    projectId,
  });

  return (
    <Routes>
      <Route path="/" element={<Navigate to="idea" replace />} />
      <Route
        path="idea"
        element={
          <IdeaEntryPage
            initialIdea={ideaData.idea}
            initialTitle={projectTitle}
            onIdeaSubmit={handleIdeaSubmit}
          />
        }
      />
      <Route
        path="competitors"
        element={
          <CompetitorDiscoveryPage
            idea={ideaData.idea}
            initialCompetitors={ideaData.competitors}
            onCompetitorsSubmit={handleCompetitorsSubmit}
          />
        }
      />
      <Route
        path="market-gaps"
        element={
          <MarketGapPage
            idea={ideaData.idea}
            competitors={ideaData.competitors}
            initialMarketGaps={ideaData.marketGaps}
            initialAnalysis={ideaData.marketGapAnalysis}
            projectId={projectId}
            onMarketGapsSubmit={handleMarketGapsSubmit}
          />
        }
      />
      <Route
        path="features"
        element={
          <FeatureEntryPage
            ideaData={ideaData}
            selectedGapIndex={selectedGapIndex}
            onFeaturesSubmit={handleFeaturesSubmit}
            initialFeatures={ideaData.features}
          />
        }
      />
      <Route
        path="validation-plan"
        element={
          <ValidationPlanPage
            ideaData={ideaData}
            selectedGapIndex={selectedGapIndex}
            onValidationPlanSubmit={handleValidationPlanSubmit}
          />
        }
      />
      <Route
        path="summary"
        element={
          <SummaryPage
            data={ideaData}
            selectedGapIndex={selectedGapIndex}
            onSaveProject={handleSaveProject}
          />
        }
      />
    </Routes>
  );
};

export default SetupFlowRouter;
