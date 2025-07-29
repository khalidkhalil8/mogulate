
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import SetupPageLayout from '@/components/setup/SetupPageLayout';

interface ProjectTitleStepProps {
  projectData: any;
  updateProjectData: (data: any) => void;
}

const ProjectTitleStep: React.FC<ProjectTitleStepProps> = ({
  projectData,
  updateProjectData
}) => {
  const [title, setTitle] = useState(projectData.title || '');
  const navigate = useNavigate();

  useEffect(() => {
    // Save to localStorage for persistence
    localStorage.setItem('projectSetupData', JSON.stringify({
      ...projectData,
      title
    }));
  }, [title, projectData]);

  const handleNext = () => {
    if (!title.trim()) return;
    
    updateProjectData({ title: title.trim() });
    navigate('/project-setup/description');
  };

  return (
    <SetupPageLayout
      title="What's your project called?"
      description="Give your project a memorable name that captures your vision"
      onNext={handleNext}
      canProceed={!!title.trim()}
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
            placeholder="E.g., FarmFresh - Local Farmers Market Finder"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
            maxLength={100}
          />
          <div className="text-sm text-gray-500 text-right">
            {title.length}/100 characters
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">💡 Tips for a great project title:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Keep it concise but descriptive</li>
            <li>• Include your core value proposition</li>
            <li>• Make it memorable and unique</li>
            <li>• Avoid generic terms</li>
          </ul>
        </div>
      </div>
    </SetupPageLayout>
  );
};

export default ProjectTitleStep;
