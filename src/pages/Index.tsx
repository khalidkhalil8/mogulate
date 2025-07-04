
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProjectData } from '@/hooks/useProjectData';
import { useSetupHandlers } from '@/hooks/useSetupHandlers';
import HomePage from '@/components/HomePage';
import SetupFlowRouter from '@/components/setup/SetupFlowRouter';
import ProjectDataWarning from '@/components/setup/ProjectDataWarning';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  const {
    projectId,
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
  } = useSetupHandlers({
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
    projectId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Show homepage for non-authenticated users
  if (!user) {
    return <HomePage />;
  }

  // Redirect authenticated users to dashboard from root
  if (window.location.pathname === '/') {
    navigate('/dashboard');
    return null;
  }

  return (
    <>
      <ProjectDataWarning projectId={projectId} />
      <SetupFlowRouter
        ideaData={ideaData}
        projectTitle={projectTitle}
        selectedGapIndex={selectedGapIndex}
        onIdeaSubmit={handleIdeaSubmit}
        onCompetitorsSubmit={handleCompetitorsSubmit}
        onMarketGapsSubmit={handleMarketGapsSubmit}
        onFeaturesSubmit={handleFeaturesSubmit}
        onValidationPlanSubmit={handleValidationPlanSubmit}
        onSaveProject={handleSaveProject}
      />
    </>
  );
};

export default Index;
