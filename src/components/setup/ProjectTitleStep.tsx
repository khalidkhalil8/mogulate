
import React, { useState, useEffect } from 'react';
import SetupPageLayout from './SetupPageLayout';
import { ProjectSetupData } from '@/pages/ProjectSetupPage';

interface ProjectTitleStepProps {
  setupData: ProjectSetupData;
  updateSetupData: (updates: Partial<ProjectSetupData>) => void;
  onNext: () => void;
  onBack?: () => void;
  canProceed: boolean;
  isLoading: boolean;
}

const ProjectTitleStep: React.FC<ProjectTitleStepProps> = ({
  setupData,
  updateSetupData,
  onNext,
  onBack,
  canProceed,
  isLoading,
}) => {
  const [title, setTitle] = useState(setupData.title);

  useEffect(() => {
    setTitle(setupData.title);
  }, [setupData.title]);

  const handleNext = () => {
    if (title.trim()) {
      updateSetupData({ title: title.trim() });
      onNext();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  return (
    <SetupPageLayout
      title="What's your project title?"
      description="Give your project a clear and descriptive name"
      onNext={handleNext}
      onBack={onBack}
      nextLabel="Continue"
      canProceed={!!title.trim() && !isLoading}
      isLoading={isLoading}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            Project Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="E.g., Local Farmer's Market Finder"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            disabled={isLoading}
            maxLength={100}
          />
          <div className="text-sm text-gray-500">
            {title.length}/100 characters
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">💡 Tips for a great project title:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Keep it concise and memorable</li>
            <li>• Clearly indicate what your project does</li>
            <li>• Avoid jargon or technical terms</li>
            <li>• Make it appealing to your target audience</li>
          </ul>
        </div>
      </div>
    </SetupPageLayout>
  );
};

export default ProjectTitleStep;
