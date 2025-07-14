
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import type { Competitor } from '@/lib/types';
import LoadingState from './ui/LoadingState';
import { fetchCompetitors } from '@/lib/api/competitors';
import SetupNavigation from './setup/SetupNavigation';
import CompetitorWelcomeState from './competitors/CompetitorWelcomeState';
import CompetitorForm from './competitors/CompetitorForm';
import { toast } from '@/components/ui/sonner';
import { useProjectData } from '@/hooks/useProjectData';
import { useSetupHandlers } from '@/hooks/useSetupHandlers';

const CompetitorDiscoveryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { projects, updateProject } = useProjects();
  const project = projects.find(p => p.id === projectId);
  
  const {
    existingProject,
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
  } = useProjectData();

  const {
    handleCompetitorsSubmit,
  } = useSetupHandlers({
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
    projectId,
  });
  
  const [competitors, setCompetitors] = useState<Competitor[]>(
    project?.competitors && project.competitors.length > 0 
      ? project.competitors.map(c => ({
          id: c.id,
          name: c.name,
          website: c.website,
          description: c.description,
          isAiGenerated: c.isAiGenerated
        }))
      : ideaData.competitors?.length > 0 
        ? ideaData.competitors 
        : []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const navigate = useNavigate();
  
  // Update competitors when project data loads
  useEffect(() => {
    if (project?.competitors && project.competitors.length > 0) {
      setCompetitors(project.competitors.map(c => ({
        id: c.id,
        name: c.name,
        website: c.website,
        description: c.description,
        isAiGenerated: c.isAiGenerated
      })));
      setHasGenerated(true);
    }
  }, [project]);
  
  const handleGenerateCompetitors = async () => {
    setIsGenerating(true);
    try {
      const result = await fetchCompetitors(ideaData.idea);
      if (result.competitors.length > 0) {
        setCompetitors(result.competitors);
        setHasGenerated(true);
        toast.success('Competitors found successfully!');
      } else {
        toast.error('No competitors found. You can add them manually.');
        setHasGenerated(true);
      }
    } catch (error) {
      console.error('Error finding competitors:', error);
      toast.error('Failed to find competitors. You can add them manually.');
      setHasGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const addCompetitor = () => {
    const newCompetitor: Competitor = {
      id: `manual-${Math.random().toString(36).substring(2, 9)}`,
      name: '',
      website: '',
      description: '',
    };
    setCompetitors([...competitors, newCompetitor]);
  };
  
  const updateCompetitor = (id: string, field: keyof Competitor, value: string) => {
    setCompetitors(competitors.map(comp => 
      comp.id === id ? { ...comp, [field]: value } : comp
    ));
  };
  
  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(comp => comp.id !== id));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (projectId && project) {
      await updateProject(projectId, { competitors });
    }
    
    handleCompetitorsSubmit(competitors);
    
    const nextUrl = projectId ? `/market-gaps?projectId=${projectId}` : '/market-gaps';
    navigate(nextUrl);
  };
  
  const handleBack = async () => {
    if (projectId && project) {
      await updateProject(projectId, { competitors });
    }
    
    handleCompetitorsSubmit(competitors);
    
    const backUrl = projectId ? `/idea?projectId=${projectId}` : '/idea';
    navigate(backUrl);
  };

  const canProceed = hasGenerated || competitors.length > 0;
  
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {isGenerating ? (
            <LoadingState message="Hang tight - our AI is finding competitors" />
          ) : !hasGenerated && competitors.length === 0 ? (
            <CompetitorWelcomeState
              onGenerateCompetitors={handleGenerateCompetitors}
              isGenerating={isGenerating}
            />
          ) : (
            <CompetitorForm
              competitors={competitors}
              hasGenerated={hasGenerated}
              canProceed={canProceed}
              onAddCompetitor={addCompetitor}
              onUpdateCompetitor={updateCompetitor}
              onRemoveCompetitor={removeCompetitor}
              onSubmit={handleSubmit}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitorDiscoveryPage;
