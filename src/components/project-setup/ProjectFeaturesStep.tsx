
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Target } from 'lucide-react';
import SetupPageLayout from '@/components/setup/SetupPageLayout';
import FeatureForm from '@/components/features/FeatureForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import type { Feature } from '@/lib/types';

interface LocalFeature {
  id: string;
  title: string;
  description: string;
  priority: string;
}

interface ProjectFeaturesStepProps {
  projectData: any;
  updateProjectData: (data: any) => void;
}

const ProjectFeaturesStep: React.FC<ProjectFeaturesStepProps> = ({
  projectData,
  updateProjectData
}) => {
  const [features, setFeatures] = useState<LocalFeature[]>(
    projectData.features?.map((f: any) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      priority: f.priority
    })) || []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(features.length > 0);
  const navigate = useNavigate();

  useEffect(() => {
    // Save to localStorage for persistence
    const fullFeatures: Feature[] = features.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      status: 'Planned' as const,
      priority: f.priority as 'Low' | 'Medium' | 'High'
    }));
    
    localStorage.setItem('projectSetupData', JSON.stringify({
      ...projectData,
      features: fullFeatures
    }));
  }, [features, projectData]);

  const handleGenerateFeatures = async () => {
    if (!projectData.idea || !projectData.marketAnalysis || projectData.selectedGapIndex === undefined) {
      toast.error('Please complete previous steps first');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedGap = projectData.marketAnalysis.marketGaps[projectData.selectedGapIndex];
      const positioningSuggestion = selectedGap?.positioningSuggestion || '';

      const { data, error } = await supabase.functions.invoke('generate-features', {
        body: { 
          idea: projectData.idea, 
          positioningSuggestion: positioningSuggestion 
        }
      });

      if (error) throw error;

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

  const handleNext = () => {
    const fullFeatures: Feature[] = features.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      status: 'Planned' as const,
      priority: f.priority as 'Low' | 'Medium' | 'High'
    }));
    
    updateProjectData({ features: fullFeatures });
    navigate('/project-setup/validation');
  };

  const handleBack = () => {
    const fullFeatures: Feature[] = features.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      status: 'Planned' as const,
      priority: f.priority as 'Low' | 'Medium' | 'High'
    }));
    
    updateProjectData({ features: fullFeatures });
    navigate('/project-setup/market-analysis');
  };

  const canProceed = features.length > 0;

  if (!hasGenerated && features.length === 0) {
    return (
      <SetupPageLayout
        title="Generate Product Features"
        description="AI will suggest features based on your market positioning and competitive analysis."
        showNavigation={false}
      >
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <Button 
            onClick={handleGenerateFeatures}
            className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
            disabled={isGenerating}
          >
            <Target className="h-5 w-5 mr-2" />
            {isGenerating ? 'Generating Features...' : 'Generate Features'}
          </Button>
          
          <p className="text-sm text-gray-500">
            This will create 3-5 features based on your market analysis
          </p>

          <div className="flex justify-between pt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
            <div />
          </div>
        </div>
      </SetupPageLayout>
    );
  }

  return (
    <SetupPageLayout
      title="Review & Edit Your Features"
      description={hasGenerated 
        ? "AI has suggested features based on your market positioning. You can edit them or add more."
        : "Add and configure the features you want to build for your product."
      }
      onNext={handleNext}
      onBack={handleBack}
      canProceed={canProceed}
    >
      <FeatureForm
        features={features}
        hasGenerated={hasGenerated}
        canProceed={canProceed}
        onAddFeature={addFeature}
        onUpdateFeature={updateFeature}
        onRemoveFeature={removeFeature}
        onSubmit={(e) => { e.preventDefault(); handleNext(); }}
        onBack={handleBack}
      />
    </SetupPageLayout>
  );
};

export default ProjectFeaturesStep;
