
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import SetupNavigation from './setup/SetupNavigation';
import FeatureList from './features/FeatureList';
import FeaturePageNavigation from './features/FeaturePageNavigation';

interface Feature {
  id: string;
  title: string;
  description: string;
  priority: string;
}

interface FeatureEntryPageProps {
  initialFeatures?: Feature[];
  onFeaturesSubmit: (features: Feature[]) => void;
}

const FeatureEntryPage: React.FC<FeatureEntryPageProps> = ({ 
  initialFeatures = [], 
  onFeaturesSubmit 
}) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { projects, updateProject } = useProjects();
  const project = projects.find(p => p.id === projectId);
  
  const [features, setFeatures] = useState<Feature[]>(
    project?.features && project.features.length > 0 
      ? project.features 
      : initialFeatures.length > 0 
        ? initialFeatures 
        : [{
            id: '1',
            title: '',
            description: '',
            priority: ''
          }]
  );
  const navigate = useNavigate();
  
  // Update features when project data loads
  useEffect(() => {
    if (project?.features && project.features.length > 0) {
      setFeatures(project.features);
    }
  }, [project]);
  
  const addFeature = () => {
    const newFeature: Feature = {
      id: Date.now().toString(),
      title: '',
      description: '',
      priority: ''
    };
    setFeatures([...features, newFeature]);
  };
  
  const removeFeature = (id: string) => {
    if (features.length > 1) {
      setFeatures(features.filter(feature => feature.id !== id));
    }
  };
  
  const updateFeature = (id: string, field: keyof Feature, value: string) => {
    setFeatures(features.map(feature => 
      feature.id === id ? { ...feature, [field]: value } : feature
    ));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to project if we have a project ID
    if (projectId && project) {
      await updateProject(projectId, { features });
    }
    
    onFeaturesSubmit(features);
    navigate('/validation-plan');
  };
  
  const handleBack = async () => {
    // Save to project if we have a project ID
    if (projectId && project) {
      await updateProject(projectId, { features });
    }
    
    onFeaturesSubmit(features);
    navigate('/market-gaps');
  };

  const handleAskAI = () => {
    // Placeholder for AI functionality
    console.log('Ask AI feature not implemented yet');
  };
  
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Features to Add</h1>
            <p className="text-gray-600">
              List features you want to implement in your development
            </p>
            <p className="text-gray-500 text-sm mt-1">
              (you can add features later if you'd like)
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <FeatureList
              features={features}
              onAddFeature={addFeature}
              onUpdateFeature={updateFeature}
              onRemoveFeature={removeFeature}
            />
            
            <FeaturePageNavigation
              onBack={handleBack}
              onNext={() => {}}
              onAskAI={handleAskAI}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeatureEntryPage;
