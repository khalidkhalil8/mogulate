
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight } from 'lucide-react';
import { ProjectSetupData } from '@/pages/ProjectSetupPage';
import SetupPageLayout from './SetupPageLayout';

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
    <SetupPageLayout
      title="Start Your Project"
      description="Give your project a name and a brief description"
      onNext={handleNext}
      canProceed={canProceedLocal}
      isLoading={isLoading}
      showNavigation={false}
    >
      <div className="max-w-2xl mx-auto space-y-6">
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
      </div>
    </SetupPageLayout>
  );
};

export default ProjectStartStep;
