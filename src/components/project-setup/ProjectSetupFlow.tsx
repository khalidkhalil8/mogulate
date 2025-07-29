
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProjectStartStep from './ProjectStartStep';
import ProjectCompetitorsStep from './ProjectCompetitorsStep';
import ProjectMarketAnalysisStep from './ProjectMarketAnalysisStep';
import ProjectFeaturesStep from './ProjectFeaturesStep';
import ProjectValidationStep from './ProjectValidationStep';
import ProjectSummaryStep from './ProjectSummaryStep';
import { useAuth } from '@/context/AuthContext';

interface ProjectData {
  title: string;
  idea: string;
  competitors: any[];
  marketAnalysis?: any;
  features: any[];
  validationPlan: any[];
  selectedGapIndex?: number;
}

const ProjectSetupFlow: React.FC = () => {
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    idea: '',
    competitors: [],
    features: [],
    validationPlan: [],
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('projectSetupData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setProjectData(parsed);
      } catch (error) {
        console.error('Error parsing saved project data:', error);
      }
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const updateProjectData = (updates: Partial<ProjectData>) => {
    const newData = { ...projectData, ...updates };
    setProjectData(newData);
    
    // Persist to localStorage
    localStorage.setItem('projectSetupData', JSON.stringify(newData));
  };

  const clearProjectData = () => {
    localStorage.removeItem('projectSetupData');
    setProjectData({
      title: '',
      idea: '',
      competitors: [],
      features: [],
      validationPlan: [],
    });
  };

  if (!user) {
    return null;
  }

  return (
    <Routes>
      <Route 
        path="start" 
        element={
          <ProjectStartStep 
            projectData={projectData} 
            updateProjectData={updateProjectData} 
          />
        } 
      />
      <Route 
        path="competitors" 
        element={
          <ProjectCompetitorsStep 
            projectData={projectData} 
            updateProjectData={updateProjectData} 
          />
        } 
      />
      <Route 
        path="market-analysis" 
        element={
          <ProjectMarketAnalysisStep 
            projectData={projectData} 
            updateProjectData={updateProjectData} 
          />
        } 
      />
      <Route 
        path="features" 
        element={
          <ProjectFeaturesStep 
            projectData={projectData} 
            updateProjectData={updateProjectData} 
          />
        } 
      />
      <Route 
        path="validation" 
        element={
          <ProjectValidationStep 
            projectData={projectData} 
            updateProjectData={updateProjectData} 
          />
        } 
      />
      <Route 
        path="summary" 
        element={
          <ProjectSummaryStep 
            projectData={projectData} 
            updateProjectData={updateProjectData}
            onProjectSaved={clearProjectData}
          />
        } 
      />
    </Routes>
  );
};

export default ProjectSetupFlow;
