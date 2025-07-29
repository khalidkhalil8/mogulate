
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useProjectLimits } from "@/hooks/useProjectLimits";
import SetupPageLayout from "@/components/setup/SetupPageLayout";
import ProjectLimitUpgrade from "@/components/projects/ProjectLimitUpgrade";

const IdeaEntryPage = () => {
  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { 
    projectLimit, 
    currentProjectCount, 
    canCreateProject, 
    isAtLimit, 
    currentTier 
  } = useProjectLimits();

  const handleNext = async () => {
    if (!canCreateProject) {
      toast.error('Project limit reached for your current plan');
      return;
    }

    if (!idea.trim()) {
      toast.error('Please enter your idea');
      return;
    }

    setIsLoading(true);

    try {
      // Navigate to the new project setup flow
      navigate(`/project/setup?step=title`);
    } catch (error) {
      console.error('Error starting project setup:', error);
      toast.error('Failed to start project setup');
    } finally {
      setIsLoading(false);
    }
  };

  // Show upgrade prompt if at limit
  if (isAtLimit) {
    return (
      <SetupPageLayout
        title="Project Limit Reached"
        description="Upgrade your plan to create more projects"
        showNavigation={false}
      >
        <div className="max-w-2xl mx-auto">
          <ProjectLimitUpgrade 
            currentTier={currentTier}
            projectLimit={projectLimit}
            currentProjectCount={currentProjectCount}
          />
        </div>
      </SetupPageLayout>
    );
  }

  return (
    <SetupPageLayout
      title="Start Your Project"
      description="Tell us about your business idea and we'll help you validate it"
      onNext={handleNext}
      nextLabel={isLoading ? "Starting..." : "Start Project"}
      canProceed={!!idea.trim() && !isLoading}
      isLoading={isLoading}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-600">
            Projects: {currentProjectCount}/{projectLimit === Infinity ? '∞' : projectLimit}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="idea" className="text-sm font-medium text-gray-700">
              Brief description of your idea
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="E.g., A mobile app that helps people find local farmers markets and track their purchases"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows={6}
              disabled={isLoading}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">💡 Tips for a great idea description:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Be specific about what problem you're solving</li>
              <li>• Mention your target audience</li>
              <li>• Include key features or functionality</li>
              <li>• Keep it concise but descriptive</li>
            </ul>
          </div>
        </div>
      </div>
    </SetupPageLayout>
  );
};

export default IdeaEntryPage;
