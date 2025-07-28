
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import FeatureCard from './FeatureCard';
import SetupFormContainer from '../setup/SetupFormContainer';

interface LocalFeature {
  id: string;
  title: string;
  description: string;
  priority: string;
}

interface FeatureFormProps {
  features: LocalFeature[];
  hasGenerated: boolean;
  canProceed: boolean;
  onAddFeature: () => void;
  onUpdateFeature: (id: string, field: keyof LocalFeature, value: string) => void;
  onRemoveFeature: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const FeatureForm: React.FC<FeatureFormProps> = ({
  features,
  hasGenerated,
  canProceed,
  onAddFeature,
  onUpdateFeature,
  onRemoveFeature,
  onSubmit,
  onBack
}) => {
  return (
    <SetupFormContainer onSubmit={onSubmit}>
      {features.length > 0 && (
        <div className="space-y-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              canDelete={features.length > 1}
              onUpdate={onUpdateFeature}
              onDelete={onRemoveFeature}
            />
          ))}
        </div>
      )}
      
      <Button
        type="button"
        onClick={onAddFeature}
        variant="outline"
        className="w-full gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Another Feature
      </Button>
    </SetupFormContainer>
  );
};

export default FeatureForm;
