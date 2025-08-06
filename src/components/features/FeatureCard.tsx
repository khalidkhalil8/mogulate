
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

interface LocalFeature {
  id: string;
  title: string;
  description: string;
  priority: string;
}

interface FeatureCardProps {
  feature: LocalFeature;
  index: number;
  canDelete: boolean;
  onUpdate: (id: string, field: keyof LocalFeature, value: string) => void;
  onDelete: (id: string) => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  index,
  canDelete,
  onUpdate,
  onDelete
}) => {
  return (
    <div className="border border-gray-200 rounded-lg card-spacing transition-all duration-200 hover:border-gray-300 hover:shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Feature {index + 1}</h3>
        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(feature.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="form-field-spacing">
        <Label htmlFor={`title-${feature.id}`} className="form-label">Feature Title</Label>
        <Input
          id={`title-${feature.id}`}
          value={feature.title}
          onChange={(e) => onUpdate(feature.id, 'title', e.target.value)}
          placeholder="e.g., User Authentication"
          className="form-input"
          required
        />
      </div>
      
      <div className="form-field-spacing">
        <Label htmlFor={`description-${feature.id}`} className="form-label">Description</Label>
        <Textarea
          id={`description-${feature.id}`}
          value={feature.description}
          onChange={(e) => onUpdate(feature.id, 'description', e.target.value)}
          placeholder="Describe the feature..."
          className="form-textarea min-h-[100px]"
          required
        />
      </div>
      
      <div className="form-field-spacing">
        <Label htmlFor={`priority-${feature.id}`} className="form-label">Priority</Label>
        <Select
          value={feature.priority}
          onValueChange={(value) => onUpdate(feature.id, 'priority', value)}
        >
          <SelectTrigger className="form-input">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FeatureCard;
