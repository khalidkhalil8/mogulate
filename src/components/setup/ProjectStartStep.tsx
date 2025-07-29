
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

  useEffect(() => {
    setTitle(setupData.title);
    setDescription(setupData.description);
  }, [setupData.title, setupData.description]);

  const handleNext = () => {
    if (title.trim() && description.trim()) {
      updateSetupData({ 
        title: title.trim(),
        description: description.trim()
      });
      onNext();
    }
  };

  // Update setupData whenever local state changes
  useEffect(() => {
    updateSetupData({ 
      title: title.trim(),
      description: description.trim()
    });
  }, [title, description, updateSetupData]);

  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Project
          </h1>
          <p className="text-xl text-gray-600">
            Give your project a name and a brief description
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-lg font-medium text-gray-900">
              Project Title
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="AI-Powered Resume Portfolio Generator"
              className="w-full h-14 px-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
              maxLength={100}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-lg font-medium text-gray-900">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="The portfolio is generated using TailwindCSS-based templates with animations, and users can preview the portfolio live and export it as a PDF."
              className="w-full h-32 px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={isLoading}
              maxLength={500}
            />
          </div>

          <div className="flex justify-end pt-8">
            <Button
              onClick={handleNext}
              disabled={!canProceed || isLoading}
              className="px-8 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {isLoading ? 'Loading...' : 'Next'}
              {!isLoading && <ArrowRight size={20} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStartStep;
