
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import SetupNavigation from './setup/SetupNavigation';
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
import { Plus, Trash2 } from 'lucide-react';

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
      ? project.features.map(f => ({
          id: f.id,
          title: f.title,
          description: f.description,
          priority: f.priority
        }))
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
      setFeatures(project.features.map(f => ({
        id: f.id,
        title: f.title,
        description: f.description,
        priority: f.priority
      })));
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
    
    // Convert to full Feature objects for database storage
    const fullFeatures = features.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      status: 'Planned' as const,
      priority: f.priority as 'Low' | 'Medium' | 'High'
    }));
    
    // Save to project if we have a project ID
    if (projectId && project) {
      await updateProject(projectId, { features: fullFeatures });
    }
    
    onFeaturesSubmit(features);
    
    // Navigate with projectId preserved
    const nextUrl = projectId ? `/validation-plan?projectId=${projectId}` : '/validation-plan';
    navigate(nextUrl);
  };
  
  const handleBack = async () => {
    // Convert to full Feature objects for database storage
    const fullFeatures = features.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      status: 'Planned' as const,
      priority: f.priority as 'Low' | 'Medium' | 'High'
    }));
    
    // Save to project if we have a project ID
    if (projectId && project) {
      await updateProject(projectId, { features: fullFeatures });
    }
    
    onFeaturesSubmit(features);
    
    // Navigate with projectId preserved
    const backUrl = projectId ? `/market-gaps?projectId=${projectId}` : '/market-gaps';
    navigate(backUrl);
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
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={feature.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Feature {index + 1}</h3>
                    {features.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(feature.id)}
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
                      onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
                      placeholder="e.g., User Authentication"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`description-${feature.id}`}>Description</Label>
                    <Textarea
                      id={`description-${feature.id}`}
                      value={feature.description}
                      onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
                      placeholder="Describe the feature..."
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`priority-${feature.id}`}>Priority</Label>
                    <Select
                      value={feature.priority}
                      onValueChange={(value) => updateFeature(feature.id, 'priority', value)}
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
              ))}
            </div>
            
            <Button
              type="button"
              onClick={addFeature}
              variant="outline"
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Another Feature
            </Button>
            
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleAskAI}
                variant="secondary"
                className="flex-1"
              >
                Ask AI
              </Button>
              <Button type="submit" className="flex-1">
                Next
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeatureEntryPage;
