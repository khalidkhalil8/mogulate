
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/hooks/useProjects';

interface FeaturesPageHeaderProps {
  project: Project;
  onAddFeature: () => void;
}

const FeaturesPageHeader: React.FC<FeaturesPageHeaderProps> = ({
  project,
  onAddFeature,
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
          <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
          <p className="text-gray-600">
            {project.idea}
          </p>
          <p className="text-gray-600 mt-2">
            List features you want to implement in your project
          </p>
        </div>
        <Button onClick={onAddFeature} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Feature
        </Button>
      </div>
    </div>
  );
};

export default FeaturesPageHeader;
