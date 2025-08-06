
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Competitor } from '@/lib/types';

interface CompetitorCardProps {
  competitor: Competitor;
  index: number;
  onUpdate: (id: string, field: keyof Competitor, value: string) => void;
  onRemove: (id: string) => void;
  allowEdit?: boolean;
  allowDelete?: boolean;
}

const CompetitorCard: React.FC<CompetitorCardProps> = ({
  competitor,
  index,
  onUpdate,
  onRemove,
  allowEdit = true,
  allowDelete = true
}) => {
  return (
    <div 
      className={`p-6 border rounded-lg w-full ${competitor.isAiGenerated ? 'border-teal-200 bg-teal-50' : 'border-gray-200'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">
          {competitor.isAiGenerated ? 'AI-Found Competitor' : `Competitor ${index + 1}`}
        </h3>
        {allowDelete && !competitor.isAiGenerated && (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={() => onRemove(competitor.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Remove
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor={`name-${competitor.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <Input
            id={`name-${competitor.id}`}
            value={competitor.name}
            onChange={(e) => onUpdate(competitor.id, 'name', e.target.value)}
            placeholder="Competitor Name"
            readOnly={competitor.isAiGenerated || !allowEdit}
            className={competitor.isAiGenerated || !allowEdit ? "bg-gray-50" : ""}
          />
        </div>
        
        <div>
          <label htmlFor={`website-${competitor.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <Input
            id={`website-${competitor.id}`}
            value={competitor.website}
            onChange={(e) => onUpdate(competitor.id, 'website', e.target.value)}
            placeholder="example.com"
            readOnly={competitor.isAiGenerated || !allowEdit}
            className={competitor.isAiGenerated || !allowEdit ? "bg-gray-50" : ""}
          />
        </div>
        
        <div>
          <label htmlFor={`description-${competitor.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            id={`description-${competitor.id}`}
            value={competitor.description}
            onChange={(e) => onUpdate(competitor.id, 'description', e.target.value)}
            placeholder="Brief description of the product or service"
            readOnly={competitor.isAiGenerated || !allowEdit}
            className={competitor.isAiGenerated || !allowEdit ? "bg-gray-50 min-h-[80px]" : "min-h-[80px]"}
          />
        </div>
      </div>
    </div>
  );
};

export default CompetitorCard;
