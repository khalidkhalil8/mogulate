
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import SetupNavigation from './setup/SetupNavigation';

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
  const [features, setFeatures] = useState<Feature[]>(
    initialFeatures.length > 0 ? initialFeatures : [{
      id: '1',
      title: '',
      description: '',
      priority: ''
    }]
  );
  const navigate = useNavigate();
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFeaturesSubmit(features);
    navigate('/validation-plan');
  };
  
  const handleBack = () => {
    onFeaturesSubmit(features);
    navigate('/market-gaps');
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
            {features.map((feature, index) => (
              <div key={feature.id} className="border rounded-lg p-6 space-y-4 relative">
                {features.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(feature.id)}
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
                      onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
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
                      onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
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
                      onChange={(e) => updateFeature(feature.id, 'priority', e.target.value)}
                      placeholder="High, Medium, Low"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addFeature}
              className="w-full flex items-center justify-center gap-2 py-3 border-dashed"
            >
              <Plus className="h-4 w-4" />
              Add more
            </Button>
            
            <div className="flex justify-between pt-6">
              <div className="flex gap-4">
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
                  type="button"
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>Ask AI</span>
                </Button>
              </div>
              
              <Button 
                type="submit" 
                className="gradient-bg border-none hover:opacity-90 button-transition flex items-center gap-2"
              >
                <span>Next</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeatureEntryPage;
