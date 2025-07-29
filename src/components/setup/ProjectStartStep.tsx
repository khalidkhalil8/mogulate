
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import { ProjectSetupData } from '@/pages/ProjectSetupPage';
import SetupNavigation from './SetupNavigation';

interface ProjectStartStepProps {
  setupData: ProjectSetupData;
  updateSetupData: (updates: Partial<ProjectSetupData>) => void;
  onNext: () => void;
  isLoading: boolean;
}

const ProjectStartStep: React.FC<ProjectStartStepProps> = ({
  setupData,
  updateSetupData,
  onNext,
  isLoading,
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

  const canProceed = title.trim() && description.trim() && !isLoading;

  return (
    <div className="min-h-screen bg-white">
      <SetupNavigation />
      
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="border border-gray-300 rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Start Your Project
            </h1>
            <p className="text-gray-600">
              Give your project a name and a brief description
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Project Title
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder=""
                className="w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="(Remember: text. An AI powered fitness app that analyzes the users form through the phone camera)"
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={isLoading}
                maxLength={500}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStartStep;
