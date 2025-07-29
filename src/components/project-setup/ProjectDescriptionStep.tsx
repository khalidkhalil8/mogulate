
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SetupPageLayout from '@/components/setup/SetupPageLayout';

interface ProjectDescriptionStepProps {
  projectData: any;
  updateProjectData: (data: any) => void;
}

const ProjectDescriptionStep: React.FC<ProjectDescriptionStepProps> = ({
  projectData,
  updateProjectData
}) => {
  const [description, setDescription] = useState(projectData.idea || '');
  const navigate = useNavigate();

  useEffect(() => {
    // Save to localStorage for persistence
    localStorage.setItem('projectSetupData', JSON.stringify({
      ...projectData,
      idea: description
    }));
  }, [description, projectData]);

  const handleNext = () => {
    if (!description.trim()) return;
    
    updateProjectData({ idea: description.trim() });
    navigate('/project-setup/competitors');
  };

  const handleBack = () => {
    updateProjectData({ idea: description });
    navigate('/project-setup/title');
  };

  return (
    <SetupPageLayout
      title="Describe your business idea"
      description="Tell us about your business concept so we can help you validate it"
      onNext={handleNext}
      onBack={handleBack}
      canProceed={!!description.trim()}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Project Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g., A mobile app that helps people find local farmers markets, track their purchases, and discover seasonal produce. Users can save favorite vendors, get notifications about market days, and build shopping lists based on what's in season."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            rows={6}
            maxLength={1000}
          />
          <div className="text-sm text-gray-500 text-right">
            {description.length}/1000 characters
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">💡 Tips for a great description:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Be specific about what problem you're solving</li>
            <li>• Mention your target audience</li>
            <li>• Include key features or functionality</li>
            <li>• Explain the value you provide</li>
          </ul>
        </div>
      </div>
    </SetupPageLayout>
  );
};

export default ProjectDescriptionStep;
