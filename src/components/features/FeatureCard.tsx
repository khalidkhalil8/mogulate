
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

interface Feature {
  id: string;
  title: string;
  description: string;
  priority: string;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
  canDelete: boolean;
  onUpdate: (id: string, field: keyof Feature, value: string) => void;
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
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Feature {index + 1}</h3>
        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(feature.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`title-${feature.id}`}>Feature Title</Label>
        <Input
          id={`title-${feature.id}`}
          value={feature.title}
          onChange={(e) => onUpdate(feature.id, 'title', e.target.value)}
          placeholder="e.g., User Authentication"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`description-${feature.id}`}>Description</Label>
        <Textarea
          id={`description-${feature.id}`}
          value={feature.description}
          onChange={(e) => onUpdate(feature.id, 'description', e.target.value)}
          placeholder="Describe the feature..."
          className="min-h-[80px]"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`priority-${feature.id}`}>Priority</Label>
        <Select
          value={feature.priority}
          onValueChange={(value) => onUpdate(feature.id, 'priority', value)}
        >
          <SelectTrigger>
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
