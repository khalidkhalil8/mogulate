
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import SetupPageLayout from '@/components/setup/SetupPageLayout';

interface ProjectStartStepProps {
  projectData: any;
  updateProjectData: (data: any) => void;
}

const ProjectStartStep: React.FC<ProjectStartStepProps> = ({
  projectData,
  updateProjectData
}) => {
  const [title, setTitle] = useState(projectData.title || '');
  const [description, setDescription] = useState(projectData.idea || '');
  const navigate = useNavigate();

  useEffect(() => {
    // Save to localStorage for persistence
    localStorage.setItem('projectSetupData', JSON.stringify({
      ...projectData,
      title,
      idea: description
    }));
  }, [title, description, projectData]);

  const handleNext = () => {
    if (!title.trim() || !description.trim()) return;
    
    updateProjectData({ 
      title: title.trim(),
      idea: description.trim()
    });
    navigate('/project-setup/competitors');
  };

  const canProceed = title.trim() && description.trim();

  return (
    <SetupPageLayout
      title="Start Your Project"
      description="Give your project a name and a brief description"
      onNext={handleNext}
      canProceed={canProceed}
      showNavigation={false}
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
            onChange={(e) => setTitle(e.target.value)}
            placeholder=""
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="(Placeholder text: An AI powered fitness app that analyzes the users form through the phone camera)"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={1000}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="gradient-bg border-none hover:opacity-90 button-transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </SetupPageLayout>
  );
};

export default ProjectStartStep;
