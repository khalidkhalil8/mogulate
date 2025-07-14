
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import FeatureCard from './FeatureCard';

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
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Review & Edit Your Features</h1>
        <p className="text-gray-600">
          {hasGenerated 
            ? "AI has suggested features based on your market positioning. You can edit them or add more."
            : "Add and configure the features you want to build for your product."
          }
        </p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-6">
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
        
        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </Button>
          
          <Button 
            type="submit" 
            disabled={!canProceed}
            className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FeatureForm;
