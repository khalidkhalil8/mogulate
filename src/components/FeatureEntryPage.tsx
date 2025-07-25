import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import SetupNavigation from './setup/SetupNavigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import FeatureWelcomeState from './features/FeatureWelcomeState';
import FeatureForm from './features/FeatureForm';
import { useProjectData } from '@/hooks/useProjectData';
import { useSetupHandlers } from '@/hooks/useSetupHandlers';
import { Feature } from '@/lib/types';

interface LocalFeature {
  id: string;
  title: string;
  description: string;
  priority: string;
}

const FeatureEntryPage: React.FC = () => {
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
    handleFeaturesSubmit,
  } = useSetupHandlers({
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
    projectId,
  });
  
  const [features, setFeatures] = useState<LocalFeature[]>(
    project?.project_features && project.project_features.length > 0 
      ? project.project_features.map(f => ({
          id: f.id,
          title: f.title,
          description: f.description,
          priority: f.priority
        }))
      : ideaData.features?.length > 0 
        ? ideaData.features.map(f => ({
            id: f.id,
            title: f.title,
            description: f.description,
            priority: f.priority
          }))
        : []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const navigate = useNavigate();
  
  // Update features when project data loads
  useEffect(() => {
    if (project?.project_features && project.project_features.length > 0) {
      setFeatures(project.project_features.map(f => ({
        id: f.id,
        title: f.title,
        description: f.description,
        priority: f.priority
      })));
      setHasGenerated(true);
    }
  }, [project]);
  
  const handleGenerateFeatures = async () => {
    setIsGenerating(true);
    try {
      let requestBody;

      if (projectId) {
        requestBody = { project_id: projectId };
      } else {
        if (!ideaData?.idea) {
          toast.error('Project idea is required');
          return;
        }

        let positioningSuggestion = '';
        if (ideaData.marketGapScoringAnalysis && selectedGapIndex !== undefined) {
          const selectedGap = ideaData.marketGapScoringAnalysis.marketGaps[selectedGapIndex];
          if (selectedGap?.positioningSuggestion) {
            positioningSuggestion = selectedGap.positioningSuggestion;
          }
        }

        if (!positioningSuggestion) {
          toast.error('Please complete market analysis and select a positioning strategy first');
          return;
        }

        requestBody = { 
          idea: ideaData.idea, 
          positioningSuggestion: positioningSuggestion 
        };
      }

      const { data, error } = await supabase.functions.invoke('generate-features', {
        body: requestBody
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        const generatedFeatures = data.features.map((f: any) => ({
          id: f.id,
          title: f.title,
          description: f.description,
          priority: f.priority
        }));
        setFeatures(generatedFeatures);
        setHasGenerated(true);
        toast.success('Features generated successfully!');
      } else {
        throw new Error(data.error || 'Failed to generate features');
      }
    } catch (error) {
      console.error('Error generating features:', error);
      toast.error('Failed to generate features. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const addFeature = () => {
    const newFeature: LocalFeature = {
      id: Date.now().toString(),
      title: '',
      description: '',
      priority: 'Medium'
    };
    setFeatures([...features, newFeature]);
  };
  
  const removeFeature = (id: string) => {
    if (features.length > 1) {
      setFeatures(features.filter(feature => feature.id !== id));
    }
  };
  
  const updateFeature = (id: string, field: keyof LocalFeature, value: string) => {
    setFeatures(features.map(feature => 
      feature.id === id ? { ...feature, [field]: value } : feature
    ));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullFeatures: Feature[] = features.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      status: 'Planned' as const,
      priority: f.priority as 'Low' | 'Medium' | 'High'
    }));
    
    if (projectId && project) {
      await updateProject(projectId, { project_features: fullFeatures });
    }
    
    handleFeaturesSubmit(fullFeatures);
    
    const nextUrl = projectId ? `/validation-plan?projectId=${projectId}` : '/validation-plan';
    navigate(nextUrl);
  };
  
  const handleBack = async () => {
    const fullFeatures: Feature[] = features.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      status: 'Planned' as const,
      priority: f.priority as 'Low' | 'Medium' | 'High'
    }));
    
    if (projectId && project) {
      await updateProject(projectId, { project_features: fullFeatures });
    }
    
    handleFeaturesSubmit(fullFeatures);
    
    const backUrl = projectId ? `/market-gaps?projectId=${projectId}` : '/market-gaps';
    navigate(backUrl);
  };

  const canProceed = hasGenerated || features.length > 0;
  
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {!hasGenerated && features.length === 0 ? (
            <FeatureWelcomeState
              onGenerateFeatures={handleGenerateFeatures}
              isGenerating={isGenerating}
            />
          ) : (
            <FeatureForm
              features={features}
              hasGenerated={hasGenerated}
              canProceed={canProceed}
              onAddFeature={addFeature}
              onUpdateFeature={updateFeature}
              onRemoveFeature={removeFeature}
              onSubmit={handleSubmit}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureEntryPage;
