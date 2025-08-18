
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight } from 'lucide-react';
import { ProjectSetupData } from '@/pages/ProjectSetupPage';
import SetupNavigation from './SetupNavigation';

interface ProjectStartStepProps {
  setupData: ProjectSetupData;
  updateSetupData: (updates: Partial<ProjectSetupData>) => void;
  onNext: () => void;
  isLoading: boolean;
  canProceed: boolean;
}

const ProjectStartStep: React.FC<ProjectStartStepProps> = ({
  setupData,
  updateSetupData,
  onNext,
  isLoading,
  canProceed,
}) => {
  const [title, setTitle] = useState(setupData.title);
  const [description, setDescription] = useState(setupData.description);

  // Update local state and parent state immediately on change
  useEffect(() => {
    setTitle(setupData.title);
    setDescription(setupData.description);
  }, [setupData.title, setupData.description]);

  // Update parent state whenever local state changes
  useEffect(() => {
    updateSetupData({ 
      title: title,
      description: description
    });
  }, [title, description, updateSetupData]);

  const handleNext = () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    
    if (trimmedTitle && trimmedDescription) {
      onNext();
    }
  };

  const canProceedLocal = title.trim() !== '' && description.trim() !== '' && !isLoading;

  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="max-w-2xl mx-auto mobile-padding section-spacing">
        {/* Header section with consistent alignment */}
        <div className="setup-header text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Project
          </h1>
          <p className="text-xl text-gray-600">
            Give your project a name and a brief description
          </p>
        </div>

        {/* Form section with consistent styling */}
        <div className="form-spacing">
          <div className="form-field-spacing">
            <Label htmlFor="title" className="form-label">
              Project Title
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your project title"
              className="form-input h-14 text-lg"
              disabled={isLoading}
              maxLength={100}
            />
          </div>

          <div className="form-field-spacing">
            <Label htmlFor="description" className="form-label">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe your idea or product"
              className="form-textarea h-32 text-lg"
              disabled={isLoading}
              maxLength={500}
            />
          </div>

          <div className="flex justify-end button-spacing">
            <Button
              onClick={handleNext}
              disabled={!canProceedLocal}
              className="nav-button bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span>{isLoading ? 'Loading...' : 'Next'}</span>
              {!isLoading && <ArrowRight size={20} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStartStep;
