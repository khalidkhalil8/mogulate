
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
import { Plus, Trash2, ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

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
        : []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
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
      setHasGenerated(true);
    }
  }, [project]);
  
  const handleGenerateFeatures = async () => {
    if (!projectId) {
      toast.error('Project ID is required');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-features', {
        body: { project_id: projectId }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        const generatedFeatures = data.features.map((f: any) => ({
          id: f.id,
          title: f.title,
          description: f.description,
          priority: f.priority
        }));
        setFeatures(generatedFeatures);
        setHasGenerated(true);
        toast.success('Features generated successfully!');
      } else {
        throw new Error(data.error || 'Failed to generate features');
      }
    } catch (error) {
      console.error('Error generating features:', error);
      toast.error('Failed to generate features. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const addFeature = () => {
    const newFeature: Feature = {
      id: Date.now().toString(),
      title: '',
      description: '',
      priority: 'Medium'
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
    
    const fullFeatures = features.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      status: 'Planned' as const,
      priority: f.priority as 'Low' | 'Medium' | 'High'
    }));
    
    if (projectId && project) {
      await updateProject(projectId, { features: fullFeatures });
    }
    
    onFeaturesSubmit(features);
    
    const nextUrl = projectId ? `/validation-plan?projectId=${projectId}` : '/validation-plan';
    navigate(nextUrl);
  };
  
  const handleBack = async () => {
    const fullFeatures = features.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      status: 'Planned' as const,
      priority: f.priority as 'Low' | 'Medium' | 'High'
    }));
    
    if (projectId && project) {
      await updateProject(projectId, { features: fullFeatures });
    }
    
    onFeaturesSubmit(features);
    
    const backUrl = projectId ? `/market-gaps?projectId=${projectId}` : '/market-gaps';
    navigate(backUrl);
  };

  const canProceed = hasGenerated || features.length > 0;
  
  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {!hasGenerated && features.length === 0 ? (
            // Initial welcome state - similar to market-gaps page
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-bold mb-4">Generate & Define Product Features</h1>
                <p className="text-gray-600 text-lg mb-8">
                  Our AI will analyze your selected market positioning to suggest three strategic features 
                  that align with your competitive advantage and target market needs.
                </p>
                
                <Button 
                  onClick={handleGenerateFeatures}
                  disabled={isGenerating}
                  className="gradient-bg border-none hover:opacity-90 button-transition text-lg px-8 py-3"
                >
                  <Lightbulb className="h-5 w-5 mr-2" />
                  {isGenerating ? 'Generating Features...' : 'Generate Features with AI'}
                </Button>
                
                <p className="text-sm text-gray-500 mt-4">
                  Features will be based on your selected market positioning
                </p>
              </div>
            </div>
          ) : (
            // Results state - show generated/added features
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
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {features.length > 0 && (
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
                            required
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
                            required
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
                )}
                
                <Button
                  type="button"
                  onClick={addFeature}
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
                    onClick={handleBack}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureEntryPage;
