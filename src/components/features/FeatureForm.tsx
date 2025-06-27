
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  priority: string;
}

interface FeatureFormProps {
  feature: Feature;
  canRemove: boolean;
  onUpdate: (id: string, field: keyof Feature, value: string) => void;
  onRemove: (id: string) => void;
}

const FeatureForm: React.FC<FeatureFormProps> = ({
  feature,
  canRemove,
  onUpdate,
  onRemove
}) => {
  return (
    <div className="border rounded-lg p-6 space-y-4 relative">
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(feature.id)}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Feature Title:
          </label>
          <Input
            value={feature.title}
            onChange={(e) => onUpdate(feature.id, 'title', e.target.value)}
            placeholder="e.g., User Authentication"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description:
          </label>
          <Textarea
            value={feature.description}
            onChange={(e) => onUpdate(feature.id, 'description', e.target.value)}
            placeholder="Describe what this feature will do"
            className="min-h-[80px]"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority:
          </label>
          <Input
            value={feature.priority}
            onChange={(e) => onUpdate(feature.id, 'priority', e.target.value)}
            placeholder="High, Medium, Low"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default FeatureForm;
