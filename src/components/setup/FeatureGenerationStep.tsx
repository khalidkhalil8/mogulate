
import React, { useState, useEffect } from 'react';
import SetupPageLayout from './SetupPageLayout';
import { ProjectSetupData } from '@/pages/ProjectSetupPage';
import { Button } from '@/components/ui/button';
import { Plus, Lightbulb, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Feature } from '@/lib/types';
import FeatureCard from '@/components/features/FeatureCard';
import AddFeatureForm from '@/components/features/AddFeatureForm';
import { supabase } from '@/integrations/supabase/client';

interface FeatureGenerationStepProps {
  setupData: ProjectSetupData;
  updateSetupData: (updates: Partial<ProjectSetupData>) => void;
  onNext: () => void;
  onBack?: () => void;
  canProceed: boolean;
  isLoading: boolean;
}

const FeatureGenerationStep: React.FC<FeatureGenerationStepProps> = ({
  setupData,
  updateSetupData,
  onNext,
  onBack,
  canProceed,
  isLoading,
}) => {
  const [features, setFeatures] = useState<Feature[]>(setupData.features);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setFeatures(setupData.features);
  }, [setupData.features]);

  const handleNext = () => {
    updateSetupData({ features });
    onNext();
  };

  const handleGenerateFeatures = async () => {
    if (!setupData.description.trim()) {
      toast.error('Please add a project description first');
      return;
    }

    if (!setupData.marketAnalysis?.marketGaps?.length) {
      toast.error('Please complete market analysis first to generate relevant features');
      return;
    }

    setIsGenerating(true);
    try {
      // Get the selected market gap or use the highest scored one
      const marketGaps = setupData.marketAnalysis.marketGaps;
      const selectedGap = setupData.selectedGapIndex !== undefined 
        ? marketGaps[setupData.selectedGapIndex]
        : marketGaps.reduce((best, current) => current.score > best.score ? current : best);

      const { data, error } = await supabase.functions.invoke('generate-features', {
        body: {
          idea: `${setupData.title}: ${setupData.description}`,
          positioningSuggestion: selectedGap.positioningSuggestion
        }
      });

      if (error) {
        console.error('Error generating features:', error);
        toast.error('Failed to generate features');
        return;
      }

      if (data.features && Array.isArray(data.features)) {
        const newFeatures = [...features, ...data.features];
        setFeatures(newFeatures);
        toast.success(`Generated ${data.features.length} features`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating features:', error);
      toast.error('Failed to generate features');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddFeature = (feature: Feature) => {
    const newFeatures = [...features, feature];
    setFeatures(newFeatures);
    setShowAddForm(false);
  };

  const handleUpdateFeature = (featureId: string, field: keyof Feature, value: string) => {
    const updatedFeatures = features.map(feature =>
      feature.id === featureId ? { ...feature, [field]: value } : feature
    );
    setFeatures(updatedFeatures);
  };

  const handleRemoveFeature = (featureId: string) => {
    const updatedFeatures = features.filter(feature => feature.id !== featureId);
    setFeatures(updatedFeatures);
  };

  if (features.length === 0) {
    return (
      <SetupPageLayout
        title="Generate Features"
        description="Define the key features and functionality of your project"
        onNext={handleNext}
        onBack={onBack}
        nextLabel="Continue"
        canProceed={!isLoading}
        isLoading={isLoading}
        showNavigation={false}
      >
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <Button
              onClick={handleGenerateFeatures}
              disabled={isGenerating || !setupData.description.trim() || !setupData.marketAnalysis?.marketGaps?.length}
              className="standard-button bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lightbulb className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating Features...' : 'Generate Features with AI'}
            </Button>
          </div>
          
          {(!setupData.marketAnalysis?.marketGaps?.length) && (
            <p className="text-sm text-gray-500">
              Complete market analysis first to generate relevant features
            </p>
          )}
        </div>
      </SetupPageLayout>
    );
  }

  return (
    <SetupPageLayout
      title="Generate Features"
      description="Define the key features and functionality of your project"
      onNext={handleNext}
      onBack={onBack}
      nextLabel="Continue"
      canProceed={!isLoading}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Feature
          </Button>
        </div>

        {showAddForm && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Add Feature</h3>
            <AddFeatureForm
              onSave={handleAddFeature}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">
            Features ({features.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                index={index}
                canDelete={true}
                onUpdate={handleUpdateFeature}
                onDelete={handleRemoveFeature}
              />
            ))}
          </div>
        </div>
      </div>
    </SetupPageLayout>
  );
};

export default FeatureGenerationStep;
