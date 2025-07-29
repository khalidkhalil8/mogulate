
import React, { useState, useEffect } from 'react';
import SetupPageLayout from './SetupPageLayout';
import { ProjectSetupData } from '@/pages/ProjectSetupPage';

interface ProjectDescriptionStepProps {
  setupData: ProjectSetupData;
  updateSetupData: (updates: Partial<ProjectSetupData>) => void;
  onNext: () => void;
  onBack?: () => void;
  canProceed: boolean;
  isLoading: boolean;
}

const ProjectDescriptionStep: React.FC<ProjectDescriptionStepProps> = ({
  setupData,
  updateSetupData,
  onNext,
  onBack,
  canProceed,
  isLoading,
}) => {
  const [description, setDescription] = useState(setupData.description);

  useEffect(() => {
    setDescription(setupData.description);
  }, [setupData.description]);

  const handleNext = () => {
    if (description.trim()) {
      updateSetupData({ description: description.trim() });
      onNext();
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  return (
    <SetupPageLayout
      title="Describe your project"
      description="Tell us about your business idea and what problem it solves"
      onNext={handleNext}
      onBack={onBack}
      nextLabel="Continue"
      canProceed={!!description.trim() && !isLoading}
      isLoading={isLoading}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Project Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="E.g., A mobile app that helps people find local farmers markets, track their purchases, and discover seasonal produce. It connects consumers with local farmers and promotes sustainable shopping habits."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            rows={6}
            disabled={isLoading}
            maxLength={500}
          />
          <div className="text-sm text-gray-500">
            {description.length}/500 characters
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">💡 Tips for a great description:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Be specific about what problem you're solving</li>
            <li>• Mention your target audience</li>
            <li>• Include key features or functionality</li>
            <li>• Explain the value proposition</li>
            <li>• Keep it concise but descriptive</li>
          </ul>
        </div>
      </div>
    </SetupPageLayout>
  );
};

export default ProjectDescriptionStep;
