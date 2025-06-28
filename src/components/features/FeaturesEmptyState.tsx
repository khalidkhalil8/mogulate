
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FeaturesEmptyStateProps {
  onAddFeature: () => void;
}

const FeaturesEmptyState: React.FC<FeaturesEmptyStateProps> = ({
  onAddFeature,
}) => {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <Plus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No features yet</h2>
        <p className="text-gray-600 mb-6">
          Start by adding your first feature to track development progress
        </p>
        <Button onClick={onAddFeature} size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Add First Feature
        </Button>
      </div>
    </div>
  );
};

export default FeaturesEmptyState;
