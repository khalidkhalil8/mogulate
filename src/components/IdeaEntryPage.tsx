
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import SetupNavigation from './setup/SetupNavigation';
import IdeaChangeWarningDialog from './project/IdeaChangeWarningDialog';
import { useProjectData } from '@/hooks/useProjectData';
import { useSetupHandlers } from '@/hooks/useSetupHandlers';

const IdeaEntryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const {
    existingProject,
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
  } = useProjectData();

  const {
    handleIdeaSubmit,
  } = useSetupHandlers({
    projectTitle,
    setProjectTitle,
    selectedGapIndex,
    setSelectedGapIndex,
    ideaData,
    setIdeaData,
    projectId,
  });

  const [localTitle, setLocalTitle] = useState('');
  const [localIdea, setLocalIdea] = useState('');
  const [showIdeaWarning, setShowIdeaWarning] = useState(false);

  const hasExistingIdea = existingProject?.idea && existingProject.idea.trim().length > 0;
  const ideaHasChanged = localIdea.trim() !== (existingProject?.idea || '').trim();

  // Load data from existing project when available
  useEffect(() => {
    if (existingProject) {
      console.log('IdeaEntryPage: Loading existing project data');
      setLocalTitle(existingProject.title || '');
      setLocalIdea(existingProject.idea || '');
    }
  }, [existingProject]);

  // Sync with project data updates
  useEffect(() => {
    if (projectTitle && projectTitle !== localTitle && !existingProject) {
      setLocalTitle(projectTitle);
    }
    if (ideaData.idea && ideaData.idea !== localIdea && !existingProject) {
      setLocalIdea(ideaData.idea);
    }
  }, [projectTitle, ideaData.idea, localTitle, localIdea, existingProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!localTitle.trim()) {
      toast.error('Please enter a project title');
      return;
    }

    if (!localIdea.trim()) {
      toast.error('Please describe your project');
      return;
    }

    // If there's an existing idea and it's being changed, show warning
    if (hasExistingIdea && ideaHasChanged && localIdea.trim().length > 0) {
      setShowIdeaWarning(true);
      return;
    }

    await performSubmit();
  };

  const performSubmit = async () => {
    try {
      console.log('IdeaEntryPage: Submitting idea with title:', localTitle);
      await handleIdeaSubmit(localIdea, localTitle);
    } catch (error) {
      console.error('Error submitting idea:', error);
      toast.error('Failed to save your idea. Please try again.');
    }
  };

  const handleIdeaChangeConfirm = () => {
    setShowIdeaWarning(false);
    performSubmit();
  };

  const handleIdeaChangeCancel = () => {
    setShowIdeaWarning(false);
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <SetupNavigation />

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Start Your Project</h1>
              <p className="text-gray-600">Give your project a name and provide a description.</p>
              {existingProject && (
                <p className="text-sm text-green-600 mt-2">
                  Editing existing project: {existingProject.title}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg border p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="projectTitle" className="text-sm font-medium">
                    Project Title
                  </Label>
                  <Input
                    id="projectTitle"
                    placeholder="Enter your project title"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idea" className="text-sm font-medium">
                    Core Idea
                    {hasExistingIdea && (
                      <span className="text-sm text-amber-600 ml-2">
                        (Warning: Changing this will affect your entire project)
                      </span>
                    )}
                  </Label>
                  <Textarea
                    id="idea"
                    placeholder="An AI-powered fitness app that analyzes the users form through the phone camera"
                    value={localIdea}
                    onChange={(e) => setLocalIdea(e.target.value)}
                    className="min-h-[120px] resize-y w-full"
                    required
                  />
                  {hasExistingIdea && ideaHasChanged && (
                    <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">You are modifying the core idea of this project.</p>
                        <p>This may impact your competitors, features, and validation plan that were based on the original idea.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="flex items-center gap-2"
                  disabled={!localTitle.trim() || !localIdea.trim()}
                >
                  <span>Next</span>
                  <ArrowRight size={18} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <IdeaChangeWarningDialog
        isOpen={showIdeaWarning}
        onClose={handleIdeaChangeCancel}
        onConfirm={handleIdeaChangeConfirm}
        currentIdea={existingProject?.idea || ''}
        newIdea={localIdea}
      />
    </>
  );
};

export default IdeaEntryPage;
