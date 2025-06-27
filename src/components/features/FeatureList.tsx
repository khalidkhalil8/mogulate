
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import FeatureForm from './FeatureForm';

interface Feature {
  id: string;
  title: string;
  description: string;
  priority: string;
}

interface FeatureListProps {
  features: Feature[];
  onAddFeature: () => void;
  onUpdateFeature: (id: string, field: keyof Feature, value: string) => void;
  onRemoveFeature: (id: string) => void;
}

const FeatureList: React.FC<FeatureListProps> = ({
  features,
  onAddFeature,
  onUpdateFeature,
  onRemoveFeature
}) => {
  return (
    <div className="space-y-6">
      {features.map((feature) => (
        <FeatureForm
          key={feature.id}
          feature={feature}
          canRemove={features.length > 1}
          onUpdate={onUpdateFeature}
          onRemove={onRemoveFeature}
        />
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={onAddFeature}
        className="w-full flex items-center justify-center gap-2 py-3 border-dashed"
      >
        <Plus className="h-4 w-4" />
        Add more
      </Button>
    </div>
  );
};

export default FeatureList;
