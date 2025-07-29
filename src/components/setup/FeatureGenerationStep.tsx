
import React, { useState, useEffect } from 'react';
import SetupPageLayout from './SetupPageLayout';
import { ProjectSetupData } from '@/pages/ProjectSetupPage';
import { Button } from '@/components/ui/button';
import { Plus, Lightbulb, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Feature } from '@/lib/types';
import FeatureCard from '@/components/features/FeatureCard';
import FeatureForm from '@/components/features/FeatureForm';

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

    setIsGenerating(true);
    try {
      // Generate some sample features based on the description
      const sampleFeatures: Feature[] = [
        {
          id: `feature-${Date.now()}-1`,
          title: 'User Authentication',
          description: 'Secure user registration and login system',
          status: 'Planned',
          priority: 'High',
        },
        {
          id: `feature-${Date.now()}-2`,
          title: 'Core Functionality',
          description: 'Main features based on your project description',
          status: 'Planned',
          priority: 'High',
        },
        {
          id: `feature-${Date.now()}-3`,
          title: 'User Dashboard',
          description: 'Personalized dashboard for users',
          status: 'Planned',
          priority: 'Medium',
        },
      ];

      const newFeatures = [...features, ...sampleFeatures];
      setFeatures(newFeatures);
      toast.success(`Generated ${sampleFeatures.length} features`);
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleGenerateFeatures}
            disabled={isGenerating || !setupData.description.trim()}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Features'}
          </Button>

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
            <FeatureForm
              onSave={handleAddFeature}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {features.length > 0 && (
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
        )}

        {features.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-4">
              <Lightbulb className="w-12 h-12 mx-auto mb-2" />
              <p>No features added yet</p>
              <p className="text-sm">Use the buttons above to generate or add features</p>
            </div>
          </div>
        )}
      </div>
    </SetupPageLayout>
  );
};

export default FeatureGenerationStep;
