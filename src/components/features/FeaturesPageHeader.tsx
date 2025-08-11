
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/hooks/useProjects';

interface FeaturesPageHeaderProps {
  project: Project;
  onAddFeature: () => void;
  onRerun?: () => void;
  isRerunning?: boolean;
}

const FeaturesPageHeader: React.FC<FeaturesPageHeaderProps> = ({
  project,
  onAddFeature,
  onRerun,
  isRerunning = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/project/${project.id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Features</h1>
          <p className="text-gray-600">Manage features for {project.title}</p>
        </div>
        <div className="flex gap-2">
          {onRerun && (
            <Button 
              onClick={onRerun} 
              disabled={isRerunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRerunning ? 'animate-spin' : ''}`} />
              {isRerunning ? 'Generating...' : 'Rerun Generation'}
            </Button>
          )}
          <Button onClick={onAddFeature} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Feature
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPageHeader;
